import path from "path";
import fs from "fs";

import Logger from "@common/logger";

import AddonError, {type ErrorInfo} from "@structs/addonerror";

import Settings from "@stores/settings";
import Events from "./emitter";
import JsonStore, {type Files} from "@stores/json";
import Toasts from "@stores/toasts";
import React from "./react";
import {t} from "@common/i18n";
import ipc from "./ipc";

import AddonEditor from "@ui/misc/addoneditor";
import FloatingWindows from "@ui/floatingwindows";
import Store from "@stores/base";
import type {SystemError} from "bun";
import RemoteAPI from "@polyfill/remote";
import {parseJsDoc} from "@common/utils";
import Modals from "@ui/modals";

export interface Addon {
    added: number;
    author: string;
    authorId?: string;
    authorLink?: string;
    description: string;
    donate?: string;
    fileContent?: string;
    filename: string;
    format: string;
    id: string;
    invite?: string;
    modified: number;
    name: string;
    partial?: boolean;
    patreon?: string;
    size: number;
    slug: string;
    source?: string;
    version: string;
    website?: string;
    runAt?: string;
    icon?: string;
}

export default abstract class AddonManager<T extends Addon = Addon> extends Store {
    abstract name: string;
    abstract extension: string;
    abstract duplicatePattern: RegExp;
    abstract addonFolder: string;
    abstract language: string;
    abstract prefix: string;
    abstract order: number;

    addonList: T[] = [];
    addonInfo: Addon[] = [];

    trigger(event: string, ...args: any[]) {
        // Emit the events as a store for react
        super.emitChange();

        // Emit the events as a normal emitter while other parts
        // of the codebase are still converting to stores
        return Events.emit(`${this.prefix}-${event}`, ...args);
    }

    timeCache: Record<string, number> = {};
    state: Record<string, boolean> = {};
    windows = new Set<string>();
    hasInitialized = false;
    initialAddonsLoaded = 0;

    initialize() {
        this.loadState();
        this.watchAddons();
        this.readAllAddons();
        Settings.registerAddonPanel(this);
    }

    finishInit() {
        this.addonInfo = [];
        this.hasInitialized = true;

        if (this.initialAddonsLoaded === 0) return;
        Toasts.show(t("Addons.manyEnabled", {count: this.initialAddonsLoaded, context: this.prefix}));
    }

    abstract startAddon(idOrAddon: string | T): void;
    abstract stopAddon(idOrAddon: string | T): void;

    loadState() {
        const saved = JsonStore.get(`${this.prefix}s` as Files);
        if (!saved) return;
        Object.assign(this.state, saved);
    }

    saveState() {
        JsonStore.set(`${this.prefix}s` as Files, this.state);
    }

    showAddonError(addon: Addon, message: string, info: ErrorInfo) {
        Modals.showAddonError(new AddonError(addon.name || addon.filename, addon.filename, message, info, this.prefix));
        return null;
    }

    watchAddons() {
        Logger.log(this.name, `Starting to watch ${this.prefix} addons.`);

        fs.watch(this.addonFolder, {persistent: false}, async (eventType, filename) => {
            if (!eventType || !filename) return;

            let absolutePath = path.resolve(this.addonFolder, filename);
            if (!filename.endsWith(this.extension)) {
                // Check to see if this filename has the duplicated file pattern `something(1).ext`
                const match = filename.match(this.duplicatePattern);
                if (!match) return;
                const ext = match[0];
                const truncated = filename.replace(ext, "");
                const newFilename = truncated + this.extension;
                const absoluteNewFilename = path.resolve(this.addonFolder, newFilename);

                // If this file already exists, give a warning and move on.
                if (fs.existsSync(absoluteNewFilename)) {
                    Logger.warn(this.name, `Duplicate files found: ${filename} and ${newFilename}`);
                    return;
                }

                // Rename the file and let it go on
                try {
                    fs.renameSync(absolutePath, absoluteNewFilename);
                    filename = newFilename;
                    absolutePath = absoluteNewFilename;
                }
                catch (err) {
                    Logger.err(this.name, `Could not rename file: ${filename} ${newFilename}`, err);
                    return;
                }
            }

            await new Promise(r => setTimeout(r, 100));

            try {
                const stats = fs.statSync(absolutePath);
                if (!stats?.isFile()) return;
                if (typeof stats.mtimeMs !== "number") return;
                if (this.timeCache[filename] == stats.mtimeMs) return;
                this.timeCache[filename] = stats.mtimeMs;

                // Load/reload the addon if it's been created/updated
                if (eventType == "rename") {
                    this.unloadAddon(filename);
                    this.readAddon(filename, true);
                }
                else if (eventType == "change") {
                    this.reloadAddon(filename);
                }
            }
            catch (err) {
                // Unload the addon if it's been deleted
                if ((err as SystemError).code !== "ENOENT" && !(err as SystemError)?.message.startsWith("ENOENT")) return;
                delete this.timeCache[filename];
                this.unloadAddon(filename);
            }
        });
    }

    readAllAddons() {
        const files = fs.readdirSync(this.addonFolder);

        for (let filename of files) {
            const absolutePath = path.resolve(this.addonFolder, filename);
            const stats = fs.statSync(absolutePath);
            if (!stats || !stats.isFile()) continue;

            if (!filename.endsWith(this.extension)) {
                // Lets check to see if this filename has the duplicated file pattern `something(1).ext`
                const match = filename.match(this.duplicatePattern);
                if (!match) continue;

                const truncated = filename.replace(match[0], "");
                const newFilename = truncated + this.extension;
                const absoluteNewFilename = path.resolve(this.addonFolder, newFilename);

                // If this file already exists, give a warning and move on.
                if (fs.existsSync(absoluteNewFilename)) {
                    Logger.warn("AddonManager", `Duplicate files found: ${filename} and ${newFilename}`);
                    continue;
                }

                // Rename the file and let it go on
                try {
                    fs.renameSync(absolutePath, absoluteNewFilename);
                    filename = newFilename;
                }
                catch (err) {
                    Logger.err("AddonManager", `Could not rename file: ${filename} ${newFilename}`, err);
                }
            }

            this.timeCache[filename] = stats.mtimeMs;

            const addon = this.readAddon(filename);
            if (addon) this.addonInfo.push(addon);
        }

        this.saveState();
    }

    readAddon(filename: string, loadAfter?: boolean) {
        const filePath = path.resolve(this.addonFolder, filename);
        let fileContent = fs.readFileSync(filePath, "utf8");

        // Remove the BOM if it exists
        if (fileContent.charCodeAt(0) === 0xFEFF) fileContent = fileContent.slice(1);

        let lineEndIndex = fileContent.indexOf("\n");
        if (lineEndIndex === -1) lineEndIndex = fileContent.length;
        const firstLine = fileContent.slice(0, lineEndIndex);

        // Validate that there is a meta comment
        const hasMetaComment = firstLine.includes("/**");
        if (!hasMetaComment) {
            Modals.showAddonError(new AddonError(filename, filename, t("Addons.metaNotFound"), {
                message: "",
                stack: fileContent
            }, this.prefix));
            return null;
        }

        const stats = fs.statSync(filePath);
        const addon = parseJsDoc(fileContent) as Partial<Addon>;

        // Add fallbacks for important fields
        if (!addon.author || typeof addon.author !== "string") addon.author = t("Addons.unknownAuthor");
        if (!addon.version || typeof addon.version !== "string") addon.version = "???";
        if (!addon.description || typeof addon.description !== "string") addon.description = t("Addons.noDescription");
        if (addon.runAt !== "idle") addon.runAt = "connection";

        // Set other metadata
        addon.id = addon.name || filename;
        addon.slug = filename.replace(this.extension, "").replace(/ /g, "-");
        addon.filename = filename;
        addon.added = stats.atimeMs;
        addon.modified = stats.mtimeMs;
        addon.size = stats.size;
        addon.fileContent = fileContent;

        if (loadAfter) this.loadAddon(addon as Addon);
        return addon as Addon;
    }

    abstract initAddon(addon: Addon): T | null;

    loadAddon(addon: Addon) {
        const initialized = this.initAddon(addon);

        // Make the addon partial if it failed to initialize
        if (!initialized) {
            this.state[addon.id] = false;
            addon.partial = true;
            this.addonList.push(addon as T);
            this.trigger("loaded", addon);
            return;
        }

        this.addonList.push(initialized);
        this.trigger("loaded", initialized);
        if (this.hasInitialized) Toasts.success(t("Addons.wasLoaded", {name: addon.name, version: addon.version}));

        // Start the addon if it's enabled
        if (this.state[initialized.id]) {
            this.startAddon(initialized);
        }
    }

    unloadAddon(idOrFileOrAddon: string | T, isReload = false) {
        const addon = this.resolveAddon(idOrFileOrAddon);
        if (!addon) return false;

        if (this.state[addon.id]) {
            if (isReload) this.stopAddon(addon);
            else this.disableAddon(addon);
        }

        this.addonList.splice(this.addonList.indexOf(addon), 1);
        this.trigger("unloaded", addon);
        Toasts.success(t("Addons.wasUnloaded", {name: addon.name}));
        return true;
    }

    reloadAddon(idOrFileOrAddon: string | T) {
        const addon = this.resolveAddon(idOrFileOrAddon);
        if (!addon) return false;

        // Unload, then reload
        const didUnload = this.unloadAddon(addon, true);
        if (!didUnload) return false;

        this.readAddon(addon.filename, true);
        return true;
    }

    isLoaded(idOrFile: string) {
        const addon = this.resolveAddon(idOrFile);
        if (!addon) return false;
        return true;
    }

    isEnabled(idOrFile: string) {
        const addon = this.resolveAddon(idOrFile);
        if (!addon) return false;
        return this.state[addon.id];
    }

    enableAddon(idOrAddon: string | T) {
        const addon = this.resolveAddon(idOrAddon);
        if (!addon || addon.partial || this.state[addon.id]) return;

        this.state[addon.id] = true;
        this.trigger("enabled", addon);

        const err = this.startAddon(addon);
        this.saveState();
        return err;
    }

    enableAllAddons() {
        for (const addon of this.addonList) this.enableAddon(addon);
        this.trigger("batch");
    }

    disableAddon(idOrAddon: string | T) {
        const addon = this.resolveAddon(idOrAddon);
        if (!addon || addon.partial || !this.state[addon.id]) return;

        this.state[addon.id] = false;
        this.trigger("disabled", addon);

        const err = this.stopAddon(addon);
        this.saveState();
        return err;
    }

    disableAllAddons() {
        for (const addon of this.addonList) this.disableAddon(addon);
        this.trigger("batch");
    }

    toggleAddon(id: string) {
        if (this.state[id]) this.disableAddon(id);
        else this.enableAddon(id);
    }

    deleteAddon(idOrFileOrAddon: string | T) {
        const addon = this.resolveAddon(idOrFileOrAddon);
        if (!addon) return;

        return fs.unlinkSync(path.resolve(this.addonFolder, addon.filename));
    }

    saveAddon(idOrFileOrAddon: string | T, content: string) {
        const addon = this.resolveAddon(idOrFileOrAddon);
        if (!addon) return;

        return fs.writeFileSync(path.resolve(this.addonFolder, addon.filename), content);
    }

    editAddon(idOrFileOrAddon: string | T, system?: "system" | "detached" | "external" | boolean) {
        const addon = this.resolveAddon(idOrFileOrAddon);
        if (!addon) return;

        const fullPath = path.resolve(this.addonFolder, addon.filename);
        if (typeof system == "undefined") system = Settings.get("settings", "addons", "editAction");

        if (system === "system") return ipc.openPath(`${fullPath}`);
        else if (system === "external") return RemoteAPI.editor.open(this.prefix as "theme", addon.filename);
        return this.openDetached(addon);
    }

    openDetached(addon: T) {
        const fullPath = path.resolve(this.addonFolder, addon.filename);
        const content = fs.readFileSync(fullPath).toString();

        if (this.windows.has(fullPath)) return;
        this.windows.add(fullPath);

        const editorRef = React.createRef<{resize(): void; hasUnsavedChanges: boolean;}>();
        const editor = React.createElement(AddonEditor, {
            id: "bd-floating-editor-" + addon.id,
            ref: editorRef,
            content: content,
            save: this.saveAddon.bind(this, addon),
            openNative: this.editAddon.bind(this, addon, true),
            language: this.language
        });

        FloatingWindows.open({
            onClose: () => {
                this.windows.delete(fullPath);
            },
            onResize: () => {
                if (!editorRef || !editorRef.current || !editorRef.current.resize!) return;
                editorRef.current.resize();
            },
            title: addon.name,
            id: "bd-floating-window-" + addon.id,
            className: "floating-addon-window",
            height: 470,
            width: 410,
            center: true,
            resizable: true,
            children: editor,
            confirmClose: () => {
                if (!editorRef || !editorRef.current) return false;
                return editorRef.current.hasUnsavedChanges;
            },
            confirmationText: t("Addons.confirmationText", {name: addon.name})
        });
    }

    resolveAddon(idOrFileOrAddon: string | T) {
        if (typeof idOrFileOrAddon === "string") {
            return this.addonList.find(addon => addon.id === idOrFileOrAddon || addon.filename === idOrFileOrAddon);
        }

        return idOrFileOrAddon;
    }
}
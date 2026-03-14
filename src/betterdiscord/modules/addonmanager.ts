import path from "path";
import fs from "fs";

import Logger from "@common/logger";

import AddonError from "@structs/addonerror";

import Settings from "@stores/settings";
import Events from "./emitter";
import JsonStore, {type Files} from "@stores/json";
import Toasts from "@stores/toasts";
import React from "./react";
import {t} from "@common/i18n";
import ipc from "./ipc";
import type {Theme} from "./thememanager";
import type {Plugin} from "./pluginmanager";

import AddonEditor from "@ui/misc/addoneditor";
import FloatingWindows from "@ui/floatingwindows";
import Store from "@stores/base";
import type {SystemError} from "bun";
import RemoteAPI from "@polyfill/remote";


// const SWITCH_ANIMATION_TIME = 250;

const openItem = ipc.openPath;

const splitRegex = /[^\S\r\n]*?\r?(?:\r\n|\n)[^\S\r\n]*?\*[^\S\r\n]?/;
const escapedAtRegex = /^\\@/;

const stripBOM = function (fileContent: string) {
    if (fileContent.charCodeAt(0) === 0xFEFF) {
        fileContent = fileContent.slice(1);
    }
    return fileContent;
};

// This is a temporary type, no one should rely on this externally
export interface Addon extends AddonMeta {
    added: number;
    donate?: string;
    fileContent?: string;
    filename: string;
    format: string;
    id: string;
    modified: number;
    partial?: boolean;
    patreon?: string;
    size: number;
    slug: string;
}

export interface AddonMeta {
    /**
     * The name of the addon. It typically does not contain spaces, but it is allowed.
     */
    name: string;
    author: string;
    /**
     * A basic description of what the addon does.
     */
    description: string;
    /**
     * Version representing the current update level. Semantic versioning recommended.
     */
    version: string;
    /**
     * A Discord invite code, useful for directing users to a support server.
     */
    invite?: string;
    /**
     * Discord snowflake ID of the developer. This allows users to get in touch.
     */
    authorId?: string;
    /**
     * Link to use for the author's name on the addon pages.
     */
    authorLink?: string;
    /**
     * Link to donate to the developer.
     */
    donate?: string;
    /**
     * Link to the Patreon of the developer.
     */
    patreon?: string;
    /**
     * Developer's (or addon's) website link.
     */
    website?: string;
    /**
     * Link to the source on GitHub of the addon.
     */
    source?: string;
};

export type AddonMetaLoaded = {
    kind: "loaded";
    meta: AddonMeta;
};
export type AddonMetaNotLoaded = {
    kind: "not-loaded";
    error: AddonError;
};
export type AddonMetaLoad = AddonMetaLoaded | AddonMetaNotLoaded;

export type AddonStateLoaded = {
    kind: "loaded";
    addon: Plugin | Theme;
};

export type AddonStateNotLoaded = {
    kind: "not-loaded";
    error: AddonError;
};

export type AddonStateStarted<A extends Plugin | Theme> = {
    kind: "started";
    addon: A;
};

export type AddonStateNotStarted = {
    kind: "not-started";
    error: AddonError;
};

export type AddonStateStopped = {
    kind: "stopped";
};

export type AddonStateNotStopped = {
    kind: "not-stopped";
    error: AddonError;
};

export type AddonStateError = AddonStateNotLoaded | AddonStateNotStarted | AddonStateNotStopped;
export type AddonStateLoad = AddonStateLoaded | AddonStateNotLoaded;
export type AddonStateStart<A extends Plugin | Theme> = AddonStateStarted<A> | AddonStateNotStarted;
export type AddonStateStop = AddonStateStopped | AddonStateNotStopped;
export type AddonState<A extends Plugin | Theme> = AddonStateStart<A> | AddonStateLoad | AddonStateStop;

export default abstract class AddonManager<A extends Plugin | Theme> extends Store {

    protected abstract name: string;

    abstract addonFolder(): string;
    abstract validateFileBase(base: string): boolean;
    abstract initializeAddon(addon: A): Promise<AddonStateLoad>;
    abstract startAddon(addon: A): Promise<AddonStateStart<A>>;
    abstract stopAddon(addon: A): Promise<AddonStateStop>;

    constructor(
        public prefix: string,
        public language: string,
        public order: number,
    ) {
        super();
        this.pluralPrefix = prefix + "s";
    }

    /**
     * Stats for each relative addon file path.
     *
     * @example "example.plugin.js"
     * @todo If you are implementing multi-file addons, it will be "example/index.js" or whatever you are implementing.
     */
    protected fileStats: Map<string, fs.Stats> = new Map();

    public enablement: Record<string, boolean> = {};

    readonly pluralPrefix: string;

    trigger(event: string, ...args: any[]): boolean {
        super.emitChange();
        return Events.emit(`${this.prefix}-${event}`, ...args);
    };

    addonList: A[] = [];

    async initialize(): Promise<Array<AddonState<A>>> {
        Settings.registerAddonPanel(this as unknown as AddonManager<Plugin> | AddonManager<Theme>);

        const states = await this.loadAllAddons();
        if (states.length > 0) {
            Toasts.show(t("Addons.manyEnabled", {count: states.length, context: this.prefix}));
        }
        return states;
    }

    loadEnablement(): void {
        const saved = JsonStore.get(this.pluralPrefix as Files);
        if (!saved) return;
        Object.assign(this.enablement, saved);
    }

    saveState(): void {
        JsonStore.set(this.pluralPrefix as Files, this.enablement);
    }

    watcher?: fs.FSWatcher;
    watchAddons(): void {
        if (this.watcher) {
            Logger.err(this.name, `Already watching ${this.prefix} addons.`);
            return;
        }

        Logger.log(this.name, `Starting to watch ${this.prefix} addons.`);

        const addonFolder = this.addonFolder();

        this.watcher = fs.watch(addonFolder, {persistent: false}, (eventType, filebase) => {
            if (!eventType || !filebase) return;

            if (!this.validateFileBase(filebase)) {
                return;
            }

            const absolutePath = path.resolve(addonFolder, filebase);
            const addon = this.addonList.find(a => a.filename === filebase);

            if (!addon) {
                Logger.err(this.name, `No addon cache found: ${filebase}.`);
                return;
            }

            // previously we were waiting 100 ms here
            let stats: fs.Stats;
            try {
                stats = fs.statSync(absolutePath);
            }
            catch (err) {
                if ((err as SystemError).code !== "ENOENT" && !(err as SystemError)?.message.startsWith("ENOENT")) return;
                this.fileStats.delete(filebase);
                this.unloadAddon(addon, true);
                return;
            }
            if (!stats.isFile()) return;
            if (this.fileStats.get(filebase)?.mtimeMs === stats.mtimeMs) return;
            if (this.fileStats.set(filebase, stats)) return;

            if (eventType == "rename") this.loadAddon(filebase, true);
            if (eventType == "change") this.reloadAddon(addon, true);
        });
    }

    unwatchAddons(): void {
        if (!this.watcher) return Logger.error(this.name, `Was not watching ${this.prefix} addons.`);
        this.watcher.close();
        delete this.watcher;
        Logger.log(this.name, `No longer watching ${this.prefix} addons.`);
    }

    extractMeta(fileContent: string, filename: string): AddonMetaLoad {
        const firstLine = fileContent.split("\n")[0];

        const hasMetaComment = firstLine.includes("/**");
        if (!hasMetaComment) {
            return {
                kind: "not-loaded",
                error: new AddonError(filename, filename, t("Addons.metaNotFound"), {message: "", stack: fileContent}, this.prefix),
            };
        };
        const metaInfo = this.parseJSDoc(fileContent);

        /**
         * Okay we have a meta JSDoc, let's validate it
         * and do some extra parsing for advanced options
         */

        if (!metaInfo.author || typeof (metaInfo.author) !== "string") metaInfo.author = t("Addons.unknownAuthor");
        if (!metaInfo.version || typeof (metaInfo.version) !== "string") metaInfo.version = "???";
        if (!metaInfo.description || typeof (metaInfo.description) !== "string") metaInfo.description = t("Addons.noDescription");

        return {
            kind: "loaded",
            meta: metaInfo,
        };
    }

    parseJSDoc(fileContent: string): AddonMeta {
        const block = fileContent.split("/**", 2)[1].split("*/", 1)[0];
        const out: Record<string, string | string[]> = {};
        let field = "";
        let accum = "";
        for (const line of block.split(splitRegex)) {
            if (line.length === 0) continue;
            if (line.charAt(0) === "@" && line.charAt(1) !== " ") {
                if (!out[field]) {
                    out[field] = accum.trim();
                }
                else {
                    if (!Array.isArray(out[field])) out[field] = [out[field] as string];
                    (out[field] as string[]).push(accum.trim());
                }
                const l = line.indexOf(" ");
                field = line.substring(1, l);
                accum = line.substring(l + 1);
            }
            else {
                accum += " " + line.replace("\\n", "\n").replace(escapedAtRegex, "@");
            }
        }
        if (!out[field]) {
            out[field] = accum.trim();
        }
        else {
            if (!Array.isArray(out[field])) out[field] = [out[field] as string];
            (out[field] as string[]).push(accum.trim());
        }
        delete out[""];
        out.format = "jsdoc";
        return out as unknown as AddonMeta;
    }

    async requireAddon(filerel: string): Promise<AddonStateLoad> {
        let fileContent = await fs.promises.readFile(filerel, "utf8");
        fileContent = stripBOM(fileContent);
        const stats = fs.statSync(filerel);
        const base = path.basename(filerel);
        const extract = this.extractMeta(fileContent, base);
        if (extract.kind === "not-loaded") {
            return {
                kind: "not-loaded",
                error: extract.error,
            };
        }
        const addon = extract.meta as Partial<Plugin | Theme>;
        if (!addon.author) addon.author = t("Addons.unknownAuthor");
        if (!addon.version) addon.version = "???";
        if (!addon.description) addon.description = t("Addons.noDescription");
        // if (!addon.name || !addon.author || !addon.description || !addon.version) return new AddonError(addon.name || path.basename(filename), filename, "Addon is missing name, author, description, or version", {message: "Addon must provide name, author, description, and version.", stack: ""}, this.prefix);
        addon.id = addon.name || base;
        addon.slug = base.replace(/.\w+.\w+$/, "").replace(/ /g, "-");
        addon.filename = base;
        addon.added = stats.atimeMs;
        addon.modified = stats.mtimeMs;
        addon.size = stats.size;
        addon.fileContent = fileContent;
        if (this.addonList.find(c => c.id == addon.id)) {
            return {
                kind: "not-loaded",
                error: new AddonError(addon.name!, filerel, t("Addons.alreadyExists", {context: this.prefix, name: addon.name}), {}, this.prefix)
            };
        }
        this.addonList.push(addon as A);
        return {
            kind: "loaded",
            addon: addon as Plugin | Theme,
        };
    }

    async loadAddon(filename: string, shouldToast = false): Promise<AddonStateLoad | AddonStateStarted<A>> {
        const required = await this.requireAddon(path.resolve(this.addonFolder(), filename));
        if (required.kind === "not-loaded") {
            const partialAddon = this.addonList.find(c => c.filename == filename);
            if (partialAddon) {
                partialAddon.partial = true;
                this.enablement[partialAddon.id] = false;
                this.trigger("loaded", partialAddon);
            }
            return required;
        }

        const {addon} = required;
        const inited = await this.initializeAddon(addon as A);
        if (inited.kind === "not-loaded") {
            this.enablement[addon.id] = false;
            addon.partial = true;
            this.trigger("loaded", addon);
            return inited;
        }

        if (shouldToast) Toasts.success(t("Addons.wasLoaded", {name: addon.name, version: addon.version}));
        this.trigger("loaded", addon);

        if (this.enablement[addon.id]) {
            await this.startAddon(addon as A);
        }
        else if (this.enablement[addon.id] === undefined) {
            this.enablement[addon.id] = false;
        }

        return {
            kind: this.enablement[addon.id] ? "started" : "loaded",
            addon: addon as A,
        };
    }

    async unloadAddon(addon: A, shouldToast = true, isReload = false): Promise<boolean> {
        // console.log("watcher", "unloadAddon", idOrFileOrAddon, addon);
        if (!addon) return false;
        if (this.enablement[addon.id]) {
            if (isReload) await this.stopAddon(addon);
            else await this.disableAddon(addon);
        }

        this.addonList.splice(this.addonList.indexOf(addon), 1);
        this.trigger("unloaded", addon);
        if (shouldToast) Toasts.success(t("Addons.wasUnloaded", {name: addon.name}));
        return true;
    }

    async reloadAddon(addon: A, shouldToast = true): Promise<AddonStateLoad | AddonStateStarted<A>> {
        const didUnload = await this.unloadAddon(addon, shouldToast, true);
        if (!didUnload) {
            return {
                kind: "not-loaded",
                error: new AddonError(addon.name, addon.filename, "Failed to unload while reloading", {}, this.prefix)
            };
        }
        return this.loadAddon(addon.filename, shouldToast);
    }

    isLoaded(idOrFile: string): boolean {
        return this.getAddon(idOrFile) !== undefined;
    }

    isEnabled(idOrFile: string): boolean {
        const addon = this.getAddon(idOrFile);
        if (!addon) return false;
        return this.enablement[addon.id];
    }

    getAddon(idOrFile: string): A | undefined {
        return this.addonList.find(c => c.id == idOrFile || c.filename == idOrFile);
    }

    async enableAddon(addon: A): Promise<AddonStateStart<A>> {
        if (addon.partial) {
            return {
                kind: "not-started",
                error: new AddonError(addon.name, addon.filename, t("Addons.couldNotEnable", {name: addon.id}), {}, this.prefix),
            };
        }
        if (this.enablement[addon.id]) {
            return {
                kind: "not-started",
                error: new AddonError(addon.name, addon.filename, t("Addons.couldNotEnable", {name: addon.id}), {}, this.prefix),
            };
        }
        this.enablement[addon.id] = true;
        this.trigger("enabled", addon);
        // setTimeout(() => {

        const err = await this.startAddon(addon);
        this.saveState();
        return err;
        // }, SWITCH_ANIMATION_TIME);
    }

    async enableAllAddons(): Promise<Array<AddonStateStart<A>>> {
        const originalSetting = Settings.get("settings", "general", "showToasts");
        Settings.set("settings", "general", "showToasts", false);
        const results: Array<AddonStateStart<A>> = [];
        for (let a = 0; a < this.addonList.length; a++) {
            const result = await this.enableAddon(this.addonList[a]);
            results.push(result);
        }
        Settings.set("settings", "general", "showToasts", originalSetting);
        this.trigger("batch");
        return results;
    }

    async disableAddon(addon: A): Promise<AddonStateStop> {
        if (addon.partial) {
            return {
                kind: "not-stopped",
                error: new AddonError(addon.name, addon.filename, t("Addons.couldNotDisable", {name: addon.id}), {}, this.prefix),
            };
        }
        if (!this.enablement[addon.id]) {
            return {
                kind: "not-stopped",
                error: new AddonError(addon.name, addon.filename, t("Addons.couldNotDisable", {name: addon.id}), {}, this.prefix),
            };
        }
        this.enablement[addon.id] = false;
        this.trigger("disabled", addon);
        // setTimeout(() => {
        const err = await this.stopAddon(addon);
        this.saveState();
        return err;
        // }, SWITCH_ANIMATION_TIME);
    }

    async disableAllAddons(): Promise<AddonStateStop[]> {
        const originalSetting = Settings.get("settings", "general", "showToasts");
        Settings.set("settings", "general", "showToasts", false);
        const results: AddonStateStop[] = [];
        for (let a = 0; a < this.addonList.length; a++) {
            const result = await this.disableAddon(this.addonList[a]);
            results.push(result);
        }
        Settings.set("settings", "general", "showToasts", originalSetting);
        this.trigger("batch");
        return results;
    }

    toggleAddon(addon: A): Promise<AddonStateStart<A> | AddonStateStop> {
        if (this.enablement[addon.id]) return this.disableAddon(addon);
        return this.enableAddon(addon);
    }

    async loadNewAddons(): Promise<{added: string[]; removed: A[];}> {
        const addonFolder = this.addonFolder();
        const files = await fs.promises.readdir(addonFolder);
        const removed = this.addonList.filter(a => !files.includes(a.filename));
        const added = files.filter(f => !this.addonList.find(a => a.filename == f) && this.validateFileBase(f) && fs.statSync(path.resolve(addonFolder, f)).isFile());
        return {added, removed};
    }

    async updateList(): Promise<void> {
        const results = await this.loadNewAddons();
        for (const filename of results.added) await this.loadAddon(filename);
        for (const name of results.removed) await this.unloadAddon(name);
    }

    async loadAllAddons(): Promise<Array<AddonState<A>>> {
        this.loadEnablement();
        const states: Array<AddonState<A>> = [];
        const addonFolder = this.addonFolder();
        const files = await fs.promises.readdir(addonFolder);

        type Resolved = {
            filename: string;
            absolute: string;
            content: string;
            stats: fs.Stats;
            meta: AddonMeta;
        };

        const resolved: Resolved[] = [];

        for (const filename of files) {
            if (!this.validateFileBase(filename)) continue;
            const absolute = path.resolve(addonFolder, filename);
            const stats = await fs.promises.stat(absolute);
            const content = await fs.promises.readFile(absolute, "utf8");
            const extracted = await this.extractMeta(content, filename);
            if (extracted.kind === "not-loaded") {
                states.push(extracted);
                continue;
            }
            const meta = extracted.meta;
            this.fileStats.set(filename, stats);
            resolved.push({filename, absolute, content, stats, meta});
        }

        const concurrency: Array<Promise<void>> = [];
        for (const {filename} of resolved) {
            concurrency.push((async (): Promise<void> => {
                const load = await this.loadAddon(filename, false);
                states.push(load);
            })());
        }
        await Promise.all(concurrency);

        this.saveState();
        this.watchAddons();
        return states;
    }

    deleteAddon(addon: A): Promise<void> {
        // console.log(path.resolve(this.addonFolder, addon.filename), fs.unlinkSync)
        return fs.promises.unlink(path.resolve(this.addonFolder(), addon.filename));
    }

    saveAddon(addon: A, content: string): Promise<void> {
        return fs.promises.writeFile(path.resolve(this.addonFolder(), addon.filename), content);
    }

    async editAddon(addon: A, system?: "system" | "detached" | "external" | boolean): Promise<void> {
        const fullPath = path.resolve(this.addonFolder(), addon.filename);
        if (typeof (system) == "undefined") system = Settings.get("settings", "addons", "editAction");
        if (system === "system") return openItem(`${fullPath}`);
        else if (system === "external") return RemoteAPI.editor.open(this.prefix as "theme", addon.filename);
        return this.openDetached(addon);
    }

    windows = new Set<string>();
    async openDetached(addon: A): Promise<void> {
        const fullPath = path.resolve(this.addonFolder(), addon.filename);
        if (this.windows.has(fullPath)) return;

        const content = fs.promises.readFile(fullPath, "utf8");
        this.windows.add(fullPath);

        const editorRef = React.createRef<{resize(): void; hasUnsavedChanges: boolean;}>();
        const editor = React.createElement(AddonEditor, {
            id: "bd-floating-editor-" + addon.id,
            ref: editorRef,
            content: await content,
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
}
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

import AddonEditor from "@ui/misc/addoneditor";
import FloatingWindows from "@ui/floatingwindows";
import Store from "@stores/base";
import type {SystemError} from "bun";
import RemoteAPI from "@polyfill/remote";
import type {AddonMeta} from "./addonmeta";
import type {AddonMetaLoad, AddonState, AddonStateLoad, AddonStateNotLoaded, AddonStateStart, AddonStateStarted, AddonStateStop} from "./addonstate";
import type {AddonAny, AddonType} from "./addon";


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

export default abstract class AddonManager<A extends AddonAny = AddonAny> extends Store {

    protected abstract name: string;

    abstract addonFolder(): string;
    abstract validateFilename(base: string): boolean;
    abstract initializeAddon(addon: A): Promise<AddonStateLoad>;
    abstract startAddon(addon: A): Promise<AddonStateStart<A>>;
    abstract stopAddon(addon: A): Promise<AddonStateStop>;

    constructor(
        public prefix: AddonType,
        public language: string,
        public order: number,
    ) {
        super();
        this.pluralPrefix = prefix + "s";
    }

    cacheByName: Record<string, A> = Object.create(null);
    cacheByFilename: Record<string, A> = Object.create(null);

    /**
     * Stats for each relative addon file path.
     *
     * @example "example.plugin.js"
     * @todo If you are implementing multi-file addons, it will be "example/index.js" or whatever you are implementing.
     */
    protected fileStats: Map<string, fs.Stats> = new Map();

    public enablement: Record<string, boolean> = Object.create(null);

    readonly pluralPrefix: string;

    trigger(event: string, ...args: any[]): boolean {
        super.emitChange();
        return Events.emit(`${this.prefix}-${event}`, ...args);
    };
    async initialize(): Promise<Array<AddonState<A>>> {
        Settings.registerAddonPanel(this);

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

    private watchTimers = new Map<string, Timer>();
    watcher?: fs.FSWatcher;
    watchAddons(): void {
        if (this.watcher) {
            Logger.err(this.name, `Already watching ${this.prefix} addons.`);
            return;
        }

        Logger.log(this.name, `Starting to watch ${this.prefix} addons.`);

        const addonFolder = this.addonFolder();
        this.watcher = fs.watch(addonFolder, {persistent: false}, (eventType, filename) => {
            if (!eventType || !filename) return;

            if (!this.validateFilename(filename)) {
                return;
            }

            if (this.watchTimers.has(filename)) {
                clearTimeout(this.watchTimers.get(filename)!);
            }

            const timer: Timer = setTimeout(async () => {
                try {
                    Logger.info("AddonManager~watcher", eventType, filename);
                    let addon = this.cacheByFilename[filename];

                    if (!addon) {
                        const loaded = await this.loadAddon(filename);
                        if (loaded.kind === "not-loaded") {
                            Logger.error(this.name, `Failed to instantiate ${filename}.`, loaded.error);
                            return;
                        }
                        addon = loaded.addon as A;
                        return;
                    }

                    const absolutePath = path.resolve(addonFolder, filename);
                    let stats: fs.Stats;
                    try {
                        stats = await fs.promises.stat(absolutePath);
                    }
                    catch (err) {
                        if ((err as SystemError).code !== "ENOENT" && !(err as SystemError)?.message.startsWith("ENOENT")) return;
                        this.fileStats.delete(filename);
                        Logger.info("AddonManager~watcher", "unload", eventType, filename);
                        await this.unloadAddon(addon, true);
                        return;
                    }
                    if (!stats.isFile()) return;
                    if (this.fileStats.get(filename)?.mtimeMs === stats.mtimeMs) return;
                    this.fileStats.set(filename, stats);

                    if (eventType == "rename") {
                        Logger.info("AddonManager~watcher", "load new", eventType, filename);
                        const oldAddon = this.getAddon(addon.id)!;
                        await this.loadAddon(filename, true);
                        await this.unloadAddon(oldAddon, true);
                    }
                    else if (eventType == "change") {
                        Logger.info("AddonManager~watcher", "reload", eventType, filename);
                        await this.reloadAddon(addon, true);
                    };
                }
                finally {
                    this.watchTimers.delete(filename);
                }
            }, 1000);
            this.watchTimers.set(filename, timer);
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
                error: new AddonError({
                    addonType: this.prefix,
                    addon: {filename},
                    message: t("Addons.metaNotFound"),
                    cause: new TypeError(fileContent),
                }),
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
        const filename = path.basename(filerel);
        const extract = this.extractMeta(fileContent, filename);
        if (extract.kind === "not-loaded") {
            return {
                kind: "not-loaded",
                error: new AddonError({
                    addonType: this.prefix,
                    addon: {filename},
                    message: "Failed to parse addon's meta",
                    cause: extract.error
                }),
            };
        }
        const addon = extract.meta as Partial<AddonAny>;
        if (!addon.author) addon.author = t("Addons.unknownAuthor");
        if (!addon.version) addon.version = "???";
        if (!addon.description) addon.description = t("Addons.noDescription");
        // if (!addon.name || !addon.author || !addon.description || !addon.version) return new AddonError(addon.name || path.basename(filename), filename, "Addon is missing name, author, description, or version", {message: "Addon must provide name, author, description, and version.", stack: ""}, this.prefix);
        addon.id = addon.name || filename;
        addon.slug = filename.replace(/.\w+.\w+$/, "").replace(/ /g, "-");
        addon.filename = filename;
        addon.added = stats.atimeMs;
        addon.modified = stats.mtimeMs;
        addon.size = stats.size;
        addon.fileContent = fileContent;
        if (this.getAddon(addon.id)) {
            return {
                kind: "not-loaded",
                error: new AddonError({
                    addonType: this.prefix,
                    addon: addon as AddonAny,
                    message: t("Addons.alreadyExists", {context: this.prefix, name: addon.name}),
                }),
            };
        }
        this.cacheByFilename[addon.filename] = addon as A;
        if (addon.name) this.cacheByName[addon.name] = addon as A;
        return {
            kind: "loaded",
            addon: addon as AddonAny,
        };
    }

    async loadAddon(filename: string, shouldToast = false): Promise<AddonStateLoad | AddonStateStarted<A>> {
        const required = await this.requireAddon(path.resolve(this.addonFolder(), filename));
        if (required.kind === "not-loaded") {
            const partialAddon = this.cacheByFilename[filename];
            if (partialAddon) {
                partialAddon.partial = true;
                this.enablement[partialAddon.id] = false;
            }
            return required;
        }

        const {addon} = required;
        const inited = await this.initializeAddon(addon as A);
        if (inited.kind === "not-loaded") {
            this.enablement[addon.id] = false;
            addon.partial = true;
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
        if (typeof addon === "string") {
            // NOTE: Currently, 'reload' is the only public consumer of the 'unloadAddon' logic.
            const err = "'BdApi.Plugins.reload(string)' is deprecated, use 'BdApi.Plugins.reload(BdApi.Plugins.get(id))'.";
            Logger.warn(this.name, err);
            addon = this.getAddon(addon) as A;
            if (!addon) {
                return false;
            }
        }
        // console.log("watcher", "unloadAddon", idOrFileOrAddon, addon);
        if (!addon) return false;
        if (this.enablement[addon.id]) {
            if (isReload) await this.stopAddon(addon);
            else await this.disableAddon(addon);
        }

        delete this.cacheByFilename[addon.filename];
        delete this.cacheByName[addon.name];
        this.trigger("unloaded", addon);
        if (shouldToast) Toasts.success(t("Addons.wasUnloaded", {name: addon.name}));
        return true;
    }

    async reloadAddon(addon: A, shouldToast = true): Promise<AddonStateNotLoaded | AddonStateLoad | AddonStateStarted<A>> {
        if (typeof addon === "string") {
            const err = "'BdApi.Plugins.reload(string)' is deprecated, use 'BdApi.Plugins.reload(BdApi.Plugins.get(id))'.";
            return {
                kind: "not-loaded",
                error: new AddonError({
                    addonType: this.prefix,
                    addon: {filename: String(addon)},
                    message: t("Addons.methodError", {method: "reload(string)"}),
                    cause: new Error(err),
                }),
            };
        }
        const didUnload = await this.unloadAddon(addon, shouldToast, true);
        if (!didUnload) {
            return {
                kind: "not-loaded",
                error: new AddonError({
                    addonType: this.prefix,
                    addon,
                    message: "Failed to unload while reloading",
                }),
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
        return this.cacheByFilename[idOrFile] || this.cacheByName[idOrFile];
    }

    async enableAddon(addon: A): Promise<AddonStateStart<A>> {
        if (addon.partial || this.enablement[addon.id]) {
            return {
                kind: "not-started",
                error: new AddonError({
                    addonType: this.prefix,
                    addon,
                    message: t("Addons.couldNotEnable", {name: addon.id}),
                }),
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
        const results: Array<AddonStateStart<A>> = await Promise.all(Object.values(this.cacheByName).map(this.enableAddon.bind(this)));
        Settings.set("settings", "general", "showToasts", originalSetting);
        this.trigger("batch");
        return results;
    }

    async disableAddon(addon: A): Promise<AddonStateStop> {
        if (addon.partial || !this.enablement[addon.id]) {
            return {
                kind: "not-stopped",
                error: new AddonError({
                    addonType: this.prefix,
                    addon,
                    message: t("Addons.couldNotDisable", {name: addon.id}),
                }),
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
        const results: AddonStateStop[] = await Promise.all(Object.values(this.cacheByName).map(this.disableAddon.bind(this)));
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
        const actual = new Set((await fs.promises.readdir(addonFolder)));
        const known = new Set(Object.keys(this.cacheByFilename));
        const removed = Array.from(known.difference(actual)).map(f => this.cacheByFilename[f]);
        const potentialAdded = actual.difference(known);

        const added: string[] = [];
        for (const f of potentialAdded) {
            const fullPath = path.resolve(addonFolder, f);
            if (this.validateFilename(f)) {
                const stats = await fs.promises.stat(fullPath);
                if (stats.isFile()) {
                    added.push(f);
                }
            }
        }
        return {added, removed};
    }

    async updateList(): Promise<void> {
        const results = await this.loadNewAddons();
        await Promise.all([
            ...results.added.map(filename => this.loadAddon(filename)),
            ...results.removed.map(addon => this.unloadAddon(addon)),
        ]);
    }

    async loadAllAddons(): Promise<Array<AddonState<A>>> {
        this.loadEnablement();
        let states: Array<AddonState<A>> = [];
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
            if (!this.validateFilename(filename)) continue;
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

        const concurrency: Array<Promise<AddonStateLoad | AddonStateStarted<A>>> = [];
        for (const {filename} of resolved) {
            if (filename === "0BDFDB.plugin.js") {
                // BDFDB only
                states.push(await this.loadAddon(filename, false));
                continue;
            }
            concurrency.push(this.loadAddon(filename, false));
        }
        states = states.concat(await Promise.all(concurrency));

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
import path from "path";
import fs from "fs";

import Logger from "@common/logger";

import AddonError from "@structs/addonerror";

import Settings from "@stores/settings";
import Events from "./emitter";
import DataStore from "./datastore";
import React from "./react";
import Strings from "./strings";
import ipc from "./ipc";

import AddonEditor from "@ui/misc/addoneditor";
import FloatingWindows from "@ui/floatingwindows";
import Toasts from "@ui/toasts";
import Store from "@stores/base";


// const SWITCH_ANIMATION_TIME = 250;

const openItem = ipc.openPath;

const splitRegex = /[^\S\r\n]*?\r?(?:\r\n|\n)[^\S\r\n]*?\*[^\S\r\n]?/;
const escapedAtRegex = /^\\@/;

const stripBOM = function(fileContent) {
    if (fileContent.charCodeAt(0) === 0xFEFF) {
        fileContent = fileContent.slice(1);
    }
    return fileContent;
};

export default class AddonManager extends Store {

    get name() {return "";}
    get extension() {return "";}
    get duplicatePattern() {return /./;}
    get addonFolder() {return "";}
    get language() {return "";}
    get prefix() {return "addon";}
    get order() {return 2;}

    emit(event, ...args) {
        // Emit the events as a store for react
        super.emit();

        // Emit the events as a normal emitter while other parts
        // of the codebase are still converting to stores
        return Events.emit(`${this.prefix}-${event}`, ...args);
    }

    constructor() {
        super();
        this.timeCache = {};
        this.addonList = [];
        this.state = {};
        this.windows = new Set();
    }

    initialize() {
        Settings.registerAddonPanel(this);
        return this.loadAllAddons();
    }

    // Subclasses should overload this and modify the addon object as needed to fully load it
    initializeAddon() {return;}

    startAddon() {return;}
    stopAddon() {return;}

    loadState() {
        const saved = DataStore.getData(`${this.prefix}s`);
        if (!saved) return;
        Object.assign(this.state, saved);
    }

    saveState() {
        DataStore.setData(`${this.prefix}s`, this.state);
    }

    watchAddons() {
        if (this.watcher) return Logger.err(this.name, `Already watching ${this.prefix} addons.`);
        Logger.log(this.name, `Starting to watch ${this.prefix} addons.`);
        this.watcher = fs.watch(this.addonFolder, {persistent: false}, async (eventType, filename) => {
            // console.log("watcher", eventType, filename, !eventType || !filename, !filename.endsWith(this.extension));
            if (!eventType || !filename) return;
            // console.log(eventType, filename)

            const absolutePath = path.resolve(this.addonFolder, filename);
            if (!filename.endsWith(this.extension)) {
                // Lets check to see if this filename has the duplicated file pattern `something(1).ext`
                const match = filename.match(this.duplicatePattern);
                if (!match) return;
                const ext = match[0];
                const truncated = filename.replace(ext, "");
                const newFilename = truncated + this.extension;

                // If this file already exists, give a warning and move on.
                if (fs.existsSync(newFilename)) {
                    Logger.warn(this.name, `Duplicate files found: ${filename} and ${newFilename}`);
                    return;
                }

                // Rename the file and let it go on
                try {
                    fs.renameSync(absolutePath, path.resolve(this.addonFolder, newFilename));
                }
                catch (error) {
                    Logger.err(this.name, `Could not rename file: ${filename} ${newFilename}`, error);
                }
            }
            // console.log("watcher", "before promise");
            await new Promise(r => setTimeout(r, 100));
            try {
                const stats = fs.statSync(absolutePath);
                // console.log("watcher", stats);
                if (!stats.isFile()) return;
                if (!stats || !stats.mtime || !stats.mtime.getTime()) return;
                if (typeof (stats.mtime.getTime()) !== "number") return;
                if (this.timeCache[filename] == stats.mtime.getTime()) return;
                this.timeCache[filename] = stats.mtime.getTime();
                if (eventType == "rename") this.loadAddon(filename, true);
                if (eventType == "change") this.reloadAddon(filename, true);
            }
            catch (err) {
                // window.watcherError = err;
                // console.log("watcher", err);
                // console.dir(err);
                if (err.code !== "ENOENT" && !err?.message.startsWith("ENOENT")) return;
                delete this.timeCache[filename];
                this.unloadAddon(filename, true);
            }
        });
    }

    unwatchAddons() {
        if (!this.watcher) return Logger.error(this.name, `Was not watching ${this.prefix} addons.`);
        this.watcher.close();
        delete this.watcher;
        Logger.log(this.name, `No longer watching ${this.prefix} addons.`);
    }

    extractMeta(fileContent, filename) {
        const firstLine = fileContent.split("\n")[0];
        const hasOldMeta = firstLine.includes("//META") && firstLine.includes("*//");
        if (hasOldMeta) return this.parseOldMeta(fileContent, filename);
        const hasNewMeta = firstLine.includes("/**");
        if (hasNewMeta) return this.parseNewMeta(fileContent);
        throw new AddonError(filename, filename, Strings.Addons.metaNotFound, {message: "", stack: fileContent}, this.prefix);
    }

    parseOldMeta(fileContent, filename) {
        const meta = fileContent.split("\n")[0];
        const metaData = meta.substring(meta.lastIndexOf("//META") + 6, meta.lastIndexOf("*//"));
        let parsed = null;
        try {
            parsed = JSON.parse(metaData);
        }
        catch (err) {
            throw new AddonError(filename, filename, Strings.Addons.metaError, err, this.prefix);
        }
        if (!parsed || !parsed.name) throw new AddonError(filename, filename, Strings.Addons.missingNameData, {message: "", stack: meta}, this.prefix);
        parsed.format = "json";
        return parsed;
    }

    parseNewMeta(fileContent) {
        const block = fileContent.split("/**", 2)[1].split("*/", 1)[0];
        const out = {};
        let field = "";
        let accum = "";
        for (const line of block.split(splitRegex)) {
            if (line.length === 0) continue;
            if (line.charAt(0) === "@" && line.charAt(1) !== " ") {
                out[field] = accum.trim();
                const l = line.indexOf(" ");
                field = line.substring(1, l);
                accum = line.substring(l + 1);
            }
            else {
                accum += " " + line.replace("\\n", "\n").replace(escapedAtRegex, "@");
            }
        }
        out[field] = accum.trim();
        delete out[""];
        out.format = "jsdoc";
        return out;
    }

    // Subclasses should overload this and modify the addon using the fileContent as needed to "require()"" the file
    requireAddon(filename) {
        let fileContent = fs.readFileSync(filename, "utf8");
        fileContent = stripBOM(fileContent);
        const stats = fs.statSync(filename);
        const addon = this.extractMeta(fileContent, path.basename(filename));
        if (!addon.author) addon.author = Strings.Addons.unknownAuthor;
        if (!addon.version) addon.version = "???";
        if (!addon.description) addon.description = Strings.Addons.noDescription;
        // if (!addon.name || !addon.author || !addon.description || !addon.version) return new AddonError(addon.name || path.basename(filename), filename, "Addon is missing name, author, description, or version", {message: "Addon must provide name, author, description, and version.", stack: ""}, this.prefix);
        addon.id = addon.name || path.basename(filename);
        addon.slug = path.basename(filename).replace(this.extension, "").replace(/ /g, "-");
        addon.filename = path.basename(filename);
        addon.added = stats.atimeMs;
        addon.modified = stats.mtimeMs;
        addon.size = stats.size;
        addon.fileContent = fileContent;
        if (this.addonList.find(c => c.id == addon.id)) throw new AddonError(addon.name, filename, Strings.Addons.alreadyExists.format({type: this.prefix, name: addon.name}), this.prefix);
        this.addonList.push(addon);
        return addon;
    }

    // Subclasses should use the return (if not AddonError) and push to this.addonList
    loadAddon(filename, shouldToast = false) {
        if (typeof (filename) === "undefined") return;
        let addon;
        try {
            addon = this.requireAddon(path.resolve(this.addonFolder, filename));
        }
        catch (e) {
            const partialAddon = this.addonList.find(c => c.filename == filename);
            if (partialAddon) {
                partialAddon.partial = true;
                this.state[partialAddon.id] = false;
                this.emit("loaded", partialAddon);
            }
            return e;
        }


        const error = this.initializeAddon(addon);
        if (error) {
            this.state[addon.id] = false;
            addon.partial = true;
            this.emit("loaded", addon);
            return error;
        }

        if (shouldToast) Toasts.success(Strings.Addons.wasLoaded.format({name: addon.name, version: addon.version}));
        this.emit("loaded", addon);

        if (!this.state[addon.id]) return this.state[addon.id] = false;
        return this.startAddon(addon);
    }

    unloadAddon(idOrFileOrAddon, shouldToast = true, isReload = false) {
        const addon = typeof (idOrFileOrAddon) == "string" ? this.addonList.find(c => c.id == idOrFileOrAddon || c.filename == idOrFileOrAddon) : idOrFileOrAddon;
        // console.log("watcher", "unloadAddon", idOrFileOrAddon, addon);
        if (!addon) return false;
        if (this.state[addon.id]) isReload ? this.stopAddon(addon) : this.disableAddon(addon);

        this.addonList.splice(this.addonList.indexOf(addon), 1);
        this.emit("unloaded", addon);
        if (shouldToast) Toasts.success(Strings.Addons.wasUnloaded.format({name: addon.name}));
        return true;
    }

    reloadAddon(idOrFileOrAddon, shouldToast = true) {
        const addon = typeof (idOrFileOrAddon) == "string" ? this.addonList.find(c => c.id == idOrFileOrAddon || c.filename == idOrFileOrAddon) : idOrFileOrAddon;
        const didUnload = this.unloadAddon(addon, shouldToast, true);
        if (addon && !didUnload) return didUnload;
        return this.loadAddon(addon ? addon.filename : idOrFileOrAddon, shouldToast);
    }

    isLoaded(idOrFile) {
        const addon = this.addonList.find(c => c.id == idOrFile || c.filename == idOrFile);
        if (!addon) return false;
        return true;
    }

    isEnabled(idOrFile) {
        const addon = this.addonList.find(c => c.id == idOrFile || c.filename == idOrFile);
        if (!addon) return false;
        return this.state[addon.id];
    }

    getAddon(idOrFile) {
        return this.addonList.find(c => c.id == idOrFile || c.filename == idOrFile);
    }

    enableAddon(idOrAddon) {
        const addon = typeof (idOrAddon) == "string" ? this.addonList.find(p => p.id == idOrAddon) : idOrAddon;
        if (!addon || addon.partial) return;
        if (this.state[addon.id]) return;
        this.state[addon.id] = true;
        this.emit("enabled", addon);
        // setTimeout(() => {
            this.startAddon(addon);
            this.saveState();
        // }, SWITCH_ANIMATION_TIME);
    }

    enableAllAddons() {
        const originalSetting = Settings.get("settings", "general", "showToasts", false);
        Settings.set("settings", "general", "showToasts", false);
        for (let a = 0; a < this.addonList.length; a++) {
            this.enableAddon(this.addonList[a]);
        }
        Settings.set("settings", "general", "showToasts", originalSetting);
        this.emit("batch");
    }

    disableAddon(idOrAddon) {
        const addon = typeof (idOrAddon) == "string" ? this.addonList.find(p => p.id == idOrAddon) : idOrAddon;
        if (!addon || addon.partial) return;
        if (!this.state[addon.id]) return;
        this.state[addon.id] = false;
        this.emit("disabled", addon);
        // setTimeout(() => {
            this.stopAddon(addon);
            this.saveState();
        // }, SWITCH_ANIMATION_TIME);
    }

    disableAllAddons() {
        const originalSetting = Settings.get("settings", "general", "showToasts", false);
        Settings.set("settings", "general", "showToasts", false);
        for (let a = 0; a < this.addonList.length; a++) {
            this.disableAddon(this.addonList[a]);
        }
        Settings.set("settings", "general", "showToasts", originalSetting);
        this.emit("batch");
    }

    toggleAddon(id) {
        if (this.state[id]) this.disableAddon(id);
        else this.enableAddon(id);
    }

    loadNewAddons() {
        const files = fs.readdirSync(this.addonFolder);
        const removed = this.addonList.filter(t => !files.includes(t.filename)).map(c => c.id);
        const added = files.filter(f => !this.addonList.find(t => t.filename == f) && f.endsWith(this.extension) && fs.statSync(path.resolve(this.addonFolder, f)).isFile());
        return {added, removed};
    }

    updateList() {
        const results = this.loadNewAddons();
        for (const filename of results.added) this.loadAddon(filename);
        for (const name of results.removed) this.unloadAddon(name);
    }

    loadAllAddons() {
        this.loadState();
        const errors = [];
        const files = fs.readdirSync(this.addonFolder);

        for (const filename of files) {
            const absolutePath = path.resolve(this.addonFolder, filename);
            const stats = fs.statSync(absolutePath);
            if (!stats || !stats.isFile()) continue;
            this.timeCache[filename] = stats.mtime.getTime();

            if (!filename.endsWith(this.extension)) {
                // Lets check to see if this filename has the duplicated file pattern `something(1).ext`
                const match = filename.match(this.duplicatePattern);
                if (!match) continue;
                const ext = match[0];
                const truncated = filename.replace(ext, "");
                const newFilename = truncated + this.extension;

                // If this file already exists, give a warning and move on.
                if (fs.existsSync(newFilename)) {
                    Logger.warn("AddonManager", `Duplicate files found: ${filename} and ${newFilename}`);
                    continue;
                }

                // Rename the file and let it go on
                fs.renameSync(absolutePath, path.resolve(this.addonFolder, newFilename));
            }
            const addon = this.loadAddon(filename, false);
            if (addon instanceof AddonError) errors.push(addon);
        }

        this.saveState();
        this.watchAddons();
        return errors;
    }

    deleteAddon(idOrFileOrAddon) {
        const addon = typeof (idOrFileOrAddon) == "string" ? this.addonList.find(c => c.id == idOrFileOrAddon || c.filename == idOrFileOrAddon) : idOrFileOrAddon;
        // console.log(path.resolve(this.addonFolder, addon.filename), fs.unlinkSync)
        return fs.unlinkSync(path.resolve(this.addonFolder, addon.filename));
    }

    saveAddon(idOrFileOrAddon, content) {
        const addon = typeof (idOrFileOrAddon) == "string" ? this.addonList.find(c => c.id == idOrFileOrAddon || c.filename == idOrFileOrAddon) : idOrFileOrAddon;
        return fs.writeFileSync(path.resolve(this.addonFolder, addon.filename), content);
    }

    editAddon(idOrFileOrAddon, system) {
        const addon = typeof (idOrFileOrAddon) == "string" ? this.addonList.find(c => c.id == idOrFileOrAddon || c.filename == idOrFileOrAddon) : idOrFileOrAddon;
        const fullPath = path.resolve(this.addonFolder, addon.filename);
        if (typeof (system) == "undefined") system = Settings.get("settings", "addons", "editAction") == "system";
        if (system) return openItem(`${fullPath}`);
        return this.openDetached(addon);
    }

    openDetached(addon) {
        const fullPath = path.resolve(this.addonFolder, addon.filename);
        const content = fs.readFileSync(fullPath).toString();

        if (this.windows.has(fullPath)) return;
        this.windows.add(fullPath);

        const editorRef = React.createRef();
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
                if (!editorRef || !editorRef.current || !editorRef.current.resize) return;
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
            confirmationText: Strings.Addons.confirmationText.format({name: addon.name})
        });
    }
}
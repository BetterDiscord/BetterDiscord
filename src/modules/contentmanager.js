import Utilities from "./utilities";
import Settings from "./settingsmanager";
import Events from "./emitter";
import DataStore from "./datastore";
import ContentError from "../structs/contenterror";
import MetaError from "../structs/metaerror";
import {Toasts} from "ui";

const path = require("path");
const fs = require("fs");
const Module = require("module").Module;
Module.globalPaths.push(path.resolve(require("electron").remote.app.getAppPath(), "node_modules"));

const splitRegex = /[^\S\r\n]*?\n[^\S\r\n]*?\*[^\S\r\n]?/;
const escapedAtRegex = /^\\@/;

export default class ContentManager {

    get name() {return "";}
    get moduleExtension() {return "";}
    get extension() {return "";}
    get contentFolder() {return "";}
    get prefix() {return "content";}
    get collection() {return "settings";}
    get category() {return "content";}
    get id() {return "autoReload";}
    emit(event, ...args) {return Events.emit(`${this.prefix}-${event}`, ...args);}

    constructor() {
        this.timeCache = {};
        this.contentList = [];
        this.state = {};
        this.originalRequire = Module._extensions[this.moduleExtension];
        Module._extensions[this.moduleExtension] = this.getContentRequire();
        Settings.on(this.collection, this.category, this.id, (enabled) => {
            if (enabled) this.watchContent();
            else this.unwatchContent();
        });
    }

    // Subclasses should overload this and modify the content object as needed to fully load it
    initializeContent() {return;}

    // Subclasses should overload this and modify the content as needed to require() the file
    getContentModification(module, content) {return content;}

    startContent() {return;}
    stopContent() {return;}

    loadState() {
        const saved = DataStore.getData(`${this.prefix}s`);
        if (!saved) return;
        Object.assign(this.state, saved);
    }

    saveState() {
        DataStore.setData(`${this.prefix}s`, this.state);
    }

    watchContent() {
        if (this.watcher) return Utilities.err(this.name, "Already watching content.");
        Utilities.log(this.name, "Starting to watch content.");
        this.watcher = fs.watch(this.contentFolder, {persistent: false}, async (eventType, filename) => {
            if (!eventType || !filename || !filename.endsWith(this.extension)) return;
            await new Promise(r => setTimeout(r, 50));
            try {fs.statSync(path.resolve(this.contentFolder, filename));}
            catch (err) {
                if (err.code !== "ENOENT") return;
                delete this.timeCache[filename];
                this.unloadContent(filename, true);
            }
            if (!fs.statSync(path.resolve(this.contentFolder, filename)).isFile()) return;
            const stats = fs.statSync(path.resolve(this.contentFolder, filename));
            if (!stats || !stats.mtime || !stats.mtime.getTime()) return;
            if (typeof(stats.mtime.getTime()) !== "number") return;
            if (this.timeCache[filename] == stats.mtime.getTime()) return;
            this.timeCache[filename] = stats.mtime.getTime();
            if (eventType == "rename") this.loadContent(filename, true);
            if (eventType == "change") this.reloadContent(filename, true);
        });
    }

    unwatchContent() {
        if (!this.watcher) return Utilities.err(this.name, "Was not watching content.");
        this.watcher.close();
        delete this.watcher;
        Utilities.log(this.name, "No longer watching content.");
    }

    extractMeta(content) {
        const firstLine = content.split("\n")[0];
        const hasOldMeta = firstLine.includes("//META");
        if (hasOldMeta) return this.parseOldMeta(content);
        const hasNewMeta = firstLine.includes("/**");
        if (hasNewMeta) return this.parseNewMeta(content);
        throw new MetaError("META was not found.");
    }

    parseOldMeta(content) {
        const meta = content.split("\n")[0];
        const metaData = meta.substring(meta.lastIndexOf("//META") + 6, meta.lastIndexOf("*//"));
        if (!Utilities.testJSON(metaData)) throw new MetaError("META could not be parsed.");

        const parsed = JSON.parse(metaData);
        if (!parsed.name) throw new MetaError("META missing name data.");
        return parsed;
    }

    parseNewMeta(content) {
        const block = content.split("/**", 2)[1].split("*/", 1)[0];
        const out = {};
        let field = "";
        let accum = "";
        for (const line of block.split(splitRegex)) {
            if (line.length === 0) continue;
            if (line.charAt(0) === "@" && line.charAt(1) !== " ") {
                out[field] = accum;
                const l = line.indexOf(" ");
                field = line.substr(1, l - 1);
                accum = line.substr(l + 1);
            }
            else {
                accum += " " + line.replace("\\n", "\n").replace(escapedAtRegex, "@");
            }
        }
        out[field] = accum.trim();
        delete out[""];
        return out;
    }

    getContentRequire() {
        const self = this;
        // const baseFolder = this.contentFolder;
        const originalRequire = this.originalRequire;
        return function(module, filename) {
            const possiblePath = path.resolve(self.contentFolder, path.basename(filename));
            if (!fs.existsSync(possiblePath) || filename !== fs.realpathSync(possiblePath)) return Reflect.apply(originalRequire, this, arguments);
            let content = fs.readFileSync(filename, "utf8");
            content = Utilities.stripBOM(content);
            const meta = self.extractMeta(content);
            meta.id = meta.name;
            meta.filename = path.basename(filename);
            content = self.getContentModification(module, content, meta);
            module._compile(content, filename);
        };
    }

    // Subclasses should use the return (if not ContentError) and push to this.contentList
    loadContent(filename, shouldToast = false) {
        if (typeof(filename) === "undefined") return;
        try {__non_webpack_require__(path.resolve(this.contentFolder, filename));}
        catch (error) {return new ContentError(filename, filename, "Could not be compiled.", {message: error.message, stack: error.stack});}
        const content = __non_webpack_require__(path.resolve(this.contentFolder, filename));
        if (this.contentList.find(c => c.id == content.id)) return new ContentError(content.name, filename, `There is already a plugin with name ${content.name}`);
        const error = this.initializeContent(content);
        if (error) return error;
        this.contentList.push(content);
        if (shouldToast) Toasts.success(`${content.name} v${content.version} was loaded.`);
        this.emit("loaded", content.id);

        if (!this.state[content.id]) return this.state[content.id] = false;
        return this.startContent(content);
    }

    unloadContent(idOrFileOrContent, shouldToast = true, isReload = false) {
        const content = typeof(idOrFileOrContent) == "string" ? this.contentList.find(c => c.id == idOrFileOrContent || c.filename == idOrFileOrContent) : idOrFileOrContent;
        if (!content) return false;
        if (this.state[content.id]) isReload ? this.stopContent(content) : this.disableContent(content);
        delete __non_webpack_require__.cache[__non_webpack_require__.resolve(path.resolve(this.contentFolder, content.filename))];
        this.contentList.splice(this.contentList.indexOf(content), 1);
        this.emit("unloaded", content.id);
        if (shouldToast) Toasts.success(`${content.name} was unloaded.`);
        return true;
    }

    reloadContent(idOrFileOrContent, shouldToast = true) {
        const content = typeof(idOrFileOrContent) == "string" ? this.contentList.find(c => c.id == idOrFileOrContent || c.filename == idOrFileOrContent) : idOrFileOrContent;
        const didUnload = this.unloadContent(content, shouldToast, true);
        if (!didUnload) return didUnload;
        return this.loadContent(content.filename, shouldToast);
    }

    isLoaded(idOrFile) {
        const content = this.contentList.find(c => c.id == idOrFile || c.filename == idOrFile);
        if (!content) return false;
        return true;
    }

    isEnabled(idOrFile) {
        const content = this.contentList.find(c => c.id == idOrFile || c.filename == idOrFile);
        if (!content) return false;
        return this.state[content.id];
    }

    enableContent(idOrContent) {
        const content = typeof(idOrContent) == "string" ? this.contentList.find(p => p.id == idOrContent) : idOrContent;
        if (!content) return;
        if (this.state[content.id]) return;
        this.state[content.id] = true;
        this.startContent(content);
        this.saveState();
    }

    disableContent(idOrContent) {
        const content = typeof(idOrContent) == "string" ? this.contentList.find(p => p.id == idOrContent) : idOrContent;
        if (!content) return;
        if (!this.state[content.id]) return;
        this.state[content.id] = false;
        this.stopContent(content);
        this.saveState();
    }

    toggleContent(id) {
        if (this.state[id]) this.disableContent(id);
        else this.enableContent(id);
    }

    loadNewContent() {
        const files = fs.readdirSync(this.contentFolder);
        const removed = this.contentList.filter(t => !files.includes(t.filename)).map(c => c.id);
        const added = files.filter(f => !this.contentList.find(t => t.filename == f) && f.endsWith(this.extension) && fs.statSync(path.resolve(this.contentFolder, f)).isFile());
        return {added, removed};
    }

    updateList() {
        const results = this.loadNewContent();
        for (const filename of results.added) this.loadContent(filename);
        for (const name of results.removed) this.unloadContent(name);
    }

    loadAllContent() {
        this.loadState();
        const errors = [];
        const files = fs.readdirSync(this.contentFolder);

        for (const filename of files) {
            if (!fs.statSync(path.resolve(this.contentFolder, filename)).isFile() || !filename.endsWith(this.extension)) continue;
            const content = this.loadContent(filename, false);
            if (content instanceof ContentError) errors.push(content);
        }

        this.saveState();
        if (Settings.get(this.collection, this.category, this.id)) this.watchContent();
        return errors;
    }
}
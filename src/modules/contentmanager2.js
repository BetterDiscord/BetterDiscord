import Utilities from "./utilities";
import Settings from "./settingsmanager";

const path = require("path");
const fs = require("fs");
const Module = require("module").Module;
Module.globalPaths.push(path.resolve(require("electron").remote.app.getAppPath(), "node_modules"));
class MetaError extends Error {
    constructor(message) {
        super(message);
        this.name = "MetaError";
    }
}

class ContentError extends Error {
    constructor(name, filename, message, error) {
        super(message);
        this.name = name;
        this.file = filename;
        this.error = error;
    }
}

export default new class ContentManager {

    get fileExtension() {return "";}
    get extension() {return "";}
    get contentFolder() {return "";}
    get collection() {return "settings";}
    get category() {return "content";}
    get id() {return "autoReload";}
    getContentModification(content) {return content;}

    constructor() {
        this.timeCache = {};
        this.content = [];
        this.originalRequire = Module._extensions[this.fileExtension];
        Module._extensions[this.fileExtension] = this.getContentRequire();
        Settings.on(this.collection, this.category, this.id, (enabled) => {
            if (enabled) this.watchContent();
            else this.unwatchContent();
        });
        if (Settings.get(this.collection, this.category, this.id)) this.watchContent();
    }

    watchContent() {
        if (this.watcher) return;
        this.watcher = fs.watch(this.contentFolder, {persistent: false}, async (eventType, filename) => {
            if (!eventType || !filename || !filename.endsWith(this.extension)) return;
            await new Promise(r => setTimeout(r, 50));
            try {fs.statSync(path.resolve(this.contentFolder, filename));}
            catch (err) {
                if (err.code !== "ENOENT") return;
                delete this.timeCache[filename];
                this.unloadContent(filename);
            }
            if (!fs.statSync(path.resolve(this.contentFolder, filename)).isFile()) return;
            const stats = fs.statSync(path.resolve(this.contentFolder, filename));
            if (!stats || !stats.mtime || !stats.mtime.getTime()) return;
            if (typeof(stats.mtime.getTime()) !== "number") return;
            if (this.timeCache[filename] == stats.mtime.getTime()) return;
            this.timeCache[filename] = stats.mtime.getTime();
            if (eventType == "rename") this.loadContent(filename);
            if (eventType == "change") this.reloadContent(filename);
        });
    }

    unwatchContent() {
        if (!this.watcher) return;
        this.watcher.close();
        delete this.watcher;
    }

    extractMeta(content) {
        const meta = content.split("\n")[0];
        const rawMeta = meta.substring(meta.lastIndexOf("//META") + 6, meta.lastIndexOf("*//"));
        if (meta.indexOf("META") < 0) throw new MetaError("META was not found.");
        if (!Utilities.testJSON(rawMeta)) throw new MetaError("META could not be parsed.");

        const parsed = JSON.parse(rawMeta);
        if (!parsed.name) throw new MetaError("META missing name data.");
        return parsed;
    }

    getContentRequire() {
        const self = this;
        const baseFolder = this.contentFolder;
        const originalRequire = this.originalRequire;
        return function(module, filename) {
            const possiblePath = path.resolve(baseFolder, path.basename(filename));
            if (!fs.existsSync(possiblePath) || filename !== fs.realpathSync(possiblePath)) return Reflect.apply(originalRequire, this, arguments);
            let content = fs.readFileSync(filename, "utf8");
            content = Utilities.stripBOM(content);
            const meta = self.extractMeta(content);
            meta.filename = path.basename(filename);
            content = self.getContentModification(content, meta);
            module._compile(content, filename);
        };
    }

    // Subclasses should use the return (if not ContentError) and push to this.contentList
    loadContent(filename, type) {
        if (typeof(filename) === "undefined" || typeof(type) === "undefined") return;
        try {__non_webpack_require__(path.resolve(this.contentFolder, filename));}
        catch (error) {return new ContentError(filename, filename, "Could not be compiled.", {message: error.message, stack: error.stack});}
        return __non_webpack_require__(path.resolve(this.contentFolder, filename));
    }

    unloadContent(idOrFile) {
        if (typeof(filename) === "undefined") return;
        const content = this.content.find(c => c.id == idOrFile || c.filename == idOrFile);
        if (!content) return false;
        delete __non_webpack_require__.cache[__non_webpack_require__.resolve(path.resolve(this.contentFolder, content.file))];
        this.content.splice(this.content.indexOf(content), 1);
        return true;
    }

    isLoaded(idOrFile) {
        const content = this.content.find(c => c.id == idOrFile || c.filename == idOrFile);
        if (!content) return false;
        return true;
    }

    reloadContent(filename, type) {
        const didUnload = this.unloadContent(filename, type);
        if (!didUnload) return didUnload;
        return this.loadContent(filename, type);
    }

    loadNewContent() {
        const files = fs.readdirSync(this.contentFolder);
        const removed = this.content.filter(t => !files.includes(t.filename)).map(c => c.id);
        const added = files.filter(f => !this.content.find(t => t.filename == f) && f.endsWith(this.extension) && fs.statSync(path.resolve(this.contentFolder, f)).isFile());
        return {added, removed};
    }

    loadAllContent(type) {
        const errors = [];
        const files = fs.readdirSync(this.contentFolder);

        for (const filename of files) {
            if (!fs.statSync(path.resolve(this.contentFolder, filename)).isFile() || !filename.endsWith(this.extension)) continue;
            const content = this.loadContent(filename, type);
            if (content instanceof ContentError) errors.push(content);
        }

        return errors;
    }
};
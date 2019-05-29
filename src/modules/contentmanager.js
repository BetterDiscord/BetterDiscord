import {Config, Plugins, Themes} from "data";
import Utilities from "./utilities";
import PluginManager from "./pluginmanager";
import ThemeManager from "./thememanager";

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
const originalJSRequire = Module._extensions[".js"];
const originalCSSRequire = Module._extensions[".css"] ? Module._extensions[".css"] : () => {return null;};

export default new class ContentManager {

    constructor() {
        this.timeCache = {};
        this.watchers = {};
        Module._extensions[".js"] = this.getContentRequire("plugin");
        Module._extensions[".css"] = this.getContentRequire("theme");
    }

    get pluginsFolder() {return this._pluginsFolder || (this._pluginsFolder = fs.realpathSync(path.resolve(Config.dataPath + "plugins/")));}
    get themesFolder() {return this._themesFolder || (this._themesFolder = fs.realpathSync(path.resolve(Config.dataPath + "themes/")));}

    watchContent(contentType) {
        if (this.watchers[contentType]) return;
        const isPlugin = contentType === "plugin";
        const baseFolder = isPlugin ? this.pluginsFolder : this.themesFolder;
        const fileEnding = isPlugin ? ".plugin.js" : ".theme.css";
        this.watchers[contentType] = fs.watch(baseFolder, {persistent: false}, async (eventType, filename) => {
            if (!eventType || !filename || !filename.endsWith(fileEnding)) return;
            await new Promise(r => setTimeout(r, 50));
            try {fs.statSync(path.resolve(baseFolder, filename));}
            catch (err) {
                if (err.code !== "ENOENT") return;
                delete this.timeCache[filename];
                if (isPlugin) return PluginManager.unloadPlugin(filename);
                return ThemeManager.unloadTheme(filename);
            }
            if (!fs.statSync(path.resolve(baseFolder, filename)).isFile()) return;
            const stats = fs.statSync(path.resolve(baseFolder, filename));
            if (!stats || !stats.mtime || !stats.mtime.getTime()) return;
            if (typeof(stats.mtime.getTime()) !== "number") return;
            if (this.timeCache[filename] == stats.mtime.getTime()) return;
            this.timeCache[filename] = stats.mtime.getTime();
            if (eventType == "rename") {
                if (isPlugin) PluginManager.loadPlugin(filename);
                else ThemeManager.loadTheme(filename);
            }
            if (eventType == "change") {
                if (isPlugin) PluginManager.reloadPlugin(filename);
                else ThemeManager.reloadTheme(filename);
            }
        });
    }

    unwatchContent(contentType) {
        if (!this.watchers[contentType]) return;
        this.watchers[contentType].close();
        delete this.watchers[contentType];
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

    getContentRequire(type) {
        const isPlugin = type === "plugin";
        const self = this;
        const originalRequire = isPlugin ? originalJSRequire : originalCSSRequire;
        return function(module, filename) {
            const baseFolder = isPlugin ? self.pluginsFolder : self.themesFolder;
            const possiblePath = path.resolve(baseFolder, path.basename(filename));
            if (!fs.existsSync(possiblePath) || filename !== fs.realpathSync(possiblePath)) return Reflect.apply(originalRequire, this, arguments);
            let content = fs.readFileSync(filename, "utf8");
            content = Utilities.stripBOM(content);

            const meta = self.extractMeta(content);
            meta.filename = path.basename(filename);
            if (!isPlugin) {
                meta.css = content.split("\n").slice(1).join("\n");
                content = `module.exports = ${JSON.stringify(meta)};`;
            }
            if (isPlugin) {
                content += `\nmodule.exports = ${JSON.stringify(meta)};\nmodule.exports.type = ${meta.name};`;
            }
            module._compile(content, filename);
        };
    }

    makePlaceholderPlugin(data) {
        return {plugin: {
                start: () => {},
                getName: () => {return data.name || data.filename;},
                getAuthor: () => {return "???";},
                getDescription: () => {return data.message ? data.message : "This plugin was unable to be loaded. Check the author's page for updates.";},
                getVersion: () => {return "???";}
            },
            name: data.name || data.filename,
            filename: data.filename,
            source: data.source ? data.source : "",
            website: data.website ? data.website : ""
        };
    }

    loadContent(filename, type) {
        if (typeof(filename) === "undefined" || typeof(type) === "undefined") return;
        const isPlugin = type === "plugin";
        const baseFolder = isPlugin ? this.pluginsFolder : this.themesFolder;
        try {__non_webpack_require__(path.resolve(baseFolder, filename));}
        catch (error) {return {name: filename, file: filename, message: "Could not be compiled.", error: {message: error.message, stack: error.stack}};}
        const content = __non_webpack_require__(path.resolve(baseFolder, filename));
        if (isPlugin) {
            if (!content.type) return;
            try {
                content.plugin = new content.type();
                delete Plugins[content.plugin.getName()];
                Plugins[content.plugin.getName()] = content;
            }
            catch (error) {return {name: filename, file: filename, message: "Could not be constructed.", error: {message: error.message, stack: error.stack}};}
        }
        else {
            delete Themes[content.name];
            Themes[content.name] = content;
        }
    }

    unloadContent(filename, type) {
        if (typeof(filename) === "undefined" || typeof(type) === "undefined") return;
        const isPlugin = type === "plugin";
        const baseFolder = isPlugin ? this.pluginsFolder : this.themesFolder;
        try {
            delete __non_webpack_require__.cache[__non_webpack_require__.resolve(path.resolve(baseFolder, filename))];
        }
        catch (err) {return {name: filename, file: filename, message: "Could not be unloaded.", error: {message: err.message, stack: err.stack}};}
    }

    isLoaded(filename, type) {
        const isPlugin = type === "plugin";
        const baseFolder = isPlugin ? this.pluginsFolder : this.themesFolder;
        try {__non_webpack_require__.cache[__non_webpack_require__.resolve(path.resolve(baseFolder, filename))];}
        catch (err) {return false;}
        return true;
    }

    reloadContent(filename, type) {
        const cantUnload = this.unloadContent(filename, type);
        if (cantUnload) return cantUnload;
        return this.loadContent(filename, type);
    }

    loadNewContent(type) {
        const isPlugin = type === "plugin";
        const fileEnding = isPlugin ? ".plugin.js" : ".theme.css";
        const basedir = isPlugin ? this.pluginsFolder : this.themesFolder;
        const files = fs.readdirSync(basedir);
        const contentList = Object.values(isPlugin ? Plugins : Themes);
        const removed = contentList.filter(t => !files.includes(t.filename)).map(c => isPlugin ? c.plugin.getName() : c.name);
        const added = files.filter(f => !contentList.find(t => t.filename == f) && f.endsWith(fileEnding) && fs.statSync(path.resolve(basedir, f)).isFile());
        return {added, removed};
    }

    loadAllContent(type) {
        const isPlugin = type === "plugin";
        const fileEnding = isPlugin ? ".plugin.js" : ".theme.css";
        const basedir = isPlugin ? this.pluginsFolder : this.themesFolder;
        const errors = [];
        const files = fs.readdirSync(basedir);

        for (const filename of files) {
            if (!fs.statSync(path.resolve(basedir, filename)).isFile() || !filename.endsWith(fileEnding)) continue;
            const error = this.loadContent(filename, type);
            if (error) errors.push(error);
        }

        return errors;
    }

    loadPlugins() {return this.loadAllContent("plugin");}
    loadThemes() {return this.loadAllContent("theme");}
};

import {bdConfig, bdplugins, bdthemes} from "../0globals";
import pluginModule from "./pluginModule";
import themeModule from "./themeModule";
import Utils from "./utils";

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
const splitRegex = /[^\S\r\n]*?(?:\r\n|\n)[^\S\r\n]*?\*[^\S\r\n]?/;
const escapedAtRegex = /^\\@/;


export default new class ContentManager {

    constructor() {
        this.timeCache = {};
        this.watchers = {};
        Module._extensions[".js"] = this.getContentRequire("plugin");
        Module._extensions[".css"] = this.getContentRequire("theme");
    }

    get pluginsFolder() {return this._pluginsFolder || (this._pluginsFolder = fs.realpathSync(path.resolve(bdConfig.dataPath + "plugins/")));}
    get themesFolder() {return this._themesFolder || (this._themesFolder = fs.realpathSync(path.resolve(bdConfig.dataPath + "themes/")));}

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
                if (isPlugin) return pluginModule.unloadPlugin(filename);
                return themeModule.unloadTheme(filename);
            }
            if (!fs.statSync(path.resolve(baseFolder, filename)).isFile()) return;
            const stats = fs.statSync(path.resolve(baseFolder, filename));
            if (!stats || !stats.mtime || !stats.mtime.getTime()) return;
            if (typeof(stats.mtime.getTime()) !== "number") return;
            if (this.timeCache[filename] == stats.mtime.getTime()) return;
            this.timeCache[filename] = stats.mtime.getTime();
            if (eventType == "rename") {
                if (isPlugin) pluginModule.loadPlugin(filename);
                else themeModule.loadTheme(filename);
            }
            if (eventType == "change") {
                if (isPlugin) pluginModule.reloadPlugin(filename);
                else themeModule.reloadTheme(filename);
            }
        });
    }

    unwatchContent(contentType) {
        if (!this.watchers[contentType]) return;
        this.watchers[contentType].close();
        delete this.watchers[contentType];
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
        const rawMeta = meta.substring(meta.lastIndexOf("//META") + 6, meta.lastIndexOf("*//"));
        if (meta.indexOf("META") < 0) throw new MetaError("META was not found.");
        const parsed = Utils.testJSON(rawMeta);
        if (!parsed) throw new MetaError("META could not be parsed.");
        if (!parsed.name) throw new MetaError("META missing name data.");
        parsed.format = "json";
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
        out.format = "jsdoc";
        return out;
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
            content = Utils.stripBOM(content);

            const stats = fs.statSync(filename);
            const meta = self.extractMeta(content);
            meta.filename = path.basename(filename);
            meta.added = stats.atimeMs;
            meta.modified = stats.mtimeMs;
            meta.size = stats.size;
            if (!isPlugin) {
                meta.css = content;
                if (meta.format == "json") meta.css = meta.css.split("\n").slice(1).join("\n");
                content = `module.exports = ${JSON.stringify(meta)};`;
                module._compile(content, filename);
            }
            if (isPlugin) {
                content += `\nif (module.exports.default) {module.exports = module.exports.default;}\nif (!module.exports.prototype || !module.exports.prototype.start) {module.exports = ${meta.exports || meta.name};}`;
                module._compile(content, filename);
                meta.type = module.exports;
                module.exports = meta;
            }
            
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
        content.id = Utils.escapeID(content.name);
        if (isPlugin) {
            if (!content.type) return;
            try {
                content.plugin = new content.type();
                delete bdplugins[content.plugin.getName()];
                bdplugins[content.plugin.getName()] = content;
            }
            catch (error) {return {name: filename, file: filename, message: "Could not be constructed.", error: {message: error.message, stack: error.stack}};}
        }
        else {
            delete bdthemes[content.name];
            bdthemes[content.name] = content;
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
        const contentList = Object.values(isPlugin ? bdplugins : bdthemes);
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
import fs from "fs";
import path from "path";

import Logger from "@common/logger";

import Config from "@data/config";


const releaseChannel = window?.DiscordNative?.app?.getReleaseChannel?.() ?? "stable";

// Schema
// =======================
// %appdata%\BetterDiscord
//     -> data
//         -> [releaseChannel]\ (stable/canary/ptb)
//             -> settings.json
//             -> plugins.json
//             -> themes.json

export default new class DataStore {
    constructor() {
        this.data = {misc: {}};
        this.pluginData = {};
        this.cacheData = {};
    }

    initialize() {
        const bdFolderExists = fs.existsSync(Config.dataPath);
        if (!bdFolderExists) fs.mkdirSync(Config.dataPath);

        const pluginFolderExists = fs.existsSync(this.pluginFolder);
        if (!pluginFolderExists) fs.mkdirSync(this.pluginFolder);

        const themeFolderExists = fs.existsSync(this.themeFolder);
        if (!themeFolderExists) fs.mkdirSync(this.themeFolder);

        const newStorageExists = fs.existsSync(this.baseFolder);
        if (!newStorageExists) fs.mkdirSync(this.baseFolder);

        if (!fs.existsSync(this.dataFolder)) fs.mkdirSync(this.dataFolder);
        if (!fs.existsSync(this.customCSS)) fs.writeFileSync(this.customCSS, "");

        const dataFiles = fs.readdirSync(this.dataFolder).filter(f => !fs.statSync(path.resolve(this.dataFolder, f)).isDirectory() && f.endsWith(".json"));
        for (const file of dataFiles) {
            let data = {};
            try {data = __non_webpack_require__(path.resolve(this.dataFolder, file));}
            catch (e) {Logger.stacktrace("DataStore", `Could not load file ${file}`, e);}
            this.data[file.split(".")[0]] = data;
        }
    }

    get pluginFolder() {return this._pluginFolder || (this._pluginFolder = path.resolve(Config.dataPath, "plugins"));}
    get themeFolder() {return this._themeFolder || (this._themeFolder = path.resolve(Config.dataPath, "themes"));}
    get customCSS() {return this._customCSS || (this._customCSS = path.resolve(this.dataFolder, "custom.css"));}
    get baseFolder() {return this._baseFolder || (this._baseFolder = path.resolve(Config.dataPath, "data"));}
    get dataFolder() {return this._dataFolder || (this._dataFolder = path.resolve(this.baseFolder, `${releaseChannel}`));}
    getPluginFile(pluginName) {return path.resolve(Config.dataPath, "plugins", pluginName + ".config.json");}


    _getFile(key) {
        if (key == "settings" || key == "plugins" || key == "themes" || key == "window") return path.resolve(this.dataFolder, `${key}.json`);
        return path.resolve(this.dataFolder, `misc.json`);
    }

    getBDData(key) {
        return this.data.misc[key] || "";
    }

    setBDData(key, value) {
        this.data.misc[key] = value;
        fs.writeFileSync(path.resolve(this.dataFolder, `misc.json`), JSON.stringify(this.data.misc, null, 4));
    }

    getLocale(locale) {
        const file = path.resolve(this.localeFolder, `${locale}.json`);
        if (!fs.existsSync(file)) return null;
        try {return JSON.parse(fs.readFileSync(file).toString());}
        catch {return false;}
    }

    saveLocale(locale, strings) {
        fs.writeFileSync(path.resolve(this.localeFolder, `${locale}.json`), JSON.stringify(strings, null, 4));
    }

    getData(key) {
        return this.data[key] || "";
    }

    setData(key, value) {
        this.data[key] = value;
        fs.writeFileSync(path.resolve(this.dataFolder, `${key}.json`), JSON.stringify(value, null, 4));
    }

    loadCustomCSS() {
        return fs.readFileSync(this.customCSS).toString();
    }

    saveCustomCSS(css) {
        return fs.writeFileSync(this.customCSS, css);
    }

    ensurePluginData(pluginName) {
        if (typeof(this.pluginData[pluginName]) !== "undefined") return; // Already have data cached

        // Setup blank data if config doesn't exist
        if (!fs.existsSync(this.getPluginFile(pluginName))) return this.pluginData[pluginName] = {};

        // Getting here means not cached, read from disk
        this.pluginData[pluginName] = JSON.parse(fs.readFileSync(this.getPluginFile(pluginName)));
    }

    getPluginData(pluginName, key) {
        this.ensurePluginData(pluginName); // Ensure plugin data, if any, is cached
        return this.pluginData[pluginName][key]; // Return blindly to allow falsey values
    }

    setPluginData(pluginName, key, value) {
        if (value === undefined) return; // Can't set undefined, use deletePluginData
        this.ensurePluginData(pluginName); // Ensure plugin data, if any, is cached

        this.pluginData[pluginName][key] = value; // Set the value blindly to allow falsey values
        fs.writeFileSync(this.getPluginFile(pluginName), JSON.stringify(this.pluginData[pluginName], null, 4)); // Save to disk
    }

    deletePluginData(pluginName, key) {
        this.ensurePluginData(pluginName); // Ensure plugin data, if any, is cached
        delete this.pluginData[pluginName][key];
        fs.writeFileSync(this.getPluginFile(pluginName), JSON.stringify(this.pluginData[pluginName], null, 4));
    }
};
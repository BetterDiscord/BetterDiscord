import fs from "fs";
import path from "path";

import Logger from "@common/logger";

import Config from "@stores/config";


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

    data: Record<string, Record<string, unknown>>;
    pluginData: Record<string, Record<string, unknown>>;

    constructor() {
        this.data = {misc: {}};
        this.pluginData = {};
    }

    initialize() {
        const bdFolderExists = fs.existsSync(Config.get("dataPath"));
        if (!bdFolderExists) fs.mkdirSync(Config.get("dataPath"));

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
            try {
                const content = fs.readFileSync(path.resolve(this.dataFolder, file)).toString();
                data = JSON.parse(content);
            }
            catch (e) {
                Logger.stacktrace("DataStore", `Could not load file ${file}`, e);
            }
            this.data[file.split(".")[0]] = data;
        }
    }

    _pluginFolder?: string;
    _themeFolder?: string;
    _customCSS?: string;
    _baseFolder?: string;
    _dataFolder?: string;
    get pluginFolder() {return this._pluginFolder || (this._pluginFolder = path.resolve(Config.get("dataPath"), "plugins"));}
    get themeFolder() {return this._themeFolder || (this._themeFolder = path.resolve(Config.get("dataPath"), "themes"));}
    get customCSS() {return this._customCSS || (this._customCSS = path.resolve(this.dataFolder, "custom.css"));}
    get baseFolder() {return this._baseFolder || (this._baseFolder = path.resolve(Config.get("dataPath"), "data"));}
    get dataFolder() {return this._dataFolder || (this._dataFolder = path.resolve(this.baseFolder, `${releaseChannel}`));}
    getPluginFile(pluginName: string) {return path.resolve(Config.get("dataPath"), "plugins", pluginName + ".config.json");}


    _getFile(key: string) {
        if (key == "settings" || key == "plugins" || key == "themes" || key == "window") return path.resolve(this.dataFolder, `${key}.json`);
        return path.resolve(this.dataFolder, `misc.json`);
    }

    getBDData(key: string) {
        return this.data.misc[key] || "";
    }

    setBDData(key: string, value: unknown) {
        this.data.misc[key] = value;
        fs.writeFileSync(path.resolve(this.dataFolder, `misc.json`), JSON.stringify(this.data.misc, null, 4));
    }

    getData(key: string) {
        return this.data[key] || "";
    }

    setData(key: string, value: Record<string, unknown>) {
        this.data[key] = value;
        fs.writeFileSync(path.resolve(this.dataFolder, `${key}.json`), JSON.stringify(value, null, 4));
    }

    loadCustomCSS() {
        return fs.readFileSync(this.customCSS).toString();
    }

    saveCustomCSS(css: string) {
        return fs.writeFileSync(this.customCSS, css);
    }

    ensurePluginData(pluginName: string) {
        if (typeof (this.pluginData[pluginName]) !== "undefined") return; // Already have data cached

        // Setup blank data if config doesn't exist
        if (!fs.existsSync(this.getPluginFile(pluginName))) return this.pluginData[pluginName] = {};

        // Getting here means not cached, read from disk
        try {this.pluginData[pluginName] = JSON.parse(fs.readFileSync(this.getPluginFile(pluginName)).toString());}
        // Setup blank data if parse fails
        catch {return this.pluginData[pluginName] = {};}
    }

    getPluginData(pluginName: string, key: string) {
        this.ensurePluginData(pluginName); // Ensure plugin data, if any, is cached
        return this.pluginData[pluginName][key]; // Return blindly to allow falsey values
    }

    setPluginData(pluginName: string, key: string, value: unknown) {
        if (value === undefined) return; // Can't set undefined, use deletePluginData
        this.ensurePluginData(pluginName); // Ensure plugin data, if any, is cached

        this.pluginData[pluginName][key] = value; // Set the value blindly to allow falsey values
        fs.writeFileSync(this.getPluginFile(pluginName), JSON.stringify(this.pluginData[pluginName], null, 4)); // Save to disk
    }

    deletePluginData(pluginName: string, key: string) {
        this.ensurePluginData(pluginName); // Ensure plugin data, if any, is cached
        delete this.pluginData[pluginName][key];
        fs.writeFileSync(this.getPluginFile(pluginName), JSON.stringify(this.pluginData[pluginName], null, 4));
    }
};
import {Config} from "data";
import Utilities from "./utilities";
const fs = require("fs");
const path = require("path");
const releaseChannel = DiscordNative.globals.releaseChannel;

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
        this.localeHashes = {};
    }

    initialize() {
        if (!fs.existsSync(this.baseFolder)) fs.mkdirSync(this.baseFolder);
        if (!fs.existsSync(this.dataFolder)) fs.mkdirSync(this.dataFolder);
        if (!fs.existsSync(this.localeFolder)) fs.mkdirSync(this.localeFolder);
        if (!fs.existsSync(this.localeCache)) fs.writeFileSync(this.localeCache, JSON.stringify({}));
        if (!fs.existsSync(this.BDFile)) fs.writeFileSync(this.BDFile, JSON.stringify(this.data.misc, null, 4));
        if (!fs.existsSync(this.customCSS)) fs.writeFileSync(this.customCSS, "");
        const dataFiles = fs.readdirSync(this.dataFolder).filter(f => !fs.statSync(path.resolve(this.dataFolder, f)).isDirectory() && f.endsWith(".json"));
        for (const file of dataFiles) {
            this.data[file.split(".")[0]] = __non_webpack_require__(path.resolve(this.dataFolder, file));
        }
        this.localeHashes = JSON.parse(fs.readFileSync(this.localeCache).toString());
    }

    get customCSS() {return this._customCSS || (this._customCSS = path.resolve(this.dataFolder, "custom.css"));}
    get baseFolder() {return this._baseFolder || (this._baseFolder = path.resolve(Config.dataPath, "data"));}
    get dataFolder() {return this._dataFolder || (this._dataFolder = path.resolve(this.baseFolder, `${releaseChannel}`));}
    get localeFolder() {return this._localeFolder || (this._localeFolder = path.resolve(this.baseFolder, `locales`));}
    get localeCache() {return this._localeCache || (this._localeCache = path.resolve(this.localeFolder, `.cache`));}
    get BDFile() {return this._BDFile || (this._BDFile = path.resolve(Config.dataPath, "data", `${releaseChannel}.json`));}
    getPluginFile(pluginName) {return path.resolve(Config.dataPath, "plugins", pluginName + ".config.json");}


    _getFile(key) {
        if (key == "settings" || key == "plugins" || key == "themes") return path.resolve(this.dataFolder, `${key}.json`);
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
        return Utilities.testJSON(fs.readFileSync(file).toString());
    }

    saveLocale(locale, strings) {
        fs.writeFileSync(path.resolve(this.localeFolder, `${locale}.json`), JSON.stringify(strings, null, 4));
    }

    getLocaleHash(locale) {
        return this.localeHashes[locale] || "";
    }

    saveLocaleHash(locale, hash) {
        this.localeHashes[locale] = hash;
        fs.writeFileSync(this.localeCache, JSON.stringify(this.localeHashes, null, 4));
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

    getPluginData(pluginName, key) {
        if (this.pluginData[pluginName] !== undefined) return this.pluginData[pluginName][key] || undefined;
        if (!fs.existsSync(this.getPluginFile(pluginName))) return undefined;
        this.pluginData[pluginName] = JSON.parse(fs.readFileSync(this.getPluginFile(pluginName)));
        return this.pluginData[pluginName][key] || undefined;
    }

    setPluginData(pluginName, key, value) {
        if (value === undefined) return;
        if (this.pluginData[pluginName] === undefined) this.pluginData[pluginName] = {};
        this.pluginData[pluginName][key] = value;
        fs.writeFileSync(this.getPluginFile(pluginName), JSON.stringify(this.pluginData[pluginName], null, 4));
    }

    deletePluginData(pluginName, key) {
        if (this.pluginData[pluginName] === undefined) this.pluginData[pluginName] = {};
        delete this.pluginData[pluginName][key];
        fs.writeFileSync(this.getPluginFile(pluginName), JSON.stringify(this.pluginData[pluginName], null, 4));
    }
};
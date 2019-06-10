import {Config} from "data";
const fs = require("fs");
const path = require("path");
const releaseChannel = DiscordNative.globals.releaseChannel;

// Schema 1
// =======================
// %appdata%\BetterDiscord
//     -> data\
//         -> [releaseChannel].json (stable/canary/ptb)

// Schema 2
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
    }

    initialize() {
        if (!fs.existsSync(this.baseFolder)) fs.mkdirSync(this.baseFolder);
        if (!fs.existsSync(this.dataFolder)) fs.mkdirSync(this.dataFolder);
        if (!fs.existsSync(this.BDFile)) fs.writeFileSync(this.BDFile, JSON.stringify(this.data.misc, null, 4));
        if (!fs.existsSync(this.customCSS)) fs.writeFileSync(this.customCSS, "");
        const dataFiles = fs.readdirSync(this.dataFolder).filter(f => !fs.statSync(path.resolve(this.dataFolder, f)).isDirectory() && f.endsWith(".json"));
        for (const file of dataFiles) {
            this.data[file.split(".")[0]] = __non_webpack_require__(path.resolve(this.dataFolder, file));
        }
        // this.data = __non_webpack_require__(this.BDFile);
        // if (data.hasOwnProperty("settings")) this.data = data;
        // if (!fs.existsSync(this.settingsFile)) return;
        // let settings = __non_webpack_require__(this.settingsFile);
        // fs.unlinkSync(this.settingsFile);
        // if (settings.hasOwnProperty("settings")) settings = Object.assign({stable: {}, canary: {}, ptb: {}}, {[releaseChannel]: settings});
        // else settings = Object.assign({stable: {}, canary: {}, ptb: {}}, settings);
        // this.setBDData("settings", settings);
    }

    get customCSS() {return this._customCSS || (this._customCSS = path.resolve(this.dataFolder, "custom.css"));}
    get baseFolder() {return this._baseFolder || (this._baseFolder = path.resolve(Config.dataPath, "data"));}
    get dataFolder() {return this._dataFolder || (this._dataFolder = path.resolve(this.baseFolder, `${releaseChannel}`));}
    get BDFile() {return this._BDFile || (this._BDFile = path.resolve(Config.dataPath, "data", `${releaseChannel}.json`));}
    // get settingsFile() {return this._settingsFile || (this._settingsFile = path.resolve(Config.dataPath, "bdsettings.json"));}
    getPluginFile(pluginName) {return path.resolve(Config.dataPath, "plugins", pluginName + ".config.json");}

    // getSettingGroup(key) {
    //     return this.data.settings[key] || null;
    // }

    // setSettingGroup(key, data) {
    //     this.data.settings[key] = data;
    //     fs.writeFileSync(this.BDFile, JSON.stringify(this.data, null, 4));
    // }

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

    getData(key) {
        return this.data[key] || "";
        // return JSON.parse(fs.readFileSync(path.resolve(this.dataFolder, `${file}.json`)));
    }

    setData(key, value) {
        this.data[key] = value;
        // fs.writeFileSync(this.BDFile, JSON.stringify(this.data, null, 4));
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
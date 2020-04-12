import {bdConfig} from "../0globals";
import Utils from "./utils";
import ContentManager from "./contentManager";

const fs = require("fs");
const path = require("path");
const releaseChannel = DiscordNative.globals.releaseChannel;

export default new class DataStore {
    constructor() {
        this.data = {settings: {stable: {}, canary: {}, ptb: {}}};
        this.pluginData = {};
    }

    initialize() {
        try {
            if (!fs.existsSync(this.BDFile)) fs.writeFileSync(this.BDFile, JSON.stringify(this.data, null, 4));
            const data = __non_webpack_require__(this.BDFile);
            if (data.hasOwnProperty("settings")) this.data = data;
            if (!fs.existsSync(this.settingsFile)) return;
            let settings = __non_webpack_require__(this.settingsFile);
            fs.unlinkSync(this.settingsFile);
            if (settings.hasOwnProperty("settings")) settings = Object.assign({stable: {}, canary: {}, ptb: {}}, {[releaseChannel]: settings});
            else settings = Object.assign({stable: {}, canary: {}, ptb: {}}, settings);
            this.setBDData("settings", settings);
        }
        catch (err) {
            console.error(err);
            Utils.alert("Corrupt Storage", "The bd storage has somehow become corrupt. You may either try to salvage the file or delete it then reload.");
        }
    }

    get injectionPath() {
        if (this._injectionPath) return this._injectionPath;
        const electron = require("electron").remote.app;
        const base = electron.getAppPath();
        const roamingBase = electron.getPath("userData");
        const roamingLocation = path.resolve(roamingBase, electron.getVersion(), "modules", "discord_desktop_core", "injector");
        const location = path.resolve(base, "..", "app");
        const realLocation = fs.existsSync(location) ? location : fs.existsSync(roamingLocation) ? roamingLocation : null;
        if (!realLocation) return this._injectionPath = null;
        return this._injectionPath = realLocation;
    }

    get configFile() {return this._configFile || (this._configFile = path.resolve(this.injectionPath, "betterdiscord", "config.json"));}
    get BDFile() {return this._BDFile || (this._BDFile = path.resolve(bdConfig.dataPath, "bdstorage.json"));}
    get settingsFile() {return this._settingsFile || (this._settingsFile = path.resolve(bdConfig.dataPath, "bdsettings.json"));}
    getPluginFile(pluginName) {return path.resolve(ContentManager.pluginsFolder, pluginName + ".config.json");}

    getSettingGroup(key) {
        return this.data.settings[releaseChannel][key] || null;
    }

    setSettingGroup(key, data) {
        this.data.settings[releaseChannel][key] = data;
        fs.writeFileSync(this.BDFile, JSON.stringify(this.data, null, 4));
    }

    getBDData(key) {
        return this.data[key] || "";
    }

    setBDData(key, value) {
        this.data[key] = value;
        fs.writeFileSync(this.BDFile, JSON.stringify(this.data, null, 4));
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
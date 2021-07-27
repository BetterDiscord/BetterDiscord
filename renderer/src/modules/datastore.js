import {Config} from "data";
import Utilities from "./utilities";
import Logger from "common/logger";
const fs = require("fs");
const path = require("path");
const releaseChannel = window?.DiscordNative?.app?.getReleaseChannel?.() ?? "stable";
const discordVersion = window?.DiscordNative?.remoteApp?.getVersion?.() ?? "0.0.309";

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

        if (newStorageExists) return;

        try {this.convertOldData();} // Convert old data if it exists (routine checks existence and removes existence)
        catch (e) {Logger.stacktrace("DataStore", `Could not convert old data.`, e);}
    }

    convertOldData() {
        const oldFile = path.join(Config.dataPath, "bdstorage.json");
        if (!fs.existsSync(oldFile)) return;

        const oldData = __non_webpack_require__(oldFile); // got the data
        fs.renameSync(oldFile, `${oldFile}.bak`); // rename file after grabbing data to prevent loop
        const setChannelData = (channel, key, value, ext = "json") => fs.writeFileSync(path.resolve(this.baseFolder, channel, `${key}.${ext}`), JSON.stringify(value, null, 4));
        const channels = ["stable", "canary", "ptb"];
        let customcss = "";
        let favoriteEmotes = {};
        try {customcss = oldData.bdcustomcss ? atob(oldData.bdcustomcss) : "";}
        catch (e) {Logger.stacktrace("DataStore:convertOldData", "Error decoding custom css", e);}
        try {favoriteEmotes = oldData.bdfavemotes ? JSON.parse(atob(oldData.bdfavemotes)) : {};}
        catch (e) {Logger.stacktrace("DataStore:convertOldData", "Error decoding favorite emotes", e);}
        for (const channel of channels) {
            if (!fs.existsSync(path.resolve(this.baseFolder, channel))) fs.mkdirSync(path.resolve(this.baseFolder, channel));
            const channelData = oldData.settings[channel];
            if (!channelData || !channelData.settings) continue;
            const oldSettings = channelData.settings;
            const newSettings = {
                general: {publicServers: oldSettings["bda-gs-1"], voiceDisconnect: oldSettings["bda-dc-0"], showToasts: oldSettings["fork-ps-2"]},
                appearance: {twentyFourHour: oldSettings["bda-gs-6"], minimalMode: oldSettings["bda-gs-2"], coloredText: oldSettings["bda-gs-7"]},
                addons: {addonErrors: oldSettings["fork-ps-1"], autoReload: oldSettings["fork-ps-5"]},
                developer: {debuggerHotkey: oldSettings["bda-gs-8"], reactDevTools: oldSettings.reactDevTools}
            };

            const newEmotes = {
                general: {download: oldSettings["fork-es-3"], emoteMenu: oldSettings["bda-es-0"], hideEmojiMenu: !oldSettings["bda-es-9"], modifiers: oldSettings["bda-es-8"], animateOnHover: oldSettings["fork-es-2"]},
                categories: {twitchglobal: oldSettings["bda-es-7"], twitchsubscriber: oldSettings["bda-es-7"], frankerfacez: oldSettings["bda-es-1"], bttv: oldSettings["bda-es-2"]}
            };

            setChannelData(channel, "settings", newSettings); // settingsCookie
            setChannelData(channel, "emotes", newEmotes); // emotes (from settingsCookie)
            setChannelData(channel, "plugins", channelData.plugins || {}); // pluginCookie
            setChannelData(channel, "themes", channelData.themes || {}); // themeCookie
            setChannelData(channel, "misc", {favoriteEmotes}); // favorite emotes
            fs.writeFileSync(path.resolve(this.baseFolder, channel, "custom.css"), customcss); // customcss
        }

        this.initialize(); // Reinitialize data store with the converted data
    }

    get injectionPath() {
        if (this._injectionPath) return this._injectionPath;
        const base = Config.appPath;
        const roamingBase = Config.userData;
        const roamingLocation = path.resolve(roamingBase, discordVersion, "modules", "discord_desktop_core", "injector");
        const location = path.resolve(base, "..", "app");
        const realLocation = fs.existsSync(location) ? location : fs.existsSync(roamingLocation) ? roamingLocation : null;
        if (!realLocation) return this._injectionPath = null;
        return this._injectionPath = realLocation;
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
        return Utilities.testJSON(fs.readFileSync(file).toString());
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
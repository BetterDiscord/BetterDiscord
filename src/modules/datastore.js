import {Config} from "data";
import Utilities from "./utilities";
import Logger from "./logger";
const fs = require("fs");
const path = require("path");
const releaseChannel = DiscordNative.globals ? DiscordNative.globals.releaseChannel : DiscordNative.app ? DiscordNative.app.getReleaseChannel() : "stable";

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
        const newStorageExists = fs.existsSync(this.baseFolder);
        if (!newStorageExists) fs.mkdirSync(this.baseFolder);
        if (!fs.existsSync(this.dataFolder)) fs.mkdirSync(this.dataFolder);
        if (!fs.existsSync(this.localeFolder)) fs.mkdirSync(this.localeFolder);
        if (!fs.existsSync(this.emoteFolder)) fs.mkdirSync(this.emoteFolder);
        if (!fs.existsSync(this.cacheFile)) fs.writeFileSync(this.cacheFile, JSON.stringify({}));
        if (!fs.existsSync(this.customCSS)) fs.writeFileSync(this.customCSS, "");
        const dataFiles = fs.readdirSync(this.dataFolder).filter(f => !fs.statSync(path.resolve(this.dataFolder, f)).isDirectory() && f.endsWith(".json"));
        for (const file of dataFiles) {
            this.data[file.split(".")[0]] = __non_webpack_require__(path.resolve(this.dataFolder, file));
        }
        this.cacheData = Utilities.testJSON(fs.readFileSync(this.cacheFile).toString()) || {};

        if (!newStorageExists) this.convertOldData(); // Convert old data if it exists (routine checks existence and removes existence)
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
                general: {publicServers: oldSettings["bda-gs-1"], voiceDisconnect: oldSettings["bda-dc-0"], classNormalizer: oldSettings["fork-ps-4"], showToasts: oldSettings["fork-ps-2"]},
                appearance: {twentyFourHour: oldSettings["bda-gs-6"], voiceMode: oldSettings["bda-gs-4"], minimalMode: oldSettings["bda-gs-2"], hideChannels: oldSettings["bda-gs-3"], darkMode: oldSettings["bda-gs-5"], coloredText: oldSettings["bda-gs-7"]},
                addons: {addonErrors: oldSettings["fork-ps-1"], autoReload: oldSettings["fork-ps-5"]},
                developer: {debuggerHotkey: oldSettings["bda-gs-8"], copySelector: oldSettings["fork-dm-1"], reactDevTools: oldSettings.reactDevTools}
            };

            const newEmotes = {
                general: {download: oldSettings["fork-es-3"], emoteMenu: oldSettings["bda-es-0"], hideEmojiMenu: !oldSettings["bda-es-9"], showNames: oldSettings["bda-es-6"], modifiers: oldSettings["bda-es-8"], animateOnHover: oldSettings["fork-es-2"]},
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
        const electron = require("electron").remote.app;
        const base = electron.getAppPath();
        const roamingBase = electron.getPath("userData");
        const roamingLocation = path.resolve(roamingBase, electron.getVersion(), "modules", "discord_desktop_core", "injector");
        const location = path.resolve(base, "..", "app");
        const realLocation = fs.existsSync(location) ? location : fs.existsSync(roamingLocation) ? roamingLocation : null;
        if (!realLocation) return this._injectionPath = null;
        return this._injectionPath = realLocation;
    }

    get customCSS() {return this._customCSS || (this._customCSS = path.resolve(this.dataFolder, "custom.css"));}
    get baseFolder() {return this._baseFolder || (this._baseFolder = path.resolve(Config.dataPath, "data"));}
    get dataFolder() {return this._dataFolder || (this._dataFolder = path.resolve(this.baseFolder, `${releaseChannel}`));}
    get localeFolder() {return this._localeFolder || (this._localeFolder = path.resolve(this.baseFolder, `locales`));}
    get emoteFolder() {return this._emoteFolder || (this._emoteFolder = path.resolve(this.baseFolder, `emotes`));}
    get cacheFile() {return this._cacheFile || (this._cacheFile = path.resolve(this.baseFolder, `.cache`));}
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

    getCacheHash(category, key) {
        if (!this.cacheData[category]) return "";
        if (!fs.existsSync(path.resolve(this.baseFolder, category, `${key}.json`))) return "";
        return this.cacheData[category][key] || "";
    }

    setCacheHash(category, key, hash) {
        if (!this.cacheData[category]) this.cacheData[category] = {};
        this.cacheData[category][key] = hash;
        fs.writeFileSync(this.cacheFile, JSON.stringify(this.cacheData));
    }

    invalidateCache(category, key) {
        if (!this.cacheData[category]) return;
        delete this.cacheData[category][key];
        fs.writeFileSync(this.cacheFile, JSON.stringify(this.cacheData));
    }

    emotesExist(category) {
        return fs.existsSync(path.resolve(this.emoteFolder, `${category}.json`));
    }

    getEmoteData(category) {
        const file = path.resolve(this.emoteFolder, `${category}.json`);
        if (!fs.existsSync(file)) return null;
        return Utilities.testJSON(fs.readFileSync(file).toString());
    }

    saveEmoteData(category, data) {
        fs.writeFileSync(path.resolve(this.emoteFolder, `${category}.json`), JSON.stringify(data));
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
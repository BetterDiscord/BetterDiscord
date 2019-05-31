import {SettingsCookie, SettingsInfo, Config, PluginCookie, ThemeCookie, Plugins, Themes, Emotes, EmoteBlacklist} from "data";
import proxyLocalStorage from "./localstorage";
import Core from "./modules/core";
import BdApi from "./modules/pluginapi";
import PluginManager from "./modules/pluginmanager";
import ThemeManager from "./modules/thememanager";
import {bdPluginStorage} from "./modules/oldstorage";
import Events from "./modules/emitter";

// Perform some setup
proxyLocalStorage();
const loadingIcon = document.createElement("div");
loadingIcon.className = "bd-loaderv2";
loadingIcon.title = "BandagedBD is loading...";
document.body.appendChild(loadingIcon);

// window.Core = Core;
window.BdApi = BdApi;
window.settings = SettingsInfo;
window.settingsCookie = SettingsCookie;
window.pluginCookie = PluginCookie;
window.themeCookie = ThemeCookie;
window.pluginModule = PluginManager;
window.themeModule = ThemeManager;
window.bdthemes = Themes;
window.bdplugins = Plugins;
window.bdEmotes = Emotes;
window.bemotes = EmoteBlacklist;
window.bdPluginStorage = bdPluginStorage;


window.BDEvents = Events;
window.bdConfig = Config;

export default class CoreWrapper {
    constructor(config) {
        Core.setConfig(config);
    }

    init() {
        Core.init();
    }
}

export function patchModuleLoad() {
    const namespace = "betterdiscord";
    const prefix = `${namespace}/`;
    const Module = require("module");
    const load = Module._load;
    // const resolveFilename = Module._resolveFilename;

    Module._load = function (request) {
        if (request === namespace || request.startsWith(prefix)) {
            const requested = request.substr(prefix.length);
            if (requested == "api") return BdApi;
        }

        return load.apply(this, arguments);
    };

    // Module._resolveFilename = function (request, parent, isMain) {
    //     if (request === "betterdiscord" || request.startsWith("betterdiscord/")) {
    //         const contentPath = PluginManager.getPluginPathByModule(parent);
    //         if (contentPath) return request;
    //     }

    //     return resolveFilename.apply(this, arguments);
    // };

    return function() {
        Module._load = load;
    };
}

// export function getPluginByModule(module) {
//     return this.localContent.find(plugin => module.filename === plugin.contentPath || module.filename.startsWith(plugin.contentPath + path.sep));
// }

// export function getPluginPathByModule(module) {
//     return Object.keys(this.pluginApiInstances).find(contentPath => module.filename === contentPath || module.filename.startsWith(contentPath + path.sep));
// }

// var settingsPanel, emoteModule, quickEmoteMenu, voiceMode,, dMode, publicServersModule;
// var bdConfig = null;
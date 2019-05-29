import {SettingsCookie, SettingsInfo, PluginCookie, ThemeCookie, Plugins, Themes, EmoteBlacklist} from "data";
import proxyLocalStorage from "./localstorage";
import Core from "./modules/core";
import BdApi from "./modules/pluginapi";
import PluginManager from "./modules/pluginmanager";
import ThemeManager from "./modules/thememanager";
import {bdPluginStorage} from "./modules/oldstorage";

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
window.bemotes = EmoteBlacklist;
window.bdPluginStorage = bdPluginStorage;

export default class CoreWrapper {
    constructor(config) {
        Core.setConfig(config);
    }

    init() {
        Core.init();
    }
}

// var settingsPanel, emoteModule, quickEmoteMenu, voiceMode,, dMode, publicServersModule;
// var bdConfig = null;
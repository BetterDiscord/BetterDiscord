import localStorageFix from "./localStorageFix";
import loadingIcon from "./loadingIcon";
localStorageFix();
loadingIcon();

import Core from "./core";
import BdApi from "./bdApi";

window.BdApi = BdApi;
// DataStore
// BDEvents
// settingsPanel
// emoteModule
// quickEmoteMenu
// voiceMode
// pluginModule
// themeModule
// dMode
// publicServersModule
// minSupportedVersion
// bbdVersion
// bbdChangelog
// mainCore
// settings
// defaultCookie
// settingsCookie
// bdpluginErrors
// bdthemeErrors
// bdConfig
// bemotes
// Utils
// ContentManager
// pluginCookie
// themeCookie
// devMode
// ClassNormalizer
// BDV2
// localStorage
// bdEmotes
// bdEmoteSettingIDs
// bdthemes
// bdplugins
// emotePromise

export default Core;

// function patchModuleLoad() {
//     const namespace = "betterdiscord";
//     const prefix = `${namespace}/`;
//     const Module = require("module");
//     const load = Module._load;
//     // const resolveFilename = Module._resolveFilename;

//     Module._load = function(request) {
//         if (request === namespace || request.startsWith(prefix)) {
//             const requested = request.substr(prefix.length);
//             if (requested == "api") return BdApi;
//         }

//         return load.apply(this, arguments);
//     };

//     // Module._resolveFilename = function (request, parent, isMain) {
//     //     if (request === "betterdiscord" || request.startsWith("betterdiscord/")) {
//     //         const contentPath = PluginManager.getPluginPathByModule(parent);
//     //         if (contentPath) return request;
//     //     }

//     //     return resolveFilename.apply(this, arguments);
//     // };

//     return function() {
//         Module._load = load;
//     };
// }

// patchModuleLoad();

// var settingsPanel, emoteModule, quickEmoteMenu, voiceMode,, dMode, publicServersModule;
// var bdConfig = null;
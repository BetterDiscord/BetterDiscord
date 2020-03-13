import localStorageFix from "./localStorageFix";
import loadingIcon from "./loadingIcon";
localStorageFix();
loadingIcon();

const deprecateGlobal = (key, value) => {
    Object.defineProperty(window, key, {
        get() {
            Utils.warn("Deprecation Notice", `"${key}" may be removed in future versions. Please only use BdApi.`);
            return value;
        }
    });  
};


import * as Globals from "./0globals";

const globalKeys = Object.keys(Globals);
for (const key of globalKeys) deprecateGlobal(key, Globals[key]);


import BdApi from "./bdApi";
import BDV2 from "./v2";
import pluginModule from "./pluginModule";
import themeModule from "./themeModule";
import Utils from "./utils";
import BDEvents from "./bdEvents";
import settingsPanel from "./settingsPanel";
import DataStore from "./dataStore";
import emoteModule from "./emoteModule";
import ContentManager from "./contentManager";
import ClassNormalizer from "./classNormalizer";

deprecateGlobal("BDV2", BDV2);
deprecateGlobal("pluginModule", pluginModule);
deprecateGlobal("themeModule", themeModule);
deprecateGlobal("Utils", Utils);
deprecateGlobal("BDEvents", BDEvents);
deprecateGlobal("settingsPanel", settingsPanel);
deprecateGlobal("DataStore", DataStore);
deprecateGlobal("emoteModule", emoteModule);
deprecateGlobal("ContentManager", ContentManager);
deprecateGlobal("ClassNormalizer", ClassNormalizer);

window.BdApi = BdApi;
// DataStore
// emoteModule
// ContentManager
// ClassNormalizer

import Core from "./core";
export default class CoreWrapper {
    constructor(bdConfig) {
        this.mainCore = new Core(bdConfig);
    }

    init() {
        // deprecateGlobal("mainCore", this.mainCore);
        this.mainCore.init();
    }
}

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
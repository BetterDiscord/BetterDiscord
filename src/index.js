import localStorageFix from "./localStorageFix";
import loadingIcon from "./loadingIcon";
localStorageFix();
loadingIcon();

const deprecateGlobal = (key, value) => {
    // value = typeof(value) !== "object" ? value : new Proxy(value, {
    //     get: function(obj, mod) {
    //         if (!obj.hasOwnProperty(mod)) return undefined;
    //         return obj[mod];
    //     },
    //     set: function(obj, mod) {
    //         if (obj.hasOwnProperty(mod)) return Utils.err("Deprecated Global", "Trying to overwrite deprecated BD globals");
    //     }
    // });
    Object.defineProperty(window, key, {
        get() {
            Utils.warn("Deprecated Global", `"${key}" will be removed in future versions. Please only use BdApi.`);
            return value;
        }
    });  
};


import * as Globals from "./0globals";

const globalKeys = Object.keys(Globals);
for (const key of globalKeys) deprecateGlobal(key, Globals[key]);


import BdApi from "./modules/bdApi";
import BDV2 from "./modules/v2";
import pluginModule from "./modules/pluginModule";
import themeModule from "./modules/themeModule";
import Utils from "./modules/utils";
import BDEvents from "./modules/bdEvents";
import settingsPanel from "./modules/settingsPanel";
import DataStore from "./modules/dataStore";
import emoteModule from "./modules/emoteModule";
import ContentManager from "./modules/contentManager";
import ClassNormalizer from "./modules/classNormalizer";

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

import Core from "./modules/core";
deprecateGlobal("mainCore", Core);
export default class CoreWrapper {
    constructor(bdConfig) {
        Core.setConfig(bdConfig);
    }

    init() {
        // deprecateGlobal("mainCore", this.mainCore);
        Core.init();
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
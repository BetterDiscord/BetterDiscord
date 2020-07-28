import localStorageFix from "./localStorageFix";
import loadingIcon from "./loadingIcon";
localStorageFix();
loadingIcon();

const deprecateGlobal = (key, value) => {
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
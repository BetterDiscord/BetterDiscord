import Utilities from "./utilities";
import WebpackModules, {DiscordModules} from "./webpackmodules";

import BDV2 from "./bdv2";
import BdApi from "./pluginapi";
import Core from "./core";



import ContentManager from "./contentmanager";
import DataStore from "./datastore";
// import DevMode from "./devmode";
import Events from "./emitter";
// import EmoteModule from "./emotes";
import PluginManager from "./pluginmanager";
// import PublicServers from "./publicservers";
import ThemeManager from "./thememanager";
import Settings from "./settingsmanager";

export const React = DiscordModules.React;
export const ReactDOM = DiscordModules.ReactDOM;

export {BDV2, BdApi, Core, ContentManager, DataStore,
        Events, PluginManager, /*PublicServers,*/ ThemeManager,
        Utilities, WebpackModules, DiscordModules, Settings};

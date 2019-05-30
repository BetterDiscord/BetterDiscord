import Utilities from "./utilities";
import WebpackModules, {DiscordModules} from "./webpackmodules";

import BDV2 from "./bdv2";
import BdApi from "./pluginapi";
import Core from "./core";



import ClassNormalizer from "./classnormalizer";
import ContentManager from "./contentmanager";
import DataStore from "./datastore";
import DevMode from "./devmode";
import Events from "./emitter";
import EmoteMenu from "./emotemenu";
import EmoteModule from "./emotes";
import PluginManager from "./pluginmanager";
// import PublicServers from "./publicservers";
import ThemeManager from "./thememanager";
import VoiceMode from "./voicemode";

export const React = DiscordModules.React;
export const ReactDOM = DiscordModules.ReactDOM;

export {BDV2, BdApi, Core, ClassNormalizer, ContentManager, DataStore, DevMode,
        Events, EmoteMenu, EmoteModule, PluginManager, /*PublicServers,*/ ThemeManager,
        VoiceMode, Utilities, WebpackModules, DiscordModules};



// export {{
//         get React() {return DiscordModules.React;}
// }}
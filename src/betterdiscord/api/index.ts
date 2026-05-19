import BDLogger from "@common/logger";

import PluginManager from "@modules/pluginmanager";
import ThemeManager from "@modules/thememanager";
import DiscordModules from "@modules/discordmodules";
import Config from "@stores/config";

import AddonAPI from "./addonapi";
import ReactUtils from "./reactutils";
import UI from "./ui";
import Utils from "./utils";
import Webpack from "./webpack";
import ContextMenu from "./contextmenu";
import Net from "./net";
import Components from "./components";
import {Logger, BoundLogger} from "./logger";
import {CommandAPI, BoundCommandAPI} from "./commands";
import {DOM, BoundDOM} from "./dom";
import {Data, BoundData} from "./data";
import {Patcher, BoundPatcher} from "./patcher";
import {Hooks, BoundHooks} from "./hooks";
import ReactDOM from "@modules/reactdom";


const bounded = new Map();

const ReactUtilsInstance = new ReactUtils();
const UIInstance = new UI();
const UtilsInstance = new Utils();
const WebpackInstance = new Webpack();
const ComponentsInstance = new Components();

const PluginAPI = new AddonAPI(PluginManager);
const ThemeAPI = new AddonAPI(ThemeManager);
const PatcherAPI = new Patcher();
const DataAPI = new Data();
const DOMAPI = new DOM();
const ContextMenuAPI = new ContextMenu();
const CommandsAPI = new CommandAPI();
const HooksAPI = new Hooks();
const DefaultLogger = new Logger();
const NetInstance = new Net();

const version: string = Config.get("version");

/**
 * `BdApi` is a globally (`window.BdApi`) accessible object for use by plugins and developers to make their lives easier.
 * It can be instantiated (`new BdApi("MyPlugin")`) to get a version of the API with automatic scoping for plugins,
 * or its static properties can be used directly.
 */
export default class BdApi {
    /** The React module being used inside Discord */
    get React() {return DiscordModules.React;}
    /** The React module being used inside Discord */
    static React = DiscordModules.React;

    /** The ReactDOM module being used inside Discord */
    get ReactDOM() {return ReactDOM;}
    /** The ReactDOM module being used inside Discord */
    static ReactDOM = ReactDOM;

    /** A reference string for BD's version */
    get version() {return version;}
    /** A reference string for BD's version */
    static version = version;

    /** A set of react components plugins can make use of */
    get Components() {return ComponentsInstance;}
    /** A set of react components plugins can make use of */
    static Components = ComponentsInstance;

    /** An instance of {@link Net} for using network related tools */
    get Net() {return NetInstance;};
    /** An instance of {@link Net} for using network related tools */
    static Net = NetInstance;

    /** An instance of {@link Webpack} to search for modules */
    get Webpack() {return WebpackInstance;}
    /** An instance of {@link Webpack} to search for modules */
    static Webpack = WebpackInstance;

    /** An instance of {@link AddonAPI} to access plugins */
    get Plugins() {return PluginAPI;}
    /** An instance of {@link AddonAPI} to access plugins */
    static Plugins = PluginAPI;

    /** An instance of {@link AddonAPI} to access themes */
    get Themes() {return ThemeAPI;}
    /** An instance of {@link AddonAPI} to access themes */
    static Themes = ThemeAPI;

    /** An instance of {@link Utils} for general utility functions */
    get Utils() {return UtilsInstance;}
    /** An instance of {@link Utils} for general utility functions */
    static Utils = UtilsInstance;

    /** An instance of {@link UI} to create interfaces */
    get UI() {return UIInstance;}
    /** An instance of {@link UI} to create interfaces */
    static UI = UIInstance;

    /** An instance of {@link ReactUtils} to work with React */
    get ReactUtils() {return ReactUtilsInstance;}
    /** An instance of {@link ReactUtils} to work with React */
    static ReactUtils = ReactUtilsInstance;

    /** An instance of {@link ContextMenu} for interacting with context menus */
    get ContextMenu() {return ContextMenuAPI;}
    /** An instance of {@link ContextMenu} for interacting with context menus */
    static ContextMenu = ContextMenuAPI;

    /** An instance of {@link Patcher} to monkey patch functions */
    get Patcher(): BoundPatcher {return PatcherAPI as unknown as BoundPatcher;}
    /** An instance of {@link Patcher} to monkey patch functions */
    static Patcher: Patcher = PatcherAPI;

    /** An instance of {@link Data} to manage data */
    get Data(): BoundData {return DataAPI as BoundData;}
    /** An instance of {@link Data} to manage data */
    static Data: Data = DataAPI;

    /** An instance of {@link DOM} to interact with the DOM */
    get DOM(): BoundDOM {return DOMAPI as BoundDOM;}
    /** An instance of {@link DOM} to interact with the DOM */
    static DOM: DOM = DOMAPI;

    /** An instance of {@link Logger} for logging information */
    get Logger(): BoundLogger {return DefaultLogger as unknown as BoundLogger;}
    /** An instance of {@link Logger} for logging information */
    static Logger: Logger = DefaultLogger;

    /** An instance of {@link CommandAPI} for adding slash commands */
    get Commands(): BoundCommandAPI {return CommandsAPI as unknown as BoundCommandAPI;}
    /** An instance of {@link CommandAPI} for adding slash commands */
    static Commands: CommandAPI = CommandsAPI;

    /** An instance of {@link Hooks} for react hooks */
    get Hooks(): BoundHooks {return HooksAPI as unknown as BoundHooks;}
    /** An instance of {@link Hooks} for react hooks */
    static Hooks: Hooks = HooksAPI;

    constructor(pluginName: string) {
        // @ts-expect-error return the normal BdApi when called without a plugin name for backwards compatibility
        if (!pluginName) return BdApi;
        if (bounded.has(pluginName)) return bounded.get(pluginName);
        if (typeof (pluginName) !== "string") {
            BDLogger.error("BdApi", "Plugin name not a string, returning generic API!");
            // @ts-expect-error same as above
            return BdApi;
        }

        // Bind to pluginName
        const ScopedPatcher = new BoundPatcher(pluginName);
        const ScopedData = new BoundData(pluginName);
        const ScopedDOM = new BoundDOM(pluginName);
        const ScopedLogger = new BoundLogger(pluginName);
        const ScopedCommands = new BoundCommandAPI(pluginName);
        const ScopedHooks = new BoundHooks(pluginName);

        Object.defineProperties(this, {
            Patcher: {get: () => ScopedPatcher},
            Data: {get: () => ScopedData},
            DOM: {get: () => ScopedDOM},
            Logger: {get: () => ScopedLogger},
            Commands: {get: () => ScopedCommands},
            Hooks: {get: () => ScopedHooks}
        });

        bounded.set(pluginName, this);
    }
}

Object.freeze(BdApi);
Object.freeze(BdApi.prototype);

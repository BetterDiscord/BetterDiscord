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
import fetch from "./fetch";
import {Logger, BoundLogger} from "./logger";
import {CommandAPI, BoundCommandAPI} from "./commands";
import {DOM, BoundDOM} from "./dom";
import {Data, BoundData} from "./data";
import {Patcher, BoundPatcher} from "./patcher";
import {Hooks, BoundHooks} from "./hooks";

import ColorInput from "@ui/settings/components/color";
import DropdownInput from "@ui/settings/components/dropdown";
import SettingItemComponent from "@ui/settings/components/item";
import KeybindInput from "@ui/settings/components/keybind";
import NumberInput from "@ui/settings/components/number";
import RadioInput from "@ui/settings/components/radio";
import SearchInput from "@ui/settings/components/search";
import SliderInput from "@ui/settings/components/slider";
import SwitchInput from "@ui/settings/components/switch";
import TextInput from "@ui/settings/components/textbox";
import SettingGroup from "@ui/settings/group";
import ErrorBoundary from "@ui/errorboundary";
import Text from "@ui/base/text";
import Flex from "@ui/base/flex";
import Button from "@ui/base/button";
import Spinner from "@ui/spinner";
import ReactDOM from "@modules/reactdom";


const bounded = new Map();

const ReactUtilsInstance = new ReactUtils();
const UIInstance = new UI();
const UtilsInstance = new Utils();
const WebpackInstance = new Webpack();

const PluginAPI = new AddonAPI(PluginManager);
const ThemeAPI = new AddonAPI(ThemeManager);
const PatcherAPI = new Patcher();
const DataAPI = new Data();
const DOMAPI = new DOM();
const ContextMenuAPI = new ContextMenu();
const CommandsAPI = new CommandAPI();
const HooksAPI = new Hooks();
const DefaultLogger = new Logger();

const Components = Object.freeze({
    Tooltip: DiscordModules.Tooltip,
    SettingItem: SettingItemComponent,
    ColorInput,
    DropdownInput,
    KeybindInput,
    NumberInput,
    RadioInput,
    SearchInput,
    SliderInput,
    SwitchInput,
    TextInput,
    SettingGroup,
    ErrorBoundary,
    Text,
    Flex,
    Button,
    Spinner
});

const Net = Object.freeze({
    fetch
});

const version: string = Config.get("version");

/**
 * `BdApi` is a globally (`window.BdApi`) accessible object for use by plugins and developers to make their lives easier.
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
    get Components() {return Components;}
    /** A set of react components plugins can make use of */
    static Components = Components;

    /** An instance of {@link Net} for using network related tools */
    get Net() {return Net;};
    /** An instance of {@link Net} for using network related tools */
    static Net = Net;

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
    Patcher: BoundPatcher = PatcherAPI as unknown as BoundPatcher;
    /** An instance of {@link Patcher} to monkey patch functions */
    static Patcher: Patcher = PatcherAPI;

    /** An instance of {@link Data} to manage data */
    Data: BoundData = DataAPI as BoundData;
    /** An instance of {@link Data} to manage data */
    static Data: Data = DataAPI;

    /** An instance of {@link DOM} to interact with the DOM */
    DOM: BoundDOM = DOMAPI as BoundDOM;
    /** An instance of {@link DOM} to interact with the DOM */
    static DOM: DOM = DOMAPI;

    /** An instance of {@link Logger} for logging information */
    Logger: BoundLogger = DefaultLogger as unknown as BoundLogger;
    /** An instance of {@link Logger} for logging information */
    static Logger: Logger = DefaultLogger;

    /** An instance of {@link CommandAPI} for adding slash commands */
    Commands: BoundCommandAPI = CommandsAPI as unknown as BoundCommandAPI;
    /** An instance of {@link CommandAPI} for adding slash commands */
    static Commands: CommandAPI = CommandsAPI;

    /** An instance of {@link Hooks} for react hooks */
    Hooks: BoundHooks = HooksAPI as unknown as BoundHooks;
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
        this.Patcher = new BoundPatcher(pluginName);
        this.Data = new BoundData(pluginName);
        this.DOM = new BoundDOM(pluginName);
        this.Logger = new BoundLogger(pluginName);
        this.Commands = new BoundCommandAPI(pluginName);
        this.Hooks = new BoundHooks(pluginName);

        bounded.set(pluginName, this);
    }
}

Object.freeze(BdApi);
Object.freeze(BdApi.prototype);

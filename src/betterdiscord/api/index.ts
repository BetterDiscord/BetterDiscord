import BDLogger from "@common/logger";

import PluginManager from "@modules/pluginmanager";
import ThemeManager from "@modules/thememanager";
import DiscordModules from "@modules/discordmodules";
import Config from "@stores/config";

import AddonAPI from "./addonapi";
import Data from "./data";
import DOM from "./dom";
import Patcher from "./patcher";
import ReactUtils from "./reactutils";
import UI from "./ui";
import Utils from "./utils";
import Webpack from "./webpack";
import ContextMenu from "./contextmenu";
import fetch from "./fetch";
import Logger from "./logger";
import CommandAPI from "./commands";
import Hooks from "./hooks";

import ColorInput from "@ui/settings/components/color";
import DropdownInput from "@ui/settings/components/dropdown";
import SettingItem from "@ui/settings/components/item";
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
const PluginAPI = new AddonAPI(PluginManager);
const ThemeAPI = new AddonAPI(ThemeManager);
const PatcherAPI = new Patcher<false>();
const DataAPI = new Data<false>();
const DOMAPI = new DOM<false>();
const ContextMenuAPI = new ContextMenu();
const CommandsAPI = new CommandAPI<false>();
const HooksAPI = new Hooks();
const DefaultLogger = new Logger<false>();

const Components = Object.freeze({
    Tooltip: DiscordModules.Tooltip,
    SettingItem: SettingItem,
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
    get Webpack() {return Webpack;}
    /** An instance of {@link Webpack} to search for modules */
    static Webpack = Webpack;

    /** An instance of {@link AddonAPI} to access plugins */
    get Plugins() {return PluginAPI;}
    /** An instance of {@link AddonAPI} to access plugins */
    static Plugins = PluginAPI;

    /** An instance of {@link AddonAPI} to access themes */
    get Themes() {return ThemeAPI;}
    /** An instance of {@link AddonAPI} to access themes */
    static Themes = ThemeAPI;

    /** An instance of {@link Utils} for general utility functions */
    get Utils() {return Utils;}
    /** An instance of {@link Utils} for general utility functions */
    static Utils = Utils;

    /** An instance of {@link UI} to create interfaces */
    get UI() {return UI;}
    /** An instance of {@link UI} to create interfaces */
    static UI = UI;

    /** An instance of {@link ReactUtils} to work with React */
    get ReactUtils() {return ReactUtils;}
    /** An instance of {@link ReactUtils} to work with React */
    static ReactUtils = ReactUtils;

    /** An instance of {@link ContextMenu} for interacting with context menus */
    get ContextMenu() {return ContextMenuAPI;}
    /** An instance of {@link ContextMenu} for interacting with context menus */
    static ContextMenu = ContextMenuAPI;

    /** An instance of {@link Patcher} to monkey patch functions */
    Patcher: Patcher<true> = PatcherAPI as Patcher<true>;
    /** An instance of {@link Patcher} to monkey patch functions */
    static Patcher: Patcher<false> = PatcherAPI;

    /** An instance of {@link Data} to manage data */
    Data: Data<true> = DataAPI as Data<true>;
    /** An instance of {@link Data} to manage data */
    static Data: Data<false> = DataAPI;

    /** An instance of {@link DOM} to interact with the DOM */
    DOM: DOM<true> = DOMAPI as DOM<true>;
    /** An instance of {@link DOM} to interact with the DOM */
    static DOM: DOM<false> = DOMAPI;

    /** An instance of {@link Logger} for logging information */
    Logger: Logger<true> = DefaultLogger as Logger<true>;
    /** An instance of {@link Logger} for logging information */
    static Logger: Logger<false> = DefaultLogger;

    /** An instance of {@link CommandAPI} for adding slash commands */
    Commands: CommandAPI<true> = CommandsAPI as unknown as CommandAPI<true>;
    /** An instance of {@link CommandAPI} for adding slash commands */
    static Commands: CommandAPI<false> = CommandsAPI;

    /** An instance of {@link Hooks} for react hooks */
    Hooks: Hooks<any, true> = HooksAPI as unknown as Hooks<any, true>;
    /** An instance of {@link Hooks} for react hooks */
    static Hooks: Hooks<any, false> = HooksAPI;

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
        this.Patcher = new Patcher(pluginName);
        this.Data = new Data(pluginName);
        this.DOM = new DOM(pluginName);
        this.Logger = new Logger(pluginName);
        this.Commands = new CommandAPI(pluginName);
        this.Hooks = new Hooks(pluginName);

        bounded.set(pluginName, this);
    }
}

Object.freeze(BdApi);
Object.freeze(BdApi.prototype);

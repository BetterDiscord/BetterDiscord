import BDLogger from "@common/logger";

import PluginManager from "@modules/pluginmanager";
import ThemeManager from "@modules/thememanager";
import DiscordModules from "@modules/discordmodules";

import AddonAPI from "./addonapi";
import Data from "./data";
import DOM from "./dom";
import Patcher from "./patcher";
import ReactUtils from "./reactutils";
import UI from "./ui";
import Utils from "./utils";
import Webpack from "./webpack";
import * as Legacy from "./legacy";
import ContextMenu from "./contextmenu";
import fetch from "./fetch";
import Logger from "./logger";
import CommandAPI from "./commands";

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

const bounded = new Map();
const PluginAPI = new AddonAPI(PluginManager);
const ThemeAPI = new AddonAPI(ThemeManager);
const PatcherAPI = new Patcher();
const DataAPI = new Data();
const DOMAPI = new DOM();
const ContextMenuAPI = new ContextMenu();
const CommandsAPI = new CommandAPI();
const DefaultLogger = new Logger();

/**
 * `Components` is a namespace holding a series of React components. It is available under {@link BdApi}.
 * @type Components
 * @summary {@link Components} a namespace holding a series of React components
 * @name Components
 */
const Components = {
    get Tooltip() {return DiscordModules.Tooltip;},
    get ColorInput() {return ColorInput;},
    get DropdownInput() {return DropdownInput;},
    get SettingItem() {return SettingItem;},
    get KeybindInput() {return KeybindInput;},
    get NumberInput() {return NumberInput;},
    get RadioInput() {return RadioInput;},
    get SearchInput() {return SearchInput;},
    get SliderInput() {return SliderInput;},
    get SwitchInput() {return SwitchInput;},
    get TextInput() {return TextInput;},
    get SettingGroup() {return SettingGroup;},
    get ErrorBoundary() {return ErrorBoundary;},
    get Text() {return Text;},
    get Flex() {return Flex;},
    get Button() {return Button;},
    get Spinner() {return Spinner;},
};

/**
 * `BdApi` is a globally (`window.BdApi`) accessible object for use by plugins and developers to make their lives easier.
 * @name BdApi
 */
export default class BdApi {
    constructor(pluginName) {
        if (!pluginName) return BdApi;
        if (bounded.has(pluginName)) return bounded.get(pluginName);
        if (typeof(pluginName) !== "string") {
            BDLogger.error("BdApi", "Plugin name not a string, returning generic API!");
            return BdApi;
        }

        // Re-add legacy functions
        Object.assign(this, Legacy);

        // Bind to pluginName
        this.Patcher = new Patcher(pluginName);
        this.Data = new Data(pluginName);
        this.DOM = new DOM(pluginName);
        this.Logger = new Logger(pluginName);
        this.Commands = new CommandAPI(pluginName);

        bounded.set(pluginName, this);
    }

    // Non-bound namespaces
    get Plugins() {return PluginAPI;}
    get Themes() {return ThemeAPI;}
    get Webpack() {return Webpack;}
    get Utils() {return Utils;}
    get UI() {return UI;}
    get ReactUtils() {return ReactUtils;}
    get ContextMenu() {return ContextMenuAPI;}
    get Components() {return Components;}
    Net = {fetch}; 
}

// Add legacy functions
Object.assign(BdApi, Legacy);

/**
 * An instance of {@link AddonAPI} to access plugins.
 * @type AddonAPI
 */
BdApi.Plugins = PluginAPI;

/**
 * An instance of {@link AddonAPI} to access themes.
 * @type AddonAPI
 */
BdApi.Themes = ThemeAPI;

/**
 * An instance of {@link Patcher} to monkey patch functions.
 * @type Patcher
 */
BdApi.Patcher = PatcherAPI;

/**
 * An instance of {@link Webpack} to search for modules.
 * @type Webpack
 */
BdApi.Webpack = Webpack;

/**
 * An instance of {@link Data} to manage data.
 * @type Data
 */
 BdApi.Data = DataAPI;

/**
 * An instance of {@link UI} to create interfaces.
 * @type UI
 */
BdApi.UI = UI;

/**
 * An instance of {@link ReactUtils} to work with React.
 * @type ReactUtils
 */
BdApi.ReactUtils = ReactUtils;

/**
 * An instance of {@link Utils} for general utility functions.
 * @type Utils
 */
BdApi.Utils = Utils;

/**
 * An instance of {@link DOM} to interact with the DOM.
 * @type DOM
 */
BdApi.DOM = DOMAPI;

/**
 * An instance of {@link ContextMenu} for interacting with context menus.
 * @type ContextMenu
 */
BdApi.ContextMenu = ContextMenuAPI;

/**
 * An set of react components plugins can make use of.
 * @type Components
 */
BdApi.Components = Components;

/**
 * An instance of {@link CommandAPI} for adding slash commands.
 * @type CommandAPI
 */
BdApi.Commands = CommandsAPI;

/**
 * An instance of {@link Net} for using network related tools.
 * @type Net
 */
BdApi.Net = {fetch};

/**
 * An instance of {@link Logger} for logging information.
 * @type Logger
 */
BdApi.Logger = DefaultLogger;

Object.freeze(BdApi);
Object.freeze(BdApi.Net);
Object.freeze(BdApi.prototype);
Object.freeze(BdApi.Components);

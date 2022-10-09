import PluginManager from "../pluginmanager";
import ThemeManager from "../thememanager";
import Logger from "common/logger";

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

const bounded = new Map();
const PluginAPI = new AddonAPI(PluginManager);
const ThemeAPI = new AddonAPI(ThemeManager);
const PatcherAPI = new Patcher();
const DataAPI = new Data();
const DOMAPI = new DOM();
const ContextMenuAPI = new ContextMenu();

/**
 * `BdApi` is a globally (`window.BdApi`) accessible object for use by plugins and developers to make their lives easier.
 * @name BdApi
 */
export default class BdApi {
    constructor(pluginName) {
        if (!pluginName) return BdApi;
        if (bounded.has(pluginName)) return bounded.get(pluginName);
        if (typeof(pluginName) !== "string") {
            Logger.error("BdApi", "Plugin name not a string, returning generic API!");
            return BdApi;
        }

        // Re-add legacy functions
        Object.assign(this, Legacy);

        // Bind to pluginName
        this.Patcher = new Patcher(pluginName);
        this.Data = new Data(pluginName);
        this.DOM = new DOM(pluginName);

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
 * An instance of {@link ContextMenu} for interacting with context menus
 * @type ContextMenu
 */
BdApi.ContextMenu = ContextMenuAPI;

Object.freeze(BdApi);
Object.freeze(BdApi.prototype);

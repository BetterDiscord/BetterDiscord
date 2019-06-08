import Utilities from "./utilities";
import WebpackModules, {DiscordModules} from "./webpackmodules";
import DataStore from "./datastore";
import {Toasts, Modals} from "ui";

const BdApi = {
    get React() { return DiscordModules.React; },
    get ReactDOM() { return DiscordModules.ReactDOM; },
    get WindowConfigFile() {
        if (this._windowConfigFile) return this._windowConfigFile;
        const electron = require("electron").remote.app;
        const path = require("path");
        const base = electron.getAppPath();
        const roamingBase = electron.getPath("userData");
        const roamingLocation = path.resolve(roamingBase, electron.getVersion(), "modules", "discord_desktop_core", "injector", "config.json");
        const location = path.resolve(base, "..", "app", "config.json");
        const fs = require("fs");
        const realLocation = fs.existsSync(location) ? location : fs.existsSync(roamingLocation) ? roamingLocation : null;
        if (!realLocation) return this._windowConfigFile = null;
        return this._windowConfigFile = realLocation;
    }
};

BdApi.getAllWindowPreferences = function() {
    if (!this.WindowConfigFile) return {};
    return __non_webpack_require__(this.WindowConfigFile);
};

BdApi.getWindowPreference = function(key) {
    if (!this.WindowConfigFile) return undefined;
    return this.getAllWindowPreferences()[key];
};

BdApi.setWindowPreference = function(key, value) {
    if (!this.WindowConfigFile) return;
    const fs = require("fs");
    const prefs = this.getAllWindowPreferences();
    prefs[key] = value;
    delete require.cache[this.WindowConfigFile];
    fs.writeFileSync(this.WindowConfigFile, JSON.stringify(prefs, null, 4));
};

//Inject CSS to document head
//id = id of element
//css = custom css
BdApi.injectCSS = function (id, css) {
    $("head").append($("<style>", {id: Utilities.escapeID(id), text: css}));
};

//Clear css/remove any element
//id = id of element
BdApi.clearCSS = function (id) {
    $("#" + Utilities.escapeID(id)).remove();
};

//Inject CSS to document head
//id = id of element
//css = custom css
BdApi.linkJS = function (id, url) {
    $("head").append($("<script>", {id: Utilities.escapeID(id), src: url, type: "text/javascript"}));
};

//Clear css/remove any element
//id = id of element
BdApi.unlinkJS = function (id) {
    $("#" + Utilities.escapeID(id)).remove();
};

/**
 * Shows a generic but very customizable modal.
 * @param {string} title - title of the modal
 * @param {string} content - a string of text to display in the modal
 */
BdApi.alert = function (title, content) {
    Modals.alert(title, content);
};

/**
 * Shows a generic but very customizable confirmation modal with optional confirm and cancel callbacks.
 * @param {string} title - title of the modal
 * @param {(string|ReactElement|Array<string|ReactElement>)} children - a single or mixed array of react elements and strings. Everything is wrapped in Discord's `TextElement` component so strings will show and render properly.
 * @param {object} [options] - options to modify the modal
 * @param {boolean} [options.danger=false] - whether the main button should be red or not
 * @param {string} [options.confirmText=Okay] - text for the confirmation/submit button
 * @param {string} [options.cancelText=Cancel] - text for the cancel button
 * @param {callable} [options.onConfirm=NOOP] - callback to occur when clicking the submit button
 * @param {callable} [options.onCancel=NOOP] - callback to occur when clicking the cancel button
 */
BdApi.showConfirmationModal = function (title, content, options = {}) {
    return Modals.showConfirmationModal(title, content, options);
};

/**
 * This shows a toast similar to android towards the bottom of the screen.
 *
 * @param {string} content The string to show in the toast.
 * @param {object} options Options object. Optional parameter.
 * @param {string} [options.type=""] Changes the type of the toast stylistically and semantically. Choices: "", "info", "success", "danger"/"error", "warning"/"warn". Default: ""
 * @param {boolean} [options.icon=true] Determines whether the icon should show corresponding to the type. A toast without type will always have no icon. Default: true
 * @param {number} [options.timeout=3000] Adjusts the time (in ms) the toast should be shown for before disappearing automatically. Default: 3000
 * @param {boolean} [options.forceShow=false] Whether to force showing the toast and ignore the bd setting
 */
BdApi.showToast = function(content, options = {}) {
    Toasts.show(content, options);
};

// Finds module
BdApi.findModule = function(filter) {
    return WebpackModules.getModule(filter);
};

// Finds module
BdApi.findAllModules = function(filter) {
    return WebpackModules.getModule(filter, false);
};

// Finds module
BdApi.findModuleByProps = function(...props) {
    return WebpackModules.getByProps(...props);
};

BdApi.findModuleByPrototypes = function(...protos) {
    return WebpackModules.getByPrototypes(...protos);
};

BdApi.findModuleByDisplayName = function(name) {
    return WebpackModules.getByDisplayName(name);
};

// Gets react instance
BdApi.getInternalInstance = function(node) {
    if (!(node instanceof window.jQuery) && !(node instanceof Element)) return undefined;
    if (node instanceof jQuery) node = node[0];
    return Utilities.getInternalInstance(node);
};

// Gets data
BdApi.loadData = function(pluginName, key) {
    return DataStore.getPluginData(pluginName, key);
};

BdApi.getData = BdApi.loadData;

// Sets data
BdApi.saveData = function(pluginName, key, data) {
    return DataStore.setPluginData(pluginName, key, data);
};

BdApi.setData = BdApi.saveData;

// Deletes data
BdApi.deleteData = function(pluginName, key) {
    return DataStore.deletePluginData(pluginName, key);
};

// Patches other functions
BdApi.monkeyPatch = function(what, methodName, options) {
    return Utilities.monkeyPatch(what, methodName, options);
};

// Event when element is removed
BdApi.onRemoved = function(node, callback) {
    return Utilities.onRemoved(node, callback);
};

// Wraps function in try..catch
BdApi.suppressErrors = function(method, message) {
    return Utilities.suppressErrors(method, message);
};

// Tests for valid JSON
BdApi.testJSON = function(data) {
    return Utilities.testJSON(data);
};

//Get another plugin
//name = name of plugin
// BdApi.getPlugin = function (name) {
//     if (Plugins.hasOwnProperty(name)) {
//         return Plugins[name].plugin;
//     }
//     return null;
// };

// BdApi.isPluginEnabled = function(name) {
//     return !!PluginCookie[name];
// };

// BdApi.isThemeEnabled = function(name) {
//     return !!ThemeCookie[name];
// };

// BdApi.isSettingEnabled = function(id) {
//     return !!SettingsCookie[id];
// };

// Gets data
BdApi.getBDData = function(key) {
    return DataStore.getBDData(key);
};

// Sets data
BdApi.setBDData = function(key, data) {
    return DataStore.setBDData(key, data);
};

export default BdApi;
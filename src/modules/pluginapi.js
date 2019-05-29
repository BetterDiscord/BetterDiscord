import {Config, Plugins, SettingsCookie, PluginCookie, ThemeCookie} from "data";
import Utilities from "./utilities";
import BDV2 from "./bdv2";
import DataStore from "./datastore";
import Core from "./core";

const BdApi = {
    get React() { return BDV2.react; },
    get ReactDOM() { return BDV2.reactDom; },
    get WindowConfigFile() {
        if (this._windowConfigFile) return this._windowConfigFile;
        const base = require("electron").remote.app.getAppPath();
        const path = require("path");
        const location = path.resolve(base, "..", "app", "config.json");
        const fs = require("fs");
        if (!fs.existsSync(path.resolve(base, "..", "app"))) return this._windowConfigFile = null;
        if (!fs.existsSync(location)) fs.writeFileSync(location, JSON.stringify({}));
        return this._windowConfigFile = location;
    }
};

BdApi.getAllWindowPreferences = function() {
    if ((Config.os !== "win32" && Config.os !== "darwin") || !this.WindowConfigFile) return {}; // Tempfix until new injection on other platforms
    return __non_webpack_require__(this.WindowConfigFile);
};

BdApi.getWindowPreference = function(key) {
    if ((Config.os !== "win32" && Config.os !== "darwin") || !this.WindowConfigFile) return undefined; // Tempfix until new injection on other platforms
    return this.getAllWindowPreferences()[key];
};

BdApi.setWindowPreference = function(key, value) {
    if ((Config.os !== "win32" && Config.os !== "darwin") || !this.WindowConfigFile) return; // Tempfix until new injection on other platforms
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

//Get another plugin
//name = name of plugin
BdApi.getPlugin = function (name) {
    if (Plugins.hasOwnProperty(name)) {
        return Plugins[name].plugin;
    }
    return null;
};


//Get BetterDiscord Core
BdApi.getCore = function () {
    return Core;
};

/**
 * Shows a generic but very customizable modal.
 * @param {string} title - title of the modal
 * @param {string} content - a string of text to display in the modal
 */
BdApi.alert = function (title, content) {
    const ModalStack = BdApi.findModuleByProps("push", "update", "pop", "popWithKey");
    const AlertModal = BdApi.findModuleByPrototypes("handleCancel", "handleSubmit", "handleMinorConfirm");
    if (!ModalStack || !AlertModal) return Core.alert(title, content);

    ModalStack.push(function(props) {
        return BdApi.React.createElement(AlertModal, Object.assign({
            title: title,
            body: content,
        }, props));
    });
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
    const ModalStack = BdApi.findModuleByProps("push", "update", "pop", "popWithKey");
    const TextElement = BdApi.findModuleByProps("Sizes", "Weights");
    const ConfirmationModal = BdApi.findModule(m => m.defaultProps && m.key && m.key() == "confirm-modal");
    if (!ModalStack || !ConfirmationModal || !TextElement) return Core.alert(title, content);

    const {onConfirm, onCancel, confirmText, cancelText, danger = false} = options;
    if (typeof(content) == "string") content = TextElement({color: TextElement.Colors.PRIMARY, children: [content]});
    else if (Array.isArray(content)) content = TextElement({color: TextElement.Colors.PRIMARY, children: content});
    content = [content];

    const emptyFunction = () => {};
    ModalStack.push(function(props) {
        return BdApi.React.createElement(ConfirmationModal, Object.assign({
            header: title,
            children: content,
            red: danger,
            confirmText: confirmText ? confirmText : "Okay",
            cancelText: cancelText ? cancelText : "Cancel",
            onConfirm: onConfirm ? onConfirm : emptyFunction,
            onCancel: onCancel ? onCancel : emptyFunction
        }, props));
    });
};

//Show toast alert
BdApi.showToast = function(content, options = {}) {
    Core.showToast(content, options);
};

// Finds module
BdApi.findModule = function(filter) {
    return BDV2.WebpackModules.find(filter);
};

// Finds module
BdApi.findAllModules = function(filter) {
    return BDV2.WebpackModules.findAll(filter);
};

// Finds module
BdApi.findModuleByProps = function(...props) {
    return BDV2.WebpackModules.findByUniqueProperties(props);
};

BdApi.findModuleByPrototypes = function(...protos) {
    return BDV2.WebpackModules.findByPrototypes(protos);
};

BdApi.findModuleByDisplayName = function(name) {
    return BDV2.WebpackModules.findByDisplayName(name);
};

// Gets react instance
BdApi.getInternalInstance = function(node) {
    if (!(node instanceof window.jQuery) && !(node instanceof Element)) return undefined;
    if (node instanceof jQuery) node = node[0];
    return BDV2.getInternalInstance(node);
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

BdApi.isPluginEnabled = function(name) {
    return !!PluginCookie[name];
};

BdApi.isThemeEnabled = function(name) {
    return !!ThemeCookie[name];
};

BdApi.isSettingEnabled = function(id) {
    return !!SettingsCookie[id];
};

// Gets data
BdApi.getBDData = function(key) {
    return DataStore.getBDData(key);
};

// Sets data
BdApi.setBDData = function(key, data) {
    return DataStore.setBDData(key, data);
};

export default BdApi;
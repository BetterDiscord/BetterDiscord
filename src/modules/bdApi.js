import {pluginCookie, themeCookie, bdplugins, bdthemes, settingsCookie, settings, bdEmotes} from "../0globals";
import mainCore from "./core";
import Utils from "./utils";
import BDV2 from "./v2";
import DataStore from "./dataStore";
import pluginModule from "./pluginModule";
import themeModule from "./themeModule";
import settingsPanel from "./settingsPanel";
import DOM from "./domtools";

const BdApi = {
    get React() { return BDV2.React; },
    get ReactDOM() { return BDV2.ReactDom; },
    get ReactComponent() {return BDV2.ReactComponent;},
    get WindowConfigFile() {return Utils.WindowConfigFile;},
    get settings() {return settings;},
    get emotes() {return bdEmotes;},
    get screenWidth() { return Math.max(document.documentElement.clientWidth, window.innerWidth || 0); },
    get screenHeight() { return Math.max(document.documentElement.clientHeight, window.innerHeight || 0); }
};

BdApi.getAllWindowPreferences = function() {
    return Utils.getAllWindowPreferences();
};

BdApi.getWindowPreference = function(key) {
    return Utils.getWindowPreference(key);
};

BdApi.setWindowPreference = function(key, value) {
    return Utils.setWindowPreference(key, value);
};

//Inject CSS to document head
//id = id of element
//css = custom css
BdApi.injectCSS = function (id, css) {
    DOM.addStyle(DOM.escapeID(id), css);
};

//Clear css/remove any element
//id = id of element
BdApi.clearCSS = function (id) {
    DOM.removeStyle(DOM.escapeID(id));
};

//Inject CSS to document head
//id = id of element
//css = custom css
BdApi.linkJS = function (id, url) {
    DOM.addScript(DOM.escapeID(id), url);
};

//Clear css/remove any element
//id = id of element
BdApi.unlinkJS = function (id) {
    DOM.removeScript(DOM.escapeID(id));
};

//Get another plugin
//name = name of plugin
BdApi.getPlugin = function (name) {
    if (bdplugins.hasOwnProperty(name)) {
        return bdplugins[name].plugin;
    }
    return null;
};

//Get BetterDiscord Core
BdApi.getCore = function () {
    Utils.warn("Deprecation Notice", `BdApi.getCore() will be removed in future versions.`);
    return mainCore;
};

/**
 * Shows a generic but very customizable modal.
 * @param {string} title - title of the modal
 * @param {string} content - a string of text to display in the modal
 */
BdApi.alert = function (title, content) {
    return Utils.showConfirmationModal(title, content, {cancelText: null});
};

/**
 * Shows a generic but very customizable confirmation modal with optional confirm and cancel callbacks.
 * @param {string} title - title of the modal
 * @param {(string|ReactElement|Array<string|ReactElement>)} children - a single or mixed array of react elements and strings. Every string is wrapped in Discord's `Markdown` component so strings will show and render properly.
 * @param {object} [options] - options to modify the modal
 * @param {boolean} [options.danger=false] - whether the main button should be red or not
 * @param {string} [options.confirmText=Okay] - text for the confirmation/submit button
 * @param {string} [options.cancelText=Cancel] - text for the cancel button
 * @param {callable} [options.onConfirm=NOOP] - callback to occur when clicking the submit button
 * @param {callable} [options.onCancel=NOOP] - callback to occur when clicking the cancel button
 * @param {string} [options.key] - key used to identify the modal. If not provided, one is generated and returned
 * @returns {string} - the key used for this modal
 */
BdApi.showConfirmationModal = function (title, content, options = {}) {
    return Utils.showConfirmationModal(title, content, options);
};

//Show toast alert
BdApi.showToast = function(content, options = {}) {
    Utils.showToast(content, options);
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
    return Utils.monkeyPatch(what, methodName, options);
};

// Event when element is removed
BdApi.onRemoved = function(node, callback) {
    return Utils.onRemoved(node, callback);
};

// Wraps function in try..catch
BdApi.suppressErrors = function(method, message) {
    return Utils.suppressErrors(method, message);
};

// Tests for valid JSON
BdApi.testJSON = function(data) {
    return Utils.testJSON(data);
};

BdApi.isPluginEnabled = function(name) {
    return !!pluginCookie[name];
};

BdApi.isThemeEnabled = function(name) {
    return !!themeCookie[name];
};

BdApi.isSettingEnabled = function(id) {
    return !!settingsCookie[id];
};

BdApi.enableSetting = function(id) {
    return settingsPanel.onChange(id, true);
};

BdApi.disableSetting = function(id) {
    return settingsPanel.onChange(id, false);
};

BdApi.toggleSetting = function(id) {
    return settingsPanel.onChange(id, !settingsCookie[id]);
};

// Gets data
BdApi.getBDData = function(key) {
    return DataStore.getBDData(key);
};

// Sets data
BdApi.setBDData = function(key, data) {
    return DataStore.setBDData(key, data);
};



const makeAddonAPI = (cookie, list, manager) => new class AddonAPI {

    get folder() {return manager.folder;}

    isEnabled(name) {
        return !!cookie[name];
    }

    enable(name) {
        return manager.enable(name);
    }

    disable(name) {
        return manager.disable(name);
    }

    toggle(name) {
        if (cookie[name]) this.disable(name);
        else this.enable(name);
    }

    reload(name) {
        return manager.reload(name);
    }

    get(name) {
        if (list.hasOwnProperty(name)) {
            if (list[name].plugin) return list[name].plugin;
            return list[name];
        }
        return null;
    }

    getAll() {
        return Object.keys(list).map(k => this.get(k)).filter(a => a);
    }
};

BdApi.Plugins = makeAddonAPI(pluginCookie, bdplugins, pluginModule);
BdApi.Themes = makeAddonAPI(themeCookie, bdthemes, themeModule);

export default BdApi;
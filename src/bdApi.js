import {pluginCookie, themeCookie, bdplugins, bdthemes, settingsCookie, settings, bdEmotes} from "./0globals";
import mainCore from "./core";
import Utils from "./utils";
import BDV2 from "./v2";
import DataStore from "./dataStore";
import pluginModule from "./pluginModule";
import themeModule from "./themeModule";
import settingsPanel from "./settingsPanel";

const BdApi = {
    get React() { return BDV2.React; },
    get ReactDOM() { return BDV2.ReactDom; },
    get ReactComponent() {return BDV2.ReactComponent;},
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
    },
    get settings() {return settings;},
    get emotes() {return bdEmotes;},
    get screenWidth() { return Math.max(document.documentElement.clientWidth, window.innerWidth || 0); },
    get screenHeight() { return Math.max(document.documentElement.clientHeight, window.innerHeight || 0); }
};

BdApi.getAllWindowPreferences = function() {
    if (!this.WindowConfigFile) return {}; // Tempfix until new injection on other platforms
    return __non_webpack_require__(this.WindowConfigFile);
};

BdApi.getWindowPreference = function(key) {
    if (!this.WindowConfigFile) return undefined; // Tempfix until new injection on other platforms
    return this.getAllWindowPreferences()[key];
};

BdApi.setWindowPreference = function(key, value) {
    if (!this.WindowConfigFile) return; // Tempfix until new injection on other platforms
    const fs = require("fs");
    const prefs = this.getAllWindowPreferences();
    prefs[key] = value;
    delete __non_webpack_require__.cache[this.WindowConfigFile];
    fs.writeFileSync(this.WindowConfigFile, JSON.stringify(prefs, null, 4));
};

//Inject CSS to document head
//id = id of element
//css = custom css
BdApi.injectCSS = function (id, css) {
    $("head").append($("<style>", {id: Utils.escapeID(id), text: css}));
};

//Clear css/remove any element
//id = id of element
BdApi.clearCSS = function (id) {
    $("#" + Utils.escapeID(id)).remove();
};

//Inject CSS to document head
//id = id of element
//css = custom css
BdApi.linkJS = function (id, url) {
    $("head").append($("<script>", {id: Utils.escapeID(id), src: url, type: "text/javascript"}));
};

//Clear css/remove any element
//id = id of element
BdApi.unlinkJS = function (id) {
    $("#" + Utils.escapeID(id)).remove();
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
    return mainCore;
};

/**
 * Shows a generic but very customizable modal.
 * @param {string} title - title of the modal
 * @param {string} content - a string of text to display in the modal
 */
BdApi.alert = function (title, content) {
    const ModalStack = BdApi.findModuleByProps("push", "update", "pop", "popWithKey");
    const AlertModal = BdApi.findModuleByPrototypes("handleCancel", "handleSubmit", "handleMinorConfirm");
    if (!ModalStack || !AlertModal) return mainCore.alert(title, content);

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
    if (!ModalStack || !ConfirmationModal || !TextElement) return mainCore.alert(title, content);

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



class AddonAPI {
    constructor(cookie, list, manager) {
        this.manager = manager;
        this.cookie = cookie;
        this.list = list;
    }

    isEnabled(name) {
        return !!this.cookie[name];
    }

    enable(name) {
        return this.manager.enable(name);
    }

    disable(name) {
        return this.manager.disable(name);
    }

    toggle(name) {
        if (this.cookie[name]) this.disable(name);
        else this.enable(name);
    }

    get(name) {
        if (this.list.hasOwnProperty(name)) {
            if (this.list[name].plugin) return this.list[name].plugin;
            return this.list[name];
        }
        return null;
    }

    getAll() {
        return Object.keys(this.list).map(k => this.get(k)).filter(a => a);
    }
}

BdApi.Plugins = new AddonAPI(pluginCookie, bdplugins, pluginModule);
BdApi.Themes = new AddonAPI(themeCookie, bdthemes, themeModule);

export default BdApi;
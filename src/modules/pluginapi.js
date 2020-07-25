import {Config} from "data";
import Utilities from "./utilities";
import WebpackModules from "./webpackmodules";
import DiscordModules from "./discordmodules";
import DataStore from "./datastore";
import DOMManager from "./dommanager";
import Toasts from "../ui/toasts";
import Modals from "../ui/modals";
import PluginManager from "./pluginmanager";
import ThemeManager from "./thememanager";
import Settings from "./settingsmanager";
import Logger from "./logger";
import Patcher from "./patcher";
import Emotes from "../builtins/emotes/emotes";

const BdApi = {
    get React() {return DiscordModules.React;},
    get ReactDOM() {return DiscordModules.ReactDOM;},
    get WindowConfigFile() {return "";},
    get settings() {return Settings.collections;},
    get emotes() {
        return new Proxy(Emotes.Emotes, {
            get() {return Emotes.Emotes;},
            set() {Logger.warn("BdApi.emotes", "Addon policy for plugins #5 https://github.com/rauenzi/BetterDiscordApp/wiki/Addon-Policies#plugins");}
        });
    },
    get version() {return Config.version;}
};

BdApi.getAllWindowPreferences = function() {
    return DataStore.getData("windowprefs") || {};
};

BdApi.getWindowPreference = function(key) {
    return this.getAllWindowPreferences()[key];
};

BdApi.setWindowPreference = function(key, value) {
    const prefs = this.getAllWindowPreferences();
    prefs[key] = value;
    return DataStore.setData("windowprefs", prefs);
};

// Inject CSS to document head
// id = id of element
// css = custom css
BdApi.injectCSS = function (id, css) {
    DOMManager.injectStyle(id, css);
};

// Clear css/remove any element
// id = id of element
BdApi.clearCSS = function (id) {
    DOMManager.removeStyle(id);
};

// Inject CSS to document head
// id = id of element
// css = custom css
BdApi.linkJS = function (id, url) {
    return DOMManager.injectScript(id, url);
};

// Clear css/remove any element
// id = id of element
BdApi.unlinkJS = function (id) {
    DOMManager.removeScript(id);
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
    return Utilities.getReactInstance(node);
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
// BdApi.monkeyPatch = function(what, methodName, options) {
//     const {before, after, instead, once = false, silent = false, force = false} = options;
//     const displayName = options.displayName || what.displayName || what.name || what.constructor.displayName || what.constructor.name;
//     if (!silent) console.log("patch", methodName, "of", displayName); // eslint-disable-line no-console
//     if (!what[methodName]) {
//         if (force) what[methodName] = function() {};
//         else return console.error(methodName, "does not exist for", displayName); // eslint-disable-line no-console
//     }
//     const origMethod = what[methodName];
//     const cancel = () => {
//         if (!silent) console.log("unpatch", methodName, "of", displayName); // eslint-disable-line no-console
//         what[methodName] = origMethod;
//     };
//     what[methodName] = function() {
//         const data = {
//             thisObject: this,
//             methodArguments: arguments,
//             cancelPatch: cancel,
//             originalMethod: origMethod,
//             callOriginalMethod: () => data.returnValue = data.originalMethod.apply(data.thisObject, data.methodArguments)
//         };
//         if (instead) {
//             const tempRet = Utilities.suppressErrors(instead, "`instead` callback of " + what[methodName].displayName)(data);
//             if (tempRet !== undefined) data.returnValue = tempRet;
//         }
//         else {
//             if (before) Utilities.suppressErrors(before, "`before` callback of " + what[methodName].displayName)(data);
//             data.callOriginalMethod();
//             if (after) Utilities.suppressErrors(after, "`after` callback of " + what[methodName].displayName)(data);
//         }
//         if (once) cancel();
//         return data.returnValue;
//     };
//     what[methodName].__monkeyPatched = true;
//     if (!what[methodName].__originalMethod) what[methodName].__originalMethod = origMethod;
//     what[methodName].displayName = "patched " + (what[methodName].displayName || methodName);
//     return cancel;
// };
BdApi.monkeyPatch = function(what, methodName, options) {
    const {before, after, instead, once = false} = options;
    const patchType = before ? "before" : after ? "after" : instead ? "instead" : "";
    if (!patchType) return Logger.err("BdApi", "Must provide one of: after, before, instead");
    const originalMethod = what[methodName];
    const data = {
        originalMethod: originalMethod,
        callOriginalMethod: () => data.originalMethod.apply(data.thisObject, data.methodArguments)
    };
    data.cancelPatch = Patcher[patchType]("BdApi", what, methodName, (thisObject, args, returnValue) => {
        data.thisObject = thisObject;
        data.methodArguments = args;
        data.returnValue = returnValue;
        try {
            Reflect.apply(options[patchType], null, [data]);
            if (once) data.cancelPatch();
        }
        catch (err) {
            // Logger.err("monkeyPatch", `Error in the ${patchType} of ${methodName}`);
        }
    });
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

// Get another plugin
// name = name of plugin
BdApi.getPlugin = function (name) {
    Logger.warn("BdApi", "getPlugin is deprecated. Please make use of the addon api (BdApi.Plugins)");
    return PluginManager.addonList.find(a => a.name == name);
};

BdApi.isPluginEnabled = function(name) {
    Logger.warn("BdApi", "isPluginEnabled is deprecated. Please make use of the addon api (BdApi.Plugins)");
    const plugin = this.getPlugin(name);
    if (!plugin) return false;
    return PluginManager.isEnabled(plugin.id);
};

BdApi.isThemeEnabled = function(name) {
    Logger.warn("BdApi", "isThemeEnabled is deprecated. Please make use of the addon api (BdApi.Themes)");
    const theme = ThemeManager.addonList.find(a => a.name == name);
    if (!theme) return false;
    return ThemeManager.isEnabled(theme.id);
};

BdApi.isSettingEnabled = function(collection, category, id) {
    return Settings.get(collection, category, id);
};

BdApi.enableSetting = function(collection, category, id) {
    return Settings.set(collection, category, id, true);
};

BdApi.disableSetting = function(collection, category, id) {
    return Settings.set(collection, category, id, false);
};

BdApi.toggleSetting = function(collection, category, id) {
    return Settings.set(collection, category, id, !Settings.get(collection, category, id));
};

// Gets data
BdApi.getBDData = function(key) {
    return DataStore.getBDData(key);
};

// Sets data
BdApi.setBDData = function(key, data) {
    return DataStore.setBDData(key, data);
};

const makeAddonAPI = (manager) => new class AddonAPI {
    get folder() {return manager.addonFolder;}
    isEnabled(idOrFile) {return manager.isEnabled(idOrFile);}
    enable(idOrAddon) {return manager.enableAddon(idOrAddon);}
    disable(idOrAddon) {return manager.disableAddon(idOrAddon);}
    toggle(idOrAddon) {return manager.toggleAddon(idOrAddon);}
    reload(idOrFileOrAddon) {return manager.reloadAddon(idOrFileOrAddon);}
    get(idOrFile) {return manager.getAddon(idOrFile);}
    getAll() {return manager.addonList.map(a => manager.getAddon(a.id));}
};

BdApi.Plugins = makeAddonAPI(PluginManager);
BdApi.Themes = makeAddonAPI(ThemeManager);
BdApi.Patcher = {
    patch: (caller, moduleToPatch, functionName, callback, options = {}) => {
        if (typeof(caller) !== "string") return Logger.err("BdApi.Patcher", "Parameter 0 of patch must be a string representing the caller");
        if (options.type !== "before" && options.type !== "instead" && options.type !== "after") return Logger.err("BdApi.Patcher", "options.type must be one of: before, instead, after");
        return Patcher.pushChildPatch(caller, moduleToPatch, functionName, callback, options);
    },
    before: (caller, moduleToPatch, functionName, callback, options = {}) => BdApi.Patcher.patch(caller, moduleToPatch, functionName, callback, Object.assign(options, {type: "before"})),
    instead: (caller, moduleToPatch, functionName, callback, options = {}) => BdApi.Patcher.patch(caller, moduleToPatch, functionName, callback, Object.assign(options, {type: "instead"})),
    after: (caller, moduleToPatch, functionName, callback, options = {}) => BdApi.Patcher.patch(caller, moduleToPatch, functionName, callback, Object.assign(options, {type: "after"})),
    unpatchAll: (caller) => {
        if (typeof(caller) !== "string") return Logger.err("BdApi.Patcher", "Parameter 0 of unpatchAll must be a string representing the caller");
        return Patcher.unpatchAll(caller);
    }
};

Object.freeze(BdApi);
Object.freeze(BdApi.Plugins);
Object.freeze(BdApi.Themes);
Object.freeze(BdApi.Patcher);

export default BdApi;
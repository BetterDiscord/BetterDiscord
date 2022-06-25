import {Config} from "data";
import Utilities from "./utilities";
import WebpackModules from "./webpackmodules";
import DiscordModules from "./discordmodules";
import DataStore from "./datastore";
import DOMManager from "./dommanager";
import Toasts from "../ui/toasts";
import Notices from "../ui/notices";
import Modals from "../ui/modals";
import PluginManager from "./pluginmanager";
import ThemeManager from "./thememanager";
import Settings from "./settingsmanager";
import Logger from "common/logger";
import Patcher from "./patcher";
import Emotes from "../builtins/emotes/emotes";
import ipc from "./ipc";

const BdApi = {
    get React() {return DiscordModules.React;},
    get ReactDOM() {return DiscordModules.ReactDOM;},
    get WindowConfigFile() {return "";},
    get settings() {return Settings.collections;},
    get emotes() {
        return new Proxy(Emotes.Emotes, {
            get(obj, category) {
                if (category === "blocklist") return Emotes.blocklist;
                const group = Emotes.Emotes[category];
                if (!group) return undefined;
                return new Proxy(group, {
                    get(cat, emote) {return group[emote];},
                    set() {Logger.warn("BdApi.emotes", "Addon policy for plugins #5 https://github.com/BetterDiscord/BetterDiscord/wiki/Addon-Policies#plugins");}
                });
            },
            set() {Logger.warn("BdApi.emotes", "Addon policy for plugins #5 https://github.com/BetterDiscord/BetterDiscord/wiki/Addon-Policies#plugins");}
        });
    },
    get version() {return Config.version;}
};

BdApi.getAllWindowPreferences = function() {
    Logger.warn("Deprecated", "BdApi.getAllWindowPreferences() has been deprecated due to the new handling of window transparency.");
};

BdApi.getWindowPreference = function() {
    Logger.warn("Deprecated", "BdApi.getWindowPreference() has been deprecated due to the new handling of window transparency.");
    return null;
};

BdApi.setWindowPreference = function() {
    Logger.warn("Deprecated", "BdApi.setWindowPreference() has been deprecated due to the new handling of window transparency.");
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

/**
 * Show a notice above discord's chat layer.
 * @param {string|Node} content Content of the notice
 * @param {object} options Options for the notice.
 * @param {string} [options.type="info" | "error" | "warning" | "success"] Type for the notice. Will affect the color.
 * @param {Array<{label: string, onClick: (immediately?: boolean = false) => void}>} [options.buttons] Buttons that should be added next to the notice text.
 * @param {number} [options.timeout=10000] Timeout until the notice is closed. Won't fire if it's set to 0;
 * @returns {(immediately?: boolean = false) => void}
 */
 BdApi.showNotice = function (content, options = {}) {
    return Notices.show(content, options);
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
    // if (!(node instanceof window.jQuery) && !(node instanceof Element)) return undefined;
    // if (node instanceof jQuery) node = node[0];
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
BdApi.monkeyPatch = function(what, methodName, options) {
    const {before, after, instead, once = false, callerId = "BdApi"} = options;
    const patchType = before ? "before" : after ? "after" : instead ? "instead" : "";
    if (!patchType) return Logger.err("BdApi", "Must provide one of: after, before, instead");
    const originalMethod = what[methodName];
    const data = {
        originalMethod: originalMethod,
        callOriginalMethod: () => data.originalMethod.apply(data.thisObject, data.methodArguments)
    };
    data.cancelPatch = Patcher[patchType](callerId, what, methodName, (thisObject, args, returnValue) => {
        data.thisObject = thisObject;
        data.methodArguments = args;
        data.returnValue = returnValue;
        try {
            const patchReturn = Reflect.apply(options[patchType], null, [data]);
            if (once) data.cancelPatch();
            return patchReturn;
        }
        catch (err) {
            Logger.stacktrace(`${callerId}:monkeyPatch`, `Error in the ${patchType} of ${methodName}`, err);
        }
    });
    return data.cancelPatch;
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

// Opens a filesystem dialog
BdApi.openDialog = async function (options) {
    const data = await ipc.openDialog(options);
    if (data.error) throw new Error(data.error);

    return data;
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
    getPatchesByCaller: (caller) => {
        if (typeof(caller) !== "string") return Logger.err("BdApi.Patcher", "Parameter 0 of getPatchesByCaller must be a string representing the caller");
        return Patcher.getPatchesByCaller(caller);
    },
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
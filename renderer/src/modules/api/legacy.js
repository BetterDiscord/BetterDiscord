import {Config} from "data";
import WebpackModules from "../webpackmodules";
import DiscordModules from "../discordmodules";
import DataStore from "../datastore";
import DOMManager from "../dommanager";
import Toasts from "../../ui/toasts";
import Notices from "../../ui/notices";
import Modals from "../../ui/modals";
import Settings from "../settingsmanager";
import Logger from "common/logger";
import Patcher from "../patcher";
import ipc from "../ipc";

/** 
 * The React module being used inside Discord.
 * @type React
 * @memberof BdApi
 */
const React = DiscordModules.React;

/** 
 * The ReactDOM module being used inside Discord.
 * @type ReactDOM
 * @memberof BdApi
 */
const ReactDOM = DiscordModules.ReactDOM;

/** 
 * A reference object to get BD's settings.
 * @type object
 * @deprecated
 * @memberof BdApi
 */
const settings = Settings.collections;

/** 
 * A reference object for BD's emotes.
 * @type object
 * @deprecated
 * @memberof BdApi
 */
const emotes = {};

/** 
 * A reference string for BD's version.
 * @type string
 * @memberof BdApi
 */
const version = Config.version;


/**
 * Adds a `<style>` to the document with the given ID.
 * 
 * @deprecated
 * @param {string} id ID to use for style element
 * @param {string} css CSS to apply to the document
 * @memberof BdApi
 */
function injectCSS(id, css) {
    DOMManager.injectStyle(id, css);
}

/**
 * Removes a `<style>` from the document corresponding to the given ID.
 * 
 * @deprecated
 * @param {string} id ID uses for the style element
 * @memberof BdApi
 */
function clearCSS(id) {
    DOMManager.removeStyle(id);
}

/**
 * Automatically creates and links a remote JS script.
 * 
 * @deprecated
 * @param {string} id ID of the script element
 * @param {string} url URL of the remote script
 * @returns {Promise} Resolves upon onload event
 * @memberof BdApi
 */
function linkJS(id, url) {
    return DOMManager.injectScript(id, url);
}

/**
 * Removes a remotely linked JS script.
 * 
 * @deprecated
 * @param {string} id ID of the script element
 * @memberof BdApi
 */
function unlinkJS(id) {
    DOMManager.removeScript(id);
}

/**
 * Shows a generic but very customizable modal.
 * 
 * @deprecated
 * @param {string} title title of the modal
 * @param {(string|ReactElement|Array<string|ReactElement>)} content a string of text to display in the modal
 * @memberof BdApi
 */
function alert(title, content) {
    Modals.alert(title, content);
}

/**
 * Shows a generic but very customizable confirmation modal with optional confirm and cancel callbacks.
 * 
 * @deprecated
 * @param {string} title title of the modal
 * @param {(string|ReactElement|Array<string|ReactElement>)} children a single or mixed array of react elements and strings. Everything is wrapped in Discord's `TextElement` component so strings will show and render properly.
 * @param {object} [options] options to modify the modal
 * @param {boolean} [options.danger=false] whether the main button should be red or not
 * @param {string} [options.confirmText=Okay] text for the confirmation/submit button
 * @param {string} [options.cancelText=Cancel] text for the cancel button
 * @param {callable} [options.onConfirm=NOOP] callback to occur when clicking the submit button
 * @param {callable} [options.onCancel=NOOP] callback to occur when clicking the cancel button
 * @memberof BdApi
 */
function showConfirmationModal(title, content, options = {}) {
    return Modals.showConfirmationModal(title, content, options);
}

/**
 * Shows a toast similar to android towards the bottom of the screen.
 *
 * @deprecated
 * @param {string} content The string to show in the toast.
 * @param {object} options Options object. Optional parameter.
 * @param {string} [options.type=""] Changes the type of the toast stylistically and semantically. Choices: "", "info", "success", "danger"/"error", "warning"/"warn". Default: ""
 * @param {boolean} [options.icon=true] Determines whether the icon should show corresponding to the type. A toast without type will always have no icon. Default: `true`
 * @param {number} [options.timeout=3000] Adjusts the time (in ms) the toast should be shown for before disappearing automatically. Default: `3000`
 * @param {boolean} [options.forceShow=false] Whether to force showing the toast and ignore the bd setting
 * @memberof BdApi
 */
function showToast(content, options = {}) {
    Toasts.show(content, options);
}

/**
 * Shows a notice above Discord's chat layer.
 * 
 * @deprecated
 * @param {string|Node} content Content of the notice
 * @param {object} options Options for the notice.
 * @param {string} [options.type="info" | "error" | "warning" | "success"] Type for the notice. Will affect the color.
 * @param {Array<{label: string, onClick: function}>} [options.buttons] Buttons that should be added next to the notice text.
 * @param {number} [options.timeout=10000] Timeout until the notice is closed. Won't fire if it's set to 0;
 * @returns {function} A callback for closing the notice. Passing `true` as first parameter closes immediately without transitioning out.
 * @memberof BdApi
 */
 function showNotice(content, options = {}) {
    return Notices.show(content, options);
}

/**
 * Finds a webpack module using a filter
 * 
 * @deprecated
 * @param {function} filter A filter given the exports, module, and moduleId. Returns `true` if the module matches.
 * @returns {any} Either the matching module or `undefined`
 * @memberof BdApi
 */
function findModule(filter) {
    return WebpackModules.getModule(filter);
}

/**
 * Finds multiple webpack modules using a filter
 * 
 * @deprecated
 * @param {function} filter A filter given the exports, module, and moduleId. Returns `true` if the module matches.
 * @returns {Array} Either an array of matching modules or an empty array
 * @memberof BdApi
 */
function findAllModules(filter) {
    return WebpackModules.getModule(filter, {first: false});
}

/**
 * Finds a webpack module by own properties.
 * 
 * @deprecated
 * @param {...string} props Any desired properties
 * @returns {any} Either the matching module or `undefined`
 * @memberof BdApi
 */
function findModuleByProps(...props) {
    return WebpackModules.getByProps(...props);
}


/**
 * Finds a webpack module by own prototypes.
 * 
 * @deprecated
 * @param {...string} protos Any desired prototype properties
 * @returns {any} Either the matching module or `undefined`
 * @memberof BdApi
 */
function findModuleByPrototypes(...protos) {
    return WebpackModules.getByPrototypes(...protos);
}

/**
 * Finds a webpack module by `displayName` property
 * 
 * @deprecated
 * @param {string} name Desired `displayName` property
 * @returns {any} Either the matching module or `undefined`
 * @memberof BdApi
 */
function findModuleByDisplayName(name) {
    return WebpackModules.getByDisplayName(name);
}

/**
 * Get the internal react data of a specified node.
 * 
 * @deprecated
 * @param {HTMLElement} node Node to get the react data from
 * @returns {object|undefined} Either the found data or `undefined` 
 * @memberof BdApi
 */
function getInternalInstance(node) {
    if (node.__reactInternalInstance$) return node.__reactInternalInstance$;
        return node[Object.keys(node).find(k => k.startsWith("__reactInternalInstance") || k.startsWith("__reactFiber"))] || null;
}

/**
 * Loads previously stored data.
 * 
 * @deprecated
 * @param {string} pluginName Name of the plugin loading data
 * @param {string} key Which piece of data to load
 * @returns {any} The stored data
 * @memberof BdApi
 */
function loadData(pluginName, key) {
    return DataStore.getPluginData(pluginName, key);
}

/**
 * Saves JSON-serializable data.
 * 
 * @deprecated
 * @param {string} pluginName Name of the plugin saving data
 * @param {string} key Which piece of data to store
 * @param {any} data The data to be saved
 * @memberof BdApi
 */
function saveData(pluginName, key, data) {
    return DataStore.setPluginData(pluginName, key, data);
}

/**
 * Deletes a piece of stored data, this is different than saving as null or undefined.
 * 
 * @deprecated
 * @param {string} pluginName Name of the plugin deleting data
 * @param {string} key Which piece of data to delete
 * @memberof BdApi
 */
function deleteData(pluginName, key) {
    DataStore.deletePluginData(pluginName, key);
}

/**
 * Monkey-patches a method on an object. The patching callback may be run before, after or instead of target method.
 * 
 *  - Be careful when monkey-patching. Think not only about original functionality of target method and your changes, but also about developers of other plugins, who may also patch this method before or after you. Try to change target method behaviour as little as possible, and avoid changing method signatures.
 *  - Display name of patched method is changed, so you can see if a function has been patched (and how many times) while debugging or in the stack trace. Also, patched methods have property `__monkeyPatched` set to `true`, in case you want to check something programmatically.
 * 
 * @deprecated
 * @param {object} what Object to be patched. You can can also pass class prototypes to patch all class instances.
 * @param {string} methodName Name of the function to be patched.
 * @param {object} options Options object to configure the patch.
 * @param {function} [options.after] Callback that will be called after original target method call. You can modify return value here, so it will be passed to external code which calls target method. Can be combined with `before`.
 * @param {function} [options.before] Callback that will be called before original target method call. You can modify arguments here, so it will be passed to original method. Can be combined with `after`.
 * @param {function} [options.instead] Callback that will be called instead of original target method call. You can get access to original method using `originalMethod` parameter if you want to call it, but you do not have to. Can't be combined with `before` or `after`.
 * @param {boolean} [options.once=false] Set to `true` if you want to automatically unpatch method after first call.
 * @param {boolean} [options.silent=false] Set to `true` if you want to suppress log messages about patching and unpatching.
 * @returns {function} A function that cancels the monkey patch
 * @memberof BdApi
 */
function monkeyPatch(what, methodName, options) {
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
}

/**
 * Adds a listener for when the node is removed from the document body.
 * 
 * @deprecated
 * @param {HTMLElement} node Node to be observed
 * @param {function} callback Function to run when fired
 * @memberof BdApi
 */
function onRemoved(node, callback) {
    return DOMManager.onRemoved(node, callback);
}

/**
 * Wraps a given function in a `try..catch` block.
 * 
 * @deprecated
 * @param {function} method Function to wrap
 * @param {string} message Additional messasge to print when an error occurs
 * @returns {function} The new wrapped function
 * @memberof BdApi
 */
function suppressErrors(method, message) {
    return (...params) => {
        try {return method(...params);}
        catch (e) {Logger.stacktrace("SuppressedError", "Error occurred in " + message, e);}
    };
}

/**
 * Tests a given object to determine if it is valid JSON.
 * 
 * @deprecated
 * @param {object} data Data to be tested
 * @returns {boolean} Result of the test
 * @memberof BdApi
 */
function testJSON(data) {
    try {
        return JSON.parse(data);
    }
    catch (err) {
        return false;
    }
}

/**
 * Gets a specific setting's status from BD.
 * 
 * @deprecated
 * @param {string} [collection="settings"] Collection ID
 * @param {string} category Category ID in the collection
 * @param {string} id Setting ID in the category
 * @returns {boolean} If the setting is enabled
 * @memberof BdApi
 */
function isSettingEnabled(collection, category, id) {
    return Settings.get(collection, category, id);
}

/**
 * Enables a BetterDiscord setting by ids.
 * 
 * @deprecated
 * @param {string} [collection="settings"] Collection ID
 * @param {string} category Category ID in the collection
 * @param {string} id Setting ID in the category
 * @memberof BdApi
 */
function enableSetting(collection, category, id) {
    return Settings.set(collection, category, id, true);
}

/**
 * Disables a BetterDiscord setting by ids.
 * 
 * @deprecated
 * @param {string} [collection="settings"] Collection ID
 * @param {string} category Category ID in the collection
 * @param {string} id Setting ID in the category
 * @memberof BdApi
 */
function disableSetting(collection, category, id) {
    return Settings.set(collection, category, id, false);
}

/**
 * Toggles a BetterDiscord setting by ids.
 * 
 * @deprecated
 * @param {string} [collection="settings"] Collection ID
 * @param {string} category Category ID in the collection
 * @param {string} id Setting ID in the category
 * @memberof BdApi
 */
function toggleSetting(collection, category, id) {
    return Settings.set(collection, category, id, !Settings.get(collection, category, id));
}

/**
 * Gets some data in BetterDiscord's misc data.
 * 
 * @deprecated
 * @param {string} key Key of the data to load.
 * @returns {any} The stored data
 * @memberof BdApi
 */
function getBDData(key) {
    return DataStore.getBDData(key);
}

/**
 * Sets some data in BetterDiscord's misc data.
 * 
 * @deprecated
 * @param {string} key Key of the data to store.
 * @returns {any} The stored data
 * @memberof BdApi
 */
function setBDData(key, data) {
    return DataStore.setBDData(key, data);
}

/**
 * Gives access to the [Electron Dialog](https://www.electronjs.org/docs/latest/api/dialog/) api. 
 * Returns a `Promise` that resolves to an `object` that has a `boolean` cancelled and a `filePath` string for saving and a `filePaths` string array for opening.
 * 
 * @deprecated
 * @param {object} options Options object to configure the dialog.
 * @param {"open"|"save"} [options.mode="open"] Determines whether the dialog should open or save files.
 * @param {string} [options.defaultPath=~] Path the dialog should show on launch.
 * @param {Array<object<string, string[]>>} [options.filters=[]] An array of [file filters](https://www.electronjs.org/docs/latest/api/structures/file-filter).
 * @param {string} [options.title] Title for the titlebar.
 * @param {string} [options.message] Message for the dialog.
 * @param {boolean} [options.showOverwriteConfirmation=false] Whether the user should be prompted when overwriting a file.
 * @param {boolean} [options.showHiddenFiles=false] Whether hidden files should be shown in the dialog.
 * @param {boolean} [options.promptToCreate=false] Whether the user should be prompted to create non-existant folders.
 * @param {boolean} [options.openDirectory=false] Whether the user should be able to select a directory as a target.
 * @param {boolean} [options.openFile=true] Whether the user should be able to select a file as a target.
 * @param {boolean} [options.multiSelections=false] Whether the user should be able to select multiple targets.
 * @param {boolean} [options.modal=false] Whether the dialog should act as a modal to the main window.
 * @returns {Promise<object>} Result of the dialog
 * @memberof BdApi
 */
async function openDialog(options) {
    const data = await ipc.openDialog(options);
    if (data.error) throw new Error(data.error);

    return data;
}

export {
    React,
    ReactDOM,
    settings,
    emotes,
    version,
    injectCSS,
    clearCSS,
    linkJS,
    unlinkJS,
    alert,
    showConfirmationModal,
    showToast,
    showNotice,
    findModule,
    findAllModules,
    findModuleByProps,
    findModuleByPrototypes,
    findModuleByDisplayName,
    getInternalInstance,
    loadData,
    loadData as getData,
    saveData,
    saveData as setData,
    deleteData,
    monkeyPatch,
    onRemoved,
    suppressErrors,
    testJSON,
    isSettingEnabled,
    enableSetting,
    disableSetting,
    toggleSetting,
    getBDData,
    setBDData,
    openDialog
};
import {Config} from "data";
import Utilities from "./utilities";
import WebpackModules, {Filters} from "./webpackmodules";
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

/**
 * `BdApi` is a globally (`window.BdApi`) accessible object for use by plugins and developers to make their lives easier.
 * @name BdApi
 */
const BdApi = {
    /** 
     * The React module being used inside Discord.
     * @type React
     * */
    get React() {return DiscordModules.React;},

    /** 
     * The ReactDOM module being used inside Discord.
     * @type ReactDOM
     */
    get ReactDOM() {return DiscordModules.ReactDOM;},

    /** 
     * A reference object to get BD's settings.
     * @type object
     * @deprecated
     */
    get settings() {return Settings.collections;},

    /** 
     * A reference object for BD's emotes.
     * @type object
     * @deprecated
     */
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

    /** 
     * A reference string for BD's version.
     * @type string
     */
    get version() {return Config.version;}
};


/**
 * Adds a `<style>` to the document with the given ID.
 * 
 * @param {string} id ID to use for style element
 * @param {string} css CSS to apply to the document
 */
BdApi.injectCSS = function (id, css) {
    DOMManager.injectStyle(id, css);
};

/**
 * Removes a `<style>` from the document corresponding to the given ID.
 * 
 * @param {string} id ID uses for the style element
 */
BdApi.clearCSS = function (id) {
    DOMManager.removeStyle(id);
};

/**
 * Automatically creates and links a remote JS script.
 * 
 * @deprecated
 * @param {string} id ID of the script element
 * @param {string} url URL of the remote script
 * @returns {Promise} Resolves upon onload event
 */
BdApi.linkJS = function (id, url) {
    return DOMManager.injectScript(id, url);
};

/**
 * Removes a remotely linked JS script.
 * 
 * @deprecated
 * @param {string} id ID of the script element
 */
BdApi.unlinkJS = function (id) {
    DOMManager.removeScript(id);
};

/**
 * Shows a generic but very customizable modal.
 * 
 * @param {string} title title of the modal
 * @param {(string|ReactElement|Array<string|ReactElement>)} content a string of text to display in the modal
 */
BdApi.alert = function (title, content) {
    Modals.alert(title, content);
};

/**
 * Shows a generic but very customizable confirmation modal with optional confirm and cancel callbacks.
 * 
 * @param {string} title title of the modal
 * @param {(string|ReactElement|Array<string|ReactElement>)} children a single or mixed array of react elements and strings. Everything is wrapped in Discord's `TextElement` component so strings will show and render properly.
 * @param {object} [options] options to modify the modal
 * @param {boolean} [options.danger=false] whether the main button should be red or not
 * @param {string} [options.confirmText=Okay] text for the confirmation/submit button
 * @param {string} [options.cancelText=Cancel] text for the cancel button
 * @param {callable} [options.onConfirm=NOOP] callback to occur when clicking the submit button
 * @param {callable} [options.onCancel=NOOP] callback to occur when clicking the cancel button
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
 * 
 * @param {string|Node} content Content of the notice
 * @param {object} options Options for the notice.
 * @param {string} [options.type="info" | "error" | "warning" | "success"] Type for the notice. Will affect the color.
 * @param {Array<{label: string, onClick: function}>} [options.buttons] Buttons that should be added next to the notice text.
 * @param {number} [options.timeout=10000] Timeout until the notice is closed. Won't fire if it's set to 0;
 * @returns {function}
 */
 BdApi.showNotice = function (content, options = {}) {
    return Notices.show(content, options);
};

/**
 * Finds a webpack module using a filter
 * 
 * @deprecated
 * @param {function} filter A filter given the exports, module, and moduleId. Returns true if the module matches.
 * @returns {any} Either the matching module or `undefined`
 */
BdApi.findModule = function(filter) {
    return WebpackModules.getModule(filter);
};

/**
 * Finds multple webpack modules using a filter
 * 
 * @deprecated
 * @param {function} filter A filter given the exports, module, and moduleId. Returns true if the module matches.
 * @returns {Array} Either an array of matching modules or an empty array
 */
BdApi.findAllModules = function(filter) {
    return WebpackModules.getModule(filter, {first: false});
};

/**
 * Finds a webpack module by own properties
 * 
 * @deprecated
 * @param {...string} props Any desired properties
 * @returns {any} Either the matching module or `undefined`
 */
BdApi.findModuleByProps = function(...props) {
    return WebpackModules.getByProps(...props);
};


/**
 * Finds a webpack module by own prototypes
 * 
 * @deprecated
 * @param {...string} protos Any desired prototype properties
 * @returns {any} Either the matching module or `undefined`
 */
BdApi.findModuleByPrototypes = function(...protos) {
    return WebpackModules.getByPrototypes(...protos);
};

/**
 * Finds a webpack module by displayName property
 * 
 * @deprecated
 * @param {string} name Desired displayName property
 * @returns {any} Either the matching module or `undefined`
 */
BdApi.findModuleByDisplayName = function(name) {
    return WebpackModules.getByDisplayName(name);
};

/**
 * Get the internal react data of a specified node
 * 
 * @param {HTMLElement} node Node to get the react data from
 * @returns {object|undefined} Either the found data or `undefined` 
 */
BdApi.getInternalInstance = function(node) {
    return Utilities.getReactInstance(node);
};

/**
 * Loads previously stored data.
 * 
 * @param {string} pluginName Name of the plugin loading data
 * @param {string} key Which piece of data to load
 * @returns {any} The stored data
 */
BdApi.loadData = function(pluginName, key) {
    return DataStore.getPluginData(pluginName, key);
};

/** @alias loadData */
BdApi.getData = BdApi.loadData;

/**
 * Saves JSON-serializable data.
 * 
 * @param {string} pluginName Name of the plugin saving data
 * @param {string} key Which piece of data to store
 * @param {any} data The data to be saved
 * @returns 
 */
BdApi.saveData = function(pluginName, key, data) {
    return DataStore.setPluginData(pluginName, key, data);
};

/** @alias saveData */
BdApi.setData = BdApi.saveData;

/**
 * Deletes a piece of stored data, this is different than saving as null or undefined.
 * 
 * @param {string} pluginName Name of the plugin deleting data
 * @param {string} key Which piece of data to delete
 */
BdApi.deleteData = function(pluginName, key) {
    DataStore.deletePluginData(pluginName, key);
};

/**
 * This function monkey-patches a method on an object. The patching callback may be run before, after or instead of target method.
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
 */
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

/**
 * Adds a listener for when the node is removed from the document body.
 * 
 * @param {HTMLElement} node Node to be observed
 * @param {function} callback Function to run when fired
 */
BdApi.onRemoved = function(node, callback) {
    Utilities.onRemoved(node, callback);
};

/**
 * Wraps a given function in a `try..catch` block.
 * 
 * @deprecated
 * @param {function} method Function to wrap
 * @param {string} message Additional messasge to print when an error occurs
 * @returns {function} The new wrapped function
 */
BdApi.suppressErrors = function(method, message) {
    return Utilities.suppressErrors(method, message);
};

/**
 * Tests a given object to determine if it is valid JSON.
 * 
 * @deprecated
 * @param {object} data Data to be tested
 * @returns {boolean} Result of the test
 */
BdApi.testJSON = function(data) {
    return Utilities.testJSON(data);
};

/**
 * Gets a specific setting's status from BD
 * 
 * @deprecated
 * @param {string} [collection="settings"] Collection ID
 * @param {string} category Category ID in the collection
 * @param {string} id Setting ID in the category
 * @returns {boolean} If the setting is enabled
 */
BdApi.isSettingEnabled = function(collection, category, id) {
    return Settings.get(collection, category, id);
};

/**
 * Enable a BetterDiscord setting by ids.
 * 
 * @deprecated
 * @param {string} [collection="settings"] Collection ID
 * @param {string} category Category ID in the collection
 * @param {string} id Setting ID in the category
 */
BdApi.enableSetting = function(collection, category, id) {
    return Settings.set(collection, category, id, true);
};

/**
 * Disables a BetterDiscord setting by ids.
 * 
 * @deprecated
 * @param {string} [collection="settings"] Collection ID
 * @param {string} category Category ID in the collection
 * @param {string} id Setting ID in the category
 */
BdApi.disableSetting = function(collection, category, id) {
    return Settings.set(collection, category, id, false);
};

/**
 * Toggle a BetterDiscord setting by ids.
 * 
 * @deprecated
 * @param {string} [collection="settings"] Collection ID
 * @param {string} category Category ID in the collection
 * @param {string} id Setting ID in the category
 */
BdApi.toggleSetting = function(collection, category, id) {
    return Settings.set(collection, category, id, !Settings.get(collection, category, id));
};

/**
 * Gets some data in BetterDiscord's misc data.
 * 
 * @deprecated
 * @param {string} key Key of the data to load.
 * @returns {any} The stored data
 */
BdApi.getBDData = function(key) {
    return DataStore.getBDData(key);
};

/**
 * Gets some data in BetterDiscord's misc data.
 * 
 * @deprecated
 * @param {string} key Key of the data to load.
 * @returns {any} The stored data
 */
BdApi.setBDData = function(key, data) {
    return DataStore.setBDData(key, data);
};

/**
 * Gives access to the [Electron Dialog](https://www.electronjs.org/docs/latest/api/dialog/) api.
 * Returns a `Promise` that resolves to an `object` that has a `boolean` cancelled and a `filePath` string for saving and a `filePaths` string array for opening.
 * 
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
 */
BdApi.openDialog = async function (options) {
    const data = await ipc.openDialog(options);
    if (data.error) throw new Error(data.error);

    return data;
};

/**
 * `AddonAPI` is a utility class for working with plugins and themes. Instances are accessible through the {@link BdApi}.
 */
class AddonAPI {
    constructor(manager) {this.manager = manager;}

    /**
     * The path to the addon folder.
     * @type string
     */
    get folder() {return this.manager.addonFolder;}

    /**
     * Determines if a particular adon is enabled.
     * @param {string} idOrFile Addon id or filename.
     * @returns {boolean}
     */
    isEnabled(idOrFile) {return this.manager.isEnabled(idOrFile);}

    /**
     * Enables the given addon.
     * @param {string} idOrFile Addon id or filename.
     */
    enable(idOrAddon) {return this.manager.enableAddon(idOrAddon);}

    /**
     * Disables the given addon.
     * @param {string} idOrFile Addon id or filename.
     */
    disable(idOrAddon) {return this.manager.disableAddon(idOrAddon);}

    /**
     * Toggles if a particular addon is enabled.
     * @param {string} idOrFile Addon id or filename.
     */
    toggle(idOrAddon) {return this.manager.toggleAddon(idOrAddon);}

    /**
     * Reloads if a particular addon is enabled.
     * @param {string} idOrFile Addon id or filename.
     */
    reload(idOrFileOrAddon) {return this.manager.reloadAddon(idOrFileOrAddon);}

    /**
     * Gets a particular addon.
     * @param {string} idOrFile Addon id or filename.
     * @returns {object} Addon instance
     */
    get(idOrFile) {return this.manager.getAddon(idOrFile);}

    /**
     * Gets all addons of this type.
     * @returns {Array<object>} Array of all addon instances
     */
    getAll() {return this.manager.addonList.map(a => this.manager.getAddon(a.id));}
}

/**
 * An instance of {@link AddonAPI} to access plugins.
 * @type AddonAPI
 */
BdApi.Plugins = new AddonAPI(PluginManager);

/**
 * An instance of {@link AddonAPI} to access themes.
 * @type AddonAPI
 */
BdApi.Themes = new AddonAPI(ThemeManager);


/**
 * `Patcher` is a utility class for modifying existing functions. Instance is accessible through the {@link BdApi}.
 * This is extremely useful for modifying the internals of Discord by adjusting return value or React renders, or arguments of internal functions.
 * @type Patcher
 * @summary {@link Patcher} is a utility class for modifying existing functions.
 */
BdApi.Patcher = {
    /**
     * This function creates a version of itself that binds all `caller` parameters to your ID.
     * @param {string} id ID to use for all subsequent calls
     * @returns {Patcher} An instance of this patcher with all functions bound to your ID
     */
    bind(id) {
        return {
            patch: BdApi.Patcher.patch.bind(BdApi.Patcher, id),
            before: BdApi.Patcher.before.bind(BdApi.Patcher, id),
            instead: BdApi.Patcher.instead.bind(BdApi.Patcher, id),
            after: BdApi.Patcher.after.bind(BdApi.Patcher, id),
            getPatchesByCaller: BdApi.Patcher.getPatchesByCaller.bind(BdApi.Patcher, id),
            unpatchAll: BdApi.Patcher.unpatchAll.bind(BdApi.Patcher, id),
        };
    },

    /**
     * This method patches onto another function, allowing your code to run beforehand.
     * Using this, you are also able to modify the incoming arguments before the original method is run.
     * @param {string} caller Name of the caller of the patch function.
     * @param {object} moduleToPatch Object with the function to be patched. Can also be an object's prototype.
     * @param {string} functionName Name of the function to be patched.
     * @param {function} callback Function to run before the original method. The function is given the `this` context and the `arguments` of the original function.
     * @returns {function} Function that cancels the original patch.
     */
    before(caller, moduleToPatch, functionName, callback) {
        return Patcher.pushChildPatch(caller, moduleToPatch, functionName, callback, {type: "before"});
    },

    /**
     * This method patches onto another function, allowing your code to run instead.
     * Using this, you are also able to modify the return value, using the return of your code instead.
     * @param {string} caller Name of the caller of the patch function.
     * @param {object} moduleToPatch Object with the function to be patched. Can also be an object's prototype.
     * @param {string} functionName Name of the function to be patched.
     * @param {function} callback Function to run before the original method. The function is given the `this` context, `arguments` of the original function, and also the original function.
     * @returns {function} Function that cancels the original patch.
     */
    instead(caller, moduleToPatch, functionName, callback) {
        return Patcher.pushChildPatch(caller, moduleToPatch, functionName, callback, {type: "instead"});
    },

    /**
     * This method patches onto another function, allowing your code to run instead.
     * Using this, you are also able to modify the return value, using the return of your code instead.
     * @param {string} caller Name of the caller of the patch function.
     * @param {object} moduleToPatch Object with the function to be patched. Can also be an object's prototype.
     * @param {string} functionName Name of the function to be patched.
     * @param {function} callback Function to run after the original method. The function is given the `this` context, the `arguments` of the original function, and the `return` value of the original function.
     * @returns {function} Function that cancels the original patch.
     */
    after(caller, moduleToPatch, functionName, callback) {
        return Patcher.pushChildPatch(caller, moduleToPatch, functionName, callback, {type: "after"});
    },

    /**
     * Returns all patches by a particular caller. The patches all have an `unpatch()` method.
     * @param {string} caller ID of the original patches
     * @returns {Array<function>} Array of all the patch objects.
     */
    getPatchesByCaller(caller) {
        if (typeof(caller) !== "string") return Logger.err("BdApi.Patcher", "Parameter 0 of getPatchesByCaller must be a string representing the caller");
        return Patcher.getPatchesByCaller(caller);
    },

    /**
     * Automatically cancels all patches created with a specific ID.
     * @param {string} caller ID of the original patches
     */
    unpatchAll(caller) {
        if (typeof(caller) !== "string") return Logger.err("BdApi.Patcher", "Parameter 0 of unpatchAll must be a string representing the caller");
        Patcher.unpatchAll(caller);
    }
};

/**
 * `Webpack` is a utility class for getting internal webpack modules. Instance is accessible through the {@link BdApi}.
 * This is extremely useful for interacting with the internals of Discord.
 * @type Webpack
 * @summary {@link Webpack} is a utility class for getting internal webpack modules.
 */
BdApi.Webpack = {

    /**
     * Series of {@link Filters} to be used for finding webpack modules.
     * @type Filters
     */
    Filters: {
        /**
         * Generates a function that filters by a set of properties.
         * @param {...string} props List of property names
         * @returns {function} A filter that checks for a set of properties
         */
        byProps(...props) {return Filters.byProps(props);},

        /**
         * Generates a function that filters by a set of properties on the object's prototype.
         * @param {...string} props List of property names
         * @returns {function} A filter that checks for a set of properties on the object's prototype.
         */
         byPrototypeFields(...props) {return Filters.byPrototypeFields(props);},

         /**
         * Generates a function that filters by a regex.
         * @param {RegExp} search A RegExp to check on the module
         * @param {function} filter Additional filter
         * @returns {function} A filter that checks for a regex match
         */
         byRegex(regex) {return Filters.byRegex(regex);},

         /**
         * Generates a function that filters by strings.
         * @param {...String} strings A list of strings
         * @returns {function} A filter that checks for a set of strings
         */
         byStrings(...strings) {return Filters.byStrings(strings);},

        /**
         * Generates a function that filters by a set of properties.
         * @param {string} name Name the module should have
         * @returns {function} A filter that checks for a set of properties
         */
         byDisplayName(name) {return Filters.byDisplayName(name);},

         /**
         * Generates a combined function from a list of filters.
         * @param {...function} filters A list of filters
         * @returns {function} Combinatory filter of all arguments
         */
         combine(...filters) {return Filters.combine(filters);},
    },

    /**
     * Finds a module using a filter function.
     * @param {function} filter A function to use to filter modules. It is given exports, module, and moduleID. Return true to signify match.
     * @param {object} [options] Whether to return only the first matching module
     * @param {Boolean} [options.first=true] Whether to return only the first matching module
     * @param {Boolean} [options.defaultExport=true] Whether to return default export when matching the default export
     * @return {any}
     */
    getModule(filter, options = {}) {
        if (("first" in options) && typeof(options.first) !== "boolean") return Logger.error("BdApi.Webpack~getModule", "Unsupported type used for options.first", options.first, "boolean expected.");
        if (("defaultExport" in options) && typeof(options.defaultExport) !== "boolean") return Logger.error("BdApi.Webpack~getModule", "Unsupported type used for options.defaultExport", options.defaultExport, "boolean expected.");
        return WebpackModules.getModule(filter, options);
    },

    /**
     * Finds multiple modules using multiple filters.
     * 
     * @param {...object} queries Whether to return only the first matching module
     * @param {Function} queries.filter A function to use to filter modules
     * @param {Boolean} [queries.first=true] Whether to return only the first matching module
     * @param {Boolean} [queries.defaultExport=true] Whether to return default export when matching the default export
     * @return {any}
     */
    getBulk(...queries) {return WebpackModules.getBulk(...queries);},

    /**
     * Finds a module that lazily loaded.
     * @param {function} filter A function to use to filter modules. It is given exports. Return true to signify match.
     * @param {object} [options] Whether to return only the first matching module
     * @param {AbortSignal} [options.signal] AbortSignal of an AbortController to cancel the promise
     * @param {Boolean} [options.defaultExport=true] Whether to return default export when matching the default export
     * @returns {Promise<any>}
     */
    waitForModule(filter, options = {}) {
        if (("defaultExport" in options) && typeof(options.defaultExport) !== "boolean") return Logger.error("BdApi.Webpack~waitForModule", "Unsupported type used for options.defaultExport", options.defaultExport, "boolean expected.");
        if (("signal" in options) && !(options.signal instanceof AbortSignal)) return Logger.error("BdApi.Webpack~waitForModule", "Unsupported type used for options.signal", options.signal, "AbortSignal expected.");
        return WebpackModules.getLazy(filter, options);
    },
};

Object.freeze(BdApi);
Object.freeze(BdApi.Plugins);
Object.freeze(BdApi.Themes);
Object.freeze(BdApi.Patcher);
Object.freeze(BdApi.Webpack);
Object.freeze(BdApi.Webpack.Filters);

export default BdApi;
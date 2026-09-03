import Logger from "@common/logger";

import Config from "@stores/config";
import Toasts from "@stores/toasts";

import AddonManager from "./addonmanager";
import {type Addon} from "@typed/addon";
import {t} from "@common/i18n";
import Events from "./emitter";

type PluginLoadPoint = "connection" | "idle";

// Do not rename
export interface PluginInstance {
    /**
     * Custom icon for slash commands
     */
    icon?: React.FunctionComponent | React.ComponentClass | string;
    /**
     * Runs when your plugin is enabled
     */
    start(): void;
    /**
     * Runs when your plugin is disabled
     */
    stop(): void;
    /**
     * @returns A React functional (not exotic react components like memo) / class component or React Node or a DOM node or a string
     */
    getSettingsPanel?(): React.ComponentClass | React.FunctionComponent | React.ReactNode | Element;
    /** @deprecated Create your own [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) instead */
    observer?(m: MutationRecord): void;
    /** @deprecated Use the [Navigation: navigate event](https://developer.mozilla.org/en-US/docs/Web/API/Navigation/navigate_event) event instead */
    onSwitch?(): void;
}

// Do not rename
// Why does ts have no way to do classes properly without extending a real class?
/**
 * For both class and function (non arrow) exports
 * @example
 * const MyPlugin: BetterDiscord.PluginConstructor = class implements BetterDiscord.PluginInstance {
 *      constructor(meta: BetterDiscord.Addon) {}
 *      start() {}
 *      stop() {}
 * }
 */
type PluginConstructor = new (meta: Addon) => PluginInstance;
// Do not rename
/**
 * Technically only arrows functions are treated as functions
 * @example
 * const MyPlugin: BetterDiscord.PluginFactory = (meta) => {
 *      start() {},
 *      stop() {}
 * };
 */
type PluginFactory = (meta: Addon) => PluginInstance;
// Do not rename
type PluginExport = PluginConstructor | PluginFactory;

export interface Plugin extends Addon {
    exports: PluginExport;
    instance: PluginInstance;
    hasObserver: boolean;
}

export interface PluginModule {
    exports: PluginExport;
    filename: string;
}

const normalizeExports = `
if (module.exports.default) {
    module.exports = module.exports.default;
}`;

class PluginManager extends AddonManager<Plugin> {
    name = "PluginManager";
    extension = ".plugin.js";
    duplicatePattern = /\.plugin\s?\([0-9]+\)\.js/;
    addonFolder = Config.get("pluginsPath");
    prefix = "plugin" as const;
    language = "javascript";
    order = 3;

    private observerRef = -1;
    private observer: MutationObserver | undefined;
    private onObserverMutations: MutationCallback = (mutations) => {
        // Possible speed increase
        if (!this.addonList.length) return;

        for (let i = 0, mlen = mutations.length; i < mlen; i++) {
            this.onMutation(mutations[i]);
        }
    };

    constructor() {
        super();
        this.onSwitch = this.onSwitch.bind(this);
    }

    initialize() {
        const errors = super.initialize();
        this.setupFunctions();
        return errors;
    }

    startAddons(point: PluginLoadPoint) {
        Logger.log("PluginManager", `Loading addons at point: ${point}`);

        for (const addon of this.addonList) {
            if (addon.runAt !== point || !(this.state[addon.id] || addon.filename === "0BDFDB.plugin.js")) continue;
            this.startAddon(addon);
        }

        if (point === "idle") this.finishInit();
    }

    initAddon(plugin: Plugin) {
        // Evaluate the plugin
        try {
            const module = {
                filename: plugin.filename,
                exports: {} as PluginExport
            } as PluginModule;

            plugin.fileContent += normalizeExports + `\n//# sourceURL=betterdiscord://betterdiscord/plugins/${plugin.filename}`;

            // Wrap the plugin in a function and run it
            const wrappedPlugin = new Function("require", "module", "exports", "__filename", "__dirname", plugin.fileContent!); // eslint-disable-line no-new-func
            wrappedPlugin(window.require, module, module.exports, module.filename, this.addonFolder);

            plugin.exports = module.exports as PluginExport;
            delete plugin.fileContent;
        }
        catch (err) {
            this.showAddonError(plugin, t("Addons.compileError"), {
                message: (err as Error).message,
                stack: (err as Error).stack
            });
            return false;
        }

        // Confirm the plugin has a name
        if (!plugin.exports || !plugin.name) {
            this.showAddonError(plugin, "Plugin had no exports or @name property", {
                message: "Plugin had no exports or no @name property. @name property is required for all addons.",
                stack: ""
            });
            return false;
        }

        // Confirm the exports are valid
        if (typeof plugin.exports !== "function") {
            this.showAddonError(plugin, "Plugin not a valid format.", {
                message: "Plugins should be either a function or a class",
                stack: ""
            });
            return false;
        }

        const meta: Omit<Plugin, "exports"> & {exports?: unknown;} = Object.assign({}, plugin);
        const exports = plugin.exports;
        delete meta.exports;

        try {
            // Load the plugin instance
            const instance = exports.prototype ? new (exports as PluginConstructor)(meta) : (exports as PluginFactory)(meta);

            // Confirm the required methods are present
            if (typeof instance.start !== "function" || typeof instance.stop !== "function") {
                this.showAddonError(plugin, "Missing start or stop function.", {
                    message: "Plugins must have both a start and stop function.",
                    stack: ""
                });
                return false;
            }

            plugin.instance = instance;
            plugin.hasObserver = typeof instance.observer === "function";

            // Confirm required fields are present
            if (!plugin.name || !plugin.author || !plugin.description || !plugin.version) {
                this.showAddonError(plugin, "Plugin is missing name, author, description, or version", {
                    message: "Plugin must provide name, author, description, and version.",
                    stack: ""
                });
                return false;
            }

            return true;
        }
        catch (err) {
            this.showAddonError(plugin, t("Addons.methodError", {method: "Plugin constructor()"}), {
                message: (err as Error).message,
                stack: (err as Error).stack
            });
            return false;
        }
    }

    startAddon(idOrAddon: string | Plugin) {
        const plugin = this.resolveAddon(idOrAddon);
        if (!plugin) return false;

        if (!plugin.instance) {
            const loaded = this.loadAddon(plugin);
            if (!loaded) return false;
        }

        try {
            plugin.instance.start();
        }
        catch (err) {
            // Disable the addon if it can't be started
            this.state[plugin.id] = false;
            this.trigger("disabled", plugin);
            Toasts.warning(t("Addons.couldNotStart", {name: plugin.name, version: plugin.version}));
            Logger.stacktrace(this.name, `${plugin.name} v${plugin.version} could not be started.`, err as Error);

            this.showAddonError(plugin, t("Addons.methodError", {method: "start()"}), {
                message: (err as Error).message,
                stack: (err as Error).stack
            });

            return false;
        }

        if (plugin.hasObserver) {
            this.observerRef++;

            if (typeof this.observer === "undefined") {
                this.observer = new MutationObserver(this.onObserverMutations);

                this.observer.observe(document, {
                    childList: true,
                    subtree: true
                });
            }
        }

        this.trigger("started", plugin.id);
        if (this.hasInitialized) Toasts.success(t("Addons.enabled", {name: plugin.name, version: plugin.version}));
        else this.initialAddonsLoaded++;

        return true;
    }

    stopAddon(idOrAddon: string | Plugin) {
        const plugin = this.resolveAddon(idOrAddon);
        if (!plugin) return false;

        if (plugin.hasObserver) {
            this.observerRef = this.observerRef <= 0 ? -1 : this.observerRef - 1;

            if (this.observerRef === -1) {
                this.observer?.disconnect();
                this.observer = undefined;
            }
        }

        try {
            plugin.instance?.stop();
        }
        catch (err) {
            this.state[plugin.id] = false;
            Toasts.warning(t("Addons.couldNotStop", {name: plugin.name, version: plugin.version}));
            Logger.stacktrace(this.name, `${plugin.name} v${plugin.version} could not be stopped.`, err as Error);

            this.showAddonError(plugin, t("Addons.methodError", {method: "stop()"}), {
                message: (err as Error).message,
                stack: (err as Error).stack
            });

            return false;
        }

        this.trigger("stopped", plugin.id);
        Toasts.error(t("Addons.disabled", {name: plugin.name, version: plugin.version}));

        return true;
    }

    setupFunctions() {
        Events.on("navigate", this.onSwitch);
    }

    onSwitch() {
        for (let i = 0; i < this.addonList.length; i++) {
            if (!this.state[this.addonList[i].id]) continue;
            const plugin = this.addonList[i].instance;
            try {
                if (typeof plugin?.onSwitch === "function") {
                    plugin.onSwitch();
                }
            }
            catch (err) {Logger.stacktrace(this.name, `Unable to fire onSwitch for ${this.addonList[i].name} v${this.addonList[i].version}`, err as Error);}
        }
    }

    onMutation(mutation: MutationRecord) {
        for (let i = 0; i < this.addonList.length; i++) {
            if (!this.state[this.addonList[i].id]) continue;
            const plugin = this.addonList[i].instance;
            try {
                if (typeof plugin?.observer === "function") {
                    plugin.observer(mutation);
                }
            }
            catch (err) {Logger.stacktrace(this.name, `Unable to fire observer for ${this.addonList[i].name} v${this.addonList[i].version}`, err as Error);}
        }
    }
}

export default new PluginManager();
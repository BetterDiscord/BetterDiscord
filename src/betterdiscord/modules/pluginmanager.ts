import Logger from "@common/logger";

import Config from "@stores/config";
import Toasts from "@stores/toasts";

import AddonManager, {type Addon} from "./addonmanager";
import {t} from "@common/i18n";
import Events from "./emitter";

type PluginLoadPoint = "connection" | "idle";

export interface Plugin extends Addon {
    exports: any;
    instance: {
        icon?: any;
        load?(): void;
        start(): void;
        stop(): void;
        observer?(m: MutationRecord): void;
        getSettingsPanel?(): any;
        onSwitch?(): void;
    };
}

const normalizeExports = `
if (module.exports.default) {
    module.exports = module.exports.default;
}`;

export default new class PluginManager extends AddonManager<Plugin> {
    name = "PluginManager";
    extension = ".plugin.js";
    duplicatePattern = /\.plugin\s?\([0-9]+\)\.js/;
    addonFolder = Config.get("pluginsPath");
    prefix = "plugin" as const;
    language = "javascript";
    order = 3;

    observer: MutationObserver;

    constructor() {
        super();
        this.onSwitch = this.onSwitch.bind(this);
        this.observer = new MutationObserver((mutations) => {
            for (let i = 0, mlen = mutations.length; i < mlen; i++) {
                this.onMutation(mutations[i]);
            }
        });
    }

    initialize() {
        const errors = super.initialize();
        this.setupFunctions();
        return errors;
    }

    loadAddons(point: PluginLoadPoint) {
        Logger.log("PluginManager", `Loading addons at point: ${point}`);

        for (const addon of this.addonInfo) {
            if (addon.runAt !== point) continue;
            this.loadAddon(addon);
        }

        if (point === "idle") this.finishInit();
    }

    runPlugin(addon: Addon) {
        try {
            const module = {filename: addon.filename, exports: {}};
            const plugin = addon as Plugin;

            plugin.fileContent += normalizeExports + `\n//# sourceURL=betterdiscord://plugins/${plugin.filename}`;

            // Wrap the plugin in a function and run it
            const wrappedPlugin = new Function("require", "module", "exports", "__filename", "__dirname", plugin.fileContent!); // eslint-disable-line no-new-func
            wrappedPlugin(window.require, module, module.exports, module.filename, this.addonFolder);

            plugin.exports = module.exports;
            delete plugin.fileContent;
            return plugin;
        }
        catch (err) {
            return this.showAddonError(addon, t("Addons.compileError"), {
                message: (err as Error).message,
                stack: (err as Error).stack
            });
        }
    }

    initAddon(addon: Addon) {
        const plugin = this.runPlugin(addon);
        if (!plugin) return null;

        // Confirm the plugin has a name
        if (!plugin.exports || !plugin.name) {
            return this.showAddonError(plugin, "Plugin had no exports or @name property", {
                message: "Plugin had no exports or no @name property. @name property is required for all addons.",
                stack: ""
            });
        }

        // Confirm the exports are valid
        if (typeof plugin.exports !== "function") {
            return this.showAddonError(plugin, "Plugin not a valid format.", {
                message: "Plugins should be either a function or a class",
                stack: ""
            });
        }

        const meta = Object.assign({}, plugin);
        const exports = plugin.exports;
        delete meta.exports;

        try {
            // Load the plugin instance
            const instance = exports.prototype ? new exports(meta) : exports(meta);

            // Confirm the required methods are present
            if (!instance.start || !instance.stop) {
                return this.showAddonError(plugin, "Missing start or stop function.", {
                    message: "Plugins must have both a start and stop function.",
                    stack: ""
                });
            }

            plugin.instance = instance;
            plugin.name = instance.getName ? instance.getName() : plugin.name;
            plugin.author = instance.getAuthor ? instance.getAuthor() : plugin.author;
            plugin.description = instance.getDescription ? instance.getDescription() : plugin.description;
            plugin.version = instance.getVersion ? instance.getVersion() : plugin.version;

            // Confirm required fields are present
            if (!plugin.name || !plugin.author || !plugin.description || !plugin.version) {
                return this.showAddonError(plugin, "Plugin is missing name, author, description, or version", {
                    message: "Plugin must provide name, author, description, and version.",
                    stack: ""
                });
            }

            // Run the plugin's load function
            try {
                if (typeof instance.load === "function") instance.load();
                return plugin;
            }
            catch (err) {
                this.state[plugin.id] = false;
                return this.showAddonError(addon, t("Addons.methodError", {method: "load()"}), {
                    message: (err as Error).message,
                    stack: (err as Error).stack
                });
            }
        }
        catch (err) {
            return this.showAddonError(addon, t("Addons.methodError", {method: "Plugin constructor()"}), {
                message: (err as Error).message,
                stack: (err as Error).stack
            });
        }
    }

    startAddon(idOrAddon: string | Plugin) {
        const plugin = this.resolveAddon(idOrAddon);
        if (!plugin) return;

        try {
            plugin.instance.start();
        }
        catch (err) {
            // Disable the addon if it can't be started
            this.state[plugin.id] = false;
            this.trigger("disabled", plugin);
            Toasts.warning(t("Addons.couldNotStart", {name: plugin.name, version: plugin.version}));
            Logger.stacktrace(this.name, `${plugin.name} v${plugin.version} could not be started.`, err as Error);

            return this.showAddonError(plugin, t("Addons.methodError", {method: "start()"}), {
                message: (err as Error).message,
                stack: (err as Error).stack
            });
        }

        this.trigger("started", plugin.id);
        if (this.hasInitialized) Toasts.success(t("Addons.enabled", {name: plugin.name, version: plugin.version}));
        else this.initialAddonsLoaded++;
    }

    stopAddon(idOrAddon: string | Plugin) {
        const plugin = this.resolveAddon(idOrAddon);
        if (!plugin) return;

        try {
            plugin.instance.stop();
        }
        catch (err) {
            this.state[plugin.id] = false;
            Toasts.warning(t("Addons.couldNotStop", {name: plugin.name, version: plugin.version}));
            Logger.stacktrace(this.name, `${plugin.name} v${plugin.version} could not be stopped.`, err as Error);

            return this.showAddonError(plugin, t("Addons.methodError", {method: "stop()"}), {
                message: (err as Error).message,
                stack: (err as Error).stack
            });
        }

        this.trigger("stopped", plugin.id);
        Toasts.error(t("Addons.disabled", {name: plugin.name, version: plugin.version}));
    }

    setupFunctions() {
        Events.on("navigate", this.onSwitch);
        this.observer.observe(document, {
            childList: true,
            subtree: true
        });
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
};
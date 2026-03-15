import path from "path";
import vm from "vm";

import Logger from "@common/logger";

import Config from "@stores/config";
import Toasts from "@stores/toasts";

import AddonError from "@structs/addonerror";

import AddonManager, {type Addon} from "./addonmanager";
import {t} from "@common/i18n";
import Events from "./emitter";

import Modals from "@ui/modals";

export interface Plugin extends Addon {
    exports: any;
    instance: {
        load?(): void;
        start(): void;
        stop(): void;
        observer?(m: MutationRecord): void;
        getSettingsPanel?(): any;
        onSwitch?(): void;
    };
}

const normalizeExports = (name: string) => `
if (module.exports.default) {
    module.exports = module.exports.default;
}
if (typeof(module.exports) !== "function") {
    module.exports = eval("${name}");
}`;

export default new class PluginManager extends AddonManager {
    get name() {return "PluginManager";}
    get extension() {return ".plugin.js";}
    get duplicatePattern() {return /\.plugin\s?\([0-9]+\)\.js/;}
    get addonFolder() {return Config.get("pluginsPath");}
    get prefix() {return "plugin" as const;}
    get language() {return "javascript";}
    get order() {return 3;}

    addonList: Plugin[] = [];
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

    /* Aliases */
    updatePluginList() {return this.updateList();}
    loadAllPlugins() {return this.loadAllAddons();}

    enablePlugin(idOrAddon: string | Plugin) {return this.enableAddon(idOrAddon);}
    disablePlugin(idOrAddon: string | Plugin) {return this.disableAddon(idOrAddon);}
    togglePlugin(id: string) {return this.toggleAddon(id);}

    unloadPlugin(idOrFileOrAddon: string | Plugin) {return this.unloadAddon(idOrFileOrAddon);}
    loadPlugin(filename: string) {return this.loadAddon(filename);}

    loadAddon(filename: string, shouldCTE = true) {
        const error = super.loadAddon(filename, shouldCTE);
        if (error && shouldCTE) Modals.showAddonErrors({plugins: [error]});
        return error;
    }

    reloadPlugin(idOrFileOrAddon: string | Plugin) {
        const error = this.reloadAddon(idOrFileOrAddon);
        if (error) Modals.showAddonErrors({plugins: [error]});
        return typeof (idOrFileOrAddon) == "string" ? this.addonList.find(c => c.id == idOrFileOrAddon || c.filename == idOrFileOrAddon) : idOrFileOrAddon;
    }

    /* Overrides */
    initializeAddon(addon: Plugin) {
        if (!addon.exports || !addon.name) return new AddonError(addon.name || addon.filename, addon.filename, "Plugin had no exports or @name property", {message: "Plugin had no exports or no @name property. @name property is required for all addons.", stack: ""}, this.prefix);

        try {
            const isValid = typeof (addon.exports) === "function";
            if (!isValid) return new AddonError(addon.name || addon.filename, addon.filename, "Plugin not a valid format.", {message: "Plugins should be either a function or a class", stack: ""}, this.prefix);

            const PluginClass = addon.exports;
            const meta = Object.assign({}, addon);
            delete meta.exports;
            const thePlugin = PluginClass.prototype ? new PluginClass(meta) : addon.exports(meta);
            if (!thePlugin.start || !thePlugin.stop) return new AddonError(addon.name || addon.filename, addon.filename, "Missing start or stop function.", {message: "Plugins must have both a start and stop function.", stack: ""}, this.prefix);

            addon.instance = thePlugin;
            addon.name = thePlugin.getName ? thePlugin.getName() : addon.name;
            addon.author = thePlugin.getAuthor ? thePlugin.getAuthor() : addon.author;
            addon.description = thePlugin.getDescription ? thePlugin.getDescription() : addon.description;
            addon.version = thePlugin.getVersion ? thePlugin.getVersion() : addon.version;
            if (!addon.name || !addon.author || !addon.description || !addon.version) return new AddonError(addon.name || addon.filename, addon.filename, "Plugin is missing name, author, description, or version", {message: "Plugin must provide name, author, description, and version.", stack: ""}, this.prefix);
            try {
                if (typeof (addon.instance.load) == "function") addon.instance.load();
            }
            catch (error) {
                this.state[addon.id] = false;
                return new AddonError(addon.name, addon.filename, t("Addons.methodError", {method: "load()"}), {message: (error as Error).message, stack: (error as Error).stack}, this.prefix);
            }
        }
        catch (error) {
            return new AddonError(addon.name, addon.filename, t("Addons.methodError", {method: "Plugin constructor()"}), {message: (error as Error).message, stack: (error as Error).stack}, this.prefix);
        }
    }

    requireAddon(filename: string) {
        const addon = super.requireAddon(filename) as Plugin;
        try {
            const module = {filename, exports: {}};
            // Test if the code is valid gracefully
            vm.compileFunction(addon.fileContent!, ["require", "module", "exports", "__filename", "__dirname"], {filename: path.basename(filename)});
            addon.fileContent += normalizeExports(addon.exports || addon.name);
            addon.fileContent += `\n//# sourceURL=betterdiscord://plugins/${addon.filename}`;
            const wrappedPlugin = new Function("require", "module", "exports", "__filename", "__dirname", addon.fileContent!); // eslint-disable-line no-new-func
            wrappedPlugin(window.require, module, module.exports, module.filename, this.addonFolder);
            addon.exports = module.exports;
            delete addon.fileContent;
            return addon;
        }
        catch (err) {
            throw new AddonError(addon.name || addon.filename, filename, t("Addons.compileError"), {message: (err as Error).message, stack: (err as Error).stack}, this.prefix);
        }
    }

    startAddon(idOrAddon: string | Plugin) {return this.startPlugin(idOrAddon);}
    stopAddon(idOrAddon: string | Plugin) {return this.stopPlugin(idOrAddon);}
    getAddon(id: string) {return this.getPlugin(id);}

    startPlugin(idOrAddon: string | Plugin) {
        const addon = typeof (idOrAddon) == "string" ? this.addonList.find(p => p.id == idOrAddon) : idOrAddon;
        if (!addon) return;
        const plugin = addon.instance;
        try {
            plugin.start();
        }
        catch (err) {
            this.state[addon.id] = false;
            this.trigger("disabled", addon);
            Toasts.warning(t("Addons.couldNotStart", {name: addon.name, version: addon.version}));
            Logger.stacktrace(this.name, `${addon.name} v${addon.version} could not be started.`, err as Error);
            return new AddonError(addon.name, addon.filename, t("Addons.methodError", {method: "start()"}), {message: (err as Error).message, stack: (err as Error).stack}, this.prefix);
        }
        this.trigger("started", addon.id);

        if (this.hasInitialized) Toasts.success(t("Addons.enabled", {name: addon.name, version: addon.version}));
    }

    stopPlugin(idOrAddon: string | Plugin) {
        const addon = typeof (idOrAddon) == "string" ? this.addonList.find(p => p.id == idOrAddon) : idOrAddon;
        if (!addon) return;
        const plugin = addon.instance;
        try {
            plugin.stop();
        }
        catch (err) {
            this.state[addon.id] = false;
            Toasts.warning(t("Addons.couldNotStop", {name: addon.name, version: addon.version}));
            Logger.stacktrace(this.name, `${addon.name} v${addon.version} could not be started.`, err as Error);
            return new AddonError(addon.name, addon.filename, t("Addons.enabled", {method: "stop()"}), {message: (err as Error).message, stack: (err as Error).stack}, this.prefix);
        }
        this.trigger("stopped", addon.id);
        Toasts.error(t("Addons.disabled", {name: addon.name, version: addon.version}));
    }

    getPlugin(idOrFile: string) {
        const addon = this.addonList.find(c => c.id == idOrFile || c.filename == idOrFile);
        if (!addon) return;
        return addon;
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
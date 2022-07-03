import {Config} from "data";
import Logger from "common/logger";
import AddonManager from "./addonmanager";
import AddonError from "../structs/addonerror";
import Settings from "./settingsmanager";
import Strings from "./strings";
import Events from "./emitter";

import Toasts from "../ui/toasts";
import Modals from "../ui/modals";
import SettingsRenderer from "../ui/settings";

const path = require("path");
const vm = require("vm");

const normalizeExports = name => `
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
    get addonFolder() {return path.resolve(Config.dataPath, "plugins");}
    get prefix() {return "plugin";}
    get language() {return "javascript";}

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
        Settings.registerPanel("plugins", Strings.Panels.plugins, {element: () => SettingsRenderer.getAddonPanel(Strings.Panels.plugins, this.addonList, this.state, {
            type: this.prefix,
            folder: this.addonFolder,
            onChange: this.togglePlugin.bind(this),
            reload: this.reloadPlugin.bind(this),
            refreshList: this.updatePluginList.bind(this),
            saveAddon: this.saveAddon.bind(this),
            editAddon: this.editAddon.bind(this),
            deleteAddon: this.deleteAddon.bind(this),
            prefix: this.prefix
        })});
        return errors;
    }

    /* Aliases */
    updatePluginList() {return this.updateList();}
    loadAllPlugins() {return this.loadAllAddons();}

    enablePlugin(idOrAddon) {return this.enableAddon(idOrAddon);}
    disablePlugin(idOrAddon) {return this.disableAddon(idOrAddon);}
    togglePlugin(id) {return this.toggleAddon(id);}

    unloadPlugin(idOrFileOrAddon) {return this.unloadAddon(idOrFileOrAddon);}
    loadPlugin(filename) {return this.loadAddon(filename);}

    loadAddon(filename, shouldCTE = true) {
        const error = super.loadAddon(filename, shouldCTE);
        if (error && shouldCTE) Modals.showAddonErrors({plugins: [error]});
        return error;
    }

    reloadPlugin(idOrFileOrAddon) {
        const error = this.reloadAddon(idOrFileOrAddon);
        if (error) Modals.showAddonErrors({plugins: [error]});
        return typeof(idOrFileOrAddon) == "string" ? this.addonList.find(c => c.id == idOrFileOrAddon || c.filename == idOrFileOrAddon) : idOrFileOrAddon;
    }

    /* Overrides */
    initializeAddon(addon) {
        if (!addon.exports || !addon.name) return new AddonError(addon.name || addon.filename, addon.filename, "Plugin had no exports or @name property", {message: "Plugin had no exports or no @name property. @name property is required for all addons.", stack: ""}, this.prefix);

        try {
            const isValid = typeof(addon.exports) === "function";
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
                if (typeof(addon.instance.load) == "function") addon.instance.load();
            }
            catch (error) {
                this.state[addon.id] = false;
                return new AddonError(addon.name, addon.filename, "load() could not be fired.", {message: error.message, stack: error.stack}, this.prefix);
            }
        }
        catch (error) {
            return new AddonError(addon.name, addon.filename, "Could not be constructed.", {message: error.message, stack: error.stack}, this.prefix);
        }
    }

    requireAddon(filename) {
        const addon = super.requireAddon(filename);
        try {
            const module = {filename, exports: {}};
            // Test if the code is valid gracefully
            vm.compileFunction(addon.fileContent, ["require", "module", "exports", "__filename", "__dirname"]);
            addon.fileContent += normalizeExports(addon.exports || addon.name);
            addon.fileContent += `\n//# sourceURL=betterdiscord://plugins/${addon.filename}`;
            const wrappedPlugin = new Function(["require", "module", "exports", "__filename", "__dirname"], addon.fileContent); // eslint-disable-line no-new-func
            wrappedPlugin(window.require, module, module.exports, module.filename, this.addonFolder);
            addon.exports = module.exports;
            delete addon.fileContent;
            return addon;
        }
        catch (err) {
            return new AddonError(addon.name || addon.filename, module.filename, "Plugin could not be compiled", {message: err.message, stack: err.stack}, this.prefix);
        }
    }

    startAddon(id) {return this.startPlugin(id);}
    stopAddon(id) {return this.stopPlugin(id);}
    getAddon(id) {return this.getPlugin(id);}

    startPlugin(idOrAddon) {
        const addon = typeof(idOrAddon) == "string" ? this.addonList.find(p => p.id == idOrAddon) : idOrAddon;
        if (!addon) return;
        const plugin = addon.instance;
        try {
            plugin.start();
        }
        catch (err) {
            this.state[addon.id] = false;
            Toasts.error(Strings.Addons.couldNotStart.format({name: addon.name, version: addon.version}));
            Logger.stacktrace(this.name, `${addon.name} v${addon.version} could not be started.`, err);
            return new AddonError(addon.name, addon.filename, Strings.Addons.enabled.format({method: "start()"}), {message: err.message, stack: err.stack}, this.prefix);
        }
        this.emit("started", addon.id);
        Toasts.show(Strings.Addons.enabled.format({name: addon.name, version: addon.version}));
    }

    stopPlugin(idOrAddon) {
        const addon = typeof(idOrAddon) == "string" ? this.addonList.find(p => p.id == idOrAddon) : idOrAddon;
        if (!addon) return;
        const plugin = addon.instance;
        try {
            plugin.stop();
        }
        catch (err) {
            this.state[addon.id] = false;
            Toasts.error(Strings.Addons.couldNotStop.format({name: addon.name, version: addon.version}));
            Logger.stacktrace(this.name, `${addon.name} v${addon.version} could not be started.`, err);
            return new AddonError(addon.name, addon.filename, Strings.Addons.enabled.format({method: "stop()"}), {message: err.message, stack: err.stack}, this.prefix);
        }
        this.emit("stopped", addon.id);
        Toasts.show(Strings.Addons.disabled.format({name: addon.name, version: addon.version}));
    }

    getPlugin(idOrFile) {
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
            const plugin = this.addonList[i].instance;
            if (!this.state[this.addonList[i].id]) continue;
            if (typeof(plugin.onSwitch) === "function") {
                try {plugin.onSwitch();}
                catch (err) {Logger.stacktrace(this.name, `Unable to fire onSwitch for ${this.addonList[i].name} v${this.addonList[i].version}`, err);}
            }
        }
    }

    onMutation(mutation) {
        for (let i = 0; i < this.addonList.length; i++) {
            const plugin = this.addonList[i].instance;
            if (!this.state[this.addonList[i].id]) continue;
            if (typeof plugin.observer === "function") {
                try {plugin.observer(mutation);}
                catch (err) {Logger.stacktrace(this.name, `Unable to fire observer for ${this.addonList[i].name} v${this.addonList[i].version}`, err);}
            }
        }
    }
};
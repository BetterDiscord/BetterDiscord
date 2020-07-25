import {Config} from "data";
import Logger from "./logger";
import AddonManager from "./addonmanager";
import Utilities from "./utilities";
import AddonError from "../structs/addonerror";
import Settings from "./settingsmanager";
import Strings from "./strings";

import Toasts from "../ui/toasts";
import Modals from "../ui/modals";
import SettingsRenderer from "../ui/settings";

const path = require("path");
const electronRemote = require("electron").remote;

export default new class PluginManager extends AddonManager {
    get name() {return "PluginManager";}
    get moduleExtension() {return ".js";}
    get extension() {return ".plugin.js";}
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

    loadPlugin(filename) {
        const error = this.loadAddon(filename);
        if (error) Modals.showAddonErrors({themes: [error]});
    }

    reloadPlugin(idOrFileOrAddon) {
        const error = this.reloadAddon(idOrFileOrAddon);
        if (error) Modals.showAddonErrors({plugins: [error]});
        return typeof(idOrFileOrAddon) == "string" ? this.addonList.find(c => c.id == idOrFileOrAddon || c.filename == idOrFileOrAddon) : idOrFileOrAddon;
    }

    /* Overrides */
    initializeAddon(addon) {
        if (!addon.type) return new AddonError(addon.name, addon.filename, "Plugin had no exports", {message: "Plugin had no exports or no name property.", stack: ""});
        try {
            const PluginClass = addon.type;
            const thePlugin = new PluginClass();
            addon.plugin = thePlugin;
            addon.name = thePlugin.getName() || addon.name;
            addon.author = thePlugin.getAuthor() || addon.author || "No author";
            addon.description = thePlugin.getDescription() || addon.description || "No description";
            addon.version = thePlugin.getVersion() || addon.version || "No version";
            try {
                if (typeof(addon.plugin.load) == "function") addon.plugin.load();
            }
            catch (error) {
                this.state[addon.id] = false;
                return new AddonError(addon.name, addon.filename, "load() could not be fired.", {message: error.message, stack: error.stack});
            }
        }
        catch (error) {return new AddonError(addon.name, addon.filename, "Could not be constructed.", {message: error.message, stack: error.stack});}
    }

    getFileModification(module, fileContent, meta) {
        module._compile(fileContent, module.filename);
        const didExport = !Utilities.isEmpty(module.exports);
        if (didExport) {
            meta.type = module.exports;
            module.exports = meta;
            return "";
        }
        Logger.warn(this.name, `${meta.name}, please start assigning module.exports`);
        fileContent += `\nmodule.exports = ${JSON.stringify(meta)};\nmodule.exports.type = ${meta.exports || meta.name};`;
        return fileContent;
    }

    startAddon(id) {return this.startPlugin(id);}
    stopAddon(id) {return this.stopPlugin(id);}
    getAddon(id) {return this.getPlugin(id);}

    startPlugin(idOrAddon) {
        const addon = typeof(idOrAddon) == "string" ? this.addonList.find(p => p.id == idOrAddon) : idOrAddon;
        if (!addon) return;
        const plugin = addon.plugin;
        try {
            plugin.start();
        }
        catch (err) {
            this.state[addon.id] = false;
            Toasts.error(Strings.Addons.couldNotStart.format({name: addon.name, version: addon.version}));
            Logger.stacktrace(this.name, addon.name + " could not be started.", err);
            return new AddonError(addon.name, addon.filename, Strings.Addons.enabled.format({method: "start()"}), {message: err.message, stack: err.stack});
        }
        this.emit("started", addon.id);
        Toasts.show(Strings.Addons.enabled.format({name: addon.name, version: addon.version}));
    }

    stopPlugin(idOrAddon) {
        const addon = typeof(idOrAddon) == "string" ? this.addonList.find(p => p.id == idOrAddon) : idOrAddon;
        if (!addon) return;
        const plugin = addon.plugin;
        try {
            plugin.stop();
        }
        catch (err) {
            this.state[addon.id] = false;
            Toasts.error(Strings.Addons.couldNotStop.format({name: addon.name, version: addon.version}));
            Logger.stacktrace(this.name, addon.name + " could not be stopped.", err);
            return new AddonError(addon.name, addon.filename, Strings.Addons.enabled.format({method: "stop()"}), {message: err.message, stack: err.stack});
        }
        this.emit("stopped", addon.id);
        Toasts.show(Strings.Addons.disabled.format({name: addon.name, version: addon.version}));
    }

    getPlugin(idOrFile) {
        const addon = this.addonList.find(c => c.id == idOrFile || c.filename == idOrFile);
        if (!addon) return;
        return addon.plugin;
    }

    setupFunctions() {
        electronRemote.getCurrentWebContents().on("did-navigate-in-page", this.onSwitch.bind(this));
        this.observer.observe(document, {
            childList: true,
            subtree: true
        });
    }

    onSwitch() {
        this.emit("page-switch");
        for (let i = 0; i < this.addonList.length; i++) {
            const plugin = this.addonList[i].plugin;
            if (!this.state[this.addonList[i].id]) continue;
            if (typeof(plugin.onSwitch) === "function") {
                try {plugin.onSwitch();}
                catch (err) {Logger.stacktrace(this.name, "Unable to fire onSwitch for " + this.addonList[i].name + ".", err);}
            }
        }
    }

    onMutation(mutation) {
        for (let i = 0; i < this.addonList.length; i++) {
            const plugin = this.addonList[i].plugin;
            if (!this.state[this.addonList[i].id]) continue;
            if (typeof plugin.observer === "function") {
                try {plugin.observer(mutation);}
                catch (err) {Logger.stacktrace(this.name, "Unable to fire observer for " + this.addonList[i].name + ".", err);}
            }
        }
    }
};
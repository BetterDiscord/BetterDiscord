import {SettingsCookie, PluginCookie, Plugins} from "data";
import ContentManager from "./contentmanager";
import Utilities from "./utilities";
import Emitter from "./emitter";
import DataStore from "./datastore";
import {Toasts, Modals} from "ui";

function PluginModule() {

}

PluginModule.prototype.loadPlugins = function () {
    this.loadPluginData();
    const errors = ContentManager.loadPlugins();
    const plugins = Object.keys(Plugins);
    for (let i = 0; i < plugins.length; i++) {
        let plugin, name;

        try {
            plugin = Plugins[plugins[i]].plugin;
            name = plugin.getName();
            if (plugin.load && typeof(plugin.load) == "function") plugin.load();
        }
        catch (err) {
            PluginCookie[name] = false;
            Utilities.err("Plugins", name + " could not be loaded.", err);
            errors.push({name: name, file: Plugins[plugins[i]].filename, message: "load() could not be fired.", error: {message: err.message, stack: err.stack}});
            continue;
        }

        if (!PluginCookie[name]) PluginCookie[name] = false;

        if (PluginCookie[name]) {
            try {
                plugin.start();
                if (SettingsCookie["fork-ps-2"]) Toasts.show(`${plugin.getName()} v${plugin.getVersion()} has started.`);
            }
            catch (err) {
                PluginCookie[name] = false;
                Utilities.err("Plugins", name + " could not be started.", err);
                errors.push({name: name, file: Plugins[plugins[i]].filename, message: "start() could not be fired.", error: {message: err.message, stack: err.stack}});
            }
        }
    }
    this.savePluginData();

    require("electron").remote.getCurrentWebContents().on("did-navigate-in-page", this.channelSwitch.bind(this));
    // if (SettingsCookie["fork-ps-5"]) ContentManager.watchContent("plugin");
    return errors;
};

PluginModule.prototype.startPlugin = function(plugin, reload = false) {
    try {
        Plugins[plugin].plugin.start();
        if (SettingsCookie["fork-ps-2"] && !reload) Toasts.show(`${Plugins[plugin].plugin.getName()} v${Plugins[plugin].plugin.getVersion()} has started.`);
    }
    catch (err) {
        if (SettingsCookie["fork-ps-2"] && !reload) Toasts.show(`${Plugins[plugin].plugin.getName()} v${Plugins[plugin].plugin.getVersion()} could not be started.`, {type: "error"});
        PluginCookie[plugin] = false;
        this.savePluginData();
        Utilities.err("Plugins", plugin + " could not be started.", err);
    }
};

PluginModule.prototype.stopPlugin = function(plugin, reload = false) {
    try {
        Plugins[plugin].plugin.stop();
        if (SettingsCookie["fork-ps-2"] && !reload) Toasts.show(`${Plugins[plugin].plugin.getName()} v${Plugins[plugin].plugin.getVersion()} has stopped.`);
    }
    catch (err) {
        if (SettingsCookie["fork-ps-2"] && !reload) Toasts.show(`${Plugins[plugin].plugin.getName()} v${Plugins[plugin].plugin.getVersion()} could not be stopped.`, {type: "error"});
        Utilities.err("Plugins", Plugins[plugin].plugin.getName() + " could not be stopped.", err);
    }
};

PluginModule.prototype.enablePlugin = function (plugin, reload = false) {
    if (PluginCookie[plugin]) return;
    PluginCookie[plugin] = true;
    this.savePluginData();
    this.startPlugin(plugin, reload);
};

PluginModule.prototype.disablePlugin = function (plugin, reload = false) {
    if (!PluginCookie[plugin]) return;
    PluginCookie[plugin] = false;
    this.savePluginData();
    this.stopPlugin(plugin, reload);
};

PluginModule.prototype.togglePlugin = function (plugin) {
    if (PluginCookie[plugin]) this.disablePlugin(plugin);
    else this.enablePlugin(plugin);
};

PluginModule.prototype.loadPlugin = function(filename) {
    const error = ContentManager.loadContent(filename, "plugin");
    if (error) {
        if (SettingsCookie["fork-ps-1"]) Modals.showContentErrors({plugins: [error]});
        if (SettingsCookie["fork-ps-2"]) Toasts.show(`${filename} could not be loaded.`, {type: "error"});
        return Utilities.err("ContentManager", `${filename} could not be loaded.`, error);
    }
    const plugin = Object.values(Plugins).find(p => p.filename == filename).plugin;
    try { if (plugin.load && typeof(plugin.load) == "function") plugin.load();}
    catch (err) {if (SettingsCookie["fork-ps-1"]) Modals.showContentErrors({plugins: [err]});}
    Utilities.log("ContentManager", `${plugin.getName()} v${plugin.getVersion()} was loaded.`);
    if (SettingsCookie["fork-ps-2"]) Toasts.show(`${plugin.getName()} v${plugin.getVersion()} was loaded.`, {type: "success"});
    Emitter.dispatch("plugin-loaded", plugin.getName());
};

PluginModule.prototype.unloadPlugin = function(filenameOrName) {
    const bdplugin = Object.values(Plugins).find(p => p.filename == filenameOrName) || Plugins[filenameOrName];
    if (!bdplugin) return;
    const plugin = bdplugin.plugin.getName();
    if (PluginCookie[plugin]) this.disablePlugin(plugin, true);
    const error = ContentManager.unloadContent(Plugins[plugin].filename, "plugin");
    delete Plugins[plugin];
    if (error) {
        if (SettingsCookie["fork-ps-1"]) Modals.showContentErrors({plugins: [error]});
        if (SettingsCookie["fork-ps-2"]) Toasts.show(`${plugin} could not be unloaded. It may have not been loaded yet.`, {type: "error"});
        return Utilities.err("ContentManager", `${plugin} could not be unloaded. It may have not been loaded yet.`, error);
    }
    Utilities.log("ContentManager", `${plugin} was unloaded.`);
    if (SettingsCookie["fork-ps-2"]) Toasts.show(`${plugin} was unloaded.`, {type: "success"});
    Emitter.dispatch("plugin-unloaded", plugin);
};

PluginModule.prototype.reloadPlugin = function(filenameOrName) {
    const bdplugin = Object.values(Plugins).find(p => p.filename == filenameOrName) || Plugins[filenameOrName];
    if (!bdplugin) return this.loadPlugin(filenameOrName);
    const plugin = bdplugin.plugin.getName();
    const enabled = PluginCookie[plugin];
    if (enabled) this.stopPlugin(plugin, true);
    const error = ContentManager.reloadContent(Plugins[plugin].filename, "plugin");
    if (error) {
        if (SettingsCookie["fork-ps-1"]) Modals.showContentErrors({plugins: [error]});
        if (SettingsCookie["fork-ps-2"]) Toasts.show(`${plugin} could not be reloaded.`, {type: "error"});
        return Utilities.err("ContentManager", `${plugin} could not be reloaded.`, error);
    }
    if (Plugins[plugin].plugin.load && typeof(Plugins[plugin].plugin.load) == "function") Plugins[plugin].plugin.load();
    if (enabled) this.startPlugin(plugin, true);
    Utilities.log("ContentManager", `${plugin} v${Plugins[plugin].plugin.getVersion()} was reloaded.`);
    if (SettingsCookie["fork-ps-2"]) Toasts.show(`${plugin} v${Plugins[plugin].plugin.getVersion()} was reloaded.`, {type: "success"});
    Emitter.dispatch("plugin-reloaded", plugin);
};

PluginModule.prototype.updatePluginList = function() {
    const results = ContentManager.loadNewContent("plugin");
    for (const filename of results.added) this.loadPlugin(filename);
    for (const name of results.removed) this.unloadPlugin(name);
};

PluginModule.prototype.loadPluginData = function () {
    const saved = DataStore.getSettingGroup("plugins");
    if (!saved) return;
    Object.assign(PluginCookie, saved);
};

PluginModule.prototype.savePluginData = function () {
    DataStore.setSettingGroup("plugins", PluginCookie);
};

PluginModule.prototype.newMessage = function () {
    const plugins = Object.keys(Plugins);
    for (let i = 0; i < plugins.length; i++) {
        const plugin = Plugins[plugins[i]].plugin;
        if (!PluginCookie[plugin.getName()]) continue;
        if (typeof plugin.onMessage === "function") {
            try { plugin.onMessage(); }
            catch (err) { Utilities.err("Plugins", "Unable to fire onMessage for " + plugin.getName() + ".", err); }
        }
    }
};

PluginModule.prototype.channelSwitch = function () {
    const plugins = Object.keys(Plugins);
    for (let i = 0; i < plugins.length; i++) {
        const plugin = Plugins[plugins[i]].plugin;
        if (!PluginCookie[plugin.getName()]) continue;
        if (typeof plugin.onSwitch === "function") {
            try { plugin.onSwitch(); }
            catch (err) { Utilities.err("Plugins", "Unable to fire onSwitch for " + plugin.getName() + ".", err); }
        }
    }
};

PluginModule.prototype.rawObserver = function(e) {
    const plugins = Object.keys(Plugins);
    for (let i = 0; i < plugins.length; i++) {
        const plugin = Plugins[plugins[i]].plugin;
        if (!PluginCookie[plugin.getName()]) continue;
        if (typeof plugin.observer === "function") {
            try { plugin.observer(e); }
            catch (err) { Utilities.err("Plugins", "Unable to fire observer for " + plugin.getName() + ".", err); }
        }
    }
};

export default new PluginModule();
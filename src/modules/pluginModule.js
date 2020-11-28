import {bdpluginErrors, pluginCookie, settingsCookie, bdplugins} from "../0globals";
import ContentManager from "./contentManager";
import DataStore from "./dataStore";
import BDEvents from "./bdEvents";
import Utils from "./utils";

class PluginModule {
    get folder() {return ContentManager.pluginsFolder;}
}

PluginModule.prototype.loadPlugins = function () {
    this.loadPluginData();
    bdpluginErrors.splice(0, 0, ...ContentManager.loadPlugins());
    const plugins = Object.keys(bdplugins);
    for (let i = 0; i < plugins.length; i++) {
        let plugin, name;

        const addon = bdplugins[plugins[i]];
        try {
            plugin = addon.plugin;
            name = addon.name;
            if (plugin.load && typeof(plugin.load) == "function") plugin.load();
        }
        catch (err) {
            pluginCookie[name] = false;
            Utils.err("Plugins", name + " could not be loaded.", err);
            bdpluginErrors.push({name: name, file: addon.filename, message: "load() could not be fired.", error: {message: err.message, stack: err.stack}});
            continue;
        }

        if (!pluginCookie[name]) pluginCookie[name] = false;

        if (pluginCookie[name]) {
            try {
                plugin.start();
                if (settingsCookie["fork-ps-2"]) Utils.showToast(`${addon.name} v${addon.version} has started.`);
            }
            catch (err) {
                pluginCookie[name] = false;
                Utils.err("Plugins", name + " could not be started.", err);
                bdpluginErrors.push({name: name, file: addon.filename, message: "start() could not be fired.", error: {message: err.message, stack: err.stack}});
            }
        }
    }
    this.savePluginData();

    require("electron").remote.getCurrentWebContents().on("did-navigate-in-page", this.channelSwitch.bind(this));
    // if (settingsCookie["fork-ps-5"]) ContentManager.watchContent("plugin");
};

PluginModule.prototype.startPlugin = function(plugin, reload = false) {
    try {
        bdplugins[plugin].plugin.start();
        if (settingsCookie["fork-ps-2"] && !reload) Utils.showToast(`${bdplugins[plugin].name} v${bdplugins[plugin].version} has started.`);
    }
    catch (err) {
        if (settingsCookie["fork-ps-2"] && !reload) Utils.showToast(`${bdplugins[plugin].name} v${bdplugins[plugin].version} could not be started.`, {type: "error"});
        pluginCookie[plugin] = false;
        this.savePluginData();
        Utils.err("Plugins", plugin + " could not be started.", err);
    }
};

PluginModule.prototype.stopPlugin = function(plugin, reload = false) {
    try {
        bdplugins[plugin].plugin.stop();
        if (settingsCookie["fork-ps-2"] && !reload) Utils.showToast(`${bdplugins[plugin].name} v${bdplugins[plugin].version} has stopped.`);
    }
    catch (err) {
        if (settingsCookie["fork-ps-2"] && !reload) Utils.showToast(`${bdplugins[plugin].name} v${bdplugins[plugin].version} could not be stopped.`, {type: "error"});
        Utils.err("Plugins", bdplugins[plugin].name + " could not be stopped.", err);
    }
};

PluginModule.prototype.enablePlugin = function (plugin, reload = false) {
    if (pluginCookie[plugin]) return;
    pluginCookie[plugin] = true;
    this.savePluginData();
    this.startPlugin(plugin, reload);
};

PluginModule.prototype.enable = function (plugin, reload = false) {
    return this.enablePlugin(plugin, reload);
};

PluginModule.prototype.disablePlugin = function (plugin, reload = false) {
    if (!pluginCookie[plugin]) return;
    pluginCookie[plugin] = false;
    this.savePluginData();
    this.stopPlugin(plugin, reload);
};

PluginModule.prototype.disable = function (plugin, reload = false) {
    return this.disablePlugin(plugin, reload);
};

PluginModule.prototype.togglePlugin = function (plugin) {
    if (pluginCookie[plugin]) this.disablePlugin(plugin);
    else this.enablePlugin(plugin);
};

PluginModule.prototype.toggle = function (plugin, reload = false) {
    return this.togglePlugin(plugin, reload);
};

PluginModule.prototype.loadPlugin = function(filename) {
    const error = ContentManager.loadContent(filename, "plugin");
    if (error) {
        if (settingsCookie["fork-ps-1"]) Utils.showContentErrors({plugins: [error]});
        if (settingsCookie["fork-ps-2"]) Utils.showToast(`${filename} could not be loaded.`, {type: "error"});
        return Utils.err("ContentManager", `${filename} could not be loaded.`, error);
    }
    const addon = Object.values(bdplugins).find(p => p.filename == filename);
    const plugin = addon.plugin;
    try { if (plugin.load && typeof(plugin.load) == "function") plugin.load();}
    catch (err) {if (settingsCookie["fork-ps-1"]) Utils.showContentErrors({plugins: [err]});}
    Utils.log("ContentManager", `${addon.name} v${addon.version} was loaded.`);
    if (settingsCookie["fork-ps-2"]) Utils.showToast(`${addon.name} v${addon.version} was loaded.`, {type: "success"});
    BDEvents.dispatch("plugin-loaded", addon.name);
};

PluginModule.prototype.unloadPlugin = function(filenameOrName) {
    const addon = Object.values(bdplugins).find(p => p.filename == filenameOrName) || bdplugins[filenameOrName];
    if (!addon) return;
    const plugin = addon.name;
    if (pluginCookie[plugin]) this.disablePlugin(plugin, true);
    const error = ContentManager.unloadContent(bdplugins[plugin].filename, "plugin");
    delete bdplugins[plugin];
    if (error) {
        if (settingsCookie["fork-ps-1"]) Utils.showContentErrors({plugins: [error]});
        if (settingsCookie["fork-ps-2"]) Utils.showToast(`${plugin} could not be unloaded. It may have not been loaded yet.`, {type: "error"});
        return Utils.err("ContentManager", `${plugin} could not be unloaded. It may have not been loaded yet.`, error);
    }
    Utils.log("ContentManager", `${plugin} was unloaded.`);
    if (settingsCookie["fork-ps-2"]) Utils.showToast(`${plugin} was unloaded.`, {type: "success"});
    BDEvents.dispatch("plugin-unloaded", plugin);
};

PluginModule.prototype.delete = function(filenameOrName) {
    const bdplugin = Object.values(bdplugins).find(p => p.filename == filenameOrName) || bdplugins[filenameOrName];
    if (!bdplugin) return;
    this.unloadPlugin(bdplugin.filename);
    const fullPath = require("path").resolve(ContentManager.pluginsFolder, bdplugin.filename);
    require("fs").unlinkSync(fullPath);
};

PluginModule.prototype.reloadPlugin = function(filenameOrName) {
    const bdplugin = Object.values(bdplugins).find(p => p.filename == filenameOrName) || bdplugins[filenameOrName];
    if (!bdplugin) return this.loadPlugin(filenameOrName);
    const plugin = bdplugin.name;
    const enabled = pluginCookie[plugin];
    if (enabled) this.stopPlugin(plugin, true);
    const error = ContentManager.reloadContent(bdplugins[plugin].filename, "plugin");
    if (error) {
        if (settingsCookie["fork-ps-1"]) Utils.showContentErrors({plugins: [error]});
        if (settingsCookie["fork-ps-2"]) Utils.showToast(`${plugin} could not be reloaded.`, {type: "error"});
        return Utils.err("ContentManager", `${plugin} could not be reloaded.`, error);
    }
    if (bdplugins[plugin].plugin.load && typeof(bdplugins[plugin].plugin.load) == "function") bdplugins[plugin].plugin.load();
    if (enabled) this.startPlugin(plugin, true);
    Utils.log("ContentManager", `${plugin} v${bdplugins[plugin].version} was reloaded.`);
    if (settingsCookie["fork-ps-2"]) Utils.showToast(`${plugin} v${bdplugins[plugin].version} was reloaded.`, {type: "success"});
    BDEvents.dispatch("plugin-reloaded", plugin);
};

PluginModule.prototype.reload = function(name) {
    return this.reloadPlugin(name);
};

PluginModule.prototype.edit = function(filenameOrName) {
    console.log("Edit " + filenameOrName);
    const bdplugin = Object.values(bdplugins).find(p => p.filename == filenameOrName) || bdplugins[filenameOrName];
    if (!bdplugin) return;
    const fullPath = require("path").resolve(ContentManager.pluginsFolder, bdplugin.filename);
    console.log("Edit " + fullPath);
    require("electron").shell.openItem(`${fullPath}`);
};

PluginModule.prototype.updatePluginList = function() {
    const results = ContentManager.loadNewContent("plugin");
    for (const filename of results.added) this.loadPlugin(filename);
    for (const name of results.removed) this.unloadPlugin(name);
};

PluginModule.prototype.loadPluginData = function () {
    const saved = DataStore.getSettingGroup("plugins");
    if (saved) {
        Object.assign(pluginCookie, saved);
    }
};

PluginModule.prototype.savePluginData = function () {
    DataStore.setSettingGroup("plugins", pluginCookie);
};

PluginModule.prototype.newMessage = function () {
    const plugins = Object.keys(bdplugins);
    for (let i = 0; i < plugins.length; i++) {
        const addon = bdplugins[plugins[i]];
        const plugin = addon.plugin;
        if (!pluginCookie[addon.name]) continue;
        if (typeof plugin.onMessage === "function") {
            try { plugin.onMessage(); }
            catch (err) { Utils.err("Plugins", "Unable to fire onMessage for " + addon.name + ".", err); }
        }
    }
};

PluginModule.prototype.channelSwitch = function () {
    const plugins = Object.keys(bdplugins);
    for (let i = 0; i < plugins.length; i++) {
        const addon = bdplugins[plugins[i]];
        const plugin = addon.plugin;
        if (!pluginCookie[addon.name]) continue;
        if (typeof plugin.onSwitch === "function") {
            try { plugin.onSwitch(); }
            catch (err) { Utils.err("Plugins", "Unable to fire onSwitch for " + addon.name + ".", err); }
        }
    }
};

PluginModule.prototype.rawObserver = function(e) {
    const plugins = Object.keys(bdplugins);
    for (let i = 0; i < plugins.length; i++) {
        const addon = bdplugins[plugins[i]];
        const plugin = addon.plugin;
        if (!pluginCookie[addon.name]) continue;
        if (typeof plugin.observer === "function") {
            try { plugin.observer(e); }
            catch (err) { Utils.err("Plugins", "Unable to fire observer for " + addon.name + ".", err); }
        }
    }
};

export default new PluginModule();
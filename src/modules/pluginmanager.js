var pluginCookie = {};

function PluginModule() {

}

PluginModule.prototype.loadPlugins = function () {
    this.loadPluginData();
    const errors = ContentManager.loadPlugins();
    var plugins = Object.keys(bdplugins);
    for (var i = 0; i < plugins.length; i++) {
        var plugin, name;

        try {
            plugin = bdplugins[plugins[i]].plugin;
            name = plugin.getName();
            if (plugin.load && typeof(plugin.load) == "function") plugin.load();
        }
        catch (err) {
            pluginCookie[name] = false;
            Utils.err("Plugins", name + " could not be loaded.", err);
            errors.push({name: name, file: bdplugins[plugins[i]].filename, message: "load() could not be fired.", error: {message: err.message, stack: err.stack}});
            continue;
        }

        if (!pluginCookie[name]) pluginCookie[name] = false;

        if (pluginCookie[name]) {
            try {
                plugin.start();
                if (settingsCookie["fork-ps-2"]) mainCore.showToast(`${plugin.getName()} v${plugin.getVersion()} has started.`);
            }
            catch (err) {
                pluginCookie[name] = false;
                Utils.err("Plugins", name + " could not be started.", err);
                errors.push({name: name, file: bdplugins[plugins[i]].filename, message: "start() could not be fired.", error: {message: err.message, stack: err.stack}});
            }
        }
    }
    this.savePluginData();

    require("electron").remote.getCurrentWebContents().on("did-navigate-in-page", this.channelSwitch.bind(this));
    // if (settingsCookie["fork-ps-5"]) ContentManager.watchContent("plugin");
    return errors;
};

PluginModule.prototype.startPlugin = function(plugin, reload = false) {
    try {
        bdplugins[plugin].plugin.start();
        if (settingsCookie["fork-ps-2"] && !reload) mainCore.showToast(`${bdplugins[plugin].plugin.getName()} v${bdplugins[plugin].plugin.getVersion()} has started.`);
    }
    catch (err) {
        if (settingsCookie["fork-ps-2"] && !reload) mainCore.showToast(`${bdplugins[plugin].plugin.getName()} v${bdplugins[plugin].plugin.getVersion()} could not be started.`, {type: "error"});
        pluginCookie[plugin] = false;
        this.savePluginData();
        Utils.err("Plugins", name + " could not be started.", err);
    }
};

PluginModule.prototype.stopPlugin = function(plugin, reload = false) {
    try {
        bdplugins[plugin].plugin.stop();
        if (settingsCookie["fork-ps-2"] && !reload) mainCore.showToast(`${bdplugins[plugin].plugin.getName()} v${bdplugins[plugin].plugin.getVersion()} has stopped.`);
    }
    catch (err) {
        if (settingsCookie["fork-ps-2"] && !reload) mainCore.showToast(`${bdplugins[plugin].plugin.getName()} v${bdplugins[plugin].plugin.getVersion()} could not be stopped.`, {type: "error"});
        Utils.err("Plugins", bdplugins[plugin].plugin.getName() + " could not be stopped.", err);
    }
};

PluginModule.prototype.enablePlugin = function (plugin, reload = false) {
    if (pluginCookie[plugin]) return;
    pluginCookie[plugin] = true;
    this.savePluginData();
    this.startPlugin(plugin, reload);
};

PluginModule.prototype.disablePlugin = function (plugin, reload = false) {
    if (!pluginCookie[plugin]) return;
    pluginCookie[plugin] = false;
    this.savePluginData();
    this.stopPlugin(plugin, reload);
};

PluginModule.prototype.togglePlugin = function (plugin) {
    if (pluginCookie[plugin]) this.disablePlugin(plugin);
    else this.enablePlugin(plugin);
};

PluginModule.prototype.loadPlugin = function(filename) {
    const error = ContentManager.loadContent(filename, "plugin");
    if (error) {
        if (settingsCookie["fork-ps-1"]) mainCore.showContentErrors({plugins: [error]});
        if (settingsCookie["fork-ps-2"]) BdApi.showToast(`${filename} could not be loaded.`, {type: "error"});
        return Utils.err("ContentManager", `${filename} could not be loaded.`, error);
    }
    const plugin = Object.values(bdplugins).find(p => p.filename == filename).plugin;
    try { if (plugin.load && typeof(plugin.load) == "function") plugin.load();}
    catch (err) {if (settingsCookie["fork-ps-1"]) mainCore.showContentErrors({plugins: [err]});}
    Utils.log("ContentManager", `${plugin.getName()} v${plugin.getVersion()} was loaded.`);
    if (settingsCookie["fork-ps-2"]) BdApi.showToast(`${plugin.getName()} v${plugin.getVersion()} was loaded.`, {type: "success"});
    BDEvents.dispatch("plugin-loaded", plugin.getName());
};

PluginModule.prototype.unloadPlugin = function(filenameOrName) {
    const bdplugin = Object.values(bdplugins).find(p => p.filename == filenameOrName) || bdplugins[filenameOrName];
    if (!bdplugin) return;
    const plugin = bdplugin.plugin.getName();
    if (pluginCookie[plugin]) this.disablePlugin(plugin, true);
    const error = ContentManager.unloadContent(bdplugins[plugin].filename, "plugin");
    delete bdplugins[plugin];
    if (error) {
        if (settingsCookie["fork-ps-1"]) mainCore.showContentErrors({plugins: [error]});
        if (settingsCookie["fork-ps-2"]) BdApi.showToast(`${plugin} could not be unloaded. It may have not been loaded yet.`, {type: "error"});
        return Utils.err("ContentManager", `${plugin} could not be unloaded. It may have not been loaded yet.`, error);
    }
    Utils.log("ContentManager", `${plugin} was unloaded.`);
    if (settingsCookie["fork-ps-2"]) BdApi.showToast(`${plugin} was unloaded.`, {type: "success"});
    BDEvents.dispatch("plugin-unloaded", plugin);
};

PluginModule.prototype.reloadPlugin = function(filenameOrName) {
    const bdplugin = Object.values(bdplugins).find(p => p.filename == filenameOrName) || bdplugins[filenameOrName];
    if (!bdplugin) return this.loadPlugin(filenameOrName);
    const plugin = bdplugin.plugin.getName();
    const enabled = pluginCookie[plugin];
    if (enabled) this.stopPlugin(plugin, true);
    const error = ContentManager.reloadContent(bdplugins[plugin].filename, "plugin");
    if (error) {
        if (settingsCookie["fork-ps-1"]) mainCore.showContentErrors({plugins: [error]});
        if (settingsCookie["fork-ps-2"]) BdApi.showToast(`${plugin} could not be reloaded.`, {type: "error"});
        return Utils.err("ContentManager", `${plugin} could not be reloaded.`, error);
    }
    if (bdplugins[plugin].plugin.load && typeof(bdplugins[plugin].plugin.load) == "function") bdplugins[plugin].plugin.load();
    if (enabled) this.startPlugin(plugin, true);
    Utils.log("ContentManager", `${plugin} v${bdplugins[plugin].plugin.getVersion()} was reloaded.`);
    if (settingsCookie["fork-ps-2"]) BdApi.showToast(`${plugin} v${bdplugins[plugin].plugin.getVersion()} was reloaded.`, {type: "success"});
    BDEvents.dispatch("plugin-reloaded", plugin);
};

PluginModule.prototype.updatePluginList = function() {
    const results = ContentManager.loadNewContent("plugin");
    for (const filename of results.added) this.loadPlugin(filename);
    for (const name of results.removed) this.unloadPlugin(name);
};

PluginModule.prototype.loadPluginData = function () {
    let saved = DataStore.getSettingGroup("plugins");
    if (saved) {
        pluginCookie = saved;
    }
};

PluginModule.prototype.savePluginData = function () {
    DataStore.setSettingGroup("plugins", pluginCookie);
};

PluginModule.prototype.newMessage = function () {
    var plugins = Object.keys(bdplugins);
    for (var i = 0; i < plugins.length; i++) {
        var plugin = bdplugins[plugins[i]].plugin;
        if (!pluginCookie[plugin.getName()]) continue;
        if (typeof plugin.onMessage === "function") {
            try { plugin.onMessage(); }
            catch (err) { Utils.err("Plugins", "Unable to fire onMessage for " + plugin.getName() + ".", err); }
        }
    }
};

PluginModule.prototype.channelSwitch = function () {
    var plugins = Object.keys(bdplugins);
    for (var i = 0; i < plugins.length; i++) {
        var plugin = bdplugins[plugins[i]].plugin;
        if (!pluginCookie[plugin.getName()]) continue;
        if (typeof plugin.onSwitch === "function") {
            try { plugin.onSwitch(); }
            catch (err) { Utils.err("Plugins", "Unable to fire onSwitch for " + plugin.getName() + ".", err); }
        }
    }
};

PluginModule.prototype.rawObserver = function(e) {
    var plugins = Object.keys(bdplugins);
    for (var i = 0; i < plugins.length; i++) {
        var plugin = bdplugins[plugins[i]].plugin;
        if (!pluginCookie[plugin.getName()]) continue;
        if (typeof plugin.observer === "function") {
            try { plugin.observer(e); }
            catch (err) { Utils.err("Plugins", "Unable to fire observer for " + plugin.getName() + ".", err); }
        }
    }
};

export default PluginModule;
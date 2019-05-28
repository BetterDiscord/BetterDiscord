var themeCookie = {};

function ThemeModule() {

}

ThemeModule.prototype.loadThemes = function () {
    this.loadThemeData();
    bdthemeErrors = ContentManager.loadThemes();
    var themes = Object.keys(bdthemes);

    for (var i = 0; i < themes.length; i++) {
        var name = bdthemes[themes[i]].name;
        if (!themeCookie[name]) themeCookie[name] = false;
        if (themeCookie[name]) $("head").append($("<style>", {id: Utils.escapeID(name), text: unescape(bdthemes[name].css)}));
    }
    for (let theme in themeCookie) {
        if (!bdthemes[theme]) delete themeCookie[theme];
    }
    this.saveThemeData();
    // if (settingsCookie["fork-ps-5"]) ContentManager.watchContent("theme");
};

ThemeModule.prototype.enableTheme = function(theme, reload = false) {
    themeCookie[theme] = true;
    this.saveThemeData();
    $("head").append($("<style>", {id: Utils.escapeID(theme), text: unescape(bdthemes[theme].css)}));
    if (settingsCookie["fork-ps-2"] && !reload) mainCore.showToast(`${bdthemes[theme].name} v${bdthemes[theme].version} has been applied.`);
};

ThemeModule.prototype.disableTheme = function(theme, reload = false) {
    themeCookie[theme] = false;
    this.saveThemeData();
    $(`#${Utils.escapeID(bdthemes[theme].name)}`).remove();
    if (settingsCookie["fork-ps-2"] && !reload) mainCore.showToast(`${bdthemes[theme].name} v${bdthemes[theme].version} has been disabled.`);
};

ThemeModule.prototype.toggleTheme = function(theme) {
    if (themeCookie[theme]) this.disableTheme(theme);
    else this.enableTheme(theme);
};

ThemeModule.prototype.loadTheme = function(filename) {
    const error = ContentManager.loadContent(filename, "theme");
    if (error) {
        if (settingsCookie["fork-ps-1"]) mainCore.showContentErrors({themes: [error]});
        if (settingsCookie["fork-ps-2"]) BdApi.showToast(`${filename} could not be loaded. It may not have been loaded.`, {type: "error"});
        return Utils.err("ContentManager", `${filename} could not be loaded.`, error);
    }
    const theme = Object.values(bdthemes).find(p => p.filename == filename);
    Utils.log("ContentManager", `${theme.name} v${theme.version} was loaded.`);
    if (settingsCookie["fork-ps-2"]) BdApi.showToast(`${theme.name} v${theme.version} was loaded.`, {type: "success"});
    BDEvents.dispatch("theme-loaded", theme.name);
};

ThemeModule.prototype.unloadTheme = function(filenameOrName) {
    const bdtheme = Object.values(bdthemes).find(p => p.filename == filenameOrName) || bdthemes[filenameOrName];
    if (!bdtheme) return;
    const theme = bdtheme.name;
    if (themeCookie[theme]) this.disableTheme(theme, true);
    const error = ContentManager.unloadContent(bdthemes[theme].filename, "theme");
    delete bdthemes[theme];
    if (error) {
        if (settingsCookie["fork-ps-1"]) mainCore.showContentErrors({themes: [error]});
        if (settingsCookie["fork-ps-2"]) BdApi.showToast(`${theme} could not be unloaded. It may have not been loaded yet.`, {type: "error"});
        return Utils.err("ContentManager", `${theme} could not be unloaded. It may have not been loaded yet.`, error);
    }
    Utils.log("ContentManager", `${theme} was unloaded.`);
    if (settingsCookie["fork-ps-2"]) BdApi.showToast(`${theme} was unloaded.`, {type: "success"});
    BDEvents.dispatch("theme-unloaded", theme);
};

ThemeModule.prototype.reloadTheme = function(filenameOrName) {
    const bdtheme = Object.values(bdthemes).find(p => p.filename == filenameOrName) || bdthemes[filenameOrName];
    if (!bdtheme) return this.loadTheme(filenameOrName);
    const theme = bdtheme.name;
    const error = ContentManager.reloadContent(bdthemes[theme].filename, "theme");
    if (themeCookie[theme]) this.disableTheme(theme, true), this.enableTheme(theme, true);
    if (error) {
        if (settingsCookie["fork-ps-1"]) mainCore.showContentErrors({themes: [error]});
        if (settingsCookie["fork-ps-2"]) BdApi.showToast(`${theme} could not be reloaded.`, {type: "error"});
        return Utils.err("ContentManager", `${theme} could not be reloaded.`, error);
    }
    Utils.log("ContentManager", `${theme} v${bdthemes[theme].version} was reloaded.`);
    if (settingsCookie["fork-ps-2"]) BdApi.showToast(`${theme} v${bdthemes[theme].version} was reloaded.`, {type: "success"});
    BDEvents.dispatch("theme-reloaded", theme);
};

ThemeModule.prototype.updateThemeList = function() {
    const results = ContentManager.loadNewContent("theme");
    for (const filename of results.added) this.loadTheme(filename);
    for (const name of results.removed) this.unloadTheme(name);
};

ThemeModule.prototype.loadThemeData = function() {
    let saved = DataStore.getSettingGroup("themes");
    if (saved) {
        themeCookie = saved;
    }
};

ThemeModule.prototype.saveThemeData = function () {
    DataStore.setSettingGroup("themes", themeCookie);
};
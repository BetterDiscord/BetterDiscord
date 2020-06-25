import {bdthemeErrors, themeCookie, settingsCookie, bdthemes} from "../0globals";
import ContentManager from "./contentManager";
import DataStore from "./dataStore";
import BDEvents from "./bdEvents";
import Utils from "./utils";
import DOM from "./domtools";

class ThemeModule {
    get folder() {return ContentManager.themesFolder;}
}

ThemeModule.prototype.loadThemes = function () {
    this.loadThemeData();
    bdthemeErrors.splice(0, 0, ...ContentManager.loadThemes());
    const themes = Object.keys(bdthemes);

    for (let i = 0; i < themes.length; i++) {
        const theme = bdthemes[themes[i]];
        if (!themeCookie[theme.name]) themeCookie[theme.name] = false;
        if (themeCookie[theme.name]) DOM.addStyle(DOM.escapeID(theme.id), unescape(theme.css));
    }
    for (const theme in themeCookie) {
        if (!bdthemes[theme]) delete themeCookie[theme];
    }
    this.saveThemeData();
    // if (settingsCookie["fork-ps-5"]) ContentManager.watchContent("theme");
};

ThemeModule.prototype.enableTheme = function(name, reload = false) {
    themeCookie[name] = true;
    this.saveThemeData();
    const theme = bdthemes[name];
    DOM.addStyle(DOM.escapeID(theme.id), unescape(theme.css));
    if (settingsCookie["fork-ps-2"] && !reload) Utils.showToast(`${theme.name} v${theme.version} has been applied.`);
};

ThemeModule.prototype.enable = function (name, reload = false) {
    return this.enableTheme(name, reload);
};

ThemeModule.prototype.disableTheme = function(name, reload = false) {
    themeCookie[name] = false;
    this.saveThemeData();
    const theme = bdthemes[name];
    DOM.removeStyle(DOM.escapeID(theme.id));
    if (settingsCookie["fork-ps-2"] && !reload) Utils.showToast(`${theme.name} v${theme.version} has been disabled.`);
};

ThemeModule.prototype.disable = function (name, reload = false) {
    return this.disableTheme(name, reload);
};

ThemeModule.prototype.toggleTheme = function(theme) {
    if (themeCookie[theme]) this.disableTheme(theme);
    else this.enableTheme(theme);
};

ThemeModule.prototype.toggle = function (name, reload = false) {
    return this.toggleTheme(name, reload);
};

ThemeModule.prototype.loadTheme = function(filename) {
    const error = ContentManager.loadContent(filename, "theme");
    if (error) {
        if (settingsCookie["fork-ps-1"]) Utils.showContentErrors({themes: [error]});
        if (settingsCookie["fork-ps-2"]) Utils.showToast(`${filename} could not be loaded. It may not have been loaded.`, {type: "error"});
        return Utils.err("ContentManager", `${filename} could not be loaded.`, error);
    }
    const theme = Object.values(bdthemes).find(p => p.filename == filename);
    Utils.log("ContentManager", `${theme.name} v${theme.version} was loaded.`);
    if (settingsCookie["fork-ps-2"]) Utils.showToast(`${theme.name} v${theme.version} was loaded.`, {type: "success"});
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
        if (settingsCookie["fork-ps-1"]) Utils.showContentErrors({themes: [error]});
        if (settingsCookie["fork-ps-2"]) Utils.showToast(`${theme} could not be unloaded. It may have not been loaded yet.`, {type: "error"});
        return Utils.err("ContentManager", `${theme} could not be unloaded. It may have not been loaded yet.`, error);
    }
    Utils.log("ContentManager", `${theme} was unloaded.`);
    if (settingsCookie["fork-ps-2"]) Utils.showToast(`${theme} was unloaded.`, {type: "success"});
    BDEvents.dispatch("theme-unloaded", theme);
};

ThemeModule.prototype.delete = function(filenameOrName) {
    const bdplugin = Object.values(bdthemes).find(p => p.filename == filenameOrName) || bdthemes[filenameOrName];
    if (!bdplugin) return;
    this.unloadTheme(bdplugin.filename);
    const fullPath = require("path").resolve(ContentManager.pluginsFolder, bdplugin.filename);
    require("fs").unlinkSync(fullPath);
};

ThemeModule.prototype.reloadTheme = function(filenameOrName) {
    const bdtheme = Object.values(bdthemes).find(p => p.filename == filenameOrName) || bdthemes[filenameOrName];
    if (!bdtheme) return this.loadTheme(filenameOrName);
    const theme = bdtheme.name;
    const error = ContentManager.reloadContent(bdthemes[theme].filename, "theme");
    if (themeCookie[theme]) this.disableTheme(theme, true), this.enableTheme(theme, true);
    if (error) {
        if (settingsCookie["fork-ps-1"]) Utils.showContentErrors({themes: [error]});
        if (settingsCookie["fork-ps-2"]) Utils.showToast(`${theme} could not be reloaded.`, {type: "error"});
        return Utils.err("ContentManager", `${theme} could not be reloaded.`, error);
    }
    Utils.log("ContentManager", `${theme} v${bdthemes[theme].version} was reloaded.`);
    if (settingsCookie["fork-ps-2"]) Utils.showToast(`${theme} v${bdthemes[theme].version} was reloaded.`, {type: "success"});
    BDEvents.dispatch("theme-reloaded", theme);
};

ThemeModule.prototype.reload = function(name) {
    return this.reloadTheme(name);
};

ThemeModule.prototype.edit = function(filenameOrName) {
    const bdplugin = Object.values(bdthemes).find(p => p.filename == filenameOrName) || bdthemes[filenameOrName];
    if (!bdplugin) return;
    const fullPath = require("path").resolve(ContentManager.themesFolder, bdplugin.filename);
    require("electron").shell.openItem(`${fullPath}`);
};

ThemeModule.prototype.updateThemeList = function() {
    const results = ContentManager.loadNewContent("theme");
    for (const filename of results.added) this.loadTheme(filename);
    for (const name of results.removed) this.unloadTheme(name);
};

ThemeModule.prototype.loadThemeData = function() {
    const saved = DataStore.getSettingGroup("themes");
    if (saved) {
        Object.assign(themeCookie, saved);
    }
};

ThemeModule.prototype.saveThemeData = function () {
    DataStore.setSettingGroup("themes", themeCookie);
};

export default new ThemeModule();
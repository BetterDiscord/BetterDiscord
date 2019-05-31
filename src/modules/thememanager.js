import {SettingsCookie, ThemeCookie, Themes} from "data";
import ContentManager from "./contentmanager";
import Utilities from "./utilities";
import Emitter from "./emitter";
import DataStore from "./datastore";
import {Toasts, Modals} from "ui";

function ThemeModule() {

}

ThemeModule.prototype.loadThemes = function () {
    this.loadThemeData();
    const errors = ContentManager.loadThemes();
    const themes = Object.keys(Themes);

    for (let i = 0; i < themes.length; i++) {
        const name = Themes[themes[i]].name;
        if (!ThemeCookie[name]) ThemeCookie[name] = false;
        if (ThemeCookie[name]) $("head").append($("<style>", {id: Utilities.escapeID(name), text: unescape(Themes[name].css)}));
    }
    for (const theme in ThemeCookie) {
        if (!Themes[theme]) delete ThemeCookie[theme];
    }
    this.saveThemeData();
    return errors;
    // if (SettingsCookie["fork-ps-5"]) ContentManager.watchContent("theme");
};

ThemeModule.prototype.enableTheme = function(theme, reload = false) {
    ThemeCookie[theme] = true;
    this.saveThemeData();
    $("head").append($("<style>", {id: Utilities.escapeID(theme), text: unescape(Themes[theme].css)}));
    if (SettingsCookie["fork-ps-2"] && !reload) Toasts.show(`${Themes[theme].name} v${Themes[theme].version} has been applied.`);
};

ThemeModule.prototype.disableTheme = function(theme, reload = false) {
    ThemeCookie[theme] = false;
    this.saveThemeData();
    $(`#${Utilities.escapeID(Themes[theme].name)}`).remove();
    if (SettingsCookie["fork-ps-2"] && !reload) Toasts.show(`${Themes[theme].name} v${Themes[theme].version} has been disabled.`);
};

ThemeModule.prototype.toggleTheme = function(theme) {
    if (ThemeCookie[theme]) this.disableTheme(theme);
    else this.enableTheme(theme);
};

ThemeModule.prototype.loadTheme = function(filename) {
    const error = ContentManager.loadContent(filename, "theme");
    if (error) {
        if (SettingsCookie["fork-ps-1"]) Modals.showContentErrors({themes: [error]});
        if (SettingsCookie["fork-ps-2"]) Toasts.show(`${filename} could not be loaded. It may not have been loaded.`, {type: "error"});
        return Utilities.err("ContentManager", `${filename} could not be loaded.`, error);
    }
    const theme = Object.values(Themes).find(p => p.filename == filename);
    Utilities.log("ContentManager", `${theme.name} v${theme.version} was loaded.`);
    if (SettingsCookie["fork-ps-2"]) Toasts.show(`${theme.name} v${theme.version} was loaded.`, {type: "success"});
    Emitter.dispatch("theme-loaded", theme.name);
};

ThemeModule.prototype.unloadTheme = function(filenameOrName) {
    const bdtheme = Object.values(Themes).find(p => p.filename == filenameOrName) || Themes[filenameOrName];
    if (!bdtheme) return;
    const theme = bdtheme.name;
    if (ThemeCookie[theme]) this.disableTheme(theme, true);
    const error = ContentManager.unloadContent(Themes[theme].filename, "theme");
    delete Themes[theme];
    if (error) {
        if (SettingsCookie["fork-ps-1"]) Modals.showContentErrors({themes: [error]});
        if (SettingsCookie["fork-ps-2"]) Toasts.show(`${theme} could not be unloaded. It may have not been loaded yet.`, {type: "error"});
        return Utilities.err("ContentManager", `${theme} could not be unloaded. It may have not been loaded yet.`, error);
    }
    Utilities.log("ContentManager", `${theme} was unloaded.`);
    if (SettingsCookie["fork-ps-2"]) Toasts.show(`${theme} was unloaded.`, {type: "success"});
    Emitter.dispatch("theme-unloaded", theme);
};

ThemeModule.prototype.reloadTheme = function(filenameOrName) {
    const bdtheme = Object.values(Themes).find(p => p.filename == filenameOrName) || Themes[filenameOrName];
    if (!bdtheme) return this.loadTheme(filenameOrName);
    const theme = bdtheme.name;
    const error = ContentManager.reloadContent(Themes[theme].filename, "theme");
    if (ThemeCookie[theme]) this.disableTheme(theme, true), this.enableTheme(theme, true);
    if (error) {
        if (SettingsCookie["fork-ps-1"]) Modals.showContentErrors({themes: [error]});
        if (SettingsCookie["fork-ps-2"]) Toasts.show(`${theme} could not be reloaded.`, {type: "error"});
        return Utilities.err("ContentManager", `${theme} could not be reloaded.`, error);
    }
    Utilities.log("ContentManager", `${theme} v${Themes[theme].version} was reloaded.`);
    if (SettingsCookie["fork-ps-2"]) Toasts.show(`${theme} v${Themes[theme].version} was reloaded.`, {type: "success"});
    Emitter.dispatch("theme-reloaded", theme);
};

ThemeModule.prototype.updateThemeList = function() {
    const results = ContentManager.loadNewContent("theme");
    for (const filename of results.added) this.loadTheme(filename);
    for (const name of results.removed) this.unloadTheme(name);
};

ThemeModule.prototype.loadThemeData = function() {
    const saved = DataStore.getSettingGroup("themes");
    if (!saved) return;
    Object.assign(ThemeCookie, saved);
};

ThemeModule.prototype.saveThemeData = function () {
    DataStore.setSettingGroup("themes", ThemeCookie);
};

export default new ThemeModule();
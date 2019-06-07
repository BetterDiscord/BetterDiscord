import {Config} from "data";
import ContentManager from "./contentmanager2";
import Utilities from "./utilities";
import ContentError from "../structs/contenterror";
import {Toasts, Modals} from "ui";

const path = require("path");

export default new class ThemeManager extends ContentManager {
    get name() {return "ThemeManager";}
    get moduleExtension() {return ".css";}
    get extension() {return ".theme.css";}
    get contentFolder() {return path.resolve(Config.dataPath, "themes");}
    get prefix() {return "theme";}

    /* Aliases */
    updateThemeList() {return this.updateList();}
    loadAllThemes() {return this.loadAllContent();}
    enableTheme(idOrContent, fromWatcher = false) {return this.enableContent(idOrContent, fromWatcher);}
    disableTheme(idOrContent, fromWatcher = false) {return this.disableContent(idOrContent, fromWatcher);}
    toggleTheme(id) {return this.toggleContent(id);}
    unloadTheme(idOrFileOrContent, fromWatcher) {return this.unloadContent(idOrFileOrContent, fromWatcher);}

    loadContent(filename, fromWatcher) {
        const error = this.loadTheme(filename, fromWatcher);
        if (!fromWatcher) return error;
        if (error) Modals.showContentErrors({themes: [error]});
    }

    /* Overrides */
    getContentModification(module, content, meta) {
        meta.css = content.split("\n").slice(1).join("\n");
        return `module.exports = ${JSON.stringify(meta)};`;
    }

    loadTheme(filename) {
        const content = super.loadContent(filename);
        if (content instanceof ContentError) return content;
        console.log(content);
        if (this.contentList.find(c => c.id == content.name)) return new ContentError(content.name, filename, `There is already a plugin with name ${content.name}`);
        this.contentList.push(content);
        Toasts.success(`${content.name} v${content.version} was loaded.`);
        this.emit("loaded", content.name);

        if (!this.state[content.id]) return this.state[content.id] = false;
        return this.addTheme(content);
    }

    reloadTheme(filename) {
        this.reloadContent(filename);
    }

    startContent(id) {return this.addTheme(id);}
    stopContent(id) {return this.removeTheme(id);}
    addTheme() {

    }

    removeTheme() {

    }
};


function ThemeModule() {

}

ThemeModule.prototype.enableTheme = function(theme, reload = false) {
    ThemeCookie[theme] = true;
    this.saveThemeData();
    $("head").append($("<style>", {id: Utilities.escapeID(theme), text: unescape(Themes[theme].css)}));
    if (!reload) Toasts.show(`${Themes[theme].name} v${Themes[theme].version} has been applied.`);
};

ThemeModule.prototype.disableTheme = function(theme, reload = false) {
    ThemeCookie[theme] = false;
    this.saveThemeData();
    $(`#${Utilities.escapeID(Themes[theme].name)}`).remove();
    if (!reload) Toasts.show(`${Themes[theme].name} v${Themes[theme].version} has been disabled.`);
};

ThemeModule.prototype.toggleTheme = function(theme) {
    if (ThemeCookie[theme]) this.disableTheme(theme);
    else this.enableTheme(theme);
};

ThemeModule.prototype.unloadTheme = function(filenameOrName) {
    const bdtheme = Object.values(Themes).find(p => p.filename == filenameOrName) || Themes[filenameOrName];
    if (!bdtheme) return;
    const theme = bdtheme.name;
    if (ThemeCookie[theme]) this.disableTheme(theme, true);
    const error = ContentManager.unloadContent(Themes[theme].filename, "theme");
    delete Themes[theme];
    if (error) {
        Modals.showContentErrors({themes: [error]});
        Toasts.show(`${theme} could not be unloaded. It may have not been loaded yet.`, {type: "error"});
        return Utilities.err("ContentManager", `${theme} could not be unloaded. It may have not been loaded yet.`, error);
    }
    Utilities.log("ContentManager", `${theme} was unloaded.`);
    Toasts.show(`${theme} was unloaded.`, {type: "success"});
    Emitter.dispatch("theme-unloaded", theme);
};

ThemeModule.prototype.reloadTheme = function(filenameOrName) {
    const bdtheme = Object.values(Themes).find(p => p.filename == filenameOrName) || Themes[filenameOrName];
    if (!bdtheme) return this.loadTheme(filenameOrName);
    const theme = bdtheme.name;
    const error = ContentManager.reloadContent(Themes[theme].filename, "theme");
    if (ThemeCookie[theme]) this.disableTheme(theme, true), this.enableTheme(theme, true);
    if (error) {
        Modals.showContentErrors({themes: [error]});
        Toasts.show(`${theme} could not be reloaded.`, {type: "error"});
        return Utilities.err("ContentManager", `${theme} could not be reloaded.`, error);
    }
    Utilities.log("ContentManager", `${theme} v${Themes[theme].version} was reloaded.`);
    Toasts.show(`${theme} v${Themes[theme].version} was reloaded.`, {type: "success"});
    Emitter.dispatch("theme-reloaded", theme);
};
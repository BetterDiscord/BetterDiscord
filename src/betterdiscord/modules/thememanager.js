import path from "path";

import Config from "@stores/config";

import AddonError from "@structs/addonerror";

import AddonManager from "./addonmanager";
import DOMManager from "./dommanager";
import Strings from "./strings";

import Toasts from "@ui/toasts";
import Modals from "@ui/modals";


export default new class ThemeManager extends AddonManager {
    get name() {return "ThemeManager";}
    get extension() {return ".theme.css";}
    get duplicatePattern() {return /\.theme\s?\([0-9]+\)\.css/;}
    get addonFolder() {return path.resolve(Config.get("dataPath"), "themes");}
    get prefix() {return "theme";}
    get language() {return "css";}
    get order() {return 4;}

    /* Aliases */
    updateThemeList() {return this.updateList();}
    loadAllThemes() {return this.loadAllAddons();}

    enableTheme(idOrAddon) {return this.enableAddon(idOrAddon);}
    disableTheme(idOrAddon) {return this.disableAddon(idOrAddon);}
    toggleTheme(id) {return this.toggleAddon(id);}

    unloadTheme(idOrFileOrAddon) {return this.unloadAddon(idOrFileOrAddon);}
    loadTheme(filename) {return this.loadAddon(filename);}
    reloadTheme(idOrFileOrAddon) {return this.reloadAddon(idOrFileOrAddon);}

    loadAddon(filename, shouldCTE = true) {
        const error = super.loadAddon(filename, shouldCTE);
        if (error && shouldCTE) Modals.showAddonErrors({themes: [error]});
        return error;
    }

    /* Overrides */
    initializeAddon(addon) {
        if (!addon.name || !addon.author || !addon.description || !addon.version) return new AddonError(addon.name || addon.filename, addon.filename, "Addon is missing name, author, description, or version", {message: "Addon must provide name, author, description, and version.", stack: ""}, this.prefix);
    }

    requireAddon(filename) {
        const addon = super.requireAddon(filename);
        addon.css = addon.fileContent;
        delete addon.fileContent;
        if (addon.format == "json") addon.css = addon.css.split("\n").slice(1).join("\n");
        return addon;
    }

    startAddon(id) {return this.addTheme(id);}
    stopAddon(id) {return this.removeTheme(id);}

    addTheme(idOrAddon) {
        const addon = typeof (idOrAddon) == "string" ? this.addonList.find(p => p.id == idOrAddon) : idOrAddon;
        if (!addon) return;
        DOMManager.injectTheme(addon.slug + "-theme-container", addon.css);
        Toasts.show(Strings.Addons.enabled.format({name: addon.name, version: addon.version}));
    }

    removeTheme(idOrAddon) {
        const addon = typeof (idOrAddon) == "string" ? this.addonList.find(p => p.id == idOrAddon) : idOrAddon;
        if (!addon) return;
        DOMManager.removeTheme(addon.slug + "-theme-container");
        Toasts.show(Strings.Addons.disabled.format({name: addon.name, version: addon.version}));
    }
};
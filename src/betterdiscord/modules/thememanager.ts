import Config from "@stores/config";
import Toasts from "@stores/toasts";

import AddonError from "@structs/addonerror";

import AddonManager, {type Addon} from "./addonmanager";
import DOMManager from "./dommanager";
import {t} from "@common/i18n";

import Modals from "@ui/modals";


export interface Theme extends Addon {
    css: string;
    properties?: Record<string, Record<string, string | boolean>>;
}

const propertyRegex = /@property\s+--([A-Za-z0-9-_]+)\s*\{(.+?)\}/gs;

function parseProperty(raw: string) {
    const out: Record<string, string | boolean> = {};
    const rules = raw.split(";");
    for (const rule of rules) {
        const split = rule.split(":");
        const name = split[0].trim();
        const value = split.slice(1).join(":").trim();
        if (!name) continue;
        if (name === "inherits") out[name] = value === "true";
        else if (name === "syntax") out[name] = value.replaceAll(`"`, "");
        else out[name] = value;
    }
    return out;
}

export default new class ThemeManager extends AddonManager {
    get name() {return "ThemeManager";}
    get extension() {return ".theme.css";}
    get duplicatePattern() {return /\.theme\s?\([0-9]+\)\.css/;}
    get addonFolder() {return Config.get("themesPath");}
    get prefix() {return "theme" as const;}
    get language() {return "css";}
    get order() {return 4;}

    addonList: Theme[] = [];

    /* Aliases */
    updateThemeList() {return this.updateList();}
    loadAllThemes() {return this.loadAllAddons();}

    enableTheme(idOrAddon: string | Theme) {return this.enableAddon(idOrAddon);}
    disableTheme(idOrAddon: string | Theme) {return this.disableAddon(idOrAddon);}
    toggleTheme(id: string) {return this.toggleAddon(id);}

    unloadTheme(idOrFileOrAddon: string | Theme) {return this.unloadAddon(idOrFileOrAddon);}
    loadTheme(filename: string) {return this.loadAddon(filename);}
    reloadTheme(idOrFileOrAddon: string | Theme) {return this.reloadAddon(idOrFileOrAddon);}

    loadAddon(filename: string, shouldCTE = true) {
        const error = super.loadAddon(filename, shouldCTE);
        if (error && shouldCTE) Modals.showAddonErrors({themes: [error]});
        return error;
    }

    /* Overrides */
    initializeAddon(addon: Theme) {
        if (!addon.name || !addon.author || !addon.description || !addon.version) return new AddonError(addon.name || addon.filename, addon.filename, "Addon is missing name, author, description, or version", {message: "Addon must provide name, author, description, and version.", stack: ""}, this.prefix);
    }

    requireAddon(filename: string) {
        const addon = super.requireAddon(filename) as Theme;
        addon.css = addon.fileContent!;
        delete addon.fileContent;
        const properties = this.extractCustomProperties(addon.css);
        addon.properties = properties;
        return addon;
    }

    startAddon(idOrAddon: string | Theme) {return this.addTheme(idOrAddon);}
    stopAddon(idOrAddon: string | Theme) {return this.removeTheme(idOrAddon);}

    addTheme(idOrAddon: string | Theme) {
        const addon = typeof (idOrAddon) == "string" ? this.addonList.find(p => p.id == idOrAddon) : idOrAddon;
        if (!addon) return;
        DOMManager.injectTheme(addon.slug + "-theme-container", addon.css);

        if (this.hasInitialized) {
            Toasts.show(t("Addons.enabled", {name: addon.name, version: addon.version}));
        }
    }

    removeTheme(idOrAddon: string | Theme) {
        const addon = typeof (idOrAddon) == "string" ? this.addonList.find(p => p.id == idOrAddon) : idOrAddon;
        if (!addon) return;
        DOMManager.removeTheme(addon.slug + "-theme-container");
        Toasts.show(t("Addons.disabled", {name: addon.name, version: addon.version}));
    }

    extractCustomProperties(css: string) {
        const out: Record<string, Record<string, string | boolean>> = {};
        const matches = css.matchAll(propertyRegex);
        for (const match of matches) {
            if (match.length !== 3) continue;
            out[match[1]] = parseProperty(match[2]);
        }
        return out;
    }
};
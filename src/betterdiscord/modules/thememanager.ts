import Config from "@stores/config";
import Toasts from "@stores/toasts";

import AddonError from "@structs/addonerror";

import AddonManager, {type Addon, type AddonStateLoad, type AddonStateStart, type AddonStateStop} from "./addonmanager";
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

export default new class ThemeManager extends AddonManager<Theme> {
    name = "ThemeManager";

    constructor() {
        super(
            "theme",
            "css",
            4,
        );
    }

    validateFileBase(base: string): boolean {
        return base.endsWith(".theme.css");
    }

    addonFolder(): string {
        return Config.get("themesPath");
    }

    /* Aliases */
    updateThemeList() {return this.updateList();}
    loadAllThemes() {return this.loadAllAddons();}

    enableTheme(theme: Theme) {return this.enableAddon(theme);}
    disableTheme(theme: Theme) {return this.disableAddon(theme);}
    toggleTheme(theme: Theme) {return this.toggleAddon(theme);}

    unloadTheme(theme: Theme) {return this.unloadAddon(theme);}
    loadTheme(filename: string) {return this.loadAddon(filename);}
    reloadTheme(theme: Theme) {return this.reloadAddon(theme);}

    async loadAddon(filename: string, shouldCTE = true) {
        const load = await super.loadAddon(filename, shouldCTE);
        if (load.kind === "not-loaded" && shouldCTE) Modals.showAddonErrors({themes: [load]});
        return load;
    }

    /* Overrides */
    async initializeAddon(addon: Theme): Promise<AddonStateLoad> {
        if (!addon.name || !addon.author || !addon.description || !addon.version) {
            return {
                kind: "not-loaded",
                error: new AddonError(addon.name || addon.filename, addon.filename, "Addon is missing name, author, description, or version", {message: "Addon must provide name, author, description, and version.", stack: ""}, this.prefix),
            };
        }
        return {
            kind: "loaded",
            addon,
        };
    }

    async requireAddon(filename: string) {
        const require = await super.requireAddon(filename);
        if (require.kind === "not-loaded") {
            return require;
        }
        const addon = require.addon as Theme;
        addon.css = addon.fileContent!;
        delete addon.fileContent;
        const properties = this.extractCustomProperties(addon.css);
        addon.properties = properties;
        return require;
    }

    startAddon(theme: Theme) {return this.addTheme(theme);}
    stopAddon(theme: Theme) {return this.removeTheme(theme);}

    async addTheme(theme: Theme): Promise<AddonStateStart<Theme>> {
        DOMManager.injectTheme(theme.slug + "-theme-container", theme.css);

        Toasts.success(t("Addons.enabled", {name: theme.name, version: theme.version}));
        return {
            kind: "started",
            addon: theme,
        };
    }

    async removeTheme(addon: Theme): Promise<AddonStateStop> {
        DOMManager.removeTheme(addon.slug + "-theme-container");
        Toasts.error(t("Addons.disabled", {name: addon.name, version: addon.version}));
        return {
            kind: "stopped",
        };
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
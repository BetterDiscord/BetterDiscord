import Config from "@stores/config";
import Toasts from "@stores/toasts";

import AddonManager, {type Addon} from "./addonmanager";
import DOMManager from "./dommanager";
import {t} from "@common/i18n";


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
    extension = ".theme.css";
    duplicatePattern = /\.theme\s?\([0-9]+\)\.css/;
    addonFolder = Config.get("themesPath");
    prefix = "theme" as const;
    language = "css";
    order = 4;

    loadAddons() {
        for (const addon of this.addonInfo) {
            this.loadAddon(addon);
        }

        this.finishInit();
    }

    initAddon(addon: Addon) {
        const theme = addon as Theme;
        theme.css = theme.fileContent!;
        delete theme.fileContent;

        // Set the custom properties
        const properties = this.extractCustomProperties(theme.css);
        theme.properties = properties;
        return theme;
    }

    startAddon(idOrAddon: string | Theme) {
        const theme = this.resolveAddon(idOrAddon);
        if (!theme) return;

        DOMManager.injectTheme(theme.slug + "-theme-container", theme.css);
        if (this.hasInitialized) Toasts.success(t("Addons.enabled", {name: theme.name, version: theme.version}));
        else this.initialAddonsLoaded++;
    }

    stopAddon(idOrAddon: string | Theme) {
        const theme = this.resolveAddon(idOrAddon);
        if (!theme) return;

        DOMManager.removeTheme(theme.slug + "-theme-container");
        Toasts.error(t("Addons.disabled", {name: theme.name, version: theme.version}));
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
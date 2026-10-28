import Config from "@stores/config";
import Toasts from "@stores/toasts";

import AddonManager from "./addonmanager";
import {type Addon} from "@typed/addon";
import DOMManager from "./dommanager";
import {t} from "@common/i18n";
import Store from "@stores/base.ts";

import fs from "fs";
import path from "path";
import DiscordModules from "@modules/discordmodules.ts";
import Logger from "@common/logger";

export interface ThemePropertyState extends Record<string, string | boolean | undefined> {
    syntax: "<boolean>" | "<color>" | "<length>" | "<percentage>" | "<integer>" | "<number>" | "<custom-ident>" | "<url>" | "*";
    inherits: boolean;
    "initial-value": string;
    name: string;
    note: string;
    options?: string;
}

export interface ThemePropertyStateSlider extends ThemePropertyState {
    max: string;
    min: string;
    step: string;
}

export interface Theme extends Addon {
    css: string;
    properties?: Record<string, ThemePropertyState>;
}

const propertyRegex = /@property\s+--([A-Za-z0-9-_]+)\s*\{(.+?)\}/gs;

const VALID_SYNTAX = new Set([
    "<boolean>", "<color>", "<length>", "<percentage>", "<integer>", "<number>", "<custom-ident>", "<url>", "*"
]);

export const Manager = new class ThemeStore extends Store {
    private cache: Record<string, Record<string, string | boolean>> | null = null;

    get filePath() {
        return path.join(process.env.BETTERDISCORD_DATA_PATH, "data", DiscordModules.RemoteModule?.releaseChannel, "theme-settings.json");
    }

    initialize() {
        this.ensureFile();
        this.cache = this.readFile();
    }

    ensureFile(): void {
        const filePath = this.filePath;
        const dir = path.dirname(filePath);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, {recursive: true});
        }

        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify({}, null, 4));
        }
    }

    readFile(): Record<string, Record<string, string | boolean>> {
        try {
            const raw = fs.readFileSync(this.filePath, "utf8");
            return JSON.parse(raw);
        }
        catch {
            return {};
        }
    }

    updateFile(name: string, property: string, value: string | boolean): void {
        this.ensureFile();

        const data = this.cache ?? this.readFile();
        if (!data[name]) data[name] = {};
        data[name][property] = value;

        fs.writeFileSync(this.filePath, JSON.stringify(data, null, 4));
        this.cache = data;
    }

    getValue(themeSlug: string, property: string): string | boolean | undefined {
        return this.cache?.[themeSlug]?.[property];
    }
};

function parseProperty(raw: string) {
    const out: Record<string, string | boolean> = {};
    const rules = raw.split(";");

    for (const rule of rules) {
        const trimmed = rule.trim();
        if (!trimmed) continue;

        const colonIndex = trimmed.indexOf(":");
        if (colonIndex === -1) continue;

        const name = trimmed.slice(0, colonIndex).trim();
        let value = trimmed.slice(colonIndex + 1).trim();

        if (!name) continue;

        if (value.startsWith(`"`) && value.endsWith(`"`) && value.length >= 2) {
            value = value.slice(1, -1);
        }

        if (name === "inherits") {
            out[name] = value === "true";
            continue;
        }

        out[name] = value;
    }

    if (typeof out.inherits !== "boolean") out.inherits = false;
    if (typeof out.syntax !== "string" || !VALID_SYNTAX.has(out.syntax)) {
        out.syntax = "<custom-ident>";
    }

    return out;
}

// function parseOptions(raw: string): string[] {
//     return raw.split("|").map(s => s.trim()).filter(Boolean);
// }

export default new class ThemeManager extends AddonManager<Theme> {
    name = "ThemeManager";
    extension = ".theme.css";
    duplicatePattern = /\.theme\s?\([0-9]+\)\.css/;
    addonFolder = Config.get("themesPath");
    prefix = "theme" as const;
    language = "css";
    order = 4;
    styleSheet = new CSSStyleSheet();

    startAddons() {
        for (const addon of this.addonList) {
            if (!this.state[addon.id]) continue;
            this.startAddon(addon);
        }
    }

    loadAddons() {
        document.adoptedStyleSheets = [...document.adoptedStyleSheets, this.styleSheet];
        Manager.initialize();

        for (const addon of this.addonInfo) {
            this.loadAddon(addon);
        }

        this.finishInit();
    }

    initAddon(theme: Theme) {
        theme.css = theme.fileContent!;
        delete theme.fileContent;

        // Set the custom properties
        const properties = this.extractCustomProperties(theme.css);
        theme.properties = properties;


        return theme;
    }

    startAddon(idOrAddon: string | Theme) {
        const theme = this.resolveAddon(idOrAddon);
        if (!theme) return false;

        if (!theme.css) {
            const loaded = this.loadAddon(theme);
            if (!loaded) return false;
        }

        if (theme.properties) {
            for (const [name, prop] of Object.entries(theme.properties)) {
                this.registerProperty(name, prop);
            }
        }

        if (theme.properties) {
            for (const [name, prop] of Object.entries(theme.properties)) {
                this.registerProperty(name, prop);
            }
        }

        DOMManager.injectTheme(theme.slug + "-theme-container", theme.css);

        if (theme.properties) {
            for (const [name, prop] of Object.entries(theme.properties)) {
                const saved = Manager.getValue(theme.slug, name);
                if (saved !== undefined) {
                    document.documentElement.style.setProperty(`--${name}`, saved as string, "important");
                }
            }
        }

        if (this.hasInitialized) Toasts.success(t("Addons.enabled", {name: theme.name, version: theme.version}));
        else this.initialAddonsLoaded++;

        return true;
    }


    stopAddon(idOrAddon: string | Theme) {
        const theme = this.resolveAddon(idOrAddon);
        if (!theme) return false;

        DOMManager.removeTheme(theme.slug + "-theme-container");
        Toasts.error(t("Addons.disabled", {name: theme.name, version: theme.version}));

        return true;
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

    registerProperty(name: string, prop: ThemePropertyState) {
        try {
            const syntax = (prop as any).file ? "<url>" : prop.syntax;
            const initialValueLine = syntax === "*" ? "" : `initial-value: ${prop["initial-value"]};`;

            this.styleSheet.insertRule(`
            @property --${name} {
                syntax: "${syntax}";
                inherits: ${prop.inherits};
                ${initialValueLine}
            }
        `, this.styleSheet.cssRules.length);
        }
        catch (err) {
            Logger.warn("ThemeManager", `Failed to register --${name}`, err);
        }
    }

    updateStyleSheet(property: string, value: string, prop?: ThemePropertyState) {
        document.documentElement.style.setProperty(`--${property}`, value, "important");
    }
};
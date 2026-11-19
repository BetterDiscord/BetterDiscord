import Config from "@stores/config";
import Toasts from "@stores/toasts";
import Logger from "@common/logger";

import AddonManager from "./addonmanager";
import {type Addon} from "@typed/addon";
import DOMManager from "./dommanager";
import {t} from "@common/i18n";
import {parseThemeSettings, type RootValue} from "./themes/settings";
import {findRootDefaults, readRegisteredProperties, removeDroppedSettings} from "./themes/browsercheck";
import {probeValues} from "./themes/probe";
import ThemeValues from "./themes/store";
import type {ThemeSetting, ThemeSettingWarning} from "./themes/types";


export interface Theme extends Addon {
    css: string;

    /** The theme's settings, filled the first time it starts. */
    properties?: ThemeSetting[];
}

class ThemeManager extends AddonManager<Theme> {
    name = "ThemeManager";
    extension = ".theme.css";
    duplicatePattern = /\.theme\s?\([0-9]+\)\.css/;
    addonFolder = Config.get("themesPath");
    prefix = "theme" as const;
    language = "css";
    order = 4;

    /**
     * Themes parsed since BD last read their file, whose settings the browser hasn't confirmed yet, with the
     * `:root` values the browser check compares against each setting's default.
     */
    private uncheckedThemes = new WeakMap<Theme, RootValue[]>();

    /** The ids of the themes on the page, in the order they started. */
    private runningThemes = new Set<string>();

    startAddons() {
        for (const addon of this.addonList) {
            if (!this.state[addon.id]) continue;
            this.startAddon(addon);
        }

        this.finishInit();
    }

    initAddon(theme: Theme) {
        theme.css = theme.fileContent!;
        delete theme.fileContent;

        const {settings, warnings, rootValues} = parseThemeSettings(theme.css);
        theme.properties = settings;
        this.logSettingWarnings(theme, warnings);
        this.uncheckedThemes.set(theme, rootValues);
        return true;
    }

    startAddon(idOrAddon: string | Theme) {
        const theme = this.resolveAddon(idOrAddon);
        if (!theme) return false;

        if (!theme.css) {
            const loaded = this.loadAddon(theme);
            if (!loaded) return false;
        }

        const style = DOMManager.injectTheme(theme.slug + "-theme-container", theme.css);

        // The browser's verdict can only change with the source, so this runs once per read of the file
        const rootValues = this.uncheckedThemes.get(theme);
        if (rootValues) {
            this.uncheckedThemes.delete(theme);
            const {settings, warnings} = removeDroppedSettings(theme.properties ?? [], readRegisteredProperties(style.sheet));
            theme.properties = settings;
            warnings.push(...findRootDefaults(settings, rootValues, entries => probeValues(theme.id, settings, entries)));
            warnings.sort((a, b) => a.line - b.line);
            this.logSettingWarnings(theme, warnings);
        }

        this.warnSharedNames(theme);
        this.runningThemes.add(theme.id);

        // After the browser check, so a value for a setting it removed isn't applied
        ThemeValues.apply(theme);

        if (this.hasInitialized) Toasts.success(t("Addons.enabled", {name: theme.name, version: theme.version}));
        else this.initialAddonsLoaded++;

        return true;
    }

    stopAddon(idOrAddon: string | Theme) {
        const theme = this.resolveAddon(idOrAddon);
        if (!theme) return false;

        DOMManager.removeTheme(theme.slug + "-theme-container");
        ThemeValues.remove(theme);
        this.runningThemes.delete(theme.id);
        Toasts.error(t("Addons.disabled", {name: theme.name, version: theme.version}));

        return true;
    }

    /** Deleting the file also deletes the theme's saved values. Unloading or reloading a theme keeps them. */
    deleteAddon(idOrFileOrAddon: string | Theme) {
        const theme = this.resolveAddon(idOrFileOrAddon);
        if (!theme) return;

        super.deleteAddon(theme);
        ThemeValues.forget(theme.id);
    }

    /**
     * Warns when a starting theme has a setting with the same name as a setting in a theme that's already running.
     * Names are shared by the whole page, so the theme that started last decides the syntax and default, and the
     * two panels change the same variable.
     */
    warnSharedNames(theme: Theme) {
        const names = new Set(theme.properties?.map(s => s.property));
        if (!names.size) return;

        for (const id of this.runningThemes) {
            const other = this.resolveAddon(id);
            if (!other || other.id === theme.id) continue;

            const shared = other.properties?.filter(s => names.has(s.property)).map(s => `\`${s.property}\``) ?? [];
            if (!shared.length) continue;

            Logger.warn(this.name, `${theme.name}: has settings that ${other.name} also has (${shared.join(", ")}). A property name is shared by the whole page, so ${theme.name} now decides their syntax and default, and both themes' panels change the same values.`);
        }
    }

    logSettingWarnings(theme: Theme, warnings: ThemeSettingWarning[]) {
        for (const warning of warnings) {
            Logger.warn(this.name, `${theme.name}: ${warning.property} (line ${warning.line}) ${warning.message}`);
        }
    }
}

export default new ThemeManager();
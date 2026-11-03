import Config from "@stores/config";
import Toasts from "@stores/toasts";
import Logger from "@common/logger";

import AddonManager from "./addonmanager";
import {type Addon} from "@typed/addon";
import DOMManager from "./dommanager";
import {t} from "@common/i18n";
import {parseThemeSettings} from "./themes/settings";
import {readRegisteredProperties, removeDroppedSettings} from "./themes/browsercheck";
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

    /** Themes parsed since BD last read their file, whose settings the browser hasn't confirmed yet. */
    private uncheckedThemes = new WeakSet<Theme>();

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

        const {settings, warnings} = parseThemeSettings(theme.css);
        theme.properties = settings;
        this.logSettingWarnings(theme, warnings);
        this.uncheckedThemes.add(theme);
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
        if (this.uncheckedThemes.has(theme)) {
            this.uncheckedThemes.delete(theme);
            const {settings, warnings} = removeDroppedSettings(theme.properties ?? [], readRegisteredProperties(style.sheet));
            theme.properties = settings;
            this.logSettingWarnings(theme, warnings);
        }

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

    logSettingWarnings(theme: Theme, warnings: ThemeSettingWarning[]) {
        for (const warning of warnings) {
            Logger.warn(this.name, `${theme.name}: ${warning.property} (line ${warning.line}) ${warning.message}`);
        }
    }
}

export default new ThemeManager();
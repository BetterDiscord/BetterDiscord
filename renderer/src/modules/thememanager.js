import path from "path";

import Config from "@data/config";

import AddonError from "@structs/addonerror";

import AddonManager from "./addonmanager";
import Settings from "./settingsmanager";
import DOMManager from "./dommanager";
import Strings from "./strings";
import DataStore from "./datastore";
import Utilities from "./utilities";

import Toasts from "@ui/toasts";
import Modals from "@ui/modals";
import SettingsRenderer from "@ui/settings";


const varRegex = /^(checkbox|text|color|select|number|range)\s+([A-Za-z0-9-_]+)\s+"([^"]+)"\s+(.*)$/;

export default new class ThemeManager extends AddonManager {
    get name() {return "ThemeManager";}
    get extension() {return ".theme.css";}
    get duplicatePattern() {return /\.theme\s?\([0-9]+\)\.css/;}
    get addonFolder() {return path.resolve(Config.dataPath, "themes");}
    get prefix() {return "theme";}
    get language() {return "css";}

    initialize() {
        const errors = super.initialize();
        Settings.registerPanel("themes", Strings.Panels.themes, {
            order: 4,
            element: SettingsRenderer.getAddonPanel(Strings.Panels.themes, this.addonList, this.state, {
                type: this.prefix,
                folder: this.addonFolder,
                onChange: this.toggleTheme.bind(this),
                reload: this.reloadTheme.bind(this),
                refreshList: this.updateThemeList.bind(this),
                saveAddon: this.saveAddon.bind(this),
                editAddon: this.editAddon.bind(this),
                deleteAddon: this.deleteAddon.bind(this),
                enableAll: this.enableAllAddons.bind(this),
                disableAll: this.disableAllAddons.bind(this),
                prefix: this.prefix
            })
        });
        return errors;
    }

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

    extractMeta(fileContent, filename) {
        const metaInfo = super.extractMeta(fileContent, filename);
        if (!metaInfo.var) return metaInfo;

        if (!Array.isArray(metaInfo.var)) metaInfo.var = [metaInfo.var];

        const variables = [];
        for (const v of metaInfo.var) {
            const match = v.match(varRegex);
            if (!match || match.length !== 5) continue;
            const type = match[1];
            const variable = match[2];
            const label = match[3].split(":");
            const name = label[0].trim();
            const note = label[1]?.trim();
            const value = match[4];
            if (type === "checkbox") variables.push({type: "switch", id: variable, name: name, note: note, value: parseInt(value) === 1});
            if (type === "text") variables.push({type: "text", id: variable, name: name, note: note, value: value});
            if (type === "color") variables.push({type: "color", id: variable, name: name, note: note, value: value, defaultValue: value});
            
            if (type === "number" || type === "range") {
                // [default, min, max, step, units]
                const parsed = JSON.parse(value);
                variables.push({type: type === "number" ? type : "slider", id: variable, name: name, note: note, value: parsed[0], min: parsed[1], max: parsed[2], step: parsed[3]});
            }
            if (type === "select") {
                const parsed = JSON.parse(value);
                let selected, options;
                if (Array.isArray(parsed)) {
                    selected = parsed.find(o => o.endsWith("*")).replace("*", "");
                    options = parsed.map(o => ({label: o.replace("*", ""), value: o.replace("*", "")}));
                }
                else {
                    selected = Object.keys(parsed).find(k => k.endsWith("*"));
                    selected = parsed[selected];
                    options = Object.entries(parsed).map(a => ({label: a[0].replace("*", ""), value: a[1]}));
                }
                variables.push({type: "dropdown", id: variable, name: name, note: note, options: options, value: selected || options[0].value});
            }
        }
        metaInfo.var = variables;
        metaInfo.instance = {getSettingsPanel: this.getThemeSettingsPanel(metaInfo.name, metaInfo.var)};

        return metaInfo;
    }

    requireAddon(filename) {
        const addon = super.requireAddon(filename);
        addon.css = addon.fileContent;
        delete addon.fileContent;
        this.loadThemeSettings(addon);
        if (addon.format == "json") addon.css = addon.css.split("\n").slice(1).join("\n");
        return addon;
    }

    startAddon(id) {return this.addTheme(id);}
    stopAddon(id) {return this.removeTheme(id);}

    addTheme(idOrAddon) {
        const addon = typeof(idOrAddon) == "string" ? this.addonList.find(p => p.id == idOrAddon) : idOrAddon;
        if (!addon) return;
        DOMManager.injectTheme(addon.slug + "-theme-container", addon.css);
        DOMManager.injectTheme(addon.slug + "-theme-settings", this.buildCSSVars(addon));
        Toasts.show(Strings.Addons.enabled.format({name: addon.name, version: addon.version}));
    }

    removeTheme(idOrAddon) {
        const addon = typeof(idOrAddon) == "string" ? this.addonList.find(p => p.id == idOrAddon) : idOrAddon;
        if (!addon) return;
        DOMManager.removeTheme(addon.slug + "-theme-container");
        DOMManager.removeTheme(addon.slug + "-theme-settings");
        Toasts.show(Strings.Addons.disabled.format({name: addon.name, version: addon.version}));
    }

    getThemeSettingsPanel(themeId, vars) {
        return SettingsRenderer.getSettingsGroup(vars, Utilities.debounce((id, value) => this.updateThemeSettings(themeId, id, value), 100));
    }

    loadThemeSettings(addon) {
        const all = DataStore.getData("theme_settings") || {};
        const stored = all?.[addon.id];
        if (!stored || !addon.var || !Array.isArray(addon.var)) return;
        for (const v of addon.var) {
            if (v.id in stored) v.value = stored[v.id];
        }
    }

    updateThemeSettings(themeId, id, value) {
        const addon = this.addonList.find(p => p.id == themeId);
        const varToUpdate = addon.var.find(v => v.id === id);
        varToUpdate.value = value;
        DOMManager.injectTheme(addon.slug + "-theme-settings", this.buildCSSVars(addon));
        this.saveThemeSettings(themeId);
    }

    saveThemeSettings(themeId) {
        const all = DataStore.getData("theme_settings") || {};
        const addon = this.addonList.find(p => p.id == themeId);
        const data = {};
        for (const v of addon.var) {
            data[v.id] = v.value;
        }
        all[themeId] = data;
        DataStore.setData("theme_settings", all);
    }

    buildCSSVars(idOrAddon) {
        const addon = typeof(idOrAddon) == "string" ? this.addonList.find(p => p.id == idOrAddon) : idOrAddon;
        const lines = [`:root {`];
        if (Array.isArray(addon.var)) {
            for (const v of addon.var) {
                const value = typeof(v.value) === "boolean" ? v.value ? 1 : 0 : v.value;
                lines.push(`    --${v.id}: ${value};`);
            }
        }
        lines.push(`}`);
        return lines.join("\n");
    }
};
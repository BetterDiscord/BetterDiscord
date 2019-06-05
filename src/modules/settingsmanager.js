import {SettingsCookie} from "data";
import DataStore from "./datastore";
import ContentManager from "./contentmanager";
import BdApi from "./pluginapi";
// import EmoteModule from "./emotes";
import Events from "./emitter";
import WebpackModules from "./webpackmodules";

import {SettingsPanel as SettingsRenderer} from "ui";
import Utilities from "./utilities";
import {Toasts} from "ui";

import EmoteSettings from "../data/emotes/config";
import EmoteState from "../data/emotes/state";
import TheSettings from "../data/settings/config";
import SettingsState from "../data/settings/state";
//WebpackModules.getModule(m => m.getSection && m.getProps && !m.getGuildId && !m.getChannel)
//WebpackModules.getByProps("getGuildId", "getSection")

export default new class SettingsManager {

    constructor() {
        this.renderer = new SettingsRenderer({onChange: this.updateSettings.bind(this)});
    }

    initialize() {
        DataStore.initialize();
        if (!DataStore.getSettingGroup("settings")) return this.saveSettings();
        const savedSettings = this.loadSettings();
        $("<style id=\"customcss\">").text(atob(DataStore.getBDData("bdcustomcss"))).appendTo(document.head);
        for (const setting in savedSettings) {
            if (savedSettings[setting] !== undefined) SettingsCookie[setting] = savedSettings[setting];
        }
        this.saveSettings();
        this.patchSections();

        this.initializeConfig(TheSettings, SettingsState);
        this.initializeConfig(EmoteSettings, EmoteState);
    }

    initializeConfig(defaultConfig, state) {
        const config = {};
        for (let s = 0; s < defaultConfig.length; s++) {
            const current = defaultConfig[s];
            if (current.type != "category") {config[current.id] = current.value;}
            else {
                config[current.id] = {};
                for (let s = 0; s < current.settings.length; s++) {
                    const subCurrent = current.settings[s];
                    config[current.id][subCurrent.id] = subCurrent.value;
                    if (subCurrent.enableWith) {
                        Object.defineProperty(subCurrent, "disabled", {
                            get: () => {
                                return !state[current.id][subCurrent.enableWith];
                            }
                        });
                    }
                }
            }
        }
        console.log(defaultConfig);
        console.log(config);
        Object.assign(state, config);
    }

    buildSettingsPanel(config, state, onChange) {
        config.forEach(section => {
            section.settings.forEach(item => item.value = state[section.id][item.id]);
        });
        return this.renderer.getSettingsPanel(config, onChange);
    }

    async patchSections() {
        const UserSettings = await this.getUserSettings(); // data.returnValue.type;
        Utilities.monkeyPatch(UserSettings.prototype, "generateSections", {after: (data) => {
            // console.log(data); /* eslint-disable-line no-console */
            data.returnValue.splice(23, 0, {section: "DIVIDER"});
            data.returnValue.splice(24, 0, {section: "HEADER", label: "BandagedBD"});
            // data.returnValue.splice(25, 0, {section: "BBD Settings", label: "Settings", element: () => this.renderer.core2});
            data.returnValue.splice(25, 0, {section: "BBD Settings", label: "Settings", element: () => this.buildSettingsPanel(TheSettings, SettingsState, this.updateSettings)});
            data.returnValue.splice(26, 0, {section: "BBD Emotes", label: "Emotes", element: () => this.buildSettingsPanel(EmoteSettings, EmoteState, this.updateSettings)});
            data.returnValue.splice(27, 0, {section: "BBD Test", label: "Test Tab", onClick: function() {Toasts.success("This can just be a click listener!", {forceShow: true});}});
            data.returnValue.splice(28, 0, {section: "CUSTOM", element: () => this.renderer.attribution});
        }});
        const viewClass = WebpackModules.getByProps("standardSidebarView").standardSidebarView.split(" ")[0];
        const node = document.querySelector(`.${viewClass}`);
        Utilities.getInternalInstance(node).return.return.return.return.return.return.stateNode.forceUpdate();
    }

    getUserSettings() {
        return new Promise(resolve => {
            const cancel = Utilities.monkeyPatch(WebpackModules.getByProps("getUserSettingsSections").default.prototype, "render", {after: (data) => {
                resolve(data.returnValue.type);
                data.thisObject.forceUpdate();
                cancel();
            }});
        });
    }

    saveSettings() {
        DataStore.setSettingGroup("settings", SettingsCookie);
    }

    loadSettings() {
        return DataStore.getSettingGroup("settings");
    }

    updateSettings(id, enabled) {
        if (arguments.length == 3) {
            SettingsState[arguments[0]][arguments[1]] = arguments[2];
            Events.dispatch("setting-updated", arguments[0], arguments[1], arguments[2]);
            console.log(SettingsState);
            return;
        }
        Events.dispatch("setting-updated", "Modules", id, enabled);
        SettingsCookie[id] = enabled;


        // if (id == "bda-es-4") {
        //     if (enabled) EmoteModule.autoCapitalize();
        //     else EmoteModule.disableAutoCapitalize();
        // }

        if (id == "fork-ps-5") {
            if (enabled) {
                ContentManager.watchContent("plugin");
                ContentManager.watchContent("theme");
            }
            else {
                ContentManager.unwatchContent("plugin");
                ContentManager.unwatchContent("theme");
            }
        }

        if (id == "fork-wp-1") {
            BdApi.setWindowPreference("transparent", enabled);
            if (enabled) BdApi.setWindowPreference("backgroundColor", null);
            else BdApi.setWindowPreference("backgroundColor", "#2f3136");
        }

        this.saveSettings();
    }

    initializeSettings() {
        // if (SettingsCookie["bda-es-4"]) EmoteModule.autoCapitalize();

        if (SettingsCookie["fork-ps-5"]) {
            ContentManager.watchContent("plugin");
            ContentManager.watchContent("theme");
        }

        this.saveSettings();
    }
};
import {SettingsCookie, Collections} from "data";
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
        this.updateSettings = this.updateSettings.bind(this);
        console.log(Collections);
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

    buildSettingsPanel(title, config, state, onChange) {
        config.forEach(section => {
            section.settings.forEach(item => item.value = state[section.id][item.id]);
        });
        return this.renderer.getSettingsPanel(title, config, onChange);
    }

    async patchSections() {
        const UserSettings = await this.getUserSettings(); // data.returnValue.type;
        Utilities.monkeyPatch(UserSettings.prototype, "generateSections", {after: (data) => {
            let location = data.returnValue.findIndex(s => s.section.toLowerCase() == "linux") + 1;
            const insert = (section) => {
                data.returnValue.splice(location, 0, section);
                location++;
            };
            console.log(data); /* eslint-disable-line no-console */
            insert({section: "DIVIDER"});
            insert({section: "HEADER", label: "BandagedBD"});
            // insert({section: "BBD Settings", label: "Settings", element: () => this.renderer.core2});
            insert({section: "BBD Settings", label: "Settings", element: () => this.buildSettingsPanel("Settings", TheSettings, SettingsState, this.updateSettings.bind(this, SettingsState))});
            if (SettingsState.general.emotes) insert({section: "BBD Emotes", label: "Emotes", element: () => this.buildSettingsPanel("Emote Settings", EmoteSettings, EmoteState, this.updateSettings.bind(this, EmoteState))});
            insert({section: "BBD Test", label: "Test Tab", onClick: function() {Toasts.success("This can just be a click listener!", {forceShow: true});}});
            insert({section: "CUSTOM", element: () => this.renderer.attribution});
        }});
        this.forceUpdate();
    }

    forceUpdate() {
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

    onSettingChange(collection, category, id, enabled) {
        collection[category][id] = enabled;
        Events.dispatch("setting-updated", category, id, enabled);
        // console.log(collection);
        if (id == "emotes") this.forceUpdate();
    }

    getSetting(category, id) {
        if (arguments.length == 2) return SettingsState[category][id];
        const collection = arguments[0] == "emotes" ? EmoteState : SettingsState;
        return collection && collection[arguments[1]][arguments[2]];
    }

    get(category, id) {
        if (arguments.length == 2) return SettingsState[category][id];
        const collection = arguments[0] == "emotes" ? EmoteState : SettingsState;
        return collection && collection[arguments[1]][arguments[2]];
    }

    updateSettings(collection, category, id, enabled) {
        // console.log("Updating ", collection);
        // console.log(category, id, enabled);
        collection[category][id] = enabled;
        Events.dispatch("setting-updated", category, id, enabled);
        // console.log(collection);
        if (id == "emotes") this.forceUpdate();
        // SettingsCookie[id] = enabled;


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

        // this.saveSettings();
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
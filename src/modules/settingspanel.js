import {SettingsCookie} from "data";
import DataStore from "./datastore";
import ContentManager from "./contentmanager";
import BdApi from "./pluginapi";
import EmoteModule from "./emotes";
import Events from "./emitter";
import WebpackModules from "./webpackmodules";

import {SettingsPanel as SettingsRenderer} from "ui";
import Utilities from "./utilities";

//WebpackModules.getModule(m => m.getSection && m.getProps && !m.getGuildId && !m.getChannel)
//WebpackModules.getByProps("getGuildId", "getSection")

export default new class SettingsPanel {

    constructor() {
        this.renderer = new SettingsRenderer({onChange: this.updateSettings.bind(this)});
    }

    renderSidebar() {
        this.renderer.renderSidebar();
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
        // console.log("PATCHING");
        // Utilities.monkeyPatch(WebpackModules.getByProps("getUserSettingsSections").default.prototype, "render", {after: (data) => {
        //     data.returnValue.type;
        // }});

        // Patcher.after(temp2.prototype, "generateSections", (t,a,r) => {
        //     r.push({section: "DIVIDER"});
        //     r.push({section: "HEADER", label: "My Section"});
        //     r.push({color: "#ffffff", label: "My Tab", onClick: function() {console.log("CLICK");}, section: "My Section"});
        //             r.push({color: "#cccccc", label: "My Tab2", onClick: function() {console.log("CLICK2");}, section: "My Section"});

        // })
        this.patchSections();
    }

    async patchSections() {
        const UserSettings = await this.getUserSettings(); // data.returnValue.type;
        Utilities.monkeyPatch(UserSettings.prototype, "generateSections", {after: (data) => {
            console.log(data);
            data.returnValue.splice(23, 0, {section: "DIVIDER"});
            data.returnValue.splice(24, 0, {section: "HEADER", label: "BandagedBD"});
            data.returnValue.splice(25, 0, {section: "IJ1", label: "Injected Tab 1", element: () => this.renderer.core2});
            data.returnValue.splice(26, 0, {section: "IJ2", label: "Injected Tab 2", onClick: function() {console.log("CLICK2");}});
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
        Events.dispatch("setting-updated", "Modules", id, enabled);
        SettingsCookie[id] = enabled;


        if (id == "bda-es-4") {
            if (enabled) EmoteModule.autoCapitalize();
            else EmoteModule.disableAutoCapitalize();
        }

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
        if (SettingsCookie["bda-es-4"]) EmoteModule.autoCapitalize();

        if (SettingsCookie["fork-ps-5"]) {
            ContentManager.watchContent("plugin");
            ContentManager.watchContent("theme");
        }

        this.saveSettings();
    }
};
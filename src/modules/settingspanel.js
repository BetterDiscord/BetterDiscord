import {SettingsCookie} from "data";
// import ClassNormalizer from "./classnormalizer";
import ContentManager from "./contentmanager";
import BdApi from "./pluginapi";
import Core from "./core";
import EmoteModule from "./emotes";
// import DevMode from "./devmode";
import Events from "./emitter";

import {SettingsPanel as SettingsRenderer} from "ui";

export default new class SettingsPanel {

    constructor() {
        this.renderer = new SettingsRenderer({onChange: this.updateSettings.bind(this)});
    }

    renderSidebar() {
        this.renderer.renderSidebar();
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

        Core.saveSettings();
    }

    initializeSettings() {
        if (SettingsCookie["bda-es-4"]) EmoteModule.autoCapitalize();

        if (SettingsCookie["fork-ps-5"]) {
            ContentManager.watchContent("plugin");
            ContentManager.watchContent("theme");
        }

        Core.saveSettings();
    }
};
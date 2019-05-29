import {SettingsCookie} from "data";
import ClassNormalizer from "./classnormalizer";
import ContentManager from "./contentmanager";
import BdApi from "./pluginapi";
import Core from "./core";
import VoiceMode from "./voicemode";
import EmoteModule from "./emotes";
import DevMode from "./devmode";

import {SettingsPanel as SettingsRenderer} from "ui";

export default new class SettingsPanel {

    constructor() {
        this.renderer = new SettingsRenderer({onChange: this.updateSettings.bind(this)});
    }

    renderSidebar() {
        this.renderer.renderSidebar();
    }

    updateSettings(id, enabled) {
        SettingsCookie[id] = enabled;

        if (id == "bda-es-0") {
            if (enabled) $("#twitchcord-button-container").show();
            else $("#twitchcord-button-container").hide();
        }

        if (id == "bda-gs-2") {
            if (enabled) $("body").addClass("bd-minimal");
            else $("body").removeClass("bd-minimal");
        }

        if (id == "bda-gs-3") {
            if (enabled) $("body").addClass("bd-minimal-chan");
            else $("body").removeClass("bd-minimal-chan");
        }

        if (id == "bda-gs-1") {
            if (enabled) $("#bd-pub-li").show();
            else $("#bd-pub-li").hide();
        }

        if (id == "bda-gs-4") {
            if (enabled) VoiceMode.enable();
            else VoiceMode.disable();
        }

        if (id == "bda-gs-5") {
            if (enabled) $("#app-mount").addClass("bda-dark");
            else $("#app-mount").removeClass("bda-dark");
        }

        if (enabled && id == "bda-gs-6") Core.inject24Hour();

        if (id == "bda-gs-7") {
            if (enabled) Core.injectColoredText();
            else Core.removeColoredText();
        }

        if (id == "bda-es-4") {
            if (enabled) EmoteModule.autoCapitalize();
            else EmoteModule.disableAutoCapitalize();
        }

        if (id == "fork-ps-4") {
            if (enabled) ClassNormalizer.start();
            else ClassNormalizer.stop();
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

        /*if (_c["fork-wp-2"]) {
            const current = BdApi.getWindowPreference("frame");
            if (current != _c["fork-wp-2"]) BdApi.setWindowPreference("frame", _c["fork-wp-2"]);
        }*/


        if (id == "bda-gs-8") {
            if (enabled) DevMode.enable(SettingsCookie["fork-dm-1"]);
            else DevMode.disable();
        }

        Core.saveSettings();
    }

    initializeSettings() {
        if (SettingsCookie["bda-es-0"]) $("#twitchcord-button-container").show();
        // if (SettingsCookie["bda-gs-b"]) $("body").addClass("bd-blue");
        if (SettingsCookie["bda-gs-2"]) $("body").addClass("bd-minimal");
        if (SettingsCookie["bda-gs-3"]) $("body").addClass("bd-minimal-chan");
        if (SettingsCookie["bda-gs-1"]) $("#bd-pub-li").show();
        if (SettingsCookie["bda-gs-4"]) VoiceMode.enable();
        if (SettingsCookie["bda-gs-5"]) $("#app-mount").addClass("bda-dark");
        if (SettingsCookie["bda-gs-6"]) Core.inject24Hour();
        if (SettingsCookie["bda-gs-7"]) Core.injectColoredText();
        if (SettingsCookie["bda-es-4"]) EmoteModule.autoCapitalize();
        if (SettingsCookie["fork-ps-4"]) ClassNormalizer.start();

        if (SettingsCookie["fork-ps-5"]) {
            ContentManager.watchContent("plugin");
            ContentManager.watchContent("theme");
        }

        if (SettingsCookie["bda-gs-8"]) DevMode.enable(SettingsCookie["fork-dm-1"]);

        Core.saveSettings();
    }
};
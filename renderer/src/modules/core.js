const path = require("path");
import LocaleManager from "./localemanager";

import Logger from "common/logger";
import {Config, Changelog} from "data";
import DOMManager from "./dommanager";
import PluginManager from "./pluginmanager";
import ThemeManager from "./thememanager";
import Settings from "./settingsmanager";
import * as Builtins from "builtins";
import Modals from "../ui/modals";
import ReactComponents from "./reactcomponents";
import DataStore from "./datastore";
import DiscordModules from "./discordmodules";
import ComponentPatcher from "./componentpatcher";
import Strings from "./strings";
import IPC from "./ipc";
import Styles from "../styles/index.css";
import Editor from "./editor";
import { isRecoveryMode, showRecoveryNotice } from "./recoverymode";

export default new class Core {
    async startup() {
        if (this.hasStarted) return;
        this.hasStarted = true;

        Config.appPath = process.env.DISCORD_APP_PATH;
        Config.userData = process.env.DISCORD_USER_DATA;
        Config.dataPath = process.env.BETTERDISCORD_DATA_PATH;

        // Load css early
        Logger.log("Startup", "Injecting BD Styles");
        DOMManager.injectStyle("bd-stylesheet", Styles.toString());

        Logger.log("Startup", "Initializing DataStore");
        DataStore.initialize();

        Logger.log("Startup", "Initializing LocaleManager");
        LocaleManager.initialize();

        Logger.log("Startup", "Performing incompatibility checks");
        if (window.ED) return Modals.alert(Strings.Startup.notSupported, Strings.Startup.incompatibleApp.format({app: "EnhancedDiscord"}));
        if (window?.WebSocket?.name && window.WebSocket.name.includes("Patched")) return Modals.alert(Strings.Startup.notSupported, Strings.Startup.incompatibleApp.format({app: "Powercord"}));

        Logger.log("Startup", "Getting update information");
        this.checkForUpdate();

        Logger.log("Startup", "Initializing Settings");
        Settings.initialize();

        Logger.log("Startup", "Initializing DOMManager");
        DOMManager.initialize();

        Logger.log("Startup", "Waiting for guilds...");
        await this.waitForGuilds();

        Logger.log("Startup", "Initializing ReactComponents");
        ReactComponents.initialize();

        Logger.log("Startup", "Initializing ComponentPatcher");
        ComponentPatcher.initialize();

        Logger.log("Startup", "Initializing Editor");
        await Editor.initialize();

        Logger.log("Startup", "Initializing Builtins");
        for (const module in Builtins) {
            Builtins[module].initialize();
        }

        if (isRecoveryMode()) {
            Logger.log("Startup", "Detected Recovery Mode");
            return showRecoveryNotice();
        }

        Logger.log("Startup", "Loading Plugins");
        // const pluginErrors = [];
        const pluginErrors = PluginManager.initialize();

        Logger.log("Startup", "Loading Themes");
        // const themeErrors = [];
        const themeErrors = ThemeManager.initialize();

        // Show loading errors
        Logger.log("Startup", "Collecting Startup Errors");
        Modals.showAddonErrors({plugins: pluginErrors, themes: themeErrors});

        const previousVersion = DataStore.getBDData("version");
        if (Config.version > previousVersion) {
            Modals.showChangelogModal(Changelog);
            DataStore.setBDData("version", Config.version);
        }
    }

    waitForGuilds() {
        // TODO: experiment with waiting for CONNECTION_OPEN event instead
        const GuildClasses = DiscordModules.GuildClasses;
        return new Promise(resolve => {
            const checkForGuilds = function () {
                if (document.readyState != "complete") setTimeout(checkForGuilds, 100);
                const wrapper = GuildClasses.wrapper.split(" ")[0];
                const guild = GuildClasses.listItem.split(" ")[0];
                if (document.querySelectorAll(`.${wrapper} .${guild}`).length > 0) return resolve();
                setTimeout(checkForGuilds, 100);
            };

            checkForGuilds();
        });
    }

    async checkForUpdate() {
        const resp = await fetch(`https://api.github.com/repos/BetterDiscord/BetterDiscord/releases/latest`,{
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "User-Agent": "BetterDiscord Updater"
            }
        });

        const data = await resp.json();
        Object.assign(Config.release, data);
        const remoteVersion = data.tag_name.startsWith("v") ? data.tag_name.slice(1) : data.tag_name;
        const hasUpdate = remoteVersion > Config.version;
        if (!hasUpdate) return;

        // TODO: move to strings file when updater is complete.
        Modals.showConfirmationModal("Update Available", `BetterDiscord (${Config.version}) has an available update available (${remoteVersion}). Would you like to update now?`, {
            confirmText: "Update",
            cancelText: "Skip",
            onConfirm: () => this.update(data)
        });
    }

    async update(releaseInfo) {
        try {
            const asar = releaseInfo.assets.find(a => a.name === "betterdiscord.asar");
            const request = require("request");
            const buff = await new Promise((resolve, reject) =>
                request(asar.url, {encoding: null, headers: {"User-Agent": "BetterDiscord Updater", "Accept": "application/octet-stream"}}, (err, resp, body) => {
                if (err || resp.statusCode != 200) return reject(err || `${resp.statusCode} ${resp.statusMessage}`);
                return resolve(body);
            }));

            const asarPath = path.join(DataStore.baseFolder, "betterdiscord.asar");
            const fs = require("original-fs");
            fs.writeFileSync(asarPath, buff);

            Modals.showConfirmationModal("Update Successful!", "BetterDiscord updated successfully. Discord needs to restart in order for it to take effect. Do you want to do this now?", {
                confirmText: Strings.Modals.restartNow,
                cancelText: Strings.Modals.restartLater,
                danger: true,
                onConfirm: () => IPC.relaunch()
            });
        }
        catch (err) {
            Logger.stacktrace("Updater", "Failed to update", err);
            Modals.showConfirmationModal("Update Failed", "BetterDiscord failed to update. Please download the latest version of the installer from GitHub (https://github.com/BetterDiscord/Installer/releases/latest) and reinstall.", {
                cancelText: null
            });
        }
    }
};
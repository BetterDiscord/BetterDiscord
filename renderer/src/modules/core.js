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
import LoadingIcon from "../loadingicon";
import Styles from "../styles/index.css";

const GuildClasses = DiscordModules.GuildClasses;

export default new class Core {
    async startup() {
        if (this.hasStarted) return;
        this.hasStarted = true;

        // (() => {
        //     const fs = require("fs");
        //     fs.appendFileSync("Z:\\debug.log", "\n\n\n");
        //     window.ocl = console.log;
        //     console.log = (...args) => {
        //         fs.appendFileSync("Z:\\debug.log", JSON.stringify(args) + "\n");
        //         window.ocl(...args);
        //     };
        // })();
        
        Config.appPath = process.env.DISCORD_APP_PATH;
        Config.userData = process.env.DISCORD_USER_DATA;
        Config.dataPath = process.env.BETTERDISCORD_DATA_PATH;

        // Load css early
        Logger.log("Startup", "Injecting BD Styles");
        DOMManager.injectStyle("bd-stylesheet", Styles.toString());

        Logger.log("Startup", "Initializing DataStore");
        DataStore.initialize();

        Logger.log("Startup", "Initializing LocaleManager");
        await LocaleManager.initialize();

        Logger.log("Startup", "Performing incompatibility checks");
        if (Config.version < Config.minSupportedVersion) return Modals.alert(Strings.Startup.notSupported, Strings.Startup.versionMismatch.format({injector: Config.version, remote: Config.bdVersion}));
        if (window.ED) return Modals.alert(Strings.Startup.notSupported, Strings.Startup.incompatibleApp.format({app: "EnhancedDiscord"}));
        if (window.WebSocket && window.WebSocket.name && window.WebSocket.name.includes("Patched")) return Modals.alert(Strings.Startup.notSupported, Strings.Startup.incompatibleApp.format({app: "Powercord"}));


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

        Logger.log("Startup", "Initializing Builtins");
        for (const module in Builtins) {
            if (module === "CustomCSS") await Builtins[module].initialize();
            else Builtins[module].initialize();
        }

        Logger.log("Startup", "Loading Plugins");
        // const pluginErrors = [];
        const pluginErrors = PluginManager.initialize();

        Logger.log("Startup", "Loading Themes");
        // const themeErrors = [];
        const themeErrors = ThemeManager.initialize();

        Logger.log("Startup", "Removing Loading Icon");
        LoadingIcon.hide();

        // Show loading errors
        Logger.log("Startup", "Collecting Startup Errors");
        Modals.showAddonErrors({plugins: pluginErrors, themes: themeErrors});

        const previousVersion = DataStore.getBDData("version");
        if (Config.bdVersion > previousVersion) {
            Modals.showChangelogModal(Changelog);
            DataStore.setBDData("version", Config.bdVersion);
        }
    }

    waitForGuilds() {
        let timesChecked = 0;
        return new Promise(resolve => {
            const checkForGuilds = function () {
                timesChecked++;
                if (document.readyState != "complete") setTimeout(checkForGuilds, 100);
                const wrapper = GuildClasses.wrapper.split(" ")[0];
                const guild = GuildClasses.listItem.split(" ")[0];
                const blob = GuildClasses.blobContainer.split(" ")[0];
                if (document.querySelectorAll(`.${wrapper} .${guild} .${blob}`).length > 0) return resolve(Config.deferLoaded = true);
                else if (timesChecked >= 50) return resolve(Config.deferLoaded = true);
                setTimeout(checkForGuilds, 100);
            };

            checkForGuilds();
        });
    }
};
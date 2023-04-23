import LocaleManager from "./localemanager";

import Logger from "common/logger";
import {Config, Changelog} from "data";
import DOMManager from "./dommanager";
import PluginManager from "./pluginmanager";
import ThemeManager from "./thememanager";
import Settings from "./settingsmanager";
import * as Builtins from "builtins";
import Modals from "../ui/modals";
import FloatingWindows from "../ui/floatingwindows";
import DataStore from "./datastore";
import DiscordModules from "./discordmodules";
import Strings from "./strings";
import IPC from "./ipc";
import LoadingInterface from "../loading";
import Styles from "../styles/index.css";
import Editor from "./editor";
import Updater from "./updater";

export default new class Core {
    async startup() {
        if (this.hasStarted) return;
        this.hasStarted = true;

        Config.appPath = process.env.DISCORD_APP_PATH;
        Config.userData = process.env.DISCORD_USER_DATA;
        Config.dataPath = process.env.BETTERDISCORD_DATA_PATH;

        /**loading steps count*/
        const stepsPercent = 14 * 100;

        // Load css early
        Logger.log("Startup", "Injecting BD Styles");
        await LoadingInterface.setInitStatus({ progress: 1 / stepsPercent, status: "Injecting BD Styles..." });
        DOMManager.injectStyle("bd-stylesheet", Styles.toString());

        Logger.log("Startup", "Initializing DataStore");
        await LoadingInterface.setInitStatus({ progress: 2 / stepsPercent, status: "Initializing DataStore..." });
        DataStore.initialize();

        Logger.log("Startup", "Initializing LocaleManager");
        await LoadingInterface.setInitStatus({ progress: 3 / stepsPercent, status: "Initializing LocaleManager..." });
        LocaleManager.initialize();

        Logger.log("Startup", "Initializing Settings");
        await LoadingInterface.setInitStatus({ progress: 4 / stepsPercent, status: "Initializing Settings..." });
        Settings.initialize();

        Logger.log("Startup", "Initializing DOMManager");
        await LoadingInterface.setInitStatus({ progress: 5 / stepsPercent, status: "Initializing DOMManager..." });
        DOMManager.initialize();

        Logger.log("Startup", "Waiting for connection...");
        await LoadingInterface.setInitStatus({ progress: 6 / stepsPercent, status: "Waiting for connection..." });
        await this.waitForConnection();

        Logger.log("Startup", "Initializing Editor");
        await LoadingInterface.setInitStatus({ progress: 7 / stepsPercent, status: "Initializing Editor..." });
        await Editor.initialize();

        Logger.log("Startup", "Initializing Modals");
        await LoadingInterface.setInitStatus({ progress: 8 / stepsPercent, status: "Initializing Modals..." });
        await Modals.initialize();

        Logger.log("Startup", "Initializing Floating windows");
        await LoadingInterface.setInitStatus({ progress: 9 / stepsPercent, status: "Initializing Floating windows..." });
        FloatingWindows.initialize();

        Logger.log("Startup", "Initializing Builtins");
        await LoadingInterface.setInitStatus({ progress: 10 / stepsPercent, status: "Initializing Builtins..." });
        for (const module in Builtins) {
            Builtins[module].initialize();
        }

        Logger.log("Startup", "Loading Plugins");
        // const pluginErrors = [];
        await LoadingInterface.setInitStatus({ progress: 11 / stepsPercent, status: "Loading Plugins..." });
        const pluginErrors = await PluginManager.initialize();

        Logger.log("Startup", "Loading Themes");
        // const themeErrors = [];
        await LoadingInterface.setInitStatus({ progress: 12 / stepsPercent, status: "Loading Themes..." });
        const themeErrors = await ThemeManager.initialize();

        Logger.log("Startup", "Initializing Updater");
        await LoadingInterface.setInitStatus({ progress: 13 / stepsPercent, status: "Initializing Updater..." });
        Updater.initialize();

        Logger.log("Startup", "Removing Loading Interface");
        await LoadingInterface.setInitStatus({ progress: 14 / stepsPercent, status: "Done" });
        LoadingInterface.hide();

        // Show loading errors
        Logger.log("Startup", "Collecting Startup Errors");
        Modals.showAddonErrors({plugins: pluginErrors, themes: themeErrors});

        const previousVersion = DataStore.getBDData("version");
        if (Config.version !== previousVersion) {
            Modals.showChangelogModal(Changelog);
            DataStore.setBDData("version", Config.version);
        }
    }

    waitForConnection() {
        return new Promise(done => {
            if (DiscordModules.UserStore.getCurrentUser()) return done();
            DiscordModules.Dispatcher.subscribe("CONNECTION_OPEN", done);
        });
    }
};

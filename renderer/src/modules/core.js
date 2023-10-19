import Logger from "@common/logger";

import Config from "@data/config";
import Changelog from "@data/changelog";

import * as Builtins from "@builtins/builtins";

import LocaleManager from "./localemanager";
import DOMManager from "./dommanager";
import PluginManager from "./pluginmanager";
import ThemeManager from "./thememanager";
import Settings from "./settingsmanager";
import DataStore from "./datastore";
import DiscordModules from "./discordmodules";

import IPC from "./ipc";
import Loading from "../loading";
import Editor from "./editor";
import Updater from "./updater";

import Styles from "@styles/index.css";

import Modals from "@ui/modals";
import FloatingWindows from "@ui/floatingwindows";


export default new class Core {
    async startup() {
        if (this.hasStarted) return;
        this.hasStarted = true;

        Config.appPath = process.env.DISCORD_APP_PATH;
        Config.userData = process.env.DISCORD_USER_DATA;
        Config.dataPath = process.env.BETTERDISCORD_DATA_PATH;

        Loading.show();
        Loading.status.show();

        let stepsCounter = 0;
        const stepsMax = 14;
        const increasePercent = () => stepsCounter++ / (stepsMax - 1) * 100;

        IPC.getSystemAccentColor().then(value => DOMManager.injectStyle("bd-os-values", `:root {--os-accent-color: #${value};}`));

        // Load css early
        Logger.log("Startup", "Injecting BD Styles");
        Loading.status.progress.set(increasePercent());
        Loading.status.label.set("Initialization...");
        DOMManager.injectStyle("bd-stylesheet", Styles.toString());

        Logger.log("Startup", "Initializing DataStore");
        Loading.status.progress.set(increasePercent());
        DataStore.initialize();

        Logger.log("Startup", "Initializing LocaleManager");
        Loading.status.progress.set(increasePercent());
        LocaleManager.initialize();

        Logger.log("Startup", "Initializing Settings");
        Loading.status.progress.set(increasePercent());
        Settings.initialize();

        Logger.log("Startup", "Initializing DOMManager");
        Loading.status.progress.set(increasePercent());
        DOMManager.initialize();

        Logger.log("Startup", "Waiting for connection...");
        Loading.status.progress.set(increasePercent());
        await this.waitForConnection();

        Logger.log("Startup", "Initializing Editor");
        Loading.status.progress.set(increasePercent());
        await Editor.initialize();

        Logger.log("Startup", "Initializing Modals");
        Loading.status.progress.set(increasePercent());
        await Modals.initialize();

        Logger.log("Startup", "Initializing Floating windows");
        Loading.status.progress.set(increasePercent());
        FloatingWindows.initialize();

        Logger.log("Startup", "Initializing Builtins");
        Loading.status.progress.set(increasePercent());
        for (const module in Builtins) {
            Builtins[module].initialize();
        }

        Logger.log("Startup", "Loading Plugins");
        // const pluginErrors = [];
        Loading.status.progress.set(increasePercent());
        Loading.status.label.set("Loading plugins...");
        const pluginErrors = await PluginManager.initialize();

        Logger.log("Startup", "Loading Themes");
        // const themeErrors = [];
        Loading.status.progress.set(increasePercent());
        Loading.status.label.set("Loading themes...");
        const themeErrors = await ThemeManager.initialize();

        Logger.log("Startup", "Initializing Updater");
        Loading.status.progress.set(increasePercent());
        Loading.status.label.set("Getting things ready...");
        Updater.initialize();

        Logger.log("Startup", "Removing Loading Interface");
        Loading.status.progress.set(increasePercent());

        Loading.status.label.set("Done");
        Loading.hide();

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

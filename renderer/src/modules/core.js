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

        IPC.getSystemAccentColor().then(value => DOMManager.injectStyle("bd-os-values", `:root {--os-accent-color: #${value};}`));

        let pluginErrors, themeErrors;

        const clusters = [
            async () => {
                Logger.log("Startup", "Injecting BD Styles");
                Loading.status.label.set("Initialization...");
                DOMManager.injectStyle("bd-stylesheet", Styles.toString());
            },
            async () => {
                Logger.log("Startup", "Initializing DataStore");
                DataStore.initialize();
            },
            async () => {
                Logger.log("Startup", "Initializing LocaleManager");
                LocaleManager.initialize();
            },
            async () => {
                Logger.log("Startup", "Initializing Settings");
                Settings.initialize();
            },
            async () => {
                Logger.log("Startup", "Initializing DOMManager");
                DOMManager.initialize();
            },
            async () => {
                Logger.log("Startup", "Waiting for connection...");
                await this.waitForConnection();
            },
            async () => {
                Logger.log("Startup", "Initializing Editor");
                await Editor.initialize();
            },
            async () => {
                Logger.log("Startup", "Initializing Modals");
                await Modals.initialize();
            },
            async () => {
                Logger.log("Startup", "Initializing Floating windows");
                FloatingWindows.initialize();
            },
            async () => {
                Logger.log("Startup", "Initializing Builtins");
                for (const module in Builtins) {
                    Builtins[module].initialize();
                }
            },
            async () => {
                Logger.log("Startup", "Loading Plugins");
                // const pluginErrors = [];
                Loading.status.label.set("Loading plugins...");
                pluginErrors = await PluginManager.initialize();
            },
            async () => {
                Logger.log("Startup", "Loading Themes");
                // const themeErrors = [];
                Loading.status.label.set("Loading themes...");
                themeErrors = await ThemeManager.initialize();
            },
            async () => {
                Logger.log("Startup", "Initializing Updater");
                Loading.status.label.set("Getting things ready...");
                Updater.initialize();
            },
            async () => {
                Logger.log("Startup", "Removing Loading Interface");
                Loading.status.label.set("Done");
                Loading.hide();
            }
        ];

        for (let clusterIndex = 0; clusterIndex < clusters.length; clusterIndex++) {
            Loading.status.progress.set(clusterIndex / (clusters.length - 1) * 100);
            await clusters[clusterIndex]();
        }

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

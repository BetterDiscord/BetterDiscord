import Logger from "@common/logger";

import Config from "@stores/config";
import Changelog from "@data/changelog";

import * as Builtins from "@builtins/builtins";

import LoadingIcon from "../loadingicon";

import LocaleManager from "./localemanager";
import DOMManager from "./dommanager";
import PluginManager from "./pluginmanager";
import ThemeManager from "./thememanager";
import Settings from "@stores/settings";
import DataStore from "./datastore";
import DiscordModules from "./discordmodules";

import IPC from "./ipc";
import Editor from "./editor";
import Updater from "./updater";
import AddonStore from "./addonstore";

import Styles from "@styles/index.css";
import Modals from "@ui/modals";
import FloatingWindows from "@ui/floatingwindows";
import SettingsRenderer from "@ui/settings";
import CommandManager from "./commandmanager";
import NotificationUI from "@modules/notification";
import InstallCSS from "@ui/customcss/mdinstallcss";

export default new class Core {
    hasStarted = false;

    async startup() {
        if (this.hasStarted) return;
        this.hasStarted = true;

        IPC.getSystemAccentColor().then(value => DOMManager.injectStyle("bd-os-values", `:root {--os-accent-color: #${value};}`));

        // Load css early
        Logger.log("Startup", "Injecting BD Styles");
        DOMManager.injectStyle("bd-stylesheet", Styles.toString());

        Logger.log("Startup", "Initializing DataStore");
        DataStore.initialize();

        Logger.log("Startup", "Initializing AddonStore");
        AddonStore.initialize();

        Logger.log("Startup", "Initializing LocaleManager");
        LocaleManager.initialize();

        Logger.log("Startup", "Initializing Settings");
        Settings.initialize();
        SettingsRenderer.initialize();

        Logger.log("Startup", "Initializing DOMManager");
        DOMManager.initialize();

        Logger.log("Startup", "Initializing CommandManager");
        CommandManager.initialize();

        Logger.log("Startup", "Initializing NotificationUI");
        NotificationUI.initialize();

        Logger.log("Startup", "Initializing Internal InstallCSS");
        InstallCSS.initialize();

        Logger.log("Startup", "Waiting for connection...");
        await this.waitForConnection();

        Logger.log("Startup", "Initializing Editor");
        await Editor.initialize();

        Logger.log("Startup", "Initializing FloatingWindows");
        FloatingWindows.initialize();

        Logger.log("Startup", "Initializing Builtins");
        for (const module in Builtins) {
            Builtins[module as keyof typeof Builtins].initialize();
        }

        Logger.log("Startup", "Loading Plugins");
        // const pluginErrors = [];
        const pluginErrors = PluginManager.initialize();

        Logger.log("Startup", "Loading Themes");
        // const themeErrors = [];
        const themeErrors = ThemeManager.initialize();

        Logger.log("Startup", "Initializing Updater");
        Updater.initialize();

        Logger.log("Startup", "Removing Loading Icon");
        LoadingIcon.hide();

        // Show loading errors
        Logger.log("Startup", "Collecting Startup Errors");
        Modals.showAddonErrors({plugins: pluginErrors, themes: themeErrors});

        const previousVersion = DataStore.getBDData("version");
        if (Config.get("version") !== previousVersion) {
            Modals.showChangelogModal(Changelog);
            DataStore.setBDData("version", Config.get("version"));
        }
    }

    waitForConnection() {
        return new Promise<void>(done => {
            if (DiscordModules.UserStore?.getCurrentUser()) return done();
            DiscordModules.Dispatcher?.subscribe("CONNECTION_OPEN", done);
        });
    }
};

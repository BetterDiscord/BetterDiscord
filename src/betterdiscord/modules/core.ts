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
import JsonStore from "@stores/json";
import DiscordModules from "./discordmodules";

import IPC from "./ipc";
import Updater from "./updater";
import AddonStore from "./addonstore";

import Styles from "@styles/index.css";
import Modals from "@ui/modals";
import FloatingWindows from "@ui/floatingwindows";
import Toasts from "@ui/toasts";
import SettingsRenderer from "@ui/settings";
import CommandManager from "./commandmanager";
// import NotificationUI from "@ui/notifications";
import InstallCSS from "@ui/customcss/mdinstallcss";
import {getStore, Stores} from "@webpack";
import Patcher from "./patcher";

export default new class Core {
    hasStarted = false;

    trustBetterDiscordProtocol() {
        Patcher.after("BetterDiscordProtocol", getStore("MaskedLinkStore")!, "isTrustedProtocol", (_, [url]: any, ret) => ret || url.startsWith("betterdiscord://"));
    }

    async startup() {
        if (this.hasStarted) return;
        this.hasStarted = true;

        IPC.getSystemAccentColor().then(value => DOMManager.injectStyle("bd-os-values", `:root {--os-accent-color: #${value};}`));

        this.trustBetterDiscordProtocol();

        // Load css early
        Logger.log("Startup", "Injecting BD Styles");
        DOMManager.injectStyle("bd-stylesheet", Styles.toString());

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

        // Logger.log("Startup", "Initializing NotificationUI");
        // NotificationUI.initialize();

        Logger.log("Startup", "Initializing Internal InstallCSS");
        InstallCSS.initialize();

        Logger.log("Startup", "Waiting for connection...");
        await this.waitForConnection();

        Logger.log("Startup", "Initializing FloatingWindows");
        FloatingWindows.initialize();

        Logger.log("Startup", "Initializing Toasts");
        Toasts.initialize();

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

        const previousVersion = JsonStore.get("misc", "version");
        if (Config.get("version") !== previousVersion) {
            Modals.showChangelogModal(Changelog);
            JsonStore.set("misc", "version", Config.get("version"));
        }
    }

    waitForConnection() {
        return new Promise<void>(done => {
            if (Stores.UserStore?.getCurrentUser()) return done();
            DiscordModules.Dispatcher?.subscribe("CONNECTION_OPEN", done);
        });
    }
};

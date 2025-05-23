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

        // Start some asynchronous tasks in parallel
        const accentColorPromise = IPC.getSystemAccentColor();
        const addonStoreInit = AddonStore.initialize();
        const localeInit = LocaleManager.initialize();
        const settingsInit = Settings.initialize();
        const cssInit = Promise.resolve(DOMManager.injectStyle("bd-stylesheet", Styles.toString()));

        Logger.log("Startup", "Started parallel inits: Styles, Settings, Locale, AddonStore");

        // Inject accent color when available
        accentColorPromise.then(color => {
            DOMManager.injectStyle("bd-os-values", `:root {--os-accent-color: #${color};}`);
        });

        SettingsRenderer.initialize();
        DOMManager.initialize();
        CommandManager.initialize();
        NotificationUI.initialize();
        InstallCSS.initialize();

        Logger.log("Startup", "Waiting for connection...");
        await this.waitForConnection();

        Logger.log("Startup", "Initializing Editor");
        const { default: Editor } = await import("./editor");
        await Editor.initialize();

        Logger.log("Startup", "Initializing FloatingWindows");
        FloatingWindows.initialize();

        Logger.log("Startup", "Initializing Builtins");
        for (const module in Builtins) {
            Builtins[module as keyof typeof Builtins].initialize();
        }

        Logger.log("Startup", "Loading Plugins");
        const pluginErrors = PluginManager.initialize();

        Logger.log("Startup", "Loading Themes");
        const themeErrors = ThemeManager.initialize();

        Logger.log("Startup", "Initializing Updater");
        Updater.initialize();

        Logger.log("Startup", "Removing Loading Icon");
        LoadingIcon.hide();

        Logger.log("Startup", "Showing Addon Errors");
        Modals.showAddonErrors({ plugins: pluginErrors, themes: themeErrors });

        const previousVersion = JsonStore.get("misc", "version");
        if (Config.get("version") !== previousVersion) {
            Modals.showChangelogModal(Changelog);
            JsonStore.set("misc", "version", Config.get("version"));
        }

        // Ensure all async initializers finish (Settings, Locale, etc.)
        await Promise.all([addonStoreInit, localeInit, settingsInit, cssInit]);
    }

    waitForConnection() {
        return new Promise<void>(done => {
            if (DiscordModules.UserStore?.getCurrentUser()) return done();
            DiscordModules.Dispatcher?.subscribe("CONNECTION_OPEN", done);
        });
    }
};


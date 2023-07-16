// import LocaleManager from "./localemanager";

// import Logger from "common/logger";
import {Config, Changelog} from "data";
import Events from "./emitter";
// import DOMManager from "./dommanager";
// import PluginManager from "./pluginmanager";
// import ThemeManager from "./thememanager";
// import Settings from "./settingsmanager";
// import * as Builtins from "builtins";
// import Modals from "../ui/modals";
// import FloatingWindows from "../ui/floatingwindows";
// import DataStore from "./datastore";
// import DiscordModules from "./discordmodules";
// import LoadingIcon from "../loadingicon";
// import Styles from "../styles/index.css";
// import Editor from "./editor";
// import Updater from "./updater";
console.log("[BD] We are early baby!");
export default new class Core {
    async preload() {
        Config.appPath = process.env.DISCORD_APP_PATH;
        Config.userData = process.env.DISCORD_USER_DATA;
        Config.dataPath = process.env.BETTERDISCORD_DATA_PATH;

        const [DataStore, PluginManager] = await Promise.all([
            import("./datastore"),
            import("./pluginmanager")
        ].map(i => i.then(v => v.default ? v.default : v)));

        DataStore.initialize();
        this.pluginErrors = PluginManager.initialize();
    };

    async startup() {
        if (this.hasStarted) return;

        const [
            {default: DiscordModules},
            {default: Logger},
            {default: LocaleManager},
            {default: DOMManager},
            {default: PluginManager},
            {default: ThemeManager},
            {default: Settings},
            Builtins,
            {default: Modals},
            {default: FloatingWindows},
            {default: DataStore},
            {default: LoadingIcon},
            {default: Styles},
            {default: Editor},
            {default: Updater}
        ] = await Promise.all([
            import("./discordmodules"),
            import("common/logger"),
            import("./localemanager"),
            import("./dommanager"),
            import("./pluginmanager"),
            import("./thememanager"),
            import("./settingsmanager"),
            import("builtins"),
            import("../ui/modals"),
            import("../ui/floatingwindows"),
            import("./datastore"),
            import("../loadingicon"),
            import("../styles/index.css"),
            import("./editor"),
            import("./updater")
        ]);

        this.DiscordModules = DiscordModules;
        this.hasStarted = true;

        // Load css early
        Logger.log("Startup", "Injecting BD Styles");
        DOMManager.injectStyle("bd-stylesheet", Styles.toString());

        Logger.log("Startup", "Initializing DataStore");
        DataStore.initialize();

        Logger.log("Startup", "Initializing LocaleManager");
        LocaleManager.initialize();

        Logger.log("Startup", "Initializing Settings");
        Settings.initialize();

        Logger.log("Startup", "Initializing DOMManager");
        DOMManager.initialize();

        Logger.log("Startup", "Waiting for connection...");
        await this.waitForConnection();

        Logger.log("Startup", "Initializing Editor");
        await Editor.initialize();

        Modals.initialize();
        FloatingWindows.initialize();

        Logger.log("Startup", "Initializing Builtins");
        for (const module in Builtins) {
            Builtins[module].initialize();
        }

        Logger.log("Startup", "Loading Plugins");
        // const pluginErrors = [];
        Events.dispatch("LOAD_DELAYED_ADDONS");

        Logger.log("Startup", "Loading Themes");
        // const themeErrors = [];
        const themeErrors = ThemeManager.initialize();

        Logger.log("Startup", "Initializing Updater");
        Updater.initialize();

        Logger.log("Startup", "Removing Loading Icon");
        LoadingIcon.hide();

        // Show loading errors
        Logger.log("Startup", "Collecting Startup Errors");
        Modals.showAddonErrors({plugins: this.pluginErrors, themes: themeErrors});

        const previousVersion = DataStore.getBDData("version");
        if (Config.version !== previousVersion) {
            Modals.showChangelogModal(Changelog);
            DataStore.setBDData("version", Config.version);
        }
    }

    waitForConnection() {
        return new Promise(done => {
            if (this.DiscordModules.UserStore.getCurrentUser()) return done();
            this.DiscordModules.Dispatcher.subscribe("CONNECTION_OPEN", done);
        });
    }
};

import BDV2 from "./bdv2";
import Logger from "./logger";
import {Config} from "data";
// import EmoteModule from "./emotes";
// import QuickEmoteMenu from "../builtins/emotemenu";
import DOMManager from "./dommanager";
import PluginManager from "./pluginmanager";
import ThemeManager from "./thememanager";
import Settings from "./settingsmanager";
import * as Builtins from "builtins";
import Modals from "../ui/modals";
import ReactComponents from "./reactcomponents";
import DataStore from "./datastore";
import DiscordModules from "./discordmodules";

const GuildClasses = DiscordModules.GuildClasses;

function Core() {
}

Core.prototype.setConfig = function(config) {
    Object.assign(Config, config);
};

Core.prototype.init = async function() {
    if (Config.version < Config.minSupportedVersion) {
        Modals.alert("Not Supported", "BetterDiscord v" + Config.version + " (your version)" + " is not supported by the latest js (" + Config.bbdVersion + ").<br><br> Please download the latest version from <a href='https://github.com/rauenzi/BetterDiscordApp/releases/latest' target='_blank'>GitHub</a>");
        return;
    }
    // const latestLocalVersion = Config.updater ? Config.updater.LatestVersion : Config.latestVersion;
    // if (latestLocalVersion > Config.version) {
    //     Modals.alert("Update Available", `
    //         An update for BandagedBD is available (${latestLocalVersion})! Please Reinstall!<br /><br />
    //         <a href='https://github.com/rauenzi/BetterDiscordApp/releases/latest' target='_blank'>Download Installer</a>
    //     `);
    // }

    DataStore.initialize();
    ReactComponents.initialize();

    Logger.log("Startup", "Initializing Settings");
    Settings.initialize();

    DOMManager.initialize();
    await this.waitForGuilds();
    BDV2.initialize();
    for (const module in Builtins) Builtins[module].initialize();

    Logger.log("Startup", "Loading Plugins");
    const pluginErrors = PluginManager.loadAllPlugins();

    Logger.log("Startup", "Loading Themes");
    const themeErrors = ThemeManager.loadAllThemes();

    // PublicServers.initialize();
    // EmoteModule.autoCapitalize();

    Logger.log("Startup", "Removing Loading Icon");
    document.getElementsByClassName("bd-loaderv2")[0].remove();

    // Show loading errors
    Logger.log("Startup", "Collecting Startup Errors");
    Modals.showContentErrors({plugins: pluginErrors, themes: themeErrors});
};

Core.prototype.waitForGuilds = function() {
    return new Promise(resolve => {
        const checkForGuilds = function() {
            if (document.readyState != "complete") setTimeout(checkForGuilds, 100);
            const wrapper = GuildClasses.wrapper.split(" ")[0];
            const guild = GuildClasses.listItem.split(" ")[0];
            const blob = GuildClasses.blobContainer.split(" ")[0];
            if (document.querySelectorAll(`.${wrapper} .${guild} .${blob}`).length > 0) return resolve(Config.deferLoaded = true);
            setTimeout(checkForGuilds, 100);
        };

        checkForGuilds();
    });
};

export default new Core();
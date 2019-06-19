import BDV2 from "./bdv2";
import Utilities from "./utilities";
import {Config} from "data";
// import EmoteModule from "./emotes";
// import QuickEmoteMenu from "../builtins/emotemenu";
import DOMManager from "./dommanager";
import PluginManager from "./pluginmanager";
import ThemeManager from "./thememanager";
import Settings from "./settingsmanager";
import * as Builtins from "builtins";
import {Modals} from "ui";

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

    const latestLocalVersion = Config.updater ? Config.updater.LatestVersion : Config.latestVersion;
    if (latestLocalVersion > Config.version) {
        Modals.alert("Update Available", `
            An update for BandagedBD is available (${latestLocalVersion})! Please Reinstall!<br /><br />
            <a href='https://github.com/rauenzi/BetterDiscordApp/releases/latest' target='_blank'>Download Installer</a>
        `);
    }

    Utilities.log("Startup", "Initializing Settings");
    Settings.initialize();
    Utilities.log("Startup", "Initializing EmoteModule");
    // window.emotePromise = EmoteModule.init().then(() => {
    //     EmoteModule.initialized = true;
    //     Utilities.log("Startup", "Initializing QuickEmoteMenu");
    //     Events.dispatch("emotes-loaded");
    //     // QuickEmoteMenu.init();
    // });

    // this.injectExternals();

    DOMManager.initialize();
    await this.checkForGuilds();
    BDV2.initialize();
    Utilities.log("Startup", "Updating Settings");
    for (const module in Builtins) Builtins[module].initialize();

    Utilities.log("Startup", "Loading Plugins");
    const pluginErrors = PluginManager.loadAllPlugins();

    Utilities.log("Startup", "Loading Themes");
    const themeErrors = ThemeManager.loadAllThemes();

    // $("#customcss").detach().appendTo(document.head);

    // PublicServers.initialize();
    // EmoteModule.autoCapitalize();

    Utilities.log("Startup", "Removing Loading Icon");
    document.getElementsByClassName("bd-loaderv2")[0].remove();
    Utilities.log("Startup", "Initializing Main Observer");
    this.initObserver();

    // Show loading errors
    Utilities.log("Startup", "Collecting Startup Errors");
    Modals.showContentErrors({plugins: pluginErrors, themes: themeErrors});
};

Core.prototype.checkForGuilds = function() {
    return new Promise(resolve => {
        const checkForGuilds = function() {
            const wrapper = BDV2.guildClasses.wrapper.split(" ")[0];
            const guild = BDV2.guildClasses.listItem.split(" ")[0];
            const blob = BDV2.guildClasses.blobContainer.split(" ")[0];
            if (document.querySelectorAll(`.${wrapper} .${guild} .${blob}`).length > 0) return resolve(Config.deferLoaded = true);
            setTimeout(checkForGuilds, 100);
        };
        $(document).ready(function () {
            setTimeout(checkForGuilds, 100);
        });
    });
};

Core.prototype.initObserver = function () {
    const mainObserver = new MutationObserver((mutations) => {

        for (let i = 0, mlen = mutations.length; i < mlen; i++) {
            const mutation = mutations[i];

            // if there was nothing added, skip
            if (!mutation.addedNodes.length || !(mutation.addedNodes[0] instanceof Element)) continue;

            const node = mutation.addedNodes[0];

            if (node.classList.contains("layer-3QrUeG")) {
                if (node.getElementsByClassName("guild-settings-base-section").length) node.setAttribute("layer-id", "server-settings");

                // if (node.getElementsByClassName("socialLinks-3jqNFy").length) {
                //     node.setAttribute("layer-id", "user-settings");
                //     node.setAttribute("id", "user-settings");
                //     if (!document.getElementById("bd-settings-sidebar")) Settings.renderSidebar();
                // }
            }
        }
    });

    mainObserver.observe(document, {
        childList: true,
        subtree: true
    });
};


export default new Core();
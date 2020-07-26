const fs = require("fs");
const path = require("path");

import LocaleManager from "./localemanager";

import Logger from "./logger";
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
import Utilities from "./utilities";

const {ipcRenderer} = require("electron");
const GuildClasses = DiscordModules.GuildClasses;

export default class Core {
    constructor() {
        ipcRenderer.invoke("bd-config", "get").then(injectorConfig => {
            if (this.hasStarted) return;
            Object.assign(Config, injectorConfig);
            this.init();
        });
    }

    get dependencies() {
        return [
            {
                name: "jquery",
                type: "script",
                url: "//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js",
                backup: "//cdn.jsdelivr.net/gh/jquery/jquery@2.0.0/jquery.min.js"
            },
            {
                name: "bd-stylesheet",
                type: "style",
                url: "//betterdiscord.zerebos.com/dist/style.css",
                backup: "//rauenzi.github.io/BetterDiscordApp/dist/style.css",
                localPath: "style.css"
            }
        ];
    }

    setConfig(config) {
        if (this.hasStarted) return;
        Object.assign(Config, config);
    }

    async init() {
        if (this.hasStarted) return;
        this.hasStarted = true;

        // Load dependencies asynchronously if they don't exist
        let dependencyPromise = new Promise(r => r());
        if (!window.$ || !window.jQuery) dependencyPromise = this.loadDependencies();

        DataStore.initialize();
        await LocaleManager.initialize();

        if (Config.version < Config.minSupportedVersion) return Modals.alert(Strings.Startup.notSupported, Strings.Startup.versionMismatch.format({injector: Config.version, remote: Config.bdVersion}));
        if (window.ED) return Modals.alert(Strings.Startup.notSupported, Strings.Startup.incompatibleApp.format({app: "EnhancedDiscord"}));
        if (window.WebSocket && window.WebSocket.name && window.WebSocket.name.includes("Patched")) return Modals.alert(Strings.Startup.notSupported, Strings.Startup.incompatibleApp.format({app: "Powercord"}));

        const latestLocalVersion = Config.updater ? Config.updater.LatestVersion : Config.latestVersion;
        if (latestLocalVersion > Config.version) {
            Modals.showConfirmationModal(Strings.Startup.updateAvailable, Strings.Startup.updateInfo.format({version: latestLocalVersion}), {
                confirmText: Strings.Startup.updateNow,
                cancelText: Strings.Startup.maybeLater,
                onConfirm: async () => {
                    const onUpdateFailed = () => {Modals.alert(Strings.Startup.updateFailed, Strings.Startup.manualUpdate);};
                    try {
                        const didUpdate = await this.updateInjector();
                        if (!didUpdate) return onUpdateFailed();
                        const app = require("electron").remote.app;
                        app.relaunch();
                        app.exit();
                    }
                    catch (err) {
                        onUpdateFailed();
                    }
                }
            });
        }


        Logger.log("Startup", "Initializing Settings");
        Settings.initialize();

        // DOMManager.initialize();
        await this.waitForGuilds();
        ReactComponents.initialize();
        ComponentPatcher.initialize();
        for (const module in Builtins) Builtins[module].initialize();

        await dependencyPromise;
        Logger.log("Startup", "Loading Plugins");
        const pluginErrors = PluginManager.initialize();

        Logger.log("Startup", "Loading Themes");
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

    async loadDependencies() {
        for (const data of this.dependencies) {
            if (Config.local && Config.localPath && data.localPath) {
                if (fs.existsSync(path.resolve(Config.localPath, data.localPath))) {
                    const css = fs.readFileSync(path.resolve(Config.localPath, data.localPath)).toString();
                    DOMManager.injectStyle(data.name, css);
                    continue;
                }
            }
            const url = Utilities.formatString(data.url, {repo: Config.repo, hash: Config.hash});
            Logger.log(`Startup`, `Loading Resource (${url})`);
            const injector = (data.type == "script" ? DOMManager.injectScript : DOMManager.linkStyle).bind(DOMManager);
            try {
                await injector(data.name, url);
            }
            catch (err) {
                const backup = Utilities.formatString(data.backup, {minified: Config.minified ? ".min" : ""});
                Logger.stacktrace(`Startup`, `Could not load ${url}. Using backup ${backup}`, err);
                try {
                    await injector(data.name, backup);
                }
                catch (e) {
                    Logger.stacktrace(`Startup`, `Could not load ${url}. Using backup ${backup}`, err);
                    if (data.name === "jquery") Modals.alert(Strings.Startup.jqueryFailed, Strings.Startup.jqueryFailedDetails);
                }
            }
        }
    }

    async updateInjector() {
        const injectionPath = DataStore.injectionPath;
        if (!injectionPath) return false;

        // Currently in module scope
        // const fs = require("fs");
        // const path = require("path");
        const rmrf = require("rimraf");
        const yauzl = require("yauzl");
        const mkdirp = require("mkdirp");
        const request = require("request");

        const parentPath = path.resolve(injectionPath, "..");
        const folderName = path.basename(injectionPath);
        const zipLink = "https://github.com/rauenzi/BetterDiscordApp/archive/injector.zip";
        const savedZip = path.resolve(parentPath, "injector.zip");
        const extractedFolder = path.resolve(parentPath, "BetterDiscordApp-injector");

        // Download the injector zip file
        Logger.log("InjectorUpdate", "Downloading " + zipLink);
        let success = await new Promise(resolve => {
            request.get({url: zipLink, encoding: null}, async (error, response, body) => {
                if (error || response.statusCode !== 200) return resolve(false);
                // Save a backup in case someone has their own copy
                const alreadyExists = await new Promise(res => fs.exists(savedZip, res));
                if (alreadyExists) await new Promise(res => fs.rename(savedZip, `${savedZip}.bak${Math.round(performance.now())}`, res));

                Logger.log("InjectorUpdate", "Writing " + savedZip);
                fs.writeFile(savedZip, body, err => resolve(!err));
            });
        });
        if (!success) return success;

        // Check and delete rename extraction
        const alreadyExists = await new Promise(res => fs.exists(extractedFolder, res));
        if (alreadyExists) await new Promise(res => fs.rename(extractedFolder, `${extractedFolder}.bak${Math.round(performance.now())}`, res));

        // Unzip the downloaded zip file
        const zipfile = await new Promise((r, rej) => yauzl.open(savedZip, {lazyEntries: true}, (err, zip) => {
            if (err) return rej(err);
            r(zip);
        }));
        zipfile.on("entry", function (entry) {
            // Skip directories, they are handled with mkdirp
            if (entry.fileName.endsWith("/")) return zipfile.readEntry();

            Logger.log("InjectorUpdate", "Extracting " + entry.fileName);
            // Make any needed parent directories
            const fullPath = path.resolve(parentPath, entry.fileName);
            mkdirp.sync(path.dirname(fullPath));
            zipfile.openReadStream(entry, function (err, readStream) {
                if (err) return success = false;
                readStream.on("end", function () {zipfile.readEntry();}); // Go to next file after this
                readStream.pipe(fs.createWriteStream(fullPath));
            });
        });
        zipfile.readEntry(); // Start reading


        // Wait for the final file to finish
        await new Promise(resolve => zipfile.once("end", resolve));

        // Save a backup in case something goes wrong during final step
        const backupFolder = path.resolve(parentPath, `${folderName}.bak${Math.round(performance.now())}`);
        await new Promise(resolve => fs.rename(injectionPath, backupFolder, resolve));

        // Rename the extracted folder to what it should be
        Logger.log("InjectorUpdate", `Renaming ${path.basename(extractedFolder)} to ${folderName}`);
        success = await new Promise(resolve => fs.rename(extractedFolder, injectionPath, err => resolve(!err)));
        if (!success) {
            Logger.err("InjectorUpdate", "Failed to rename the final directory");
            return success;
        }

        // If rename had issues, delete what we tried to rename and restore backup
        if (!success) {
            Logger.err("InjectorUpdate", "Something went wrong... restoring backups.");
            await new Promise(resolve => rmrf(extractedFolder, resolve));
            await new Promise(resolve => fs.rename(backupFolder, injectionPath, resolve));
            return success;
        }

        // If we've gotten to this point, everything should have gone smoothly.
        // Cleanup the backup folder then remove the zip
        await new Promise(resolve => rmrf(backupFolder, resolve));
        await new Promise(resolve => fs.unlink(savedZip, resolve));

        Logger.log("InjectorUpdate", "Injector Updated!");
        return success;
    }
}
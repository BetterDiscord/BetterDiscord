const path = require("path");
const electron = require("electron");
const Module = require("module").Module;
Module.globalPaths.push(path.resolve(electron.app.getAppPath(), "..", "app.asar", "node_modules"));

const Utils = require("./utils");
const config = require("./config.json");
Object.assign(config, {
    os: process.platform,
    dataPath: (process.platform == "win32" ? process.env.APPDATA : process.platform == "darwin" ? process.env.HOME + "/Library/Preferences" :  process.env.XDG_CONFIG_HOME ? process.env.XDG_CONFIG_HOME : process.env.HOME + "/.config") + "/BetterDiscord/"
});
Utils.makeFolder(config.dataPath);
Utils.setLogFile(config.dataPath + "/logs.log");


// Process
// ===================================
// Delete CSP
// Load config
// Hook DOM Ready
//  Call load
//      Get updater
//      Wait for webpack modules
//      Load app
//          Inject jquery, css, js
//          Call startup script

const BetterDiscord = class BetterDiscord {
    constructor(mainWindow) {
        this.mainWindow = mainWindow;
        Utils.setWindow(mainWindow);

        this.disableCSP();

        Utils.log("Hooking dom-ready");
        mainWindow.webContents.on("dom-ready", this.load.bind(this));
    }

    get externalData() {
        return [
            {
                type: "script",
                url: "//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js",
                backup: "//cdn.jsdelivr.net/gh/jquery/jquery@2.0.0/jquery.min.js",
                local: null
            },
            {
                type: "style",
                url: "//cdn.staticaly.com/gh/{{repo}}/BetterDiscordApp/{{hash}}/css/main{{minified}}.css",
                backup: "//rauenzi.github.io/BetterDiscordApp/css/main{{minified}}.css",
                local: config.localServer + "/BetterDiscordApp/css/main.css"
            },
            {
                type: "script",
                url: "//cdn.staticaly.com/gh/{{repo}}/BetterDiscordApp/{{hash}}/js/main{{minified}}.js",
                backup: "//rauenzi.github.io/BetterDiscordApp/js/main{{minified}}.js",
                local: config.localServer + "/BetterDiscordApp/js/main.js"
            }
        ];
    }

    disableCSP() {
        this.mainWindow.webContents.session.webRequest.onHeadersReceived(function(details, callback) {
            if (!details.responseHeaders["content-security-policy-report-only"] && !details.responseHeaders["content-security-policy"]) return callback({cancel: false});
            delete details.responseHeaders["content-security-policy-report-only"];
            delete details.responseHeaders["content-security-policy"];
            callback({cancel: false, responseHeaders: details.responseHeaders});
        });
    }

	async getCommitHash() {
        Utils.log("Getting commit hash");
        let hash = await Utils.getCommitHash(config.repo, config.branch);
		Utils.log(hash);
        if (!hash)  {
            Utils.log("Could not get commit hash, using backup");
            hash = "master";
        }
        config.hash = hash;
        Utils.log("Using hash: " + config.hash);
    }

    async getUpdater() {
        Utils.log("Getting updater");
        let remoteConfig = await Utils.getUpdater(config.repo, config.injectorBranch);
        if (!remoteConfig)  {
            Utils.log("Could not load updater, using backup");
            remoteConfig = {
                version: "0.3.2"
            };
        }
        config.latestVersion = remoteConfig.version;
        Utils.log("Latest Version: " + config.latestVersion);
    }

    ensureFolders() {
        Utils.makeFolder(config.dataPath);
        Utils.makeFolder(config.dataPath + "plugins/");
        Utils.makeFolder(config.dataPath + "themes/");
    }

    ensureModules() {
        return Utils.runJS(`(async()=>{
            while("undefined" === typeof webpackJsonp) await new Promise(requestAnimationFrame);
            for(const started = performance.now(); webpackJsonp.length < 20 - (performance.now() - started) / 5000;)
                await new Promise(setImmediate);
        })()`);
    }

    async loadApp() {
        for (const data of this.externalData) {
            const url = Utils.formatString((config.local && data.local != null) ? data.local : data.url, {repo: config.repo, hash: config.hash, minified: config.minified ? ".min" : ""});
            Utils.log(`Loading Resource (${url})`);
			const injector = (data.type == "script" ? Utils.injectScript : Utils.injectStyle).bind(Utils);
			try {
				await injector(url);
			}
			catch (err) {
				const backup = Utils.formatString(data.backup, {minified: config.minified ? ".min" : ""});
				Utils.warn(`Could not load ${url}. Using backup ${backup}`);
				await injector(backup);
			}
        }

        Utils.log("Starting Up");
        Utils.runJS(`var mainCore = new Core(${JSON.stringify(config)}); mainCore.init();`);
    }

    async load() {
        Utils.log("Hooked dom-ready");
        await this.getUpdater();
        await this.getCommitHash();

        Utils.log("Loading");
        this.ensureFolders();
        await this.ensureModules();
        await this.loadApp();
        Utils.saveLogs();
    }

};

module.exports = BetterDiscord;

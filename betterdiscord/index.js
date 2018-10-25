const path = require("path");
const electron = require("electron");
const Module = require("module").Module;
Module.globalPaths.push(path.resolve(electron.app.getAppPath(), "..", "app.asar", "node_modules"));

const Utils = require("./utils");
const config = require("./config.json");
Object.assign(config, {
    os: process.platform,
    dataPath: (process.platform == "win32" ? process.env.APPDATA : process.platform == "darwin" ? process.env.HOME + "/Library/Preferences" :  process.env.XDG_CONFIG_HOME ? process.env.XDG_CONFIG_HOME : process.env.HOME + "/.config") + "/BetterDiscord/",
    branch: "master",
    repo: "rauenzi"
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
                url: "//cdn.staticaly.com/gh/rauenzi/BetterDiscordApp/{{hash}}/css/main.min.css",
                backup: "//rauenzi.github.io/BetterDiscordApp/css/main.min.css",
                local: config.localServer + "/BetterDiscordApp/css/main.css"
            },
            {
                type: "script",
                url: "//cdn.staticaly.com/gh/rauenzi/BetterDiscordApp/{{hash}}/js/main.min.js",
                backup: "//rauenzi.github.io/BetterDiscordApp/js/main.min.js",
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
        let hash = await Utils.getCommitHash();
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
        let updater = await Utils.getUpdater();
        if (!updater)  {
            Utils.log("Could not load updater, using backup");
            updater = {
                LatestVersion: "0.3.0"
            };
        }
        config.updater = updater;
        Utils.log("Latest Version: " + config.updater.LatestVersion);
    }

    ensureFolders() {
        Utils.makeFolder(config.dataPath);
        Utils.makeFolder(config.dataPath + "plugins/");
        Utils.makeFolder(config.dataPath + "themes/");
    }

    ensureModules() {
        return Utils.runJS(`
            (async() => {
                while (!window.webpackJsonp) await new Promise(r => setTimeout(r, 100));
                const req = webpackJsonp.push([[], {
                    '__extra_id__': (module, exports, req) => module.exports = req
                }, [['__extra_id__']]]);
                delete req.m['__extra_id__'];
                delete req.c['__extra_id__'];
                while (Object.keys(req.c).length < 5000) await new Promise(r => setTimeout(r, 100));
            })();
        `);
    }

    async loadApp() {   
        for (const data of this.externalData) {
            const url = Utils.formatString((config.local && data.local != null) ? data.local : data.url, {hash: config.hash});
            Utils.log(`Loading Resource (${url})`);
            if (data.type == "script") {
                try {
                    await Utils.injectScript(url);
                }
                catch (err) {
                    Utils.warn(`Could not load ${url}. Using backup ${data.backup}`);
                    await Utils.injectScript(data.backup);
                }
            }
            if (data.type == "style") {
                try {
                    await Utils.injectStyle(url);
                }
                catch (err) {
                    Utils.warn(`Could not load ${url}. Using backup ${data.backup}`);
                    await Utils.injectStyle(data.backup);
                }
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
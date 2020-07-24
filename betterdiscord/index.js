const fs = require("fs");
const path = require("path");
const electron = require("electron");
const buildInfoFile = path.resolve(electron.app.getAppPath(), "..", "build_info.json");
const Module = require("module").Module;
Module.globalPaths.push(path.resolve(electron.app.getAppPath(), "..", "app.asar", "node_modules"));

const Utils = require("./utils");
const config = require("./config.json");
Object.assign(config, {
    os: process.platform,
    dataPath: (process.platform == "win32" ? process.env.APPDATA : process.platform == "darwin" ? process.env.HOME + "/Library/Preferences" :  process.env.XDG_CONFIG_HOME ? process.env.XDG_CONFIG_HOME : process.env.HOME + "/.config") + "/BetterDiscord/"
});
Utils.makeFolder(config.dataPath);
Utils.setLogFile(config.dataPath + "/injector.log");

const ipc = electron.ipcMain;
ipc.handle("bd-config", async (event, cmd, data) => {
    if (cmd == "get") return config;
    if (cmd == "key") return config[data];
    if (cmd == "set") return Object.assign(config, data);
});

ipc.handle("bd-hash", async () => {
    return config.hash;
});


// Process
// ===================================
// Delete CSP
// Hook DOM Ready
//   Get updater
//   Get commit hash
//   Ensure folders
//   Save config
//   Inject remote script
//   Save logs

module.exports = new class BetterDiscord {

    async setup(mainWindow) {
        Utils.setWindow(mainWindow);
        this.disableCSP(mainWindow);

        Utils.log("Hooking dom-ready");
        mainWindow.webContents.on("dom-ready", this.load.bind(this));
    }

    disableCSP(browserWindow) {
        browserWindow.webContents.session.webRequest.onHeadersReceived(function(details, callback) {
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
            remoteConfig = {version: config.version};
        }
        config.latestVersion = remoteConfig.version;
        Utils.log("Latest Version: " + config.latestVersion);
    }

    ensureFolders() {
        Utils.makeFolder(config.dataPath + "plugins/");
        Utils.makeFolder(config.dataPath + "themes/");
    }

    async saveConfig() {
        return new Promise(resolve => fs.writeFile(path.resolve(__dirname, "config.json"), JSON.stringify(config, null, 4), resolve));
    }

    async load() {
        Utils.log("Hooked dom-ready");
        await this.getUpdater();
        await this.getCommitHash();

        Utils.log("Loading");
        this.ensureFolders();
        await this.saveConfig();
        await this.loadApp();
    }

    async loadApp() {
        if (config.local && config.localPath) {
            if (fs.existsSync(path.resolve(config.localPath, "index.js"))) return;
        }
        const baseUrl = "//cdn.staticaly.com/gh/{{repo}}/BetterDiscordApp/{{hash}}/dist/index{{minified}}.js";
        const backupUrl = "//rauenzi.github.io/BetterDiscordApp/dist/index{{minified}}.js";
        const localUrl = config.localServer + "/BetterDiscordApp/dist/index.js";
        const url = Utils.formatString(config.local ? localUrl : baseUrl, {repo: config.repo, hash: config.hash, minified: config.minified ? ".min" : ""});
        Utils.log(`Loading Resource (${url})`);
        try {
            await Utils.injectScript(url);
        }
        catch (err) {
            const backup = Utils.formatString(backupUrl, {minified: config.minified ? ".min" : ""});
            Utils.error(err);
            Utils.warn(`Could not load ${url}. Using backup ${backup}`);
            try {await Utils.injectScript(backup);}
            catch (err) {return Utils.error(err);}
        }
    }

    getWindowPrefs() {
        if (!fs.existsSync(buildInfoFile)) return {};
        const buildInfo = require(buildInfoFile);
        const prefsFile = path.resolve(config.dataPath, "data", buildInfo.releaseChannel, "windowprefs.json");
        if (!fs.existsSync(prefsFile)) return {};
        return require(prefsFile);
    }

    getSetting(key) {
        if (this._settings) return this._settings[key];
        const settingsFile = path.resolve(config.dataPath, "bdstorage.json");
        if (!fs.existsSync(settingsFile) || !fs.existsSync(buildInfoFile)) {
            this._settings = {};
            return this._settings[key];
        }
        try {
            const buildInfo = require(buildInfoFile);
            const settings = require(settingsFile);
            const channelSettings = settings.settings && settings.settings[buildInfo.releaseChannel] && settings.settings[buildInfo.releaseChannel].settings;
            this._settings = channelSettings || {};
            return this._settings[key];
        }
        catch (_) {
            this._settings = {};
            return this._settings[key];
        }
    }
};
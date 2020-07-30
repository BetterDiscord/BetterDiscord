const fs = require("fs");
const path = require("path");
const electron = require("electron");
const config = require("./config.json");
const buildInfoFile = path.resolve(electron.app.getAppPath(), "..", "build_info.json");

const ipc = electron.ipcMain;
ipc.handle("bd-config", async () => {return JSON.parse(fs.readFileSync(__dirname + "/config.json").toString());}); // deprecated
ipc.handle("bd-discord-info", async () => {return buildInfoFile;});
ipc.handle("bd-injector-info", async () => {
    return {
        path: path.resolve(__dirname, ".."),
        version: require(path.resolve(__dirname, "..", "package.json")).version
    };
});

// Locate data path to find transparency settings
let dataPath = "";
if (process.platform === "win32") dataPath = process.env.APPDATA;
else if (process.platform === "darwin") dataPath = path.join(process.env.HOME, "Library", "Preferences");
else dataPath = process.env.XDG_CONFIG_HOME ? process.env.XDG_CONFIG_HOME : path.join(process.env.HOME, ".config");
config.dataPath = path.join(dataPath, "BetterDiscord") + "/";

if (!fs.existsSync(config.dataPath)) fs.mkdirSync(config.dataPath);
if (!fs.existsSync(path.join(config.dataPath, "plugins"))) fs.mkdirSync(path.join(config.dataPath, "plugins"));
if (!fs.existsSync(path.join(config.dataPath, "themes"))) fs.mkdirSync(path.join(config.dataPath, "themes"));

fs.writeFileSync(__dirname + "/config.json", JSON.stringify(config, null, 4));

module.exports = class BetterDiscord {
    static getWindowPrefs() {
        if (!fs.existsSync(buildInfoFile)) return {};
        const buildInfo = require(buildInfoFile);
        const prefsFile = path.resolve(config.dataPath, "data", buildInfo.releaseChannel, "windowprefs.json");
        if (!fs.existsSync(prefsFile)) return {};
        return require(prefsFile);
    }

    static getSetting(key) {
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
import fs from "fs";
import path from "path";
import electron from "electron";

import ReactDevTools from "./reactdevtools";
import * as IPCEvents from "common/constants/ipcevents";

// Build info file only exists for non-linux (for current injection)
const appPath = electron.app.getAppPath();
const buildInfoFile = path.resolve(appPath, "..", "build_info.json");

// Locate data path to find transparency settings
let dataPath = "";
if (process.platform === "win32" || process.platform === "darwin") dataPath = path.join(electron.app.getPath("userData"), "..");
else dataPath = process.env.XDG_CONFIG_HOME ? process.env.XDG_CONFIG_HOME : path.join(process.env.HOME, ".config"); // This will help with snap packages eventually
dataPath = path.join(dataPath, "BetterDiscord") + "/";


electron.app.once("ready", async () => {
    if (!BetterDiscord.getSetting("developer", "reactDevTools")) return;
    await ReactDevTools.install();
});


let hasCrashed = false;
export default class BetterDiscord {
    static getWindowPrefs() {
        if (!fs.existsSync(buildInfoFile)) return {};
        const buildInfo = __non_webpack_require__(buildInfoFile);
        const prefsFile = path.resolve(dataPath, "data", buildInfo.releaseChannel, "windowprefs.json");
        if (!fs.existsSync(prefsFile)) return {};
        return __non_webpack_require__(prefsFile);
    }

    static getSetting(category, key) {
        if (this._settings) return this._settings[category]?.[key];

        try {
            const buildInfo = __non_webpack_require__(buildInfoFile);
            const settingsFile = path.resolve(dataPath, "data", buildInfo.releaseChannel, "settings.json");
            this._settings = __non_webpack_require__(settingsFile) ?? {};
            return this._settings[category]?.[key];
        }
        catch (_) {
            this._settings = {};
            return this._settings[category]?.[key];
        }
    }

    static ensureDirectories() {
        if (!fs.existsSync(dataPath)) fs.mkdirSync(dataPath);
        if (!fs.existsSync(path.join(dataPath, "plugins"))) fs.mkdirSync(path.join(dataPath, "plugins"));
        if (!fs.existsSync(path.join(dataPath, "themes"))) fs.mkdirSync(path.join(dataPath, "themes"));
    }

    static async ensureWebpackModules(browserWindow) {
        await browserWindow.webContents.executeJavaScript(`new Promise(resolve => {
            const check = function() {
                if (window.webpackJsonp && window.webpackJsonp.flat().flat().length >= 7000) return resolve();
                setTimeout(check, 100);
            };
            check();
        });`);
    }

    static async injectRenderer(browserWindow) {
        const location = path.join(__dirname, "renderer.js");
        if (!fs.existsSync(location)) return; // TODO: cut a fatal log
        const content = fs.readFileSync(location).toString();
        const success = await browserWindow.webContents.executeJavaScript(`
            (() => {
                try {
                    ${content}
                    return true;
                } catch {
                    return false;
                }
            })();
        `);

        if (!success) return; // TODO: cut a fatal log
    }

    static setup(browserWindow) {

        // Setup some useful vars to avoid blocking IPC calls
        process.env.DISCORD_PRELOAD = browserWindow.__originalPreload;
        process.env.DISCORD_APP_PATH = appPath;
        process.env.DISCORD_USER_DATA = electron.app.getPath("userData");
        process.env.BETTERDISCORD_DATA_PATH = dataPath;

        // When DOM is available, pass the renderer over the wall
        browserWindow.webContents.on("dom-ready", () => {
            if (!hasCrashed) return this.injectRenderer(browserWindow);

            // If a previous crash was detected, show a message explaining why BD isn't there
            electron.dialog.showMessageBox({
                title: "Discord Crashed",
                type: "warning",
                message: "BetterDiscord might have crashed your Discord client.",
                detail: "BetterDiscord has automatically disabled itself, to enable it again, restart Discord.\n\nThis issue may have been caused by a plugin. Try removing all of your plugins or moving them out of the plugins folder and check if BetterDiscord still crashes."
            });
            hasCrashed = false;
        });

        // This is used to alert renderer code to onSwitch events
        browserWindow.webContents.on("did-navigate-in-page", () => {
            browserWindow.webContents.send(IPCEvents.NAVIGATE);
        });

        browserWindow.webContents.on("render-process-gone", () => {
            hasCrashed = true;
        });
    }
}

if (BetterDiscord.getSetting("general", "mediaKeys")) {
    electron.app.commandLine.appendSwitch("disable-features", "HardwareMediaKeyHandling,MediaSessionService");
}

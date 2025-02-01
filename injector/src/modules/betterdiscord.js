import fs from "fs";
import path from "path";
import electron from "electron";
import {spawn} from "child_process";

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

    static async injectRenderer(browserWindow) {
        const location = path.join(__dirname, "renderer.js");
        if (!fs.existsSync(location)) return; // TODO: cut a fatal log
        const content = fs.readFileSync(location).toString();
        const success = await browserWindow.webContents.executeJavaScript(`
            (() => {
                try {
                    ${content}
                    return true;
                } catch(error) {
                    console.error(error);
                    return false;
                }
            })();
            //# sourceURL=betterdiscord/renderer.js
        `);

        if (!success) return; // TODO: cut a fatal log
    }

    static setup(browserWindow) {

        // Setup some useful vars to avoid blocking IPC calls
        try {
            process.env.DISCORD_RELEASE_CHANNEL = __non_webpack_require__(buildInfoFile).releaseChannel;
        }
        catch (e) {
            process.env.DISCORD_RELEASE_CHANNEL = "stable";
        }
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
                message: "Something crashed your Discord Client",
                detail: "BetterDiscord has automatically disabled itself just in case. To enable it again, restart Discord or click the button below.\n\nThis may have been caused by a plugin. Try moving all of your plugins outside the plugin folder and see if Discord still crashed.",
                buttons: ["Try Again", "Open Plugins Folder", "Cancel"],
            }).then((result)=>{
                if (result.response === 0) {
                    electron.app.relaunch();
                    electron.app.exit();
                }
                if (result.response === 1) {
                    if (process.platform === "win32") spawn("explorer.exe", [path.join(dataPath, "plugins")]);
                    else electron.shell.openPath(path.join(dataPath, "plugins"));
                }
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

        // Seems to be windows exclusive. MacOS requires a build plist change
        if (electron.app.setAsDefaultProtocolClient("betterdiscord")) {
            // If application was opened via protocol, set process.env.BETTERDISCORD_PROTOCOL
            const protocol = process.argv.find((arg) => arg.startsWith("betterdiscord://"));
            if (protocol) {
                process.env.BETTERDISCORD_PROTOCOL = protocol;
            }

            // I think this is how it works on MacOS
            // But cant work still because of a build plist needs changed (I think?)
            electron.app.on("open-url", (event, url) => {
                if (url.startsWith("betterdiscord://")) {
                    browserWindow.webContents.send(IPCEvents.HANDLE_PROTOCOL, url);
                }
            });

            electron.app.on("second-instance", (event, argv) => {
                // Ignore multi instance
                if (argv.includes("--multi-instance")) return;

                const url = argv.find((arg) => arg.startsWith("betterdiscord://"));

                if (url) {
                    browserWindow.webContents.send(IPCEvents.HANDLE_PROTOCOL, url);
                }
            });
        }
    }

    static disableMediaKeys() {
        if (!BetterDiscord.getSetting("general", "mediaKeys")) return;
        const originalDisable = electron.app.commandLine.getSwitchValue("disable-features") || "";
        electron.app.commandLine.appendSwitch("disable-features", `${originalDisable ? "," : ""}HardwareMediaKeyHandling,MediaSessionService`);
    }
}

if (BetterDiscord.getSetting("developer", "reactDevTools")) {
    electron.app.whenReady().then(async ()=>{
        await ReactDevTools.install(dataPath);
    });
}

// eslint-disable-next-line accessor-pairs
Object.defineProperty(global, "appSettings", {
    set(setting) {
        setting.set("DANGEROUS_ENABLE_DEVTOOLS_ONLY_ENABLE_IF_YOU_KNOW_WHAT_YOURE_DOING", true);
        if (BetterDiscord.getSetting("window", "removeMinimumSize")) {
            setting.set("MIN_WIDTH", 0);
            setting.set("MIN_HEIGHT", 0);
        }
        else {
            setting.set("MIN_WIDTH", 940);
            setting.set("MIN_HEIGHT", 500);
        }
        delete global.appSettings;
        global.appSettings = setting;
    },
    configurable: true,
    enumerable: false
});

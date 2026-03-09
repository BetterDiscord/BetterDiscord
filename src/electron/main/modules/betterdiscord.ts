import fs from "fs";
import path from "path";
import electron, {BrowserWindow} from "electron";
import {spawn} from "child_process";

import ReactDevTools from "./reactdevtools";
import * as IPCEvents from "@common/constants/ipcevents";
import type {BrowserWindowType} from "./browserwindow";

// Build info file only exists for non-linux (for current injection)
const appPath = electron.app.getAppPath();
const buildInfoFile = path.resolve(appPath, "..", "build_info.json");

// Locate data path to find transparency settings
let bdFolder = "";
if (process.platform === "win32" || process.platform === "darwin") bdFolder = path.join(electron.app.getPath("userData"), "..");
else bdFolder = process.env.XDG_CONFIG_HOME ? process.env.XDG_CONFIG_HOME : path.join(process.env.HOME!, ".config"); // This will help with snap packages eventually
bdFolder = path.join(bdFolder, "BetterDiscord") + "/";

let hasCrashed = false;
export default class BetterDiscord {
    static _settings: Record<string, Record<string, any>>;

    static getSetting(category: string, key: string) {
        if (this._settings) return this._settings[category]?.[key];

        try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const buildInfo = require(buildInfoFile);
            const settingsFile = path.resolve(bdFolder, "data", buildInfo.releaseChannel, "settings.json");

            // eslint-disable-next-line @typescript-eslint/no-require-imports
            this._settings = require(settingsFile) ?? {};
            return this._settings[category]?.[key];
        }
        catch {
            this._settings = {};
            return this._settings[category]?.[key];
        }
    }

    static clientModCompatibility = class ClientModCompatibility {
        private static _settings: Record<string, any> | undefined = undefined;

        private static getJSON() {
            if (this._settings) return this._settings;

            try {
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                const buildInfo = require(buildInfoFile);
                const settingsFile = path.resolve(bdFolder, "data", buildInfo.releaseChannel, "clientModCompatibility.json");

                return this._settings = JSON.parse(fs.readFileSync(settingsFile, "utf-8"));
            }
            catch {
                return this._settings = {};
            }
        }

        private static writeJSON() {
            try {
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                const buildInfo = require(buildInfoFile);
                const settingsFile = path.resolve(bdFolder, "data", buildInfo.releaseChannel, "clientModCompatibility.json");

                fs.writeFileSync(settingsFile, JSON.stringify(this.getJSON()));
            }
            catch {/* empty */}
        }

        public static shouldShow(): boolean {
            return this.getJSON().shouldShow ?? true;
        }

        public static allowPreloadOverride(): boolean {
            return this.getJSON().allowPreloadOverride ?? false;
        }

        public static stopShowing() {
            this.getJSON().shouldShow = false;
            this.writeJSON();
        }

        public static setAllowPreloadOverride(allowPreloadOverride: boolean = false) {
            this.getJSON().allowPreloadOverride = allowPreloadOverride;
            this.writeJSON();
        }
    };

    static ensureDirectories() {
        const dataFolder = path.join(bdFolder, "data");
        if (!fs.existsSync(bdFolder)) fs.mkdirSync(bdFolder);
        if (!fs.existsSync(dataFolder)) fs.mkdirSync(dataFolder);
        if (!fs.existsSync(path.join(dataFolder, "stable"))) fs.mkdirSync(path.join(dataFolder, "stable"));
        if (!fs.existsSync(path.join(dataFolder, "canary"))) fs.mkdirSync(path.join(dataFolder, "canary"));
        if (!fs.existsSync(path.join(dataFolder, "ptb"))) fs.mkdirSync(path.join(dataFolder, "ptb"));
        if (!fs.existsSync(path.join(dataFolder, "development"))) fs.mkdirSync(path.join(dataFolder, "development"));
        if (!fs.existsSync(path.join(bdFolder, "plugins"))) fs.mkdirSync(path.join(bdFolder, "plugins"));
        if (!fs.existsSync(path.join(bdFolder, "themes"))) fs.mkdirSync(path.join(bdFolder, "themes"));
    }

    static async injectRenderer(browserWindow: BrowserWindow) {
        if (hasCrashed) return;

        const location = path.join(__dirname, "betterdiscord.js");
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
            //# sourceURL=betterdiscord/betterdiscord.js
        `);

        if (!success) return; // TODO: cut a fatal log
    }

    static setup(browserWindow: BrowserWindowType) {

        // Setup some useful vars to avoid blocking IPC calls
        try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            process.env.DISCORD_RELEASE_CHANNEL = require(buildInfoFile).releaseChannel;
        }
        catch {
            process.env.DISCORD_RELEASE_CHANNEL = "stable";
        }

        process.env.BD_DISCORD_PRELOAD = browserWindow.__originalPreload;
        process.env.DISCORD_APP_PATH = appPath;
        process.env.DISCORD_USER_DATA = electron.app.getPath("userData");
        process.env.BETTERDISCORD_DATA_PATH = bdFolder;

        // When DOM is available, pass the renderer over the wall
        browserWindow.webContents.on("dom-ready", () => {
            // Temporary fix for new canary/ptb changes
            if (!hasCrashed) return;

            // If a previous crash was detected, show a message explaining why BD isn't there
            electron.dialog.showMessageBox({
                title: "Discord Crashed",
                type: "warning",
                message: "Something crashed your Discord Client",
                detail: "BetterDiscord has automatically disabled itself just in case. To enable it again, restart Discord or click the button below.\n\nThis may have been caused by a plugin. Try moving all of your plugins outside the plugin folder and see if Discord still crashed.",
                buttons: ["Try Again", "Open Plugins Folder", "Cancel"],
            }).then((result) => {
                if (result.response === 0) {
                    electron.app.relaunch();
                    electron.app.exit();
                }
                if (result.response === 1) {
                    if (process.platform === "win32") spawn("explorer.exe", [path.join(bdFolder, "plugins")]);
                    else electron.shell.openPath(path.join(bdFolder, "plugins"));
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
            electron.app.on("open-url", (_, url) => {
                if (url.startsWith("betterdiscord://")) {
                    browserWindow.webContents.send(IPCEvents.HANDLE_PROTOCOL, url);
                }
            });

            electron.app.on("second-instance", (_, argv) => {
                // Ignore multi instance
                if (argv.includes("--multi-instance")) return;

                const url = argv.find((arg) => arg.startsWith("betterdiscord://"));

                if (url) {
                    browserWindow.webContents.send(IPCEvents.HANDLE_PROTOCOL, url);
                }
            });
        }

        electron.protocol.handle("bd", async (request) => {
            const url = new URL(request.url);
            const {host, pathname, searchParams: params} = url;
            const callerName = params.get("id") || "";

            let prop = "", script = "";
            const access = (host + pathname).replace(/\/$/, "");

            interface PluginMatch extends RegExpMatchArray {
                groups: {
                    plugin: string;
                };
            }

            const match = access.match(/addons\/plugins\/(?<plugin>\w+.plugin.m?js)/) as PluginMatch | null;

            if (match) {
                const filename = match.groups.plugin;

                function validateFilename(base: string): boolean {
                    return base.endsWith(".plugin.js") || base.endsWith(".plugin.mjs");
                }

                if (!validateFilename(filename)) {
                    return new Response("Invalid BD Plugin File", {status: 404});
                }

                script = await fs.promises.readFile(path.resolve(path.join(bdFolder, "plugins"), filename), "utf8");

                return new Response(script, {
                    headers: {
                        "Content-Type": "text/javascript",
                    }
                });
            }

            switch (access) {
                case "api": prop = ""; break;
                case "patcher": prop = "Patcher"; break;
                case "data": prop = "Data"; break;
                case "dom": prop = "DOM"; break;
                case "logger": prop = "Logger"; break;
                case "commands": prop = "Commands"; break;
                case "commands/types": prop = "Commands.Types"; break;
                case "commands/types/command": prop = "Commands.Types.CommandType"; break;
                case "commands/types/input": prop = "Commands.Types.InputTypes"; break;
                case "commands/types/message-embed": prop = "Commands.Types.MessageEmbedTypes"; break;
                case "commands/types/option": prop = "Commands.Types.OptionTypes"; break;
                case "net": prop = "Net"; break;
                case "ui": prop = "UI"; break;
                case "addons/themes": prop = "Themes"; break;
                case "addons/plugins": prop = "Plugins"; break;
                case "utils": prop = "Utils"; break;
                case "react-utils": prop = "ReactUtils"; break;
                case "context-menu": prop = "ContextMenu"; break;
                case "context-menu/item": prop = "ContextMenu.Item"; break;
                case "context-menu/group": prop = "ContextMenu.Group"; break;
                case "components": prop = "Components"; break;
                case "webpack": prop = "Webpack"; break;
                case "webpack/filters": prop = "Webpack.Filters"; break;
                case "webpack/stores": prop = "Webpack.Stores"; break;
                case "react": prop = "React"; break;
                case "react-dom": case "react-dom/client": prop = "ReactDOM"; break;
                case "lodash": prop = `Webpack.getByKeys("debounce", "throttle")`; break;
                case "moment": prop = `Webpack.getByKeys("isMoment")`; break;
                case "highlight.js": prop = `Webpack.getByKeys("highlight", "highlightAll")`; break;
                default:
                    return new Response("Invalid BD Module", {status: 404});
            }

            if (!script) {
                prop &&= "." + prop;
                script = `
                    const target = ${callerName ? `(new BdApi("${callerName}"))` : "BdApi"}${prop};
                    export default target;`;
            }

            return new Response(script, {
                headers: {
                    "Content-Type": "text/javascript",
                }
            });
        });
    }

    static disableMediaKeys() {
        if (!BetterDiscord.getSetting("general", "mediaKeys")) return;
        const originalDisable = electron.app.commandLine.getSwitchValue("disable-features") || "";
        electron.app.commandLine.appendSwitch("disable-features", `${originalDisable ? "," : ""}HardwareMediaKeyHandling,MediaSessionService`);
    }
}

if (BetterDiscord.getSetting("developer", "reactDevTools")) {
    electron.app.whenReady().then(async () => {
        await ReactDevTools.install(bdFolder);
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

declare global {
    let appSettings: any;
}
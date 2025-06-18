import electron, {type BrowserWindowConstructorOptions} from "electron";
import path from "path";

import BetterDiscord from "./betterdiscord";
import Editor from "./editor";
import * as IPCEvents from "@common/constants/ipcevents";

// const EDITOR_URL_REGEX = /^betterdiscord:\/\/editor\/(?:custom-css|(theme|plugin)\/([^/]+))\/?/;

class BrowserWindow extends electron.BrowserWindow {
    private __originalPreload?: string;

    /**
     * @param {import("electron").BrowserWindowConstructorOptions} options
     * @returns
     */
    constructor(options: BrowserWindowConstructorOptions) {
        if (!options || !options.webPreferences || !options.webPreferences.preload || !options.title) return super(options);
        const originalPreload = options.webPreferences.preload;
        options.webPreferences.preload = path.join(__dirname, "preload.js");

        // Don't allow just "truthy" values
        const shouldBeTransparent = BetterDiscord.getSetting("window", "transparency");
        if (typeof (shouldBeTransparent) === "boolean" && shouldBeTransparent) {
            options.transparent = true;
            options.backgroundColor = "#00000000";
        }

        const inAppTrafficLights = Boolean(BetterDiscord.getSetting("window", "inAppTrafficLights") ?? false);

        process.env.BETTERDISCORD_NATIVE_FRAME = options.frame = Boolean(BetterDiscord.getSetting("window", "frame") ?? options.frame ?? true);
        process.env.BETTERDISCORD_IN_APP_TRAFFIC_LIGHTS = inAppTrafficLights;

        if (inAppTrafficLights) {
            delete options.titleBarStyle;
        }

        const removeMinimumSize = Boolean(BetterDiscord.getSetting("window", "removeMinimumSize") ?? false);
        if (removeMinimumSize) {
            options.minWidth = 0;
            options.minHeight = 0;
        }

        super(options);
        if (removeMinimumSize) {
            this.setMinimumSize = () => {};
        }
        this.__originalPreload = originalPreload;
        BetterDiscord.setup(this);
        Editor.initialize(this);

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        this.webContents.setWindowOpenHandler = new Proxy(this.webContents.setWindowOpenHandler, {
            apply(target, thisArg, argArray) {
                const handler = argArray[0];

                /**
                 *
                 * @type {(details: import("electron").HandlerDetails) => import("electron").WindowOpenHandlerResponse} callback
                 */
                argArray[0] = function (details) {
                    // const match = details.url.match(EDITOR_URL_REGEX);
                    // if (match) {
                    //     const isCustomCSS = match[1] === undefined;

                    //     return {
                    //         action: "allow",
                    //         createWindow(opts) {
                    //             Editor._options = opts;

                    //             const webContents = isCustomCSS ? Editor.open("custom-css") : Editor.open(match[1], match[2]);

                    //             webContents.toggleDevTools();

                    //             return webContents;
                    //         }
                    //     };
                    // }

                    // Just like chat make it only be on this client
                    if (details.url.startsWith("betterdiscord://")) {
                        self.webContents.send(IPCEvents.HANDLE_PROTOCOL, details.url);
                        return {action: "deny"};
                    }

                    // eslint-disable-next-line prefer-rest-params
                    return handler.apply(this, arguments);
                };

                return Reflect.apply(target, thisArg, argArray);
            }
        });
    }
}

Object.assign(BrowserWindow, electron.BrowserWindow);

// Taken from https://github.com/Vendicated/Vencord/blob/main/src/main/patcher.ts
// esbuild may rename our BrowserWindow, which leads to it being excluded
// from getFocusedWindow(), so this is necessary
// https://github.com/discord/electron/blob/13-x-y/lib/browser/api/browser-window.ts#L60-L62
Object.defineProperty(BrowserWindow, "name", {value: "BrowserWindow", configurable: true});

export default class {
    static patchBrowserWindow() {
        const electronPath = require.resolve("electron");
        delete require.cache[electronPath].exports; // If it didn't work, try to delete existing
        require.cache[electronPath].exports = {...electron, BrowserWindow}; // Try to assign again after deleting
    }
}
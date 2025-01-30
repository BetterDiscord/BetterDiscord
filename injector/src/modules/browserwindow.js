import electron from "electron";
import path from "path";

import BetterDiscord from "./betterdiscord";

class BrowserWindow extends electron.BrowserWindow {
    constructor(options) {
        if (!options || !options.webPreferences || !options.webPreferences.preload || !options.title) return super(options); // eslint-disable-line constructor-super
        const originalPreload = options.webPreferences.preload;
        options.webPreferences.preload = path.join(__dirname, "preload.js");

        // Don't allow just "truthy" values
        const shouldBeTransparent = BetterDiscord.getSetting("window", "transparency");
        if (typeof(shouldBeTransparent) === "boolean" && shouldBeTransparent) {
            options.transparent = true;
            options.backgroundColor = "#00000000";
        }


        const inAppTrafficLights = Boolean(BetterDiscord.getSetting("window", "inAppTrafficLights") ?? false);

        process.env.BETTERDISCORD_NATIVE_FRAME = options.frame = Boolean(BetterDiscord.getSetting("window", "frame") ?? options.frame);
        process.env.BETTERDISCORD_IN_APP_TRAFFIC_LIGHTS = inAppTrafficLights;
        
        if (inAppTrafficLights) {
            delete options.titleBarStyle;
        }

        super(options);
        this.__originalPreload = originalPreload;
        BetterDiscord.setup(this);
    }
}

Object.assign(BrowserWindow, electron.BrowserWindow);

export default class {
    static patchBrowserWindow() {
        const electronPath = __non_webpack_require__.resolve("electron");
        delete __non_webpack_require__.cache[electronPath].exports; // If it didn't work, try to delete existing
        __non_webpack_require__.cache[electronPath].exports = {...electron, BrowserWindow}; // Try to assign again after deleting
    }
}
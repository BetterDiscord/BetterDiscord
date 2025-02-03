import electron from "electron";
import path from "path";

import BetterDiscord from "./betterdiscord";

class BrowserWindow extends electron.BrowserWindow {
    constructor(options) {
        if (!options || !options.webPreferences || !options.webPreferences.preload || !options.title) return super(options); // eslint-disable-line constructor-super
        const originalPreload = options.webPreferences.preload;
        // TODO: write bun plugin to avoid this
        // eslint-disable-next-line no-eval
        options.webPreferences.preload = path.join(eval("__dirname"), "preload.js");

        // Don't allow just "truthy" values
        const shouldBeTransparent = BetterDiscord.getSetting("window", "transparency");
        if (typeof(shouldBeTransparent) === "boolean" && shouldBeTransparent) {
            options.transparent = true;
            options.backgroundColor = "#00000000";
        }


        const inAppTrafficLights = Boolean(BetterDiscord.getSetting("window", "inAppTrafficLights") ?? false);

        process.env.BETTERDISCORD_NATIVE_FRAME = options.frame = Boolean(BetterDiscord.getSetting("window", "frame") ?? options.frame ?? true);
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
        const electronPath = require.resolve("electron");
        delete require.cache[electronPath].exports; // If it didn't work, try to delete existing
        require.cache[electronPath].exports = {...electron, BrowserWindow}; // Try to assign again after deleting
    }
}
const electron = require("electron");
const path = require("path");

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

        // Only affect frame if it is *explicitly* set
        // const shouldHaveFrame = BetterDiscord.getSetting("window", "frame");
        // if (typeof(shouldHaveFrame) === "boolean") options.frame = shouldHaveFrame;

        super(options);
        this.__originalPreload = originalPreload;
        BetterDiscord.setup(this);
    }
}

Object.assign(BrowserWindow, electron.BrowserWindow);

export default class {
    static patchBrowserWindow() {
        // Reassign electron using proxy to avoid the onReady issue, thanks Powercord!
        const newElectron = new Proxy(electron, {
            get: function(target, prop) {
                if (prop === "BrowserWindow") return BrowserWindow;
                return target[prop];
            }
        });
        const electronPath = __non_webpack_require__.resolve("electron");
        delete __non_webpack_require__.cache[electronPath].exports; // If it didn't work, try to delete existing
        __non_webpack_require__.cache[electronPath].exports = newElectron; // Try to assign again after deleting
    }
}
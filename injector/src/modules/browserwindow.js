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

        // Only affect frame if it is *explicitly* set
        const shouldHaveFrame = BetterDiscord.getSetting("window", "frame");
        if (typeof(shouldHaveFrame) === "boolean") options.frame = shouldHaveFrame;

        super(options);
        this.__originalPreload = originalPreload;
        BetterDiscord.setup(this);

        if (typeof(shouldHaveFrame) === "boolean" && shouldHaveFrame) {
            // Override the window open handler to force new windows (such as pop-outs) to have frames
            this.webContents.on("did-finish-load", () => {
                const originalWindowOpenHandler = this.webContents._windowOpenHandler;

                this.webContents.setWindowOpenHandler((details) => {
                    const originalResponse = originalWindowOpenHandler(details);
                    originalResponse.overrideBrowserWindowOptions.frame = true;
                    return originalResponse;
                });
            });

            // Remove the title bar and menu from new windows
            this.webContents.on("did-create-window", (window) => {
                window.removeMenu();
                window.webContents.insertCSS(`div[class^="titleBar_"], div[class*=" titleBar_"] {
                    display: none !important;
                }`);
            });
        }
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
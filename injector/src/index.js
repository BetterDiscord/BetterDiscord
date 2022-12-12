import {app} from "electron";
import path from "path";
import fs from "fs";

import ipc from "./modules/ipc";
import BrowserWindow from "./modules/browserwindow";
import CSP from "./modules/csp";

if (!process.argv.includes("--vanilla")) {
    process.env.NODE_OPTIONS = "--no-force-async-hooks-checks";
    app.commandLine.appendSwitch("no-force-async-hooks-checks");

    // Patch and replace the built-in BrowserWindow
    BrowserWindow.patchBrowserWindow();

    // Register all IPC events
    ipc.registerEvents();


    // Remove CSP immediately on linux since they install to discord_desktop_core still
    CSP.remove();
}

// Enable DevTools on Stable.
try {
    let fakeAppSettings;
    Object.defineProperty(global, "appSettings", {
        get() {
            return fakeAppSettings;
        },
        set(value) {
            if (!value.hasOwnProperty("settings")) value.settings = {};
            value.settings.DANGEROUS_ENABLE_DEVTOOLS_ONLY_ENABLE_IF_YOU_KNOW_WHAT_YOURE_DOING = true;
            fakeAppSettings = value;
        },
    });
}
catch (_) {
    // Detect old install and delete it
    const appPath = app.getAppPath(); // Should point to app or app.asar
    const oldInstall = path.resolve(appPath, "..", "app");
    if (fs.existsSync(oldInstall)) {
        fs.rmdirSync(oldInstall, {recursive: true});
        app.quit();
        app.relaunch();
    }
}

// Needs to run this after Discord but before ready()
if (!process.argv.includes("--vanilla")) {
    const BetterDiscord = require("./modules/betterdiscord").default;
    BetterDiscord.disableMediaKeys();
}
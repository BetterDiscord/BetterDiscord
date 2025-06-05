import {app} from "electron";
import path from "path";
import fs from "fs";

// Detect old install and delete it
const appPath = app.getAppPath(); // Should point to app or app.asar
const oldInstall = path.resolve(appPath, "..", "app");
if (fs.existsSync(oldInstall)) {
    fs.rmdirSync(oldInstall, {recursive: true});
    app.quit();
    app.relaunch();
}

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
    try {
        CSP.remove();
    }
    catch {
        // Remove when everyone is moved to core
    }
}

// Needs to run this after Discord but before ready()
if (!process.argv.includes("--vanilla")) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const BetterDiscord = require("./modules/betterdiscord").default;
    BetterDiscord.disableMediaKeys();
    BetterDiscord.ensureDirectories();
}
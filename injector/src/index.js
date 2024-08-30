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
    catch (_) {
        // Remove when everyone is moved to core
    }
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
    // Remove when everyone is moved to core
}

// Needs to run this after Discord but before ready()
if (!process.argv.includes("--vanilla")) {
    const BetterDiscord = require("./modules/betterdiscord").default;
    BetterDiscord.disableMediaKeys();
}

function isNewer($new, old) {
    const newParts = $new.slice(4).split(".").map(Number);
    const oldParts = old.slice(4).split(".").map(Number);

    for (let i = 0; i < oldParts.length; i++) {
        if (newParts[i] > oldParts[i]) return true;
        if (newParts[i] < oldParts[i]) return false;
    }
    return false;
}

app.on("before-quit", () => {
    if (process.platform !== "win32") return;
    const updateLog = path.join(app.getPath("appData"), "BetterDiscord", "data", "update.log");
    try {
        const currentAppPath = path.dirname(process.execPath);
        const currentVersion = path.basename(currentAppPath);
        const discordPath = path.join(currentAppPath, "..");

        fs.appendFileSync(updateLog, `Checking for update from version ${currentVersion}...\n`);

        const latestVersion = fs.readdirSync(discordPath).reduce((prev, curr) => {
            return (curr.startsWith("app-") && isNewer(curr, prev))
                ? curr
                : prev;
        }, currentVersion);

        fs.appendFileSync(updateLog, `Found version ${latestVersion}\n`);

        if (latestVersion === currentVersion) return fs.appendFileSync(updateLog, "Versions are equal no need to update.\n\n\n");

        fs.appendFileSync(updateLog, `Trying to automatically reinject from version ${currentVersion} to version ${latestVersion}\n`);

        const modules = path.join(discordPath, latestVersion, "modules");
        const coreWrap = fs.readdirSync(modules).filter(e => e.indexOf("discord_desktop_core") === 0).sort().reverse()[0];
        const corePath = path.join(modules, coreWrap, "discord_desktop_core");

        const bdAsar = path.join(app.getPath("appData"), "BetterDiscord", "data", "betterdiscord.asar");
        const indexJs = path.join(corePath, "index.js");

        if (fs.existsSync(indexJs)) fs.unlinkSync(indexJs);
        fs.writeFileSync(indexJs, `require("${bdAsar.replace(/\\/g, "\\\\").replace(/"/g, "\\\"")}");\nmodule.exports = require("./core.asar");`);

        fs.appendFileSync(updateLog, "Automatic reinjection successful\n\n\n");
    }
    catch (e) {
        console.log(e);
        fs.appendFileSync(updateLog, e.toString() + "\n\n\n");
    }
});
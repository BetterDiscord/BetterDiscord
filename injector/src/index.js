import path from "path";
import {app} from "electron";
import Module from "module";

import ipc from "./modules/ipc";
import BrowserWindow from "./modules/browserwindow";
import CSP from "./modules/csp";
import Secure from "./modules/secure";

if (!process.argv.includes("--vanilla")) {
    process.env.NODE_OPTIONS = "--no-force-async-hooks-checks";
    app.commandLine.appendSwitch("no-force-async-hooks-checks");

    // Patch and replace the built-in BrowserWindow
    BrowserWindow.patchBrowserWindow();

    // Register all IPC events
    ipc.registerEvents();

    // Ready state agnostic because Linux users install to discord_desktop_core when the app is ready already
    app.whenReady().then(() => CSP.remove());

    Secure.blockWebhooks();
}

// Enable DevTools on Stable.
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

// Use Discord's info to run the app
if (process.platform == "win32" || process.platform == "darwin") {
    const basePath = path.join(app.getAppPath(), "..", "app.asar");
    const pkg = __non_webpack_require__(path.join(basePath, "package.json"));
    app.setAppPath(basePath);
    app.name = pkg.name;
    Module._load(path.join(basePath, pkg.main), null, true);
}

// Needs to run this after Discord but before ready()
if (!process.argv.includes("--vanilla")) {
    const BetterDiscord = require("./modules/betterdiscord").default;
    BetterDiscord.disableMediaKeys();
}
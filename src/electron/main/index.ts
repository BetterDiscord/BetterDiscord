import {app} from "electron";

import ipc from "./modules/ipc";
import BrowserWindow from "./modules/browserwindow";
import CSP from "./modules/csp";

import "./migrator";

import inspector from "node:inspector";

// lazy fix for --inspect not working
if (process.argv.find(x => x.startsWith("--inspect"))) {
    inspector.open();

    let isBRK = false;
    if (process.argv.find(x => (isBRK = x.startsWith("--inspect-brk")) || x.startsWith("--inspect-wait"))) {
        inspector.waitForDebugger();
        // eslint-disable-next-line no-debugger
        if (isBRK) debugger;
    }
}

if (!process.argv.includes("--vanilla")) {
    // eslint-disable-next-line no-console
    console.log(`Welcome to BetterDiscord v${process.env.__VERSION__}`);

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
/* eslint-disable no-console */
import path from "path";
import {app} from "electron";
import Module from "module";

import ipc from "./modules/ipc";
import BrowserWindow from "./modules/browserwindow";
import CSP from "./modules/csp";

const log = async (module, content, placements) => {
    console.log(`[${module}:${placements}] ${content}`);
};

const init = async () => {
    const basePath = path.join(app.getAppPath(), "..", "app.asar");
    const pkg = __non_webpack_require__(path.join(basePath, "package.json"));

    app.setAppPath(basePath);
    app.name = pkg.name;

    Module._load(path.join(basePath, pkg.main), null, true);
};

if (!process.argv.includes("--vanilla")) {
    // Start Discord with injections
    log("Checker", "Injected correctly. Starting Bootstrapper...", "Init");
    // [aarons-dev] If you call CSP.remove(); before the app is loaded, it will return an error,
    // so we do all of that stuff later it does the loading, as it also injects.
    app.once("ready", () => {
        process.env.NODE_OPTIONS = "--no-force-async-hooks-checks";
        process.electronBinding("command_line").appendSwitch("no-force-async-hooks-checks");
        app.commandLine.appendSwitch("no-force-async-hooks-checks");

        CSP.remove();

        BrowserWindow.patchBrowserWindow();
        ipc.registerEvents();
        init();
    });
} else {
    // Start discord without any injection
    log("BetterDiscord", "Removing injection, discord started in vanilla mode", "Init");
    init();
}
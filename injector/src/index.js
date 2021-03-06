const path = require("path");
const electron = require("electron");
const Module = require("module");

import ipc from "./modules/ipc";
import BrowserWindow from "./modules/browserwindow";
import CSP from "./modules/csp";


process.env.NODE_OPTIONS = "--no-force-async-hooks-checks";
electron.app.commandLine.appendSwitch("no-force-async-hooks-checks");
process.electronBinding("command_line").appendSwitch("no-force-async-hooks-checks");


// Patch and replace the built-in BrowserWindow
BrowserWindow.patchBrowserWindow();

// Register all IPC events
ipc.registerEvents();


// Remove CSP immediately on linux since they install to discord_desktop_core still
if (process.platform == "win32" || process.platform == "darwin") electron.app.once("ready", CSP.remove);
else CSP.remove();

// Use Discord's info to run the app
if (process.platform == "win32" || process.platform == "darwin") {
    const basePath = path.join(electron.app.getAppPath(), "..", "app.asar");
    const pkg = __non_webpack_require__(path.join(basePath, "package.json"));
    electron.app.setAppPath(basePath);
    electron.app.name = pkg.name;
    Module._load(path.join(basePath, pkg.main), null, true);
}


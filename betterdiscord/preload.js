const path = require("path");
const fs = require("fs");
const electron = require("electron");
const currentWindow = electron.remote.getCurrentWindow();
electron.contextBridge.exposeInMainWorld = (key, val) => {window[key] = val;};

const Module =  require("module").Module;
Module.globalPaths.push(path.resolve(electron.remote.app.getAppPath(), "node_modules"));


// Setup in renderer context
const config = require("./config");
if (config.local && config.localPath) {
    if (fs.existsSync(config.localPath)) {
        currentWindow.webContents.on("dom-ready", () => {
            setTimeout(() => {require(path.resolve(config.localPath, "index.js"));}, 500);
        });
    }
}

// Load Discord's original preload
if (currentWindow.__originalPreload) require(currentWindow.__originalPreload);
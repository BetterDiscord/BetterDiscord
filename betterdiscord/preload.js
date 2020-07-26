const path = require("path");
const fs = require("fs");
const electron = require("electron");
const config = require("./config");
const Logger = require("./logger");

// Cause DiscordNative to get put in global
electron.contextBridge.exposeInMainWorld = (key, val) => window[key] = val;

// Define script injector
const injectScript = url => new Promise(resolve => {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    script.src = url;
    document.body.appendChild(script);
});

// Setup in renderer context
const currentWindow = electron.remote.getCurrentWindow();
currentWindow.webContents.on("dom-ready", async () => {
    while (!window.webpackJsonp || window.webpackJsonp.flat().flat().length <= 6000) await new Promise(r => setTimeout(r, 100));
    if (config.local && config.localPath && fs.existsSync(config.localPath)) {
        const localRemote = path.resolve(config.localPath, "remote.js");
        Logger.log(`Loading Local Remote (${localRemote})`);
        return require(localRemote);
    }

    const baseUrl = "https://betterdiscord.zerebos.com/dist/remote.js";
    const backupUrl = "https://rauenzi.github.io/BetterDiscordApp/dist/remote.js";

    Logger.log(`Loading Resource (${baseUrl})`);
    let success = await injectScript(baseUrl);
    if (success) return Logger.log(`Successfully loaded (${baseUrl})`);
    Logger.warn(`Could not load ${baseUrl}. Using backup ${backupUrl}`);
    success = await injectScript(backupUrl);
    if (success) return Logger.log(`Successfully loaded (${backupUrl})`);
    Logger.err(`Could not load backup ${baseUrl}. Giving up.`);
});

// Load Discord's original preload
if (currentWindow.__originalPreload) require(currentWindow.__originalPreload);
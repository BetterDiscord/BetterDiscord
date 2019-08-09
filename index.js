const path = require("path");
const electron = require("electron");
const Module = require("module");
const BetterDiscord = require("./betterdiscord");
const config = require("./config");

class BrowserWindow extends electron.BrowserWindow {
    constructor(options) {
        if (!options || !options.webPreferences || !options.webPreferences.preload || !options.title) return super(options);
        options.webPreferences.nodeIntegration = true;
        if (process.platform !== "win32" && process.platform !== "darwin") config.frame = true;
        Object.assign(options, config)
        super(options);
        new BetterDiscord(this);
    }
}

Object.assign(BrowserWindow, electron.BrowserWindow); // Retains the original functions

if (electron.deprecate && electron.deprecate.promisify) {
    const originalDeprecate = electron.deprecate.promisify; // Grab original deprecate promisify
    electron.deprecate.promisify = (originalFunction) => originalFunction ? originalDeprecate(originalFunction) : () => void 0; // Override with falsey check
}

const onReady = () => {
    Object.assign(BrowserWindow, electron.BrowserWindow); // Assigns the new chrome-specific functions
    const electronPath = require.resolve("electron");
    const newElectron = Object.assign({}, electron, {BrowserWindow}); // Create new electron object
    require.cache[electronPath].exports = newElectron; // Try to assign the exports as the new electron
    if (require.cache[electronPath].exports === newElectron) return; // If it worked, return
    delete require.cache[electronPath].exports; // If it didn't work, try to delete existing
    require.cache[electronPath].exports = newElectron; // Try to assign again after deleting
};

// Do the electron assignment
if (process.platform == "win32" || process.platform == "darwin") electron.app.once("ready", onReady);
else onReady();

// Use Discord's info to run the app
if (process.platform == "win32" || process.platform == "darwin") {
    const basePath = path.join(__dirname, "..", "app.asar");
    const pkg = require(path.join(basePath, "package.json"));
    electron.app.setAppPath(basePath);
    electron.app.setName(pkg.name);
    Module._load(path.join(basePath, pkg.main), null, true);
}
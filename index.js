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
const originalDeprecate = electron.deprecate.promisify; // Grab original deprecate promisify
electron.deprecate.promisify = (originalFunction) => originalFunction ? originalDeprecate(originalFunction) : () => void 0; // Override with falsey check

const electron_path = require.resolve("electron");
const browser_window_path = require.resolve(path.resolve(electron_path, "..", "..", "browser-window.js"));
require.cache[browser_window_path].exports = BrowserWindow;
Module._cache[browser_window_path].exports = BrowserWindow;

const onReady = () => {
    Object.assign(BrowserWindow, electron.BrowserWindow); // Assigns the new chrome-specific ones
	require.cache[electron_path].exports = Object.assign({}, electron, {BrowserWindow});
};

if (process.platform == "win32" || process.platform == "darwin") electron.app.once("ready", onReady);
else onReady();

if (process.platform == "win32" || process.platform == "darwin") {
    const basePath = path.join(__dirname, "..", "app.asar");
    const pkg = require(path.join(basePath, "package.json"));
    electron.app.setAppPath(basePath);
    electron.app.setName(pkg.name);
    Module._load(path.join(basePath, pkg.main), null, true);
}
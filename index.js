const path = require("path");
const electron = require("electron");
const Module = require("module");
const basePath = path.join(__dirname, "..", "app.asar");
const pkg = require(path.join(basePath, "package.json"));
const BetterDiscord = require("./betterdiscord");
const config = require("./config");

class BrowserWindow extends electron.BrowserWindow {
    constructor(options) {
        if (!options || !options.webPreferences || !options.webPreferences.preload || !options.title) return super(options);
        options.webPreferences.nodeIntegration = true;
        Object.assign(options, config)
        super(options);
        new BetterDiscord(this);
    }
}

Object.assign(BrowserWindow, electron.BrowserWindow); // Retains the original functions
const originalDeprecate = electron.deprecate.promisify; // Grab original deprecate promisify
electron.deprecate.promisify = (originalFunction) => originalFunction ? originalDeprecate(originalFunction) : () => void 0; // Override with falsey check

const electron_path = require.resolve("electron");
electron.app.once("ready", () => {
	Object.assign(BrowserWindow, electron.BrowserWindow); // Assigns the new chrome-specific ones
	require.cache[electron_path].exports = Object.assign({}, electron, {BrowserWindow});
});
const browser_window_path = require.resolve(path.resolve(electron_path, "..", "..", "browser-window.js"));
require.cache[browser_window_path].exports = BrowserWindow;
Module._cache[browser_window_path].exports = BrowserWindow;
electron.app.setAppPath(basePath);
electron.app.setName(pkg.name);
Module._load(path.join(basePath, pkg.main), null, true);
const path = require("path");
const electron = require("electron");
const Module = require("module");
const BetterDiscord = require("./betterdiscord");
electron.app.commandLine.appendSwitch("no-force-async-hooks-checks");

class BrowserWindow extends electron.BrowserWindow {
    constructor(options) {
        if (!options || !options.webPreferences || !options.webPreferences.preload || !options.title) return super(options); // eslint-disable-line constructor-super
        const originalPreload = options.webPreferences.preload;
        options.webPreferences.preload = path.join(__dirname, "betterdiscord", "preload.js");
        options.webPreferences.nodeIntegration = true;
        options.webPreferences.enableRemoteModule = true;
        options.webPreferences.contextIsolation = false;

        Object.assign(options, BetterDiscord.getWindowPrefs()); // Assign new style window prefs if they exist

        // Don't allow just "truthy" values
        const shouldBeTransparent = BetterDiscord.getSetting("transparency");
        if (typeof(shouldBeTransparent) === "boolean" && shouldBeTransparent) {
            options.transparent = true;
            options.backgroundColor = "#00000000";
        }

        // Only affect frame if it is *explicitly* set
        const shouldHaveFrame = BetterDiscord.getSetting("frame");
        if (typeof(shouldHaveFrame) === "boolean") options.frame = shouldHaveFrame;

        super(options);
        this.__originalPreload = originalPreload;
    }
}

// Reassign electron using proxy to avoid the onReady issue, thanks Powercord!
const newElectron = new Proxy(electron, {
    get: function(target, prop) {
        if (prop === "BrowserWindow") return BrowserWindow;
        return target[prop];
    }
});
const electronPath = require.resolve("electron");
delete require.cache[electronPath].exports; // If it didn't work, try to delete existing
require.cache[electronPath].exports = newElectron; // Try to assign again after deleting

// Remove the CSP
const removeCSP = () => {
    electron.session.defaultSession.webRequest.onHeadersReceived(function(details, callback) {
        if (!details.responseHeaders["content-security-policy-report-only"] && !details.responseHeaders["content-security-policy"]) return callback({cancel: false});
        delete details.responseHeaders["content-security-policy-report-only"];
        delete details.responseHeaders["content-security-policy"];
        callback({cancel: false, responseHeaders: details.responseHeaders});
    });   
};

// Remove CSP immediately on linux since they install to discord_desktop_core still
if (process.platform == "win32" || process.platform == "darwin") electron.app.once("ready", removeCSP);
else removeCSP();

// Use Discord's info to run the app
if (process.platform == "win32" || process.platform == "darwin") {
    const basePath = path.join(__dirname, "..", "app.asar");
    const pkg = require(path.join(basePath, "package.json"));
    electron.app.setAppPath(basePath);
    electron.app.name = pkg.name;
    Module._load(path.join(basePath, pkg.main), null, true);
}
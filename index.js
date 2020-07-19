const path = require("path");
const electron = require("electron");
const Module = require("module");
const BetterDiscord = require("./betterdiscord");
electron.app.commandLine.appendSwitch("no-force-async-hooks-checks");

class BrowserWindow extends electron.BrowserWindow {
    constructor(options) {
        if (!options || !options.webPreferences || !options.webPreferences.preload || !options.title) {super(options); return;}
        options.webPreferences.nodeIntegration = true;
        options.webPreferences.enableRemoteModule = true;
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
        BetterDiscord.setup(this);
    }
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
    electron.app.name = pkg.name;
    Module._load(path.join(basePath, pkg.main), null, true);
}
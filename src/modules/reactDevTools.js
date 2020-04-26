import Utils from "./utils";
import {settings} from "../0globals";

const electron = require("electron");
const fs = require("fs");
const path = require("path");

const BrowserWindow = electron.remote.BrowserWindow;
const webContents = electron.remote.getCurrentWebContents();


export default new class reactDevTools {
    constructor() {
        let extensionPath = "";
        if (process.platform === "win32") extensionPath = path.resolve(process.env.LOCALAPPDATA, "Google/Chrome/User Data");
        else if (process.platform === "linux") extensionPath = path.resolve(process.env.HOME, ".config/google-chrome");
        else if (process.platform === "darwin") extensionPath = path.resolve(process.env.HOME, "Library/Application Support/Google/Chrome");
        else extensionPath = path.resolve(process.env.HOME, ".config/chromium");
        extensionPath += "/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/";
        if (fs.existsSync(extensionPath)) {
            const versions = fs.readdirSync(extensionPath);
            extensionPath = path.resolve(extensionPath, versions[versions.length - 1]);
        }
        this.extensionPath = extensionPath;
        this.isExtensionInstalled = fs.existsSync(extensionPath);
        this.listener = this.listener.bind(this);

        settings["React DevTools"].hidden = !this.isExtensionInstalled;
    }

    listener() {
        if (!this.isExtensionInstalled) return;
        BrowserWindow.removeDevToolsExtension("React Developer Tools");
        const didInstall = BrowserWindow.addDevToolsExtension(this.extensionPath);

        if (didInstall) Utils.log("React DevTools", "Successfully installed react devtools.");
        else Utils.err("React DevTools", "Couldn't find react devtools in chrome extensions!");
    }

    start() {
        setImmediate(() => webContents.on("devtools-opened", this.listener));
        if (webContents.isDevToolsOpened()) this.listener();
    }

    stop() {
        webContents.removeListener("devtools-opened", this.listener);
    }
};  
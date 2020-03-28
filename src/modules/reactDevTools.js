import Utils from "./utils";
import {settings} from "../0globals";

const electron = require("electron");
const fs = require("fs");
const path = require("path");

const BrowserWindow = electron.remote.BrowserWindow;
const currentWindow = BrowserWindow.getAllWindows()[0];


export default new class reactDevTools {
    constructor() {
        let extensionPath = "";
        if (process.platform === "win32") extensionPath = path.resolve(process.env.LOCALAPPDATA, "Google/Chrome/User Data");
        if (process.platform === "linux") extensionPath = path.resolve(process.env.HOME, ".config/google-chrome");
        if (process.platform === "darwin") extensionPath = path.resolve(process.env.HOME, "Library/Application Support/Google/Chrome");
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
        currentWindow.webContents.on("devtools-opened", this.listener);
    }

    stop() {
        currentWindow.webContents.removeListener("devtools-opened", this.listener);
    }
};  
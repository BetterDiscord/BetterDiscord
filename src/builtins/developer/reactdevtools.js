import Builtin from "../../structs/builtin";
import Modals from "../../ui/modals";
import {Strings} from "modules";

const electron = require("electron");
const fs = require("fs");
const path = require("path");

const BrowserWindow = electron.remote.BrowserWindow;
const webContents = electron.remote.getCurrentWebContents();

export default new class ReactDevTools extends Builtin {
    get name() {return "ReactDevTools";}
    get category() {return "developer";}
    get id() {return "reactDevTools";}

    initialize() {
        super.initialize();
        this.findExtension();
    }

    findExtension() {
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
    }

    enabled() {
        if (!this.isExtensionInstalled) this.findExtension();
        if (!this.isExtensionInstalled) return Modals.alert(Strings.ReactDevTools.notFound, Strings.ReactDevTools.notFoundDetails);
        setImmediate(() => webContents.on("devtools-opened", this.listener));
        if (webContents.isDevToolsOpened()) this.listener();
    }

    disabled() {
        webContents.removeListener("devtools-opened", this.listener);
    }

    listener() {
        if (!this.isExtensionInstalled) return;
        BrowserWindow.removeDevToolsExtension("React Developer Tools");
        const didInstall = BrowserWindow.addDevToolsExtension(this.extensionPath);

        if (didInstall) this.log("Successfully installed react devtools.");
        else this.error("Couldn't find react devtools in chrome extensions!");
    }
};
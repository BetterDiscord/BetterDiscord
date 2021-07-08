import fs from "fs";
import path from "path";
import {session} from "electron";

export const REACT_DEVTOOLS_ID = "fmkadmapgofadopljbjfkapdkoienihi";

const findExtension = function() {
    let extensionPath = "";
    if (process.platform === "win32") extensionPath = path.resolve(process.env.LOCALAPPDATA, "Google/Chrome/User Data");
    else if (process.platform === "linux") extensionPath = path.resolve(process.env.HOME, ".config/google-chrome");
    else if (process.platform === "darwin") extensionPath = path.resolve(process.env.HOME, "Library/Application Support/Google/Chrome");
    else extensionPath = path.resolve(process.env.HOME, ".config/chromium");
    extensionPath += `/Default/Extensions/${REACT_DEVTOOLS_ID}`;
    if (fs.existsSync(extensionPath)) {
        const versions = fs.readdirSync(extensionPath);
        extensionPath = path.resolve(extensionPath, versions[versions.length - 1]);
    }

    const isExtensionInstalled = fs.existsSync(extensionPath);
    if (isExtensionInstalled) return extensionPath;
    return "";
};

export default class ReactDevTools {
    static async install() {
        const extPath = findExtension();
        if (!extPath) return; // TODO: cut a log

        try {
            const ext = await session.defaultSession.loadExtension(extPath);
            if (!ext) return; // TODO: cut a log
        }
        catch (err) {
            // TODO: cut a log
        }
    }

    static async remove() {
        const extPath = findExtension();
        if (!extPath) return; // TODO: cut a log

        try {
            await session.defaultSession.removeExtension(extPath);
        }
        catch (err) {
            // TODO: cut a log
        }
    }
}
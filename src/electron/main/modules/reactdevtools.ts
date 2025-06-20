import fs from "fs";
import path from "path";
import {session} from "electron";

export const REACT_DEVTOOLS_ID = "fmkadmapgofadopljbjfkapdkoienihi";

const findLatestVersion = (extensionPath: string) => {
    const versions = fs.readdirSync(extensionPath);
    return path.resolve(extensionPath, versions[versions.length - 1]);
};

const findExtension = (dataPath: string) => {
    // Default to extensions folder in BetterDiscord folder
    const replacementPath = path.resolve(dataPath, "extensions", REACT_DEVTOOLS_ID);
    if (fs.existsSync(replacementPath)) {
        if (fs.existsSync(path.resolve(replacementPath, "manifest.json"))) {
            return replacementPath;
        }
        return findLatestVersion(replacementPath);
    }

    let extensionPath = "";
    // Get path to user data folder
    if (process.platform === "win32") extensionPath = path.resolve(process.env.LOCALAPPDATA!, "Google/Chrome/User Data");
    else if (process.platform === "linux") extensionPath = path.resolve(process.env.HOME!, ".config/google-chrome");
    else if (process.platform === "darwin") extensionPath = path.resolve(process.env.HOME!, "Library/Application Support/Google/Chrome");
    else extensionPath = path.resolve(process.env.HOME!, ".config/chromium");

    // If default profile doesn't exist
    if (!fs.existsSync(extensionPath + "/Default")) {
        const profiles = fs.readdirSync(extensionPath).filter((fileName) => {
            // Check if file is a profile folder
            return fileName.startsWith("Profile") && !fileName.endsWith("store");
        });
        // Check for a profile with react dev tools installed
        let foundExtension = false;
        for (const p of profiles) {
            const exPath = `${extensionPath}/${p}/Extensions/${REACT_DEVTOOLS_ID}`;
            if (fs.existsSync(exPath)) {
                extensionPath = exPath;
                foundExtension = true;
                break;
            }
        }
        // Return empty if no installation found
        if (!foundExtension) {
            return "";
        }
    }
    else {
        extensionPath += `/Default/Extensions/${REACT_DEVTOOLS_ID}`;
    }

    // Get latest version
    if (fs.existsSync(extensionPath)) {
        extensionPath = findLatestVersion(extensionPath);
    }

    const isExtensionInstalled = fs.existsSync(extensionPath);
    if (isExtensionInstalled) return extensionPath;
    return "";
};

export default class ReactDevTools {
    static async install(dataPath: string) {
        const extPath = findExtension(dataPath);
        if (!extPath) return; // TODO: cut a log

        try {
            const ext = await session.defaultSession.loadExtension(extPath);
            if (!ext) return; // TODO: cut a log
        }
        catch {
            // TODO: cut a log
        }
    }

    static async remove(dataPath: string) {
        const extPath = findExtension(dataPath);
        if (!extPath) return; // TODO: cut a log

        try {
            await session.defaultSession.removeExtension(extPath);
        }
        catch {
            // TODO: cut a log
        }
    }
}
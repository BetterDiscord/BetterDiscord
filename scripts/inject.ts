const args = process.argv;

import fs from "fs";
import path from "path";
import bun from "bun";

import doSanityChecks from "./helpers/validate";
import buildPackage from "./helpers/package";
import copyFiles from "./helpers/copy";
import {comparator} from "../src/common/semver";

const useBdRelease = args[2] && args[2].toLowerCase() === "release";
const releaseInput = useBdRelease ? args[3] && args[3].toLowerCase() : args[2] && args[2].toLowerCase();
const release = releaseInput === "canary" ? "Discord Canary" : releaseInput === "ptb" ? "Discord PTB" : "Discord";
const bdPath = useBdRelease ? path.resolve(__dirname, "..", "dist", "betterdiscord.asar") : path.resolve(__dirname, "..", "dist");

const resources = await (async function () {
    let basedir = "";
    if (process.platform === "win32") {
        basedir = path.join(process.env.LOCALAPPDATA!, release.replace(/ /g, ""));
    }
    else if (process.env.WSL_DISTRO_NAME) {
        const appdata = (await bun.$`wslpath "$(cmd.exe /c "echo %LOCALAPPDATA%" 2>/dev/null | tr -d '\r')"`.text()).trim();
        basedir = path.join(appdata, release.replace(/ /g, ""));
    }
    else {
        if (process.platform === "darwin") {
            return path.sep + path.join("Applications", `${release}.app`, "Contents", "Resources");
        }

        basedir = path.join(process.env.XDG_CONFIG_HOME ? process.env.XDG_CONFIG_HOME : path.join(process.env.HOME!, ".config"), release.toLowerCase().replace(" ", ""));
    }

    if (!fs.existsSync(basedir)) throw new Error(`No ${release} install at ${basedir}`);

    const dirs = fs.readdirSync(basedir)
        .filter(x => x.startsWith("app-"));

    if (dirs.length === 0) {
        throw new Error("Discord requires the new updater. Please update Dicord.");
    }

    const latest = dirs
        .filter((item) => item.startsWith("app-") && fs.statSync(path.join(basedir, item)).isDirectory())
        .map(item => item.slice(4))
        .reduce((pre, cur) => {
            if (comparator(pre, cur) === 1) return cur;
            return pre;
        });

    return path.join(basedir, `app-${latest}`, "resources");
})();

doSanityChecks(bdPath);
buildPackage(bdPath);
console.log("");

console.log(`Injecting into ${release}`);
console.log(`    ✅ Found ${release} in ${resources}`);

const asarDir = path.join(resources, "app");

let appName = "app.asar";

const renamedAppAsarExists = fs.existsSync(path.join(resources, "betterdiscord.app.asar"));
if (renamedAppAsarExists || fs.existsSync(path.join(resources, "betterdiscord.app"))) {
    // lazy fix for if app.asar does not exist but app folder does (Why? Better safe than sorry)
    if (!renamedAppAsarExists) {
        appName = "app";
    }

    console.log(`    ✅ ${appName} was previously renamed`);
}
else {
    if (!fs.existsSync(path.join(resources, "app.asar"))) appName = "app";

    console.log(`    ✅ Renaming ${appName} to betterdiscord.${appName}`);

    fs.renameSync(path.join(resources, appName), path.join(resources, `betterdiscord.${appName}`));
}

fs.mkdirSync(asarDir, {recursive: true});

const indexJs = path.join(asarDir, "index.js");

let requirePath: string;
if (process.env.WSL_DISTRO_NAME) {
    copyFiles(bdPath, path.join(asarDir, "..", "..", "betterdiscord"));
    requirePath = "../../betterdiscord";
}
else {
    requirePath = bdPath;
}


// __betterdiscord_inject_meta__ is used so the updater module can use the correct path
fs.writeFileSync(indexJs, `
require(${JSON.stringify(requirePath)});
module.exports = require("../betterdiscord.app.asar");`);

console.log("    ✅ Wrote index.js");

if (!fs.existsSync(path.join(asarDir, "package.json"))) {
    fs.writeFileSync(path.join(asarDir, "package.json"), JSON.stringify({
        main: "./index.js",
        name: "discord"
    }));

    console.log("    ✅ Wrote package.json");
}

console.log("");

console.log(`Injection successful, please restart ${release}.`);

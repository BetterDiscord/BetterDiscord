const args = process.argv;
import fs from "fs";
import path from "path";
import bun from "bun";

import doSanityChecks from "./helpers/validate";
import buildPackage from "./helpers/package";
import copyFiles from "./helpers/copy";

const useBdRelease = args[2] && args[2].toLowerCase() === "release";
const releaseInput = useBdRelease ? args[3] && args[3].toLowerCase() : args[2] && args[2].toLowerCase();
const release = releaseInput === "canary" ? "Discord Canary" : releaseInput === "ptb" ? "Discord PTB" : "Discord";
const bdPath = useBdRelease ? path.resolve(__dirname, "..", "dist", "betterdiscord.asar") : path.resolve(__dirname, "..", "dist");
// Discord 1.0.136+ writes to `app-<X>.<Y>.<Z>` and may leave an empty legacy
// `<X>.<Y>.<Z>` alongside it; prefer `app-*`, then highest version, and prefer
// entries that actually contain a `modules/` subdir.
function pickVersionDir(basedir: string): string | undefined {
    const entries = fs.readdirSync(basedir).filter(name => {
        try {return fs.lstatSync(path.join(basedir, name)).isDirectory();}
        catch {return false;}
    });
    const versionRe = /^(app-)?(\d+)\.(\d+)\.(\d+)$/;
    const candidates = entries
        .map(name => ({name, m: name.match(versionRe)}))
        .filter((c): c is {name: string; m: RegExpMatchArray} => Boolean(c.m))
        .map(c => ({
            name: c.name,
            isApp: Boolean(c.m[1]),
            tuple: [+c.m[2], +c.m[3], +c.m[4]] as [number, number, number],
        }));
    if (!candidates.length) return undefined;
    candidates.sort((a, b) => {
        if (a.isApp !== b.isApp) return a.isApp ? -1 : 1;
        for (let i = 0; i < 3; i++) {
            if (a.tuple[i] !== b.tuple[i]) return b.tuple[i] - a.tuple[i];
        }
        return 0;
    });
    const usable = candidates.find(c => fs.existsSync(path.join(basedir, c.name, "modules")));
    return (usable ?? candidates[0]).name;
}

// Tries the new wrapped layout (`discord_desktop_core-<N>/discord_desktop_core`)
// first, falls back to the legacy unwrapped layout (`discord_desktop_core`).
function resolveCorePath(modulesDir: string): string {
    if (!fs.existsSync(modulesDir)) return "";
    const wrappers = fs.readdirSync(modulesDir)
        .map(name => {
            const m = name.match(/^discord_desktop_core-(\d+)$/);
            return m ? {name, n: +m[1]} : null;
        })
        .filter((w): w is {name: string; n: number} => w !== null)
        .sort((a, b) => b.n - a.n);
    for (const {name} of wrappers) {
        const candidate = path.join(modulesDir, name, "discord_desktop_core");
        if (fs.existsSync(candidate)) return candidate;
    }
    const legacy = path.join(modulesDir, "discord_desktop_core");
    if (fs.existsSync(legacy)) return legacy;
    return "";
}

const discordPath = await (async function () {
    let basedir = "";
    if (process.platform === "win32") {
        basedir = path.join(process.env.LOCALAPPDATA!, release.replace(/ /g, ""));
    }
    else if (process.env.WSL_DISTRO_NAME) {
        const appdata = (await bun.$`wslpath "$(cmd.exe /c "echo %LOCALAPPDATA%" 2>/dev/null | tr -d '\r')"`.text()).trim();
        basedir = path.join(appdata, release.replace(/ /g, ""));
    }
    else {
        let userData = process.env.XDG_CONFIG_HOME ? process.env.XDG_CONFIG_HOME : path.join(process.env.HOME!, ".config");
        if (process.platform === "darwin") userData = path.join(process.env.HOME!, "Library", "Application Support");
        basedir = path.join(userData, release.toLowerCase().replace(" ", ""));
    }

    if (!fs.existsSync(basedir)) throw new Error(`No ${release} install at ${basedir}`);
    const version = pickVersionDir(basedir);
    if (!version) throw new Error(`No version dir in ${basedir} (expected app-X.Y.Z or X.Y.Z)`);
    const modulesDir = path.join(basedir, version, "modules");
    const core = resolveCorePath(modulesDir);
    if (!core) throw new Error(`Found ${modulesDir} but no discord_desktop_core (tried wrapped discord_desktop_core-N/ and legacy)`);
    return core;
})();

doSanityChecks(bdPath);
buildPackage(bdPath);
console.log("");

console.log(`Injecting into ${release}`);
console.log(`    ✅ Found ${release} in ${discordPath}`);

const indexJs = path.join(discordPath, "index.js");
if (fs.existsSync(indexJs)) fs.unlinkSync(indexJs);
if (process.env.WSL_DISTRO_NAME) {
    copyFiles(bdPath, path.join(discordPath, "betterdiscord"));
    fs.writeFileSync(indexJs, `require("./betterdiscord");\nmodule.exports = require("./core.asar");`);
}
else {
    fs.writeFileSync(indexJs, `require("${bdPath.replace(/\\/g, "\\\\").replace(/"/g, "\\\"")}");\nmodule.exports = require("./core.asar");`);
}

console.log("    ✅ Wrote index.js");
console.log("");

console.log(`Injection successful, please restart ${release}.`);

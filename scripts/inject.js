const args = process.argv;
const fs = require("fs");
const path = require("path");

const doSanityChecks = require("./validate");
const buildPackage = require("./package");

const useBdRelease = args[2] && args[2].toLowerCase() === "release";
const releaseInput = useBdRelease ? args[3] && args[3].toLowerCase() : args[2] && args[2].toLowerCase();
const release = releaseInput === "canary" ? "Discord Canary" : releaseInput === "ptb" ? "Discord PTB" : "Discord";
const bdPath = useBdRelease ? path.resolve(__dirname, "..", "dist", "betterdiscord.asar") : path.resolve(__dirname, "..", "dist");
const discordPath = (function() {
    if (process.platform === "win32") {
        const basedir = path.join(process.env.LOCALAPPDATA, release.replace(/ /g, ""));
        if (!fs.existsSync(basedir)) throw new Error(`Cannot find directory for ${release}`);
        const version = fs.readdirSync(basedir).filter(f => fs.lstatSync(path.join(basedir, f)).isDirectory() && f.split(".").length > 1).sort().reverse()[0];
        return path.join(basedir, version, "resources");
    }
    else if (process.platform === "darwin") {
        const appPath = releaseInput === "canary" ? path.join("/Applications", "Discord Canary.app")
            : releaseInput === "ptb" ? path.join("/Applications", "Discord PTB.app")
            : useBdRelease && args[3] ? args[3] ? args[2] : args[2]
            : path.join("/Applications", "Discord.app");

        return path.join(appPath, "Contents", "Resources");
    }
    else if (process.platform === "linux") {
        const baseDirs = [
            "/usr/share", // Ubuntu?, Mint?, Debian?
            "/opt",       // Manjaro?, Arch?, Gentoo
            "/usr/lib64", // Fedora?
        ];
        for (const baseDir of baseDirs) {
            const appPath = path.join(baseDir, release.toLowerCase().replace(/ /g, "-"), "resources");
            if (fs.existsSync(appPath)) return appPath;
        }
    }
})();

doSanityChecks(bdPath);
buildPackage(bdPath);
console.log("");

console.log(`Injecting into ${release}`);
if (!fs.existsSync(discordPath)) throw new Error(`Cannot find directory for ${release}`);
console.log(`    ✅ Found ${release} in ${discordPath}`);

const appPath = path.join(discordPath, "app");
const packageJson = path.join(appPath, "package.json");
const indexJs = path.join(appPath, "index.js");

if (!fs.existsSync(appPath)) fs.mkdirSync(appPath);
if (fs.existsSync(packageJson)) fs.unlinkSync(packageJson);
if (fs.existsSync(indexJs)) fs.unlinkSync(indexJs);

fs.writeFileSync(packageJson, JSON.stringify({
    name: "betterdiscord",
    main: "index.js",
}, null, 4));
console.log("    ✅ Wrote package.json");

fs.writeFileSync(indexJs, `require("${bdPath.replace(/\\/g, "\\\\").replace(/"/g, "\\\"")}");`);
console.log("    ✅ Wrote index.js");
console.log("");
console.log(`Injection successful, please restart ${release}.`);

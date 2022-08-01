const args = process.argv;
const fs = require("fs");
const path = require("path");
const getDiscordPath = require("./discordpath");

const doSanityChecks = require("./validate");
const buildPackage = require("./package");

const useBdRelease = args[2] && args[2].toLowerCase() === "release";
const releaseInput = useBdRelease ? args[3] && args[3].toLowerCase() : args[2] && args[2].toLowerCase();
const release = releaseInput === "canary" ? "Discord Canary" : releaseInput === "ptb" ? "Discord PTB" : "Discord";
const bdPath = useBdRelease ? path.resolve(__dirname, "..", "dist", "betterdiscord.asar") : path.resolve(__dirname, "..", "dist");
const discordPath = getDiscordPath(useBdRelease, releaseInput, release, args);

doSanityChecks(bdPath);
buildPackage(bdPath);
console.log("");

console.log(`Injecting into ${release}`);
if (!fs.existsSync(discordPath)) throw new Error(`Cannot find directory for ${release}`);
console.log(`    ✅ Found ${release} in ${discordPath}`);

const appPath = process.platform === "win32" || process.platform === "darwin" ? path.join(discordPath, "app") : discordPath;
const packageJson = path.join(appPath, "package.json");
const indexJs = path.join(appPath, "index.js");

if (!fs.existsSync(appPath)) fs.mkdirSync(appPath);
if (fs.existsSync(packageJson)) fs.unlinkSync(packageJson);
if (fs.existsSync(indexJs)) fs.unlinkSync(indexJs);

if (process.platform === "win32" || process.platform === "darwin") {
    fs.writeFileSync(packageJson, JSON.stringify({
        name: "betterdiscord",
        main: "index.js",
    }, null, 4));
    console.log("    ✅ Wrote package.json");

    fs.writeFileSync(indexJs, `require("${bdPath.replace(/\\/g, "\\\\").replace(/"/g, "\\\"")}");`);
}
else {
    fs.writeFileSync(indexJs, `require("${bdPath.replace(/\\/g, "\\\\").replace(/"/g, "\\\"")}");\nmodule.exports = require("./core.asar");`);
}

console.log("    ✅ Wrote index.js");
console.log("");
console.log(`Injection successful, please restart ${release}.`);
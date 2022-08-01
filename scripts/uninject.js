const args = process.argv;
const fs = require("fs");
const path = require("path");
const getDiscordPath = require("./discordpath");

const useBdRelease = args[2] && args[2].toLowerCase() === "release";
const releaseInput = useBdRelease ? args[3] && args[3].toLowerCase() : args[2] && args[2].toLowerCase();
const release = releaseInput === "canary" ? "Discord Canary" : releaseInput === "ptb" ? "Discord PTB" : "Discord";

const discordPath = getDiscordPath(useBdRelease, releaseInput, release, args);

console.log(`Uninjecting ${release}`);
if (!fs.existsSync(discordPath)) throw new Error(`Cannot find directory for ${release}`);
console.log(`    ✅ Found ${release} in ${discordPath}`);

const appPath = process.platform === "win32" || process.platform === "darwin" ? path.join(discordPath, "app") : discordPath;
const indexJs = path.join(appPath, "index.js");

console.log("");
console.log("Deleting shims...");

try {
    console.log(`Removing ${appPath}`);
    if (process.platform === "win32" || process.platform === "darwin") {
        if (fs.existsSync(appPath)) {
            fs.rmSync(appPath, {recursive: true, force: true});
        }
    }
    else {
        if (fs.existsSync(indexJs)) fs.writeFileSync(indexJs, `module.exports = require("./core.asar");`);
    }
    console.log("    ✅ Deletion successful");
    console.log("");
    console.log(`Uninjection successful, please restart ${release}.`);
}
catch (err) {
    console.log(`❌ Could not delete folder ${appPath}`);
    console.log(`❌ ${err.message}`);
}
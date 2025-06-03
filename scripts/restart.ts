const args = process.argv;
import fs from "fs";
import path from "path";
import {execSync, spawn} from "child_process";

const useBdRelease = args[2] && args[2].toLowerCase() === "release";
const releaseInput = useBdRelease ? args[3] && args[3].toLowerCase() : args[2] && args[2].toLowerCase();
const release = releaseInput === "canary" ? "Discord Canary" : releaseInput === "ptb" ? "Discord PTB" : "Discord";
let discordExeName = releaseInput === "canary" ? "DiscordCanary" : releaseInput === "ptb" ? "DiscordPTB" : "Discord";
if (process.platform === "win32") discordExeName += ".exe";

const discordPath = (function () {
    let latestExe = "";
    if (process.platform === "win32") {
        const basedir = path.join(process.env.LOCALAPPDATA!, release.replace(/ /g, ""));
        if (!fs.existsSync(basedir)) throw new Error(`Cannot find directory for ${release}`);
        const version = fs.readdirSync(basedir).filter(f => fs.lstatSync(path.join(basedir, f)).isDirectory() && f.split(".").length > 1).sort().reverse()[0];
        latestExe = path.join(basedir, version, discordExeName);
    }
    else if (process.platform === "linux") {
        const basedir = "/usr/share/discord";
        if (!fs.existsSync(basedir)) return "";
        latestExe = path.join(basedir, discordExeName);
    }
    else if (process.platform === "darwin") {
        throw new Error(`Unsupported platform: ${process.platform}`);
    }

    if (fs.existsSync(latestExe)) return latestExe;
    return "";
})();
console.log("");

console.log(`Stopping ${release}`);
const killCommand = process.platform === "win32" ? "taskkill /F /IM " + discordExeName : "pkill -f " + discordExeName;
try {
    execSync(killCommand, {stdio: "ignore"});
    console.log(`    ✅ Stopped ${release}`);
}
catch (error) {
    const status = (error as {status?: number;}).status;
    if (status === 128 && process.platform === "win32" || status === 1) console.log(`    ☑️ ${release} wasn't running`);
    console.log(`    ❌ Failed to stop ${release}`);
}
console.log("");

console.log(`Searching ${release}`);
if (!fs.existsSync(discordPath)) throw new Error(`    ❌ Failed to find ${release} executable path`);
console.log(`    ✅ Found ${release} in ${discordPath}`);
console.log("");

console.log(`Starting ${release}`);
const startCommand = process.platform === "win32" ? "cmd.exe" : process.platform === "linux" ? "discordPath" : "open";
const startArgs = process.platform === "win32" ? ["/c", "start", "", discordPath] : process.platform === "linux" ? [] : [discordPath];
try {
    spawn(startCommand, startArgs, {detached: true, stdio: "ignore"});// Linux not working
    console.log(`    ✅ Started ${release}`);
}
catch (error) {
    console.log(`    ❌ Failed to start ${release}`);
    throw error;
}

console.log("");
console.log("Restart successful");
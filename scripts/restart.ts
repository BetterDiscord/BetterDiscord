const args = process.argv;
import fs from "fs";
import path from "path";
import findProcess from "find-process";
import {kill} from "process";
import {spawn} from "child_process";

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
try {
    const results = await findProcess("name", discordExeName, true);
    if (results.length === 0) {
        console.log(`    ☑️  ${release} wasn't running`);
    }
    else {
        for (const result of results) {
            kill(result.pid);
        }
        console.log(`    ✅ Stopped ${release}`);
    }
}
catch (error) {
    console.log(`    ❌ Failed to stop ${release}`);
    throw error;
}
console.log("");

console.log(`Searching ${release}`);
if (fs.existsSync(discordPath)) {
    console.log(`    ✅ Found ${release} in ${discordPath}`);
}
else {
    throw new Error(`    ❌ Failed to find ${release} executable path`);
}
console.log("");

console.log(`Starting ${release}`);
try {
    spawn(discordPath, [], { // Not working on linux
        detached: true,
        stdio: "ignore"
    }).unref();
    console.log(`    ✅ Started ${release}`);
}
catch (error) {
    console.log(`    ❌ Failed to start ${release}`);
    throw error;
}

console.log("");
console.log("Restart successful");
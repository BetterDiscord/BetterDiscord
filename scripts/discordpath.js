const fs = require("fs");
const path = require("path");

module.exports = function getDiscordPath(useBdRelease, releaseInput, release, args) {    
    let resourcePath = "";
    if (process.platform === "win32") {
        const basedir = path.join(process.env.LOCALAPPDATA, release.replace(/ /g, ""));
        if (!fs.existsSync(basedir)) throw new Error(`Cannot find directory for ${release}`);
        const version = fs.readdirSync(basedir).filter(f => fs.lstatSync(path.join(basedir, f)).isDirectory() && f.split(".").length > 1).sort().reverse()[0];
        resourcePath = path.join(basedir, version, "resources");
    }
    else if (process.platform === "darwin") {
        const appPath = releaseInput === "canary" ? path.join("/Applications", "Discord Canary.app")
            : releaseInput === "ptb" ? path.join("/Applications", "Discord PTB.app")
            : useBdRelease && args[3] ? args[3] ? args[2] : args[2]
            : path.join("/Applications", "Discord.app");

        resourcePath = path.join(appPath, "Contents", "Resources");
    }
    else {
        const userData = process.env.XDG_CONFIG_HOME ? process.env.XDG_CONFIG_HOME : path.join(process.env.HOME, ".config");
        const basedir = path.join(userData, release.toLowerCase().replace(" ", ""));
        if (!fs.existsSync(basedir)) return "";
        const version = fs.readdirSync(basedir).filter(f => fs.lstatSync(path.join(basedir, f)).isDirectory() && f.split(".").length > 1).sort().reverse()[0];
        if (!version) return "";
        resourcePath = path.join(basedir, version, "modules", "discord_desktop_core");
    }

    if (fs.existsSync(resourcePath)) return resourcePath;
    return "";
};
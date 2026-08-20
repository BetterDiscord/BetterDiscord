import {app} from "electron";
import path from "path";
import fs from "fs";
import {comparator} from "@common/semver";
import {bdFolder} from "./modules/betterdiscord";
import {randomUUID} from "crypto";

const supported: NodeJS.Platform[] = [
    "win32",
    "linux"
];

function migrate() {
    if (!supported.includes(process.platform)) return;

    const logPath = path.join(bdFolder, "data", "updater.log");
    const uuid = randomUUID();

    const log = (content: string) => {
        if (process.env.__BUILD__ === "production") return;
        fs.appendFileSync(logPath, `[id=${uuid},time=${Date.now()}]: ${content}\n`);
    };

    try {
        const base = path.dirname(process.execPath);

        const currentVersion = path.basename(base).slice(4);
        const discordPath = path.dirname(base);

        const latestVersion = fs.readdirSync(discordPath)
            .filter((item) => item.startsWith("app-") && fs.statSync(path.join(discordPath, item)).isDirectory())
            .map(item => item.slice(4))
            .reduce((pre, cur) => {
                if (comparator(pre, cur) === 1) return cur;
                return pre;
            });

        log(`Current version is ${currentVersion} and latest is ${latestVersion}`);

        if (latestVersion === currentVersion) return log("Latest version is same");

        log("Attempting migration");

        const resources = path.join(discordPath, `app-${latestVersion}`, "resources");

        if (fs.existsSync(path.join(resources, "betterdiscord.app.asar"))) return log("Appears migration has happened before");

        log(`Renaming app.asar`);

        fs.renameSync(path.join(resources, "app.asar"), path.join(resources, "betterdiscord.app.asar"));

        fs.mkdirSync(path.join(resources, "app"), {recursive: true});

        log("Writing new app directory");

        fs.writeFileSync(path.join(resources, "app", "index.js"), `
require(${JSON.stringify(path.join(__dirname, "main.js"))});
require("../betterdiscord.app.asar");
`);

        fs.writeFileSync(path.join(resources, "app", "package.json"), JSON.stringify({
            name: "discord",
            main: "index.js"
        }));
    }
    catch (e) {
        log(`Migration Failed!\n${String(e)}`);
    }
}

app.on("before-quit", migrate);
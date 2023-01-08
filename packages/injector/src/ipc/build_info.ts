import {ipcMain as IPC, app} from "electron/main";
import {IPCEvents} from "@betterdiscord/common";
import path from "path";
import fs from "fs";

const buildInfoPath = path.resolve(app.getAppPath(), "..", "build_info.json");
let buildInfo = {releaseChannel: "stable", version: "0.0.000", fallback: true};

if (fs.existsSync(buildInfoPath)) {
    try {
        buildInfo = JSON.parse(fs.readFileSync(buildInfoPath, "utf8"));
    } catch (error) {
        console.error("[@BetterDiscord~Injector] Failed to load discord build_info.json:", error);
    }
}

IPC.on(IPCEvents.GET_BUILD_INFO, event => {
    event.returnValue = buildInfo;
});

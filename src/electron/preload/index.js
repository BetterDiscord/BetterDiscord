import {contextBridge} from "electron";
import * as BdApi from "./api";
import DiscordNativePatch from "./discordnativepatch";
import init from "./init";
import patchDefine from "./patcher";
import newProcess from "./process";

patchDefine();
DiscordNativePatch.init();

let hasInitialized = false;
contextBridge.exposeInMainWorld("process", newProcess);
contextBridge.exposeInMainWorld("BetterDiscordPreload", () => {
    if (hasInitialized) return null;
    hasInitialized = true;
    return BdApi;
});

init();

import {contextBridge, ipcRenderer} from "electron";
import newProcess from "./process";
import * as BdApi from "./api";
import init from "./init";
import DiscordNativePatch from "./discordnativepatch";
import * as IPCEvents from "@common/constants/ipcevents";

DiscordNativePatch.init();

let hasInitialized = false;
contextBridge.exposeInMainWorld("process", newProcess);
contextBridge.exposeInMainWorld("BetterDiscordPreload", () => {
    if (hasInitialized) return null;
    hasInitialized = true;
    return BdApi;
});

let hasRanRenderer = false;
contextBridge.exposeInMainWorld("BetterDiscordRunRenderer", () => {
    if (hasRanRenderer) return null;
    hasRanRenderer = true;

    ipcRenderer.invoke(IPCEvents.RUN_RENDERER);
});

init();

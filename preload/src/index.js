import {contextBridge} from "electron";
import newProcess from "./process";
import * as BdApi from "./api";
import init from "./init";

let hasInitialized = false;
contextBridge.exposeInMainWorld("BetterDiscord", BdApi);
contextBridge.exposeInMainWorld("process", newProcess);
contextBridge.exposeInMainWorld("BetterDiscordPreload", () => {
    if (hasInitialized) return null;
    hasInitialized = true;
    return BdApi;
});

init();
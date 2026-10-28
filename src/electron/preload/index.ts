import {contextBridge, ipcRenderer} from "electron";
import newProcess from "./process";
import * as BdApi from "./api";
import init from "./init";
import DiscordNativePatch from "./discordnativepatch";
import * as IPCEvents from "@common/constants/ipcevents";

DiscordNativePatch.init();

/**
 * Only hand out the privileged API / run BD on first-party Discord surfaces.
 * contextBridge is designed to cross the isolation boundary, so context isolation
 * alone does not stop an untrusted origin (that happened to receive our preload)
 * from requesting the full API. This origin gate is the control that does.
 */
const TRUSTED_HOSTS = [
    "discord.com",
    "discordapp.com",
    "canary.discord.com",
    "ptb.discord.com",
];
function isTrustedOrigin(): boolean {
    try {
        // `location` here is the isolated-world location, not tamperable from the page's main world.
        const {protocol, hostname} = location;
        if (protocol !== "https:") return false;
        return TRUSTED_HOSTS.some(h => hostname === h || hostname.endsWith(`.${h}`));
    }
    catch {
        return false;
    }
}

let hasInitialized = false;
contextBridge.exposeInMainWorld("process", newProcess);
contextBridge.exposeInMainWorld("BetterDiscordPreload", () => {
    if (!isTrustedOrigin()) return null;
    if (hasInitialized) return null;
    hasInitialized = true;
    return BdApi;
});

let hasRanRenderer = false;
contextBridge.exposeInMainWorld("BetterDiscordRunRenderer", () => {
    if (!isTrustedOrigin()) return null;
    if (hasRanRenderer) return null;
    hasRanRenderer = true;

    ipcRenderer.invoke(IPCEvents.RUN_RENDERER);
});

init();

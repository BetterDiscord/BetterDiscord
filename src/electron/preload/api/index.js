export * as filesystem from "./filesystem";
export {default as https} from "./https";
export * as electron from "./electron";
export * as crypto from "./crypto";
export * as vm from "./vm";
export * from "./fetch";

// We can expose that without any issues.
export * as path from "path";
export * as net from "net"; // TODO: evaluate need and create wrapper
export * as os from "os";

import electron from "electron";
import * as IPCEvents from "common/constants/ipcevents";
import DiscordNativePatch from "../discordnativepatch";

// Currently for the store, but can easily be changed later on
const {BETTERDISCORD_PROTOCOL} = process.env;
delete process.env.BETTERDISCORD_PROTOCOL;

/** @param {(protocol: (url: string) => void)} callback  */
export function setProtocolListener(callback) {
    if (BETTERDISCORD_PROTOCOL) {
        process.nextTick(() => callback(BETTERDISCORD_PROTOCOL));
    }

    electron.ipcRenderer.on(IPCEvents.HANDLE_PROTOCOL, (event, url) => callback(url));
}

/** @param {boolean} value  */
export function setDevToolsWarningState(value) {
    DiscordNativePatch.setDevToolsWarningState(value);
}
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

// Currently for the store, but can easily be changed later anywhere
export function setProtocolListener(callback) {
    const listener = (event, url) => callback(url);

    if (process.env.BETTERDISCORD_PROTOCOL) {
        callback(process.env.BETTERDISCORD_PROTOCOL);

        delete process.env.BETTERDISCORD_PROTOCOL;
    }

    electron.ipcRenderer.on(IPCEvents.HANDLE_PROTOCOL, listener);
}

import {IPCEvents} from "@betterdiscord/common";
import {ipcRenderer as IPC, shell as Shell} from "electron";

export const fileManager = {
    getPath(path: Parameters<typeof import("electron/main").app.getPath>[0] | "app") {return IPC.sendSync(IPCEvents.GET_PATH, path);}
};

export const shell = Shell;

export const ipcRenderer = <typeof IPC>Object.fromEntries(
    Object.keys(IPC)
        .filter(k => typeof (<any>IPC)[k] === "function")
        .map(key => [key, (<any>IPC)[key].bind(IPC)])
);

export default {fileManager, ipcRenderer, shell};

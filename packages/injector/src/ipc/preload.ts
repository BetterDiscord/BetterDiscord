import {ipcMain as IPC, BrowserWindow} from "electron/main";
import {IPCEvents} from "@betterdiscord/common";

IPC.on(IPCEvents.GET_PRELOAD, event => {
    event.returnValue = (<any>BrowserWindow.fromWebContents(event.sender))?.__originalPreload ?? "NOT_FOUND";
});

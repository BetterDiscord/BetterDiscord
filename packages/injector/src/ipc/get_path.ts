import {ipcMain as IPC, app} from "electron/main";
import {IPCEvents} from "@betterdiscord/common";

IPC.on(IPCEvents.GET_PATH, (event, path) => {
    event.returnValue = path === "app" ? app.getAppPath() : app.getPath(path);
});

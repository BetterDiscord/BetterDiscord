import {ipcRenderer as IPC} from "electron/renderer";
import {IPCEvents} from "@betterdiscord/common";

export default class DiscordPreload {
    public static load(): void {
        const originalPreload = IPC.sendSync(IPCEvents.GET_PRELOAD);

        if (originalPreload !== "NOT_FOUND") {
            require(originalPreload);
        } else {
            console.error("[BetterDiscord~Preload] Original preload.js wasn't found.");
        }
    }
}

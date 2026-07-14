import {ipcRenderer as IPC, webFrame} from "electron";
import fs from "fs";
import path from "path";

import * as IPCEvents from "@common/constants/ipcevents";

export default function () {
    webFrame.top?.executeJavaScript(`(() => {${fs.readFileSync(path.join(__dirname, "earlyRenderer.js"), "utf8")}})()`).catch(() => {});

    // Load Discord's original preload
    const preload = process.env.BD_DISCORD_PRELOAD;
    if (preload) {

        // Restore original preload for future windows
        IPC.send(IPCEvents.REGISTER_PRELOAD, preload);
        // Run original preload
        const originalKill = process.kill;
        try {
            process.kill = function (_: number, __?: string | number | undefined) {return true;};
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            require(preload);
        }
        catch {
            // TODO bail out
        }
        finally {
            process.kill = originalKill;
        }
    }
}
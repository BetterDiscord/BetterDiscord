import {ipcRenderer as IPC, webFrame} from "electron";
import fs from "fs";
import path from "path";
import * as IPCEvents from "common/constants/ipcevents";

export default function () {
    try {
        const location = path.join(__dirname, "renderer.js");
        if (!fs.existsSync(location)) return; // TODO: cut a fatal log
        const content = fs.readFileSync(location).toString();
        webFrame.top.executeJavaScript(`
            (() => {
                console.log("We are early baby!");
                try {
                    ${content}
                    return true;
                } catch(error) {
                    console.error(error);
                    return false;
                }
            })();
            //# sourceURL=betterdiscord/renderer.js
        `);
    } catch (error) {
        console.error(error);
    }

    // Load Discord's original preload
    const preload = process.env.DISCORD_PRELOAD;
    if (preload) {

        // Restore original preload for future windows
        IPC.send(IPCEvents.REGISTER_PRELOAD, preload);
        // Run original preload
        try {
            const originalKill = process.kill;
            process.kill = function() {};
            __non_webpack_require__(preload);
            process.kill = originalKill;
        }
        catch (e) {
            // TODO bail out
        }
    }
}

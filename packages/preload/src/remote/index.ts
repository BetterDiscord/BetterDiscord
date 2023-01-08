import {contextBridge} from "electron/renderer";

import fs from "./fs";
import path from "path";
import electron from "./electron";
import processModule from "./process";

let clientDidReceive = false;
const heap = {
    fs,
    path,
    electron,
    process: processModule
};

export type RemoteModules = typeof heap;

export default class RemoteModule {
    public static exposeFunctions(): void {
        contextBridge.exposeInMainWorld("__BDPreload__", () => {
            if (clientDidReceive) throw new Error("This function can only be called once!");
            clientDidReceive = true;

            return heap;
        });
    }
}

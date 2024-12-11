import {contextBridge} from "electron";
import patchDefine from "./patcher";
import newProcess from "./process";
import * as BdApi from "./api";
import init from "./init";

patchDefine();

let hasInitialized = false;
contextBridge.exposeInMainWorld("process", newProcess);
contextBridge.exposeInMainWorld("BetterDiscordPreload", () => {
    if (hasInitialized) return null;
    hasInitialized = true;
    return BdApi;
});


// Block sentry from being required
// const M = require("module");
// const originalRequire = M.prototype.require;
// M.prototype.require = function(id) {
//     if (id.toLowerCase().includes("sentry")) return null;
//     return originalRequire.apply(this, [id]);
// };

init();

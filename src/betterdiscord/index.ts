// @ts-expect-error this is how we override require
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import require from "./polyfill";
import secure from "./secure";
import LoadingIcon from "./loadingicon";
import BetterDiscord from "@modules/core";
import BdApi from "@api/index";
import * as IPCEvents from "@common/constants/ipcevents";
import {ipcRenderer} from "../electron/preload/api/electron";

// Perform some setup
secure();
Object.defineProperty(window, "BdApi", {
    value: BdApi,
    writable: false,
    configurable: false
});
window.global = window;

window.addEventListener("beforeunload", () => {
    ipcRenderer.invoke(IPCEvents.UNREGISTER_ALL_GLOBAL_SHORTCUTS);
});

// Add loading icon at the bottom right
LoadingIcon.show();
BetterDiscord.startup();
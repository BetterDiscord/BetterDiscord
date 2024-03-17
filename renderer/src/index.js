import require from "./polyfill"; // eslint-disable-line no-unused-vars
import secure from "./secure";
import BetterDiscord from "@modules/core";
import BdApi from "@modules/api/index";

// Perform some setup
secure();
Object.defineProperty(window, "BdApi", {
    value: BdApi,
    writable: false,
    configurable: false
});
window.global = window;

BetterDiscord.startup();
import BdApi from "@api/index";
import BetterDiscord from "@modules/core";
import LoadingIcon from "./loadingicon";
import require from "./polyfill"; // eslint-disable-line no-unused-vars
import secure from "./secure";

// Perform some setup
secure();
Object.defineProperty(window, "BdApi", {
    value: BdApi,
    writable: false,
    configurable: false
});
window.global = window;

// Add loading icon at the bottom right
LoadingIcon.show();
BetterDiscord.startup();

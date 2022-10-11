import require from "./polyfill"; // eslint-disable-line no-unused-vars
import secure from "./secure";
import LoadingIcon from "./loadingicon";
import BetterDiscord from "./modules/core";
import BdApi from "./modules/api/index";

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
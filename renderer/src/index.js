import require from "./polyfill"; // eslint-disable-line no-unused-vars
import secure from "./secure";
import LoadingIcon from "./loadingicon";
import BetterDiscord from "./modules/core";
import Events from "./modules/emitter";
import BdApi from "./modules/api/index";

Object.defineProperty(window, "BdApi", {
    value: BdApi,
    writable: false,
    configurable: false
});

// Perform some setup
secure();
window.global = window;

// Add loading icon at the bottom right
Events.addListener("CLIENT_READY", async () => {
    BetterDiscord.startup();
});

BetterDiscord.preload();
LoadingIcon.show();

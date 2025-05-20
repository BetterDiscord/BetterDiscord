// @ts-expect-error this is how we override require
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import require from "./polyfill";
import secure from "./secure";
import LoadingIcon from "./loadingicon";
import BetterDiscord from "@modules/core";
import BdApi from "@api/index";

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
import require from "./polyfill"; // eslint-disable-line no-unused-vars
import secure from "./secure";
import LoadingInterface from "./loading";
import BetterDiscord from "./modules/core";
import BdApi from "./modules/pluginapi";

// Perform some setup
secure();
window.BdApi = BdApi;
window.global = window;

// Add loading icon at the bottom right
LoadingInterface.show();
BetterDiscord.startup();
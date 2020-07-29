import secure from "./secure";
import patchModuleLoad from "./moduleloader";
import LoadingIcon from "./loadingicon";
import BetterDiscord from "./modules/core";
import BdApi from "./modules/pluginapi";

// Perform some setup
secure();
patchModuleLoad();
window.BdApi = BdApi;

// Add loading icon at the bottom right
LoadingIcon.show();
BetterDiscord.startup();
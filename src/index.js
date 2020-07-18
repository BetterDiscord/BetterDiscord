import secure from "./secure";
import patchModuleLoad from "./moduleloader";
import Core from "./modules/core";
import BdApi from "./modules/pluginapi";
import LoadingIcon from "./loadingicon";

// Perform some setup
secure();
patchModuleLoad();
window.BdApi = BdApi;

// Add loading icon at the bottom right
LoadingIcon.show();

// Backwards compatibility for now
export default class CoreWrapper {
    constructor(config) {
        Core.setConfig(config);
    }

    init() {
        Core.init();
    }
}
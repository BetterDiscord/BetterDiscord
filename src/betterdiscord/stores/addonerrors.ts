import type AddonError from "@structs/addonerror";
import Store from "./base";

class AddonErrorsStore extends Store {
    pluginErrors: AddonError[] = [];
    themeErrors: AddonError[] = [];

    addPluginError(error: AddonError) {
        this.pluginErrors.push(error);
        this.emitChange();
    }

    addThemeError(error: AddonError) {
        this.themeErrors.push(error);
        this.emitChange();
    }

    clearErrors() {
        this.pluginErrors = [];
        this.themeErrors = [];
        this.emitChange();
    }
}

export default new AddonErrorsStore();
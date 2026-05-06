import type AddonError from "@structs/addonerror";
import Store from "./base";

export default new class AddonErrorsStore extends Store {
    pluginErrors: Record<string, AddonError> = {};
    themeErrors: Record<string, AddonError> = {};

    addPluginError(error: AddonError) {
        this.pluginErrors[error.file] = error;
        this.emitChange();
    }

    addThemeError(error: AddonError) {
        this.themeErrors[error.file] = error;
        this.emitChange();
    }

    clearErrors() {
        this.pluginErrors = {};
        this.themeErrors = {};
        this.emitChange();
    }
};
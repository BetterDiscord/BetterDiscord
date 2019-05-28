import {KnownModules} from "./webpackmodules";
import strings from "../data/strings";

Object.defineProperty(module, "exports", {
    get: () => {
        if (!strings) return {};
        const locale = KnownModules.UserSettingsStore.locale.split("-")[0];
        if (strings.hasOwnProperty(locale)) return strings[locale];
        return strings.en;
    }
});
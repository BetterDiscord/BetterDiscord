import * as Locales from "@assets/locales/index";

import DiscordModules from "./discordmodules";
import Utilities from "./utilities";
import Events from "./emitter";

const {LocaleStore} = DiscordModules;

export default new class LocaleManager {
    get discordLocale() {return LocaleStore?.locale ?? this.defaultLocale;}
    get defaultLocale() {return "en-US";}

    constructor() {
        this.strings = Utilities.extend({}, Locales[this.defaultLocale]);
    }

    initialize() {
        this.setLocale();
        LocaleStore?.addChangeListener(() => this.setLocale());
    }

    setLocale() {
        // Reset to the default locale in case a language is incomplete
        Utilities.extend(this.strings, Locales[this.defaultLocale]);

        // Get the strings of the new language and extend if a translation exists
        const newStrings = Locales[this.discordLocale];
        if (newStrings) Utilities.extendTruthy(this.strings, newStrings);

        Events.emit("strings-updated");
    }
};
import Locales from "@assets/locales/index";
import defaultStrings from "@assets/locales/en-us.json";

import DiscordModules from "./discordmodules";
import Utilities from "./utilities";
import Events from "./emitter";

const {LocaleStore} = DiscordModules;

export default new class LocaleManager {
    get discordLocale() {return LocaleStore?.locale ?? this.defaultLocale;}
    get defaultLocale() {return "en-US";}

    strings: typeof defaultStrings;

    constructor() {
        this.strings = Utilities.extend({}, Locales[this.defaultLocale as keyof typeof Locales]) as typeof defaultStrings;
    }

    initialize() {
        this.setLocale();
        LocaleStore?.addChangeListener(() => this.setLocale());
    }

    setLocale() {
        // Reset to the default locale in case a language is incomplete
        Utilities.extend(this.strings, Locales[this.defaultLocale as keyof typeof Locales]);

        // Get the strings of the new language and extend if a translation exists
        const newStrings = Locales[this.discordLocale as keyof typeof Locales];
        if (newStrings) Utilities.extendTruthy(this.strings, newStrings);

        Events.emit("strings-updated");
    }
};
import Locales from "@assets/locales/index";
import defaultStrings from "@assets/locales/en-us.json";

import DiscordModules from "./discordmodules";
import {extend} from "@common/utils";

const {LocaleStore} = DiscordModules;

export default new class LocaleManager {
    get discordLocale() {return LocaleStore?.locale ?? this.defaultLocale;}
    get defaultLocale() {return "en-US";}

    strings: typeof defaultStrings;

    constructor() {
        this.strings = extend({}, Locales[this.defaultLocale as keyof typeof Locales]) as typeof defaultStrings;
    }

    initialize() {
        this.setLocale();
        LocaleStore?.addChangeListener(() => this.setLocale());
    }

    setLocale() {
        // Reset to the default locale in case a language is incomplete
        extend(this.strings, Locales[this.defaultLocale as keyof typeof Locales]);

        // Get the strings of the new language and extend if a translation exists
        const newStrings = Locales[this.discordLocale as keyof typeof Locales];
        if (newStrings) extend(this.strings, newStrings);
    }
};
import * as Locales from "@assets/locales/index";

import DiscordModules from "./discordmodules";
import Utilities from "./utilities";
import Events from "./emitter";

const {LocaleStore} = DiscordModules;

export default new class LocaleManager {
    get discordLocale() {return LocaleStore?.locale ?? this.defaultLocale;}
    get defaultLocale() {return "en-US";}

    constructor() {
        this.locale = "";
        this.strings = Utilities.extend({}, Locales[this.defaultLocale]);
    }

    initialize() {
        this.setLocale();
        LocaleStore?.addChangeListener(() => this.setLocale());
    }

    setLocale() {
        let newStrings;
        if (this.discordLocale != this.defaultLocale) {
            newStrings = Locales[this.discordLocale];
            if (!newStrings) return this.setLocale(this.defaultLocale);
        }
        else {
            newStrings = Locales[this.defaultLocale];
        }
        this.locale = this.discordLocale;
        Utilities.extendTruthy(this.strings, newStrings);
        Events.emit("strings-updated");
    }
};
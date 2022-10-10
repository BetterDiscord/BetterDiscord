import * as Locales from "../../../assets/locales";
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
        this.setLocale(this.discordLocale);
        LocaleStore?.addChangeListener((newLocale) => this.setLocale(newLocale));
    }

    setLocale(newLocale) {
        let newStrings;
        if (newLocale != this.defaultLocale) {
            newStrings = Locales[newLocale];
            if (!newStrings) return this.setLocale(this.defaultLocale);
        }
        else {
            newStrings = Locales[this.defaultLocale];
        }
        this.locale = newLocale;
        Utilities.extendTruthy(this.strings, newStrings);
        Events.emit("strings-updated");
    }
};
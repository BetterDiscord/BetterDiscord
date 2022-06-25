import * as Locales from "../../../assets/locales";
import DiscordModules from "./discordmodules";
import Utilities from "./utilities";
import Events from "./emitter";

const {Dispatcher, DiscordConstants, UserSettingsStore} = DiscordModules;

export default new class LocaleManager {
    get discordLocale() {return UserSettingsStore.locale;}
    get defaultLocale() {return "en-US";}

    constructor() {
        this.locale = "";
        this.strings = Utilities.extend({}, Locales[this.defaultLocale]);
    }

    initialize() {
        this.setLocale(this.discordLocale);
        Dispatcher.subscribe(DiscordConstants.ActionTypes.USER_SETTINGS_UPDATE, ({settings}) => {
            const newLocale = settings.locale;
            if (newLocale && newLocale != this.locale) this.setLocale(newLocale);
        });
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
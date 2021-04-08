import * as Locales from "../../../assets/locales";
import DiscordModules from "./discordmodules";
import Utilities from "./utilities";
import Events from "./emitter";

const {Dispatcher, DiscordConstants, UserSettingsStore} = DiscordModules;

export default new class LocaleManager {
    get discordLocale() {return UserSettingsStore.locale.split("-")[0];}
    get defaultLocale() {return "en";}

    constructor() {
        this.locale = "";
        this.strings = Utilities.extend({}, Locales[this.defaultLocale]);
    }

    initialize() {
        this.setLocale(this.discordLocale);
        Dispatcher.subscribe(DiscordConstants.ActionTypes.USER_SETTINGS_UPDATE, ({settings}) => {
            const newLocale = settings.locale;
            if (newLocale && newLocale != this.locale) this.setLocale(newLocale.split("-")[0]);
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
        Utilities.extend(this.strings, newStrings);
        Events.emit("strings-updated");
    }
};
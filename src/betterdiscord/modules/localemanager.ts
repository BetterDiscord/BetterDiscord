import i18n, {type Locale} from "@common/i18n";
import {Stores} from "@webpack";


export default new class LocaleManager {
    get discordLocale(): Locale {return Stores.LocaleStore?.locale ?? this.defaultLocale;}
    get defaultLocale(): Locale {return "en-US";}

    initialize() {
        i18n.setLocale(this.discordLocale);
        Stores.LocaleStore?.addChangeListener(() => i18n.setLocale(this.discordLocale));
    }
};
import i18n, {type Locale} from "@common/i18n";

import DiscordModules from "./discordmodules";


export default new class LocaleManager {
    get discordLocale(): Locale {return DiscordModules.LocaleStore?.locale ?? this.defaultLocale;}
    get defaultLocale(): Locale {return "en-US";}

    initialize() {
        i18n.setLocale(this.discordLocale);
        DiscordModules.LocaleStore?.addChangeListener(() => i18n.setLocale(this.discordLocale));
    }
};
import DefaultStrings from "../data/strings";
import DiscordModules from "./discordmodules";
import Utilities from "./utilities";
import Events from "./emitter";
import DataStore from "./datastore";
const request = require("request");

const {Dispatcher, DiscordConstants, UserSettingsStore} = DiscordModules;

export default new class LocaleManager {
	get discordLocale() {return UserSettingsStore.locale.split("-")[0];}
	get defaultLocale() {return "en";}

	constructor() {
        this.locale = "";
        this.strings = {};
	}
	
	async initialize() {
        await this.setLocale(this.discordLocale);
        Dispatcher.subscribe(DiscordConstants.ActionTypes.USER_SETTINGS_UPDATE, ({settings}) => {
            const newLocale = settings.locale;
            if (newLocale && newLocale != this.locale) this.setLocale(newLocale.split("-")[0]);
        });
	}

	async setLocale(newLocale) {
        let newStrings;
        if (newLocale != this.defaultLocale) {
            const savedStrings = DataStore.getLocale(newLocale);
            newStrings = savedStrings || await this.downloadLocale(newLocale);
            if (!newStrings) return this.setLocale(this.defaultLocale);
        }
        else {
            newStrings = DefaultStrings;
        }
		this.locale = newLocale;
		Utilities.extend(this.strings, newStrings);
		Events.emit("strings-updated");
	}

	downloadLocale(locale) {
		return new Promise(resolve => {
			const options = {
				url: `https://raw.githubusercontent.com/rauenzi/BetterDiscordApp/development/data/locales/${locale}.json`,//`https://rauenzi.github.io/BetterDiscordApp/data/locales/${discordLocale}.json`,
				timeout: 2000,
				json: true
			};
			request.get(options, (err, resp, newStrings) => {
                if (err || resp.statusCode !== 200) return resolve(null);
                DataStore.saveLocale(locale, newStrings);
				resolve(newStrings);
			});
		});
	}
};
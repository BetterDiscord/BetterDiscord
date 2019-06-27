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
			newStrings = await this.getLocaleStrings(newLocale);
            if (!newStrings) return this.setLocale(this.defaultLocale);
        }
        else {
            newStrings = DefaultStrings;
        }
		this.locale = newLocale;
		Utilities.extend(this.strings, newStrings);
		Events.emit("strings-updated");
	}

	async getLocaleStrings(locale) {
		const hash = DataStore.getLocaleHash(locale);
		if (!hash) return await this.downloadLocale(locale);
		const invalid = await this.downloadLocale(locale, hash);
		if (!invalid) return DataStore.getLocale(locale);
		return invalid;
	}

	downloadLocale(locale, hash = "") {
		return new Promise(resolve => {
			const options = {
				url: Utilities.repoUrl(`data/locales/${locale}.json`),
				timeout: 2000,
				json: true
			};
			if (hash) options.headers = {"If-None-Match": hash};
			console.log(options.headers);
			request.get(options, (err, resp, newStrings) => {
				if (err || resp.statusCode !== 200) return resolve(null);
				console.log(resp);
				DataStore.saveLocale(locale, newStrings);
				DataStore.saveLocaleHash(locale, resp.headers.etag);
				resolve(newStrings);
			});
		});
	}
};
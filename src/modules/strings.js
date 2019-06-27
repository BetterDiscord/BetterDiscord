import DiscordModules from "./discordmodules";
import RawStrings from "../data/strings";
import Utilities from "./utilities";
import FormattableString from "../structs/string";
import Events from "./emitter";
import DataStore from "./datastore";

const request = require("request");
const discordLocale = UserSettingsStore.locale.split("-")[0];

const savedStrings = DataStore.getLocale(discordLocale);
if (!savedStrings) {
	const options = {
		url: "https://rauenzi.github.io/BetterDiscordApp/data/emotedata_twitch_subscriber.json",
		timeout: 5000,
        json: true
	};
	request.get(options, (err, resp, newStrings) => {
		if (err) return;
		DataStore.saveLocale(discordLocale, newStrings);
		Utilities.extend(Messages, newStrings);
		Events.emit("strings-updated");
	});
}

const {Dispatcher, DiscordConstants, UserSettingsStore} = DiscordModules;
const Messages = {};



export let currentLocale = "en";
export function setLocale(newLocale) {
    currentLocale = newLocale;
	Utilities.extend(Messages, RawStrings[currentLocale]);
	Events.emit("strings-updated");
}

Utilities.extend(Messages, RawStrings[currentLocale]);

// if (RawStrings[discordLocale] && discordLocale != currentLocale) setLocale(discordLocale);

Dispatcher.subscribe(DiscordConstants.ActionTypes.USER_SETTINGS_UPDATE, ({settings}) => {
    const newLocale = settings.locale;
    if (newLocale && newLocale != currentLocale) setLocale(newLocale.split("-")[0]);
});


export default new Proxy(Messages, {
	get: function(strings, category) {
        if (!strings.hasOwnProperty(category)) {
			return new Proxy({}, {
				get: function() {
					return `String group "${category}" not found.`;
				}
			});
		}
		return new Proxy(strings[category], {
			get: function(obj, prop) {
				if (typeof(obj[prop]) == "string") return new FormattableString(obj[prop]);
				return obj[prop];
			}
		});
	}
});


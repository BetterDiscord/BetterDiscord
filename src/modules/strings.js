import DiscordModules from "./discordmodules";
import RawStrings from "../data/strings";
import Utilities from "./utilities";

const {Dispatcher, DiscordConstants} = DiscordModules;
const Messages = {};

export let currentLocale = "en";
export function setLocale(newLocale) {
    currentLocale = newLocale;
    Utilities.extend(Messages, RawStrings[currentLocale]);
}

Utilities.extend(Messages, RawStrings[currentLocale]);

Dispatcher.subscribe(DiscordConstants.ActionTypes.USER_SETTINGS_UPDATE, ({settings}) => {
    const newLocale = settings.locale;
    if (newLocale && newLocale != currentLocale) setLocale(newLocale.split("-")[0]);
});

export default new Proxy(Messages, {
	get: function(strings, category) {
        if (strings.hasOwnProperty(category)) return strings[category];
		return new Proxy({}, {
			get: function() {
				return `String group "${category}" not found.`;
			}
		});
	}
});


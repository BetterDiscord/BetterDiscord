import DiscordModules from "./discordmodules";
import RawStrings from "../data/strings";
import Utilities from "./utilities";
import FormattableString from "../structs/string";
import Events from "./emitter";

const {Dispatcher, DiscordConstants} = DiscordModules;
const Messages = {};

export let currentLocale = "en";
export function setLocale(newLocale) {
    currentLocale = newLocale;
	Utilities.extend(Messages, RawStrings[currentLocale]);
	Events.emit("strings-updated");
}

Utilities.extend(Messages, RawStrings[currentLocale]);

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


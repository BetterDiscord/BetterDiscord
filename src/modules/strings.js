import LocaleManager from "./localemanager";
import FormattableString from "../structs/string";

export default new Proxy(LocaleManager.strings, {
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


import FormattableString from "@structs/string";

import LocaleManager from "./localemanager";


export default new Proxy(LocaleManager.strings, {
    get: function(strings, category) {
        if (!strings.hasOwnProperty(category)) {
            return new Proxy({}, {
                get: function() {
                    // Use a FormattableString anyways so code using `.format()` doesn't fail
                    return new FormattableString(`String group "${category}" not found.`);
                }
            });
        }
        return new Proxy(strings[category], {
            get: function(obj, prop) {
                if (typeof (obj[prop]) == "string") return new FormattableString(obj[prop]);
                return obj[prop];
            }
        });
    }
});


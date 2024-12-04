import {Locale, Replacements, Translation} from "./types";


let _locale: Locale;
let _translations: Record<Locale, Translation>;
let pluralization;


interface InitOptions {
    locale?: Locale;
    fallback?: Locale;
    translations?: Record<Locale, Translation>;
}

const i18n = {
    get locale() {return _locale;},
    get supportedLocales() {return Object.keys(_translations);},
    isSupported(abbr: Locale) {return Object.keys(_translations).includes(abbr);},

    init(options: InitOptions = {}) {
        let {locale, fallback = "en-US", translations} = options;
        if (!locale) locale = fallback;
        _locale = locale;
        if (translations) _translations = translations;
        pluralization = new Intl.PluralRules(_locale);
    },

    t(phrase: string, replacements: Replacements) {
        let target = getNestedProp(_translations[_locale], phrase);
        if (target.plural && replacements.count) {
            target = target.plural[pluralization.select(replacements.count)];
        }
    }
};

export default i18n;
export const t = i18n.t;


function getNestedProp<T>(obj: T, path: string) {
    return path.split(".").reduce(function(ob, prop) {
        return ob && ob[prop];
    }, obj);
}
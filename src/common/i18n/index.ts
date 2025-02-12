import Localizations from "@assets/locales";
import {formatString, getNestedProp} from "@common/utils";


interface Plural {
    zero?: string;
    one?: string;
    two?: string;
    few?: string;
    many?: string;
    other?: string;
}

type Translation = string | Plural | undefined;

type Replacements = {
    [key: string]: string | number | undefined;
    count?: number;
};

// TODO: move this to the types folder its useful
type NestedKeyOf<ObjectType extends object> =
    {[Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
        ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
        : `${Key}`
    }[keyof ObjectType & (string | number)];

type TranslationKeys = NestedKeyOf<typeof Localizations["en-US"]>;

type Locale = keyof typeof Localizations;

interface InitOptions {
    locale?: Locale;
    fallback?: Locale;
    translations: Record<Locale, typeof Localizations[Locale]>;
}


const ruleCache: Map<Locale, Intl.PluralRules> = new Map();

let currentLocale: Locale;
let currentFallback: Locale;
let currentTranslations: Record<Locale, typeof Localizations[Locale]>;

const i18n = {
    get locale() {return currentLocale;},
    get rules() {return ruleCache.get(i18n.locale);},
    get supportedLocales() {return Object.keys(currentTranslations);},
    isSupported(abbr: Locale) {return Object.keys(currentTranslations).includes(abbr);},

    // This can easily be made more generic if needed in the future
    init(options: InitOptions) {
        const {locale, fallback = "en-US", translations} = options;
        currentFallback = fallback;
        currentTranslations = translations;
        i18n.setLocale(locale);
    },

    setLocale(locale?: Locale) {
        currentLocale = locale ?? currentFallback;
        if (ruleCache.has(currentLocale)) return;
        ruleCache.set(currentLocale, new Intl.PluralRules(currentLocale));
    },

    pluralize(target: string | Plural, count: number) {
        if (typeof target === "string") return target;
        const hasZero = "zero" in target;
        const selection = hasZero && (count === 0) ? "zero" : i18n.rules?.select(count);
        // console.log({hasZero, selection});
        if (!selection) return target;
        if (selection in target) return target[selection];
        return target;
    },

    t(phrase: TranslationKeys, replacements?: Replacements & {count?: number;}) {
        // console.log(phrase);
        let target = getNestedProp(currentTranslations[currentLocale], phrase) as Translation;
        if (!target) target = getNestedProp(currentTranslations[currentFallback], phrase);
        // console.log(target);
        if (!target) return null;

        if (replacements) {
            if ("count" in replacements) target = i18n.pluralize(target, replacements.count!);
            if (typeof target !== "string") return null;
            target = formatString(target, replacements);
        }

        if (typeof target !== "string") return null;
        return target;
    }
};


i18n.init({translations: Localizations});


export default i18n;
export const t = i18n.t;

// i18n.init({translations: Localizations});
// console.log(`Code Snippet:  t("Addons.results", {count: 0})`);
// console.log(`Translation:   ${t("Addons.results", {count: 0})}`);
// console.log("");
// console.log(`Code Snippet:  t("Addons.results", {count: 1})`);
// console.log(`Translation:   ${t("Addons.results", {count: 1})}`);
// console.log("");
// console.log(`Code Snippet:  t("Addons.results", {count: 2})`);
// console.log(`Translation:   ${t("Addons.results", {count: 2})}`);
// i18n.setLocale("hi");
// console.log("");
// console.log(`Code Snippet:  t("Panels.plugins", {count: 2})`);
// console.log(`Translation:   ${t("Panels.plugins", {count: 2})}`);
// console.log("");
// console.log(`Code Snippet:  t("Addons.results", {count: 2})`);
// console.log(`Translation:   ${t("Addons.results", {count: 2})}`);
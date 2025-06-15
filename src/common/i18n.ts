import Localizations from "@assets/locales";
import Default from "@assets/locales/en-us.json";
import {formatString, getNestedProp} from "@common/utils";
import Logger from "./logger";


interface Plural {
    zero?: string;
    one?: string;
    two?: string;
    few?: string;
    many?: string;
    other?: string;
}

type Translation = string | Plural;

type Replacements = {
    [key: string]: string | number | undefined;
    count?: number;
    context?: string;
};

// TODO: move this to the types folder its useful
type NestedKeyOf<ObjectType extends object> =
    {[Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
        ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
        : `${Key}`
    }[keyof ObjectType & (string | number)];

// type pString = `${string}_${keyof Plural}`;
// type RemovePrefix<TPrefix extends string, TString extends string> = TString extends `${TPrefix}${infer T}` ? T : never;
// type RemovePostfix<TPostfix extends string, TString extends string> = TString extends `${infer T}${TPostfix}` ? T : TString;

// type NestedKeyOf2<ObjectType extends object> =
//     {[Key in keyof ObjectType & (string | number | pString)]: ObjectType[Key] extends object
//         ? `${Key}` | `${Key}.${RemovePostfix<`_${keyof Plural}`, NestedKeyOf<ObjectType[Key]>>}`
//         : `${Key}`
//     }[keyof ObjectType & (string | number | pString)];

// type Single = typeof Localizations["en-US"];

// export type AltKeys = NestedKeyOf2<typeof Default>;
export type TranslationKey = NestedKeyOf<typeof Default>;

// function foo(t: AltKeys) {}
// const test = foo("Panels.plugins");

export type Locale = keyof typeof Localizations;

interface InitOptions {
    locale?: Locale;
    fallback?: Locale;
    translations: Record<Locale, typeof Localizations[Locale]>;
}

function isValidPlural(value: unknown): value is Plural {
    if (typeof value !== "object" || value === null) return false;
    return Object.keys(value).some(k => ["zero", "one", "two", "few", "many", "other"].includes(k));
}

function isValidTranslation(value: unknown): value is Translation {
    return typeof value === "string" || isValidPlural(value);
}

function isValidLocale(locale: string): locale is Locale {
    return Object.keys(Localizations).includes(locale);
}


const ruleCache: Map<Locale, Intl.PluralRules> = new Map();

let currentLocale: Locale;
let currentFallback: Locale;
let currentTranslations: Record<Locale, typeof Localizations[Locale]>;

const i18n = {
    get locale() {return currentLocale;},
    get rules() {return ruleCache.get(i18n.locale);},
    get supportedLocales() {return currentTranslations ? Object.keys(currentTranslations) : [];},
    isSupported(abbr: Locale) {return currentTranslations ? Object.keys(currentTranslations).includes(abbr) : false;},

    // This can easily be made more generic if needed in the future
    init(options: InitOptions) {
        const {locale, fallback = "en-US", translations} = options;
        if (!isValidLocale(fallback)) throw new Error(`Invalid fallback locale: ${fallback}`);
        currentFallback = fallback;
        currentTranslations = translations;
        i18n.setLocale(locale ?? fallback);
    },

    setLocale(locale: Locale) {
        if (!i18n.isSupported(locale)) {
            Logger.warn("i18n", `Locale ${locale} is not supported, falling back to ${currentFallback}`);
            locale = currentFallback;
        }

        currentLocale = locale;
        if (ruleCache.has(currentLocale)) return;
        ruleCache.set(currentLocale, new Intl.PluralRules(currentLocale));
    },

    /** @private */
    pluralize(target: string | Plural, count?: number): string {
        if (typeof target === "string") return target;

        if (typeof count !== "number" || isNaN(count)) {
            Logger.warn("i18n", `Invalid count provided for pluralization: ${count}. Returning 'other' form.`);
            return target.other ?? target.one ?? "Translation error";
        }

        const hasZero = "zero" in target;
        const selection = hasZero && (count === 0) ? "zero" : i18n.rules?.select(count);

        if (!selection) {
            Logger.warn("i18n", `No plural selection for ${currentLocale} with count ${count}`);
            return target.other ?? target.one ?? "Translation error";
        }

        if (selection in target && target[selection]) {
            return target[selection]!;
        }

        return target.other ?? target.one ?? `Missing plural form: ${selection}`;
    },

    /** @private */
    context(key: TranslationKey | (string & {}), context?: string): Translation | undefined {
        const contextKey = `${key}.${context}` as TranslationKey;
        const defaultKey = `${key}.default` as TranslationKey;

        // Check current locale first, and fallback to default key if not found
        let target = context ? getNestedProp(currentTranslations[currentLocale], contextKey) : null;
        if (!isValidTranslation(target)) target = getNestedProp(currentTranslations[currentLocale], defaultKey);
        if (isValidTranslation(target)) return target;

        // If it's still invalid, check the fallback locale
        target = context ? getNestedProp(currentTranslations[currentFallback], contextKey) : null;
        if (!isValidTranslation(target)) target = getNestedProp(currentTranslations[currentFallback], defaultKey);
        if (isValidTranslation(target)) return target;
    },

    t<T extends Replacements>(key: TranslationKey | (string & {}), replacements?: T, formatters?: Partial<Record<keyof T, (value: string) => string>>): string {
        // Try to get a contextual translation first
        let target = i18n.context(key, replacements?.context);

        // If the context translation is not valid, fallback to the key itself
        if (!isValidTranslation(target)) target = getNestedProp(currentTranslations[currentLocale], key);
        if (!isValidTranslation(target)) target = getNestedProp(currentTranslations[currentFallback], key);
        if (!isValidTranslation(target)) return "String not found!";

        // First handle pluralization if the target is a plural object
        // pluralize will handle the case where count is not provided or invalid
        if (isValidPlural(target)) {
            target = i18n.pluralize(target, replacements?.count);
        }

        // If there are replacements, pluralize if needed and format the string
        if (replacements) {
            const formatted: Replacements = {...replacements};
            for (const fkey in formatters) {
                if (!formatted[fkey] || typeof formatters[fkey] !== "function") continue;
                try {
                    formatted[fkey] = formatters[fkey](formatted[fkey].toString());
                }
                catch (error) {
                    Logger.stacktrace("i18n", `Error formatting ${fkey} in ${key}:`, error as Error);
                    formatted[fkey] = formatted[fkey].toString(); // Fallback to string if formatter fails
                }
            }
            target = formatString(target, formatted);
        }

        // If the target is still not a string, return an error message
        // This can happen if the translation is not found or is not a string
        // Or if the translation was a plural and no count was provided
        if (typeof target !== "string") return "String not found!";

        return target;
    },

    /**
     * Create a namespace-scoped translation function
     */
    ns(prefix: string) {
        return {
            t: <T extends Replacements>(
                key: string,
                replacements?: T,
                formatters?: Partial<Record<keyof T, (value: string) => string>>
            ): string => {
                const fullKey = `${prefix}.${key}` as TranslationKey;
                return i18n.t(fullKey, replacements, formatters);
            },

            /** Create a nested namespace */
            ns: (subPrefix: string) => {
                return i18n.ns(`${prefix}.${subPrefix}`);
            },

            /** Get the full key for debugging */
            getFullKey: (key: string) => `${prefix}.${key}`,
        };
    }
};


i18n.init({translations: Localizations});


export default i18n;
export const t = i18n.t;

export const formatters = {
    number: (options: Intl.NumberFormatOptions = {}) => (val: string) => new Intl.NumberFormat(currentLocale, options).format(Number(val)),
    date: (options: Intl.DateTimeFormatOptions = {}) => (val: string) => new Intl.DateTimeFormat(currentLocale, options).format(new Date(val)),
    currency: (currency: string = "USD", options: Intl.NumberFormatOptions = {}) => (val: string) => new Intl.NumberFormat(currentLocale, {style: "currency", currency, ...options}).format(Number(val)),
    bytes: () => (val: string) => {
        const bytes = Number(val);
        const units = ["B", "KB", "MB", "GB"];
        let size = bytes;
        let unitIndex = 0;
        while (Math.abs(size) >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return `${size.toFixed(1)} ${units[unitIndex]}`;
    }
};

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
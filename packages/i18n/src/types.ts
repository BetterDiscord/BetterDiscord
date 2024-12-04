import en from "../../../assets/locales/en-us.json";


export type Locale = "en-US" | "en-GB" | "zh-CN" | "zh-TW" | "cs" | "da" | "nl" | "fr" | "de" | "el" | "hu" | "it" | "ja" | "ko" | "no" | "hr" | "pl" | "pt-PT" | "pt-BR" | "ru" | "sk" | "es-ES" | "es-419" | "sv-SE" | "tr" | "bg" | "uk" | "fi" | "ro" | "lt" | "th" | "vi" | "hi" | "he" | "ar" | "id";

export interface Plural {
    plural: {
        [key: string]: string
    }
}

// export interface Translation {
//     [key: string]: string | Plural | Translation;
// }

export type Translation = typeof en;

export interface Replacements {
    [key: string]: string | number | boolean;
}
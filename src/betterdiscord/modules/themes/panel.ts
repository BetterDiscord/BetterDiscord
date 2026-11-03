import {hasThemeSettings} from "./settings";
import {parseCssString} from "./scanner";
import type {Theme} from "@modules/thememanager";
import type {ThemeSetting} from "./types";


/** Settings that share a `group`, under that group's heading. */
export interface ThemeSettingGroup {
    name: string;
    settings: ThemeSetting[];
}

/**
 * Whether a theme's card gets a settings button. A theme that has started knows its settings, and it keeps them
 * after it stops. A theme that hasn't started yet only has its source, so the check falls back to the text.
 */
export function themeHasSettings(theme: Pick<Theme, "properties" | "css" | "fileContent">) {
    if (theme.properties) return theme.properties.length > 0;
    return hasThemeSettings(theme.fileContent ?? theme.css ?? "");
}

/** Splits settings into those without a group, which come first, and one group per name in order of first use. */
export function groupSettings(settings: readonly ThemeSetting[]) {
    const ungrouped: ThemeSetting[] = [];
    const groups: ThemeSettingGroup[] = [];

    for (const setting of settings) {
        if (!setting.group) {
            ungrouped.push(setting);
            continue;
        }

        let group = groups.find(g => g.name === setting.group);
        if (!group) {
            group = {name: setting.group, settings: []};
            groups.push(group);
        }
        group.settings.push(setting);
    }

    return {ungrouped, groups};
}

/** One choice in a keyword radio or dropdown. The value is the keyword as written, and the label is for people. */
export interface KeywordOption {
    value: string;
    label: string;
}

/** The control a setting gets in the panel. `text` is a plain field for the CSS value as written. */
export type ThemeControl =
    | {kind: "switch";}
    | {kind: "radio" | "dropdown"; options: KeywordOption[];}
    | {kind: "slider"; min: number; max: number; step: number; unit: string;}
    | {kind: "number"; min?: number; max?: number; step: number; unit: string;}
    | {kind: "color"; palette?: string[];}
    | {kind: "string";}
    | {kind: "url";}
    | {kind: "text";};

/** Picks the control for a setting from its syntax and range. */
export function pickControl(setting: ThemeSetting): ThemeControl {
    const {keywords, type} = setting.syntax;

    if (!type) {
        if (keywords.length === 2 && keywords.includes("true") && keywords.includes("false")) return {kind: "switch"};
        const options = keywords.map(value => ({value, label: keywordLabel(value)}));
        return {kind: keywords.length > 3 ? "dropdown" : "radio", options};
    }

    // TODO: keywords plus a type get a Custom option that reveals the type's control
    if (keywords.length) return {kind: "text"};

    if (type === "color") return {kind: "color", palette: setting.palette};
    if (type === "string") return {kind: "string"};
    if (type === "url") return {kind: "url"};
    return pickNumericControl(setting) ?? {kind: "text"};
}

/** A slider when the range has both ends, and a number field otherwise. Null when the setting needs a unit picker. */
function pickNumericControl(setting: ThemeSetting): ThemeControl | null {
    const isUnitless = setting.syntax.type === "number" || setting.syntax.type === "integer";
    // TODO: a setting that offers several units gets a unit picker
    if (!isUnitless && setting.units.length !== 1) return null;

    const unit = isUnitless ? "" : setting.units[0];
    const isInteger = setting.syntax.type === "integer";
    const {min, max, step} = setting.range ?? {};

    if (min !== undefined && max !== undefined) {
        return {kind: "slider", min, max, step: step ?? defaultSliderStep(min, max, isInteger), unit};
    }
    return {kind: "number", min, max, step: step ?? 1, unit};
}

/** Whole steps for a wide range, so 0 to 24px moves in pixels, and a hundredth of a narrow range such as 0 to 1. */
function defaultSliderStep(min: number, max: number, isInteger: boolean) {
    if (isInteger || max - min >= 10) return 1;
    return (max - min) / 100;
}

/** Turns a keyword into a label, so `high-contrast` reads "High contrast". */
export function keywordLabel(keyword: string) {
    const words = keyword.replace(/[-_]+/g, " ").trim();
    return words.charAt(0).toUpperCase() + words.slice(1);
}

const numberPattern = /^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)([a-z%]*)$/i;

/**
 * Reads a value such as `12px` as a number in the given unit. Returns null for anything else, such as another
 * unit or `calc()`, so the panel can fall back to a text field. A plain `0` counts in any unit.
 */
export function readNumber(value: string, unit: string) {
    const match = numberPattern.exec(value.trim());
    if (!match) return null;

    const number = Number(match[1]);
    const valueUnit = match[2].toLowerCase();
    if (valueUnit === unit || (valueUnit === "" && number === 0)) return number;
    return null;
}

/** Writes a number in a unit, without the float noise a slider can produce (`0.15000000000000002`). */
export function writeNumber(number: number, unit: string) {
    return String(Number(number.toFixed(6))) + unit;
}

/** Puts text in a CSS string, escaping backslashes, quotes and line breaks. */
export function quoteCssString(text: string) {
    return "\"" + text.replace(/\\/g, "\\\\").replace(/"/g, "\\\"").replace(/\r?\n/g, "\\A ") + "\"";
}

/** Reads the text inside a CSS string, or returns the value as it is when it isn't one string. */
export function readCssString(value: string) {
    return parseCssString(value.trim()) ?? value;
}

/** Wraps a link in `url()`. */
export function writeCssUrl(link: string) {
    return `url(${quoteCssString(link.trim())})`;
}

/** Reads the link inside `url()`, quoted or not. Returns the value as it is when it isn't one `url()`. */
export function readCssUrl(value: string) {
    const match = /^url\(\s*([^]*?)\s*\)$/i.exec(value.trim());
    if (!match) return value;
    return parseCssString(match[1]) ?? match[1];
}

/** The 6-digit hex the color picker can show, or null for any other color. A 3-digit hex is expanded. */
export function pickerHex(value: string) {
    const hex = value.trim().toLowerCase();
    if (/^#[0-9a-f]{6}$/.test(hex)) return hex;
    if (/^#[0-9a-f]{3}$/.test(hex)) return "#" + [...hex.slice(1)].map(c => c + c).join("");
    return null;
}

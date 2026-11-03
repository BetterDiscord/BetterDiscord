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

/** A control for a setting's data type, without any keywords. */
export type TypeControl =
    | {kind: "slider"; min: number; max: number; step: number; units: string[];}
    | {kind: "number"; min?: number; max?: number; step: number; units: string[];}
    | {kind: "color"; palette?: string[];}
    | {kind: "string";}
    | {kind: "url";};

/**
 * The control a setting gets in the panel. A number's `units` lists the units the user may pick from, in order,
 * and is empty for a plain number. `custom` is a keyword control with one more option, Custom, which reveals the
 * data type's control and starts it at `starter`. A null starter means Custom waits for the user to type a value.
 */
export type ThemeControl =
    | TypeControl
    | {kind: "switch";}
    | {kind: "radio" | "dropdown"; options: KeywordOption[];}
    | {kind: "custom"; display: "radio" | "dropdown"; options: KeywordOption[]; control: TypeControl; starter: string | null;};

/** The most choices shown as radio buttons. A list with more choices gets a dropdown, which keeps the row narrow. */
export const maxRadioChoices = 3;

/** Picks the control for a setting from its syntax and range. */
export function pickControl(setting: ThemeSetting): ThemeControl {
    const {keywords, type} = setting.syntax;
    const options = keywords.map(value => ({value, label: keywordLabel(value)}));

    if (!type) {
        if (keywords.length === 2 && keywords.includes("true") && keywords.includes("false")) return {kind: "switch"};
        return {kind: keywords.length > maxRadioChoices ? "dropdown" : "radio", options};
    }

    const control = pickTypeControl(setting);
    if (!keywords.length) return control;

    // Custom counts as one more option when choosing between a radio and a dropdown
    const display = keywords.length + 1 > maxRadioChoices ? "dropdown" : "radio";
    return {kind: "custom", display, options, control, starter: customStarter(control)};
}

function pickTypeControl(setting: ThemeSetting): TypeControl {
    const {type} = setting.syntax;
    if (type === "color") return {kind: "color", palette: setting.palette};
    if (type === "string") return {kind: "string"};
    if (type === "url") return {kind: "url"};

    const isInteger = type === "integer";
    const {min, max, step} = setting.range ?? {};
    const {units} = setting;

    if (min !== undefined && max !== undefined) {
        return {kind: "slider", min, max, step: step ?? defaultSliderStep(min, max, isInteger), units};
    }
    return {kind: "number", min, max, step: step ?? 1, units};
}

/**
 * The value Custom applies when the user picks it, so the keyword control always matches the page: the first
 * swatch or black for a color, the bottom of the range or 0 for a number, and an empty string for a string. A link
 * has nothing sensible to start from.
 */
function customStarter(control: TypeControl) {
    switch (control.kind) {
        case "color": return control.palette?.[0] ?? "#000000";
        case "slider": return writeNumber(control.min, control.units[0] ?? "");
        case "number": return writeNumber(control.min ?? 0, control.units[0] ?? "");
        case "string": return quoteCssString("");
        case "url": return null;
    }
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
 * Reads a value such as `12px` as a number and one of the given units. Returns null for anything else, such as
 * another unit or `calc()`, so the panel can fall back to a text field. A plain `0` counts as the first unit.
 */
export function readNumber(value: string, units: readonly string[]) {
    const match = numberPattern.exec(value.trim());
    if (!match) return null;

    const number = Number(match[1]);
    const unit = match[2].toLowerCase();
    if (units.length === 0) return unit ? null : {number, unit};
    if (units.includes(unit)) return {number, unit};
    if (unit === "" && number === 0) return {number, unit: units[0]};
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

/**
 * Serializes a color the way a canvas's `fillStyle` does: `#rrggbb` for an opaque sRGB color, `rgba(r, g, b, a)`
 * for a see-through one, or null when the browser refuses the value.
 */
export type ReadColor = (value: string) => string | null;

/**
 * The hex the color picker can show, with 6 digits or with 8 when the color is see-through, or null for any other
 * color. A short hex is expanded. Named colors, `rgb()` and `hsl()` go through `readColor`, so `gray` becomes
 * `#808080`. A color that depends on where it's used, such as `currentcolor` or `light-dark()`, stays null, and so
 * does one outside sRGB, such as `oklch()`.
 */
export function pickerHex(value: string, readColor: ReadColor = readCanvasColor): string | null {
    const color = value.trim().toLowerCase();
    if (/^#[0-9a-f]{3,4}$/.test(color)) return trimOpaque("#" + [...color.slice(1)].map(c => c + c).join(""));
    if (/^#(?:[0-9a-f]{6}|[0-9a-f]{8})$/.test(color)) return trimOpaque(color);

    const isPlainColor = /^(?:[a-z]+|(?:rgba?|hsla?)\([^()]*\))$/.test(color) && color !== "currentcolor";
    if (!isPlainColor) return null;

    const read = readColor(color);
    if (read && /^#[0-9a-f]{6}$/.test(read)) return read;

    const match = read && /^rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)$/.exec(read);
    if (!match) return null;
    const bytes = [match[1], match[2], match[3]].map(Number);
    if (match[4] !== undefined) bytes.push(Math.round(Number(match[4]) * 255));
    return trimOpaque("#" + bytes.map(b => b.toString(16).padStart(2, "0")).join(""));
}

/** Drops a fully opaque alpha, so `#5865f2ff` and `#5865f2` are the same value. */
function trimOpaque(hex: string) {
    return hex.length === 9 && hex.endsWith("ff") ? hex.slice(0, 7) : hex;
}

let canvasContext: CanvasRenderingContext2D | null | undefined;

/** Reads a color through a canvas, which parses it without restyling the page. */
function readCanvasColor(value: string) {
    try {
        canvasContext ??= document.createElement("canvas").getContext("2d");
    }
    catch {
        canvasContext = null;
    }
    if (!canvasContext) return null;

    // A refused value leaves the old fill in place, so two different starting fills tell a refusal apart
    canvasContext.fillStyle = "#000000";
    canvasContext.fillStyle = value;
    const first = String(canvasContext.fillStyle);
    canvasContext.fillStyle = "#ffffff";
    canvasContext.fillStyle = value;
    return first === String(canvasContext.fillStyle) ? first : null;
}

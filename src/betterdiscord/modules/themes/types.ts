/**
 * A data type BD can build a control for. `<length> | <percentage>` and `<length-percentage>` both become
 * `"length-percentage"`.
 */
export type ThemeSettingType =
    | "color"
    | "length"
    | "percentage"
    | "length-percentage"
    | "number"
    | "integer"
    | "angle"
    | "time"
    | "string"
    | "url";

export interface ThemeSettingSyntax {
    /** The syntax as written, without its quotes: `light | dark | <color>`. */
    raw: string;

    /** Keyword options in source order, kept exactly as written because keywords are case-sensitive. */
    keywords: string[];

    /** The one data type, when the syntax has one. Unset for a keyword-only syntax such as `true | false`. */
    type?: ThemeSettingType;
}

export interface ThemeSettingRange {
    min?: number;
    max?: number;
    step?: number;

    /** The unit that `min` and `max` share, which locks the unit picker. Unset when the range has no unit. */
    unit?: string;
}

/** One `@property` rule that BD shows as a setting in the theme's panel. */
export interface ThemeSetting {
    /** The full custom property name, with its dashes: `--mytheme-accent`. */
    property: string;

    syntax: ThemeSettingSyntax;

    /** The trimmed source text of `initial-value`, which is also the reset value. */
    initialValue: string;

    /** The setting's label, from the `name` descriptor with its quotes removed. */
    name: string;

    /** One line of help under the label, from `note`. */
    note?: string;

    /** The section heading the setting sits under, from `group`. */
    group?: string;

    /** Preset swatches from `palette`, only on a `<color>` type. */
    palette?: string[];

    /** The range from `min`, `max` and `step`, only on numeric types. */
    range?: ThemeSettingRange;

    /** The units the unit picker may offer, in order. Empty for types without units. */
    units: string[];

    /** The line of the rule in the theme's file, for warnings. */
    line: number;
}

/** A reason a rule gets no setting, or a problem with a setting, for the theme dev to read in the console. */
export interface ThemeSettingWarning {
    property: string;
    line: number;
    message: string;
}

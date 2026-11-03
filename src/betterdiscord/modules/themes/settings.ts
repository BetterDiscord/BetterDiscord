import {parseCssString, scanCss, splitTopLevel, type ScanContext, type ScannedDeclaration, type ScannedPropertyRule} from "./scanner";
import type {ThemeSetting, ThemeSettingRange, ThemeSettingSyntax, ThemeSettingType, ThemeSettingWarning} from "./types";

export interface ThemeSettingsResult {
    settings: ThemeSetting[];
    warnings: ThemeSettingWarning[];
}

/** Data types that get a control, by the name inside `<…>`. */
const supportedTypes = new Set<string>(["color", "length", "percentage", "length-percentage", "number", "integer", "angle", "time", "string", "url"]);

/** Data types the browser accepts in `syntax` but BD has no control for. */
const unsupportedTypes = new Set<string>(["image", "custom-ident", "resolution", "transform-list", "transform-function"]);

/** Keywords the browser refuses as syntax options. */
const reservedKeywords = new Set<string>(["inherit", "initial", "unset", "revert", "revert-layer", "default"]);

const numericTypes = new Set<ThemeSettingType>(["length", "percentage", "length-percentage", "number", "integer", "angle", "time"]);

/**
 * Units the unit picker offers for each type. `em` is left out because a registered property resolves it
 * against the root, which makes it the same as `rem`.
 */
const typeUnits: Partial<Record<ThemeSettingType, string[]>> = {
    "length": ["px", "rem", "vw", "vh"],
    "percentage": ["%"],
    "length-percentage": ["px", "rem", "vw", "vh", "%"],
    "angle": ["deg", "turn"],
    "time": ["ms", "s"]
};

/**
 * Units that a property with `inherits: false` can't use. BD sets those properties by registering them again
 * with the user's value as `initial-value`, which the browser refuses when it depends on the element.
 */
const unitsNeedingInheritance = new Set(["rem"]);

/** At-rules whose `@property` rules the browser always registers. */
const groupingAtRules = new Set(["layer", "scope"]);

const identPattern = /^(?:--|-?(?:[a-zA-Z_]|[^\0-\x7F]|\\.))(?:[\w-]|[^\0-\x7F]|\\.)*$/;
const numberPattern = /^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)([a-z%]*)$/i;
const elementDependentPattern = /\bvar\(|\battr\(|\benv\(|\d(?:em|rem|ex|rex|ch|rch|cap|rcap|ic|ric|lh|rlh)\b/i;

const ignoredRuleSuffix = "so the browser ignores this rule";

/**
 * Reads a theme's source and returns the `@property` rules that become settings, in the order they appear,
 * along with a warning for each named rule that can't be one.
 *
 * A rule needs a `name` to be a setting. A rule without one is the theme's own helper and is skipped without
 * a warning.
 */
export function parseThemeSettings(source: string): ThemeSettingsResult {
    const {properties, declarations} = scanCss(source);
    const warnings: ThemeSettingWarning[] = [];
    const winners: ScannedPropertyRule[] = [];

    const copiesByName = new Map<string, ScannedPropertyRule[]>();
    for (const rule of properties) {
        const copies = copiesByName.get(rule.property) ?? [];
        copies.push(rule);
        copiesByName.set(rule.property, copies);
    }

    for (const [property, copies] of copiesByName) {
        if (!copies.some(copy => "name" in copy.descriptors)) continue;
        const winner = pickWinner(property, copies, warnings);
        if (winner) winners.push(winner);
    }

    // A setting sits where its winning copy sits in the file
    winners.sort((a, b) => properties.indexOf(a) - properties.indexOf(b));

    const settings: ThemeSetting[] = [];
    for (const rule of winners) {
        const setting = validateRule(rule, warnings);
        if (!setting) continue;

        settings.push(setting);
        const override = findOverrides(setting, declarations);
        if (override) warnings.push(override);
    }

    // Warnings follow the file, the way a theme dev reads it
    warnings.sort((a, b) => a.line - b.line);
    return {settings, warnings};
}

/**
 * Picks the copy of a property that the browser registers, or returns null when there's no reliable one.
 * The browser registers the last copy at the top level or inside `@layer` or `@scope`. It ignores a copy
 * inside a style rule. A copy inside `@media`, `@supports` or another conditional at-rule only applies while
 * its condition matches, so no copy is reliable then.
 */
function pickWinner(property: string, copies: ScannedPropertyRule[], warnings: ThemeSettingWarning[]) {
    const registered: ScannedPropertyRule[] = [];

    for (const copy of copies) {
        const styleRule = copy.context.find(c => c.kind === "style");
        if (styleRule) {
            warnings.push({property, line: copy.line, message: `is inside the style rule \`${styleRule.selector}\`, ${ignoredRuleSuffix}.`});
            continue;
        }

        const conditional = copy.context.find(c => c.kind === "at-rule" && !groupingAtRules.has(c.name));
        if (conditional?.kind === "at-rule") {
            warnings.push({
                property,
                line: copy.line,
                message: `is inside \`@${conditional.name}\`, which the browser only applies while its condition matches, so it gets no setting.`
            });
            return null;
        }

        registered.push(copy);
    }

    if (registered.length > 1) {
        const earlier = registered.slice(0, -1).map(copy => copy.line).join(", ");
        warnings.push({
            property,
            line: registered[registered.length - 1].line,
            message: `is declared more than once, so BD uses this last copy and ignores the one on line ${earlier}.`
        });
    }

    return registered[registered.length - 1] ?? null;
}

/** Checks one rule's descriptors and builds its setting, or adds a warning and returns null. */
function validateRule(rule: ScannedPropertyRule, warnings: ThemeSettingWarning[]): ThemeSetting | null {
    const {property, descriptors, line} = rule;
    const warn = (message: string) => {
        warnings.push({property, line, message});
        return null;
    };

    if (!("name" in descriptors)) return null;
    if (!property.startsWith("--")) return warn(`isn't a custom property name, which must start with \`--\`, ${ignoredRuleSuffix}.`);
    const name = readText(descriptors.name);
    if (!name) return warn("has an empty `name`, so it gets no setting.");

    if (!("syntax" in descriptors)) return warn(`has no \`syntax\` descriptor, ${ignoredRuleSuffix}.`);
    if (!("inherits" in descriptors)) return warn(`has no \`inherits\` descriptor, ${ignoredRuleSuffix}.`);

    const rawSyntax = parseCssString(descriptors.syntax);
    if (rawSyntax === null) return warn(`has a \`syntax\` that isn't a quoted string, ${ignoredRuleSuffix}.`);

    const inherits = descriptors.inherits.toLowerCase();
    if (inherits !== "true" && inherits !== "false") return warn(`has \`inherits: ${descriptors.inherits}\`, but it must be \`true\` or \`false\`, ${ignoredRuleSuffix}.`);

    const syntax = parseSyntax(rawSyntax.trim());
    if ("problem" in syntax) return warn(syntax.problem);

    if (!("initial-value" in descriptors) || !descriptors["initial-value"]) return warn(`has no \`initial-value\`, ${ignoredRuleSuffix}.`);
    const initialValue = descriptors["initial-value"];

    if (elementDependentPattern.test(withoutStrings(initialValue))) {
        return warn(`has the initial value \`${initialValue}\`, which depends on the element (\`em\`, \`rem\`, \`ch\` or \`var()\`), ${ignoredRuleSuffix}.`);
    }

    if (!syntax.type && !syntax.keywords.includes(initialValue)) {
        return warn(`has the initial value \`${initialValue}\`, which isn't one of the keywords in its syntax (they're case-sensitive), ${ignoredRuleSuffix}.`);
    }

    const setting: ThemeSetting = {
        property,
        syntax,
        initialValue,
        inherits: inherits === "true",
        name,
        units: [],
        line
    };

    if ("note" in descriptors) setting.note = readText(descriptors.note) || undefined;
    if ("group" in descriptors) setting.group = readText(descriptors.group) || undefined;

    if ("palette" in descriptors) {
        if (syntax.type === "color") setting.palette = splitTopLevel(descriptors.palette, ",").filter(Boolean);
        else warnings.push({property, line, message: "has a `palette`, which only works on a `<color>` syntax, so BD ignores it."});
    }

    let units = typeUnits[syntax.type!] ?? [];
    if (!setting.inherits) units = units.filter(unit => !unitsNeedingInheritance.has(unit));

    const range = readRange(rule, syntax, units, warnings);
    if (range) {
        setting.range = range;
        if (range.unit) units = [range.unit];
    }

    setting.units = units;
    return setting;
}

/** Removes quoted strings and `url()` contents, so a check for units or functions only sees real values. */
function withoutStrings(value: string) {
    return value.replace(/"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|\burl\([^)]*\)/gi, "\"\"");
}

/** Reads a `name`, `note` or `group` value, which may be a quoted string or plain text. */
function readText(raw: string) {
    return (parseCssString(raw) ?? raw).trim();
}

/** Splits a syntax into its keywords and its one data type, or explains why it gets no setting. */
function parseSyntax(raw: string): ThemeSettingSyntax | {problem: string;} {
    if (raw === "*") return {problem: "has the universal syntax `*`, which has no type to build a control from, so it gets no setting."};

    const keywords: string[] = [];
    const types = new Set<string>();

    for (const component of splitTopLevel(raw, "|")) {
        if (!component) return {problem: `has an empty option in its syntax \`${raw}\`, ${ignoredRuleSuffix}.`};

        if (component.endsWith("+") || component.endsWith("#")) {
            const inner = component.slice(0, -1);
            if (inner.startsWith("<") || identPattern.test(inner)) return {problem: `has the list syntax \`${component}\`, and lists of values aren't supported, so it gets no setting.`};
        }

        if (component.startsWith("<") && component.endsWith(">")) {
            const type = component.slice(1, -1).trim();
            if (unsupportedTypes.has(type)) return {problem: `uses \`<${type}>\`, which isn't a supported type, so it gets no setting.`};
            if (!supportedTypes.has(type)) return {problem: `uses \`<${type}>\`, which isn't a type the browser knows, ${ignoredRuleSuffix}.`};
            types.add(type);
            continue;
        }

        if (component.startsWith("#")) {
            return {problem: `has \`${component}\` in its syntax. A syntax option must be a \`<type>\` or a keyword, and a hex color is neither, ${ignoredRuleSuffix}. Preset colors go in \`palette\`.`};
        }

        if (!identPattern.test(component)) return {problem: `has \`${component}\` in its syntax, which isn't a \`<type>\` or a keyword, ${ignoredRuleSuffix}.`};
        if (reservedKeywords.has(component.toLowerCase())) return {problem: `has the reserved keyword \`${component}\` in its syntax, ${ignoredRuleSuffix}.`};

        keywords.push(component);
    }

    if (types.has("length") && types.has("percentage")) {
        types.delete("length");
        types.delete("percentage");
        types.add("length-percentage");
    }

    if (types.size > 1) return {problem: `mixes more than one data type in \`${raw}\`, which has no single control, so it gets no setting.`};

    const syntax: ThemeSettingSyntax = {raw, keywords};
    const [type] = types;
    if (type) syntax.type = type as ThemeSettingType;
    return syntax;
}

/**
 * Reads `min`, `max` and `step` for a numeric type. A range whose ends use different units, or a unit the
 * picker can't offer, has no meaning that a slider could show, so it's dropped with a warning.
 */
function readRange(rule: ScannedPropertyRule, syntax: ThemeSettingSyntax, units: string[], warnings: ThemeSettingWarning[]): ThemeSettingRange | null {
    const {property, descriptors, line} = rule;
    const keys = (["min", "max", "step"] as const).filter(key => key in descriptors);
    if (!keys.length) return null;

    const warn = (message: string) => {
        warnings.push({property, line, message});
        return null;
    };

    if (!syntax.type || !numericTypes.has(syntax.type)) {
        return warn(`has \`${keys.join("`, `")}\`, which only work on a numeric syntax, so BD ignores them.`);
    }

    const parsed: Partial<Record<"min" | "max" | "step", {value: number; unit: string;}>> = {};
    for (const key of keys) {
        const match = numberPattern.exec(descriptors[key]);
        if (!match) return warn(`has \`${key}: ${descriptors[key]}\`, which isn't a number, so BD ignores its range.`);
        parsed[key] = {value: Number(match[1]), unit: match[2].toLowerCase()};
    }

    const range: ThemeSettingRange = {};

    if (parsed.step) {
        if (parsed.step.value <= 0) warn(`has \`step: ${descriptors.step}\`, which must be more than 0, so BD ignores it.`);
        else range.step = parsed.step.value;
    }

    const ends = [parsed.min, parsed.max].filter(end => end !== undefined);
    const endUnits = new Set(ends.map(end => end.unit).filter(Boolean));

    if (endUnits.size > 1) {
        warn("has `min` and `max` in different units, which can't be compared, so it gets a number field instead of a slider.");
        return range.step === undefined ? null : range;
    }

    const [unit] = endUnits;
    if (unit) {
        const isNumberType = syntax.type === "number" || syntax.type === "integer";
        if (isNumberType || !units.includes(unit)) {
            const allowed = isNumberType ? "no unit" : units.map(u => `\`${u}\``).join(", ");
            warn(`has a range in \`${unit}\`, but this setting takes ${allowed}, so BD ignores its range.`);
            return range.step === undefined ? null : range;
        }
        range.unit = unit;
    }

    if (parsed.step?.unit && range.step !== undefined && parsed.step.unit !== (unit ?? parsed.step.unit)) {
        warn(`has \`step\` in \`${parsed.step.unit}\` but its range in \`${unit}\`, so BD ignores the step.`);
        delete range.step;
    }

    if (parsed.min && parsed.max && parsed.min.value > parsed.max.value) {
        warn("has a `min` larger than its `max`, so BD ignores its range.");
        return range.step === undefined ? null : {step: range.step};
    }

    if (parsed.min) range.min = parsed.min.value;
    if (parsed.max) range.max = parsed.max.value;

    return Object.keys(range).length ? range : null;
}

/** Selectors whose plain declarations lose to BD's `:root` rule, because BD's comes later. */
const weakSelectors = new Set([":root", "html"]);

/**
 * Finds the places where the theme sets a setting's variable in a way that beats BD's `:root` rule, so the
 * user's value wouldn't show there. Those are `!important`, a selector stronger than `:root`, a rule nested in
 * another rule or in `@scope`, and any element below the root.
 */
function findOverrides(setting: ThemeSetting, declarations: ScannedDeclaration[]): ThemeSettingWarning | null {
    const places: string[] = [];

    for (const declaration of declarations) {
        if (declaration.property !== setting.property) continue;
        if (declaration.context.some(c => c.kind === "at-rule" && c.name === "keyframes")) continue;

        const reason = overrideReason(declaration);
        if (reason) places.push(`line ${declaration.line} (${reason})`);
    }

    if (!places.length) return null;

    const shown = places.slice(0, 3).join(", ");
    const more = places.length > 3 ? ` and ${places.length - 3} more` : "";
    return {
        property: setting.property,
        line: setting.line,
        message: `is also set where it beats BD's \`:root\` rule, so the user's value won't show there: ${shown}${more}. Leave the default to \`initial-value\`, or set it on \`:root\` without \`!important\`.`
    };
}

function overrideReason(declaration: ScannedDeclaration) {
    if (declaration.important) return "`!important`";

    const styleRules = declaration.context.filter((c): c is Extract<ScanContext, {kind: "style";}> => c.kind === "style");
    const selector = styleRules.map(c => c.selector).join(" ");

    if (declaration.context.some(c => c.kind === "at-rule" && c.name === "scope")) return `\`${selector}\` inside \`@scope\``;
    if (styleRules.length !== 1) return `\`${selector}\``;

    const isWeak = splitTopLevel(styleRules[0].selector, ",").every(part => weakSelectors.has(part.replace(/\s+/g, " ").toLowerCase()));
    return isWeak ? null : `\`${styleRules[0].selector}\``;
}

const namedPropertyPattern = /@property\s[^{]*\{(?:[^}]*?[\s;])?name\s*:/i;

/**
 * A quick check for whether a theme that hasn't started yet has settings, for its settings button. It looks
 * for an `@property` rule with a `name` in the source text without parsing it, so a commented-out rule also
 * counts.
 */
export function hasThemeSettings(source: string) {
    return namedPropertyPattern.test(source);
}

import type {ThemeSetting, ThemeSettingWarning} from "./types";

/** What the browser registered for one `@property` rule. */
export interface RegisteredProperty {
    name: string;

    /** The syntax as the browser serializes it, with its quotes. */
    syntax: string;

    inherits: boolean;
    initialValue: string | null;
}

/**
 * Lists the `@property` rules the browser kept from a theme's sheet, in order, including those inside
 * `@layer` and `@scope`. Rules inside conditional at-rules are left out, because they never become settings.
 */
export function readRegisteredProperties(sheet: CSSStyleSheet | null | undefined): RegisteredProperty[] {
    const registered: RegisteredProperty[] = [];
    if (!sheet) return registered;

    const walk = (rules: CSSRuleList) => {
        for (const rule of Array.from(rules)) {
            if (typeof CSSPropertyRule !== "undefined" && rule instanceof CSSPropertyRule) {
                registered.push({name: rule.name, syntax: rule.syntax, inherits: rule.inherits, initialValue: rule.initialValue});
            }
            else if (isGroupingRule(rule)) {
                walk(rule.cssRules);
            }
        }
    };

    walk(sheet.cssRules);
    return registered;
}

function isGroupingRule(rule: CSSRule): rule is CSSGroupingRule {
    const {CSSLayerBlockRule, CSSScopeRule} = globalThis as unknown as Record<string, (abstract new () => CSSGroupingRule) | undefined>;
    return Boolean((CSSLayerBlockRule && rule instanceof CSSLayerBlockRule) || (CSSScopeRule && rule instanceof CSSScopeRule));
}

/**
 * Removes the settings whose rule the browser dropped, with a warning for each. A setting counts as kept when
 * the last registered rule with its name has the same syntax and initial value, and `inherits: true`. That
 * catches a last copy the browser dropped while it kept an earlier one.
 */
export function removeDroppedSettings(settings: ThemeSetting[], registered: RegisteredProperty[]) {
    const lastByName = new Map<string, RegisteredProperty>();
    for (const rule of registered) lastByName.set(rule.name, rule);

    const kept: ThemeSetting[] = [];
    const warnings: ThemeSettingWarning[] = [];

    for (const setting of settings) {
        const rule = lastByName.get(setting.property);
        const isKept = rule
            && collapse(rule.syntax.replace(/^["']|["']$/g, "")) === collapse(setting.syntax.raw)
            && rule.inherits
            && collapse(rule.initialValue ?? "") === collapse(setting.initialValue);

        if (isKept) {
            kept.push(setting);
            continue;
        }

        warnings.push({
            property: setting.property,
            line: setting.line,
            message: "was dropped by the browser, usually because its initial value doesn't match its syntax, so it gets no setting."
        });
    }

    return {settings: kept, warnings};
}

function collapse(text: string) {
    return text.replace(/\s+/g, " ").trim();
}

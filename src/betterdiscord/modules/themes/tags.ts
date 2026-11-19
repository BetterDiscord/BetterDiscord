import DOMManager from "@modules/dommanager";


/** The id of the style tag that holds a theme's values, inside `bd-theme-settings`. */
export function settingsTagId(slug: string) {
    return DOMManager.escapeID(slug + "-theme-settings");
}

/**
 * Puts a theme's values on a `:root` rule in its own style tag, or removes the tag when there are none. Each value
 * goes in through `setProperty()`, so a value can't end the rule early and add rules of its own.
 */
export function writeSettingsTag(slug: string, values: Readonly<Record<string, string>>) {
    const id = settingsTagId(slug);
    let style = document.getElementById(id) as HTMLStyleElement | null;

    if (!Object.keys(values).length) {
        style?.remove();
        return;
    }

    if (!style) {
        style = DOMManager.createElement("style", {id}) as HTMLStyleElement;
        style.textContent = ":root {}";
        DOMManager.bdThemeSettings.append(style);
    }

    const rule = style.sheet!.cssRules[0] as CSSStyleRule;
    rule.style.cssText = "";
    for (const [property, value] of Object.entries(values)) rule.style.setProperty(property, value);
}

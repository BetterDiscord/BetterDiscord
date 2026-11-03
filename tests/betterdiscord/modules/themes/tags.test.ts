import {describe, test, expect, afterEach} from "bun:test";
import DOMManager from "@modules/dommanager";
import {settingsTagId, writeSettingsTag} from "@modules/themes/tags";

function tag(slug: string) {
    return document.getElementById(settingsTagId(slug)) as HTMLStyleElement | null;
}

function rootRule(slug: string) {
    return tag(slug)!.sheet!.cssRules[0] as CSSStyleRule;
}

afterEach(() => {
    DOMManager.bdThemeSettings.replaceChildren();
});

describe("the settings container", () => {
    test("sits after the themes and before Custom CSS", () => {
        const order = Array.from(DOMManager.bdHead.children).map(child => child.id || child.tagName.toLowerCase());
        expect(order).toEqual(["bd-scripts", "bd-styles", "bd-themes", "bd-theme-settings", "customcss"]);
    });
});

describe("writeSettingsTag", () => {
    test("adds a tag with a :root rule holding the values", () => {
        writeSettingsTag("Midnight", {"--accent": "blue", "--radius": "0.5rem"});
        expect(tag("Midnight")!.parentNode).toBe(DOMManager.bdThemeSettings);
        expect(rootRule("Midnight").selectorText).toBe(":root");
        expect(rootRule("Midnight").style.getPropertyValue("--accent")).toBe("blue");
        expect(rootRule("Midnight").style.getPropertyValue("--radius")).toBe("0.5rem");
    });

    test("replaces the values on a later write", () => {
        writeSettingsTag("Midnight", {"--accent": "blue", "--radius": "0.5rem"});
        writeSettingsTag("Midnight", {"--accent": "green"});
        expect(DOMManager.bdThemeSettings.children).toHaveLength(1);
        expect(rootRule("Midnight").style.getPropertyValue("--accent")).toBe("green");
        expect(rootRule("Midnight").style.getPropertyValue("--radius")).toBe("");
    });

    test("keeps a string holding } inside the rule", () => {
        writeSettingsTag("Midnight", {"--label": `"a } body { color: red"`});
        expect(tag("Midnight")!.sheet!.cssRules).toHaveLength(1);
        expect(rootRule("Midnight").style.getPropertyValue("--label")).toBe(`"a } body { color: red"`);
    });

    test("removes the tag when there are no values", () => {
        writeSettingsTag("Midnight", {"--accent": "blue"});
        writeSettingsTag("Midnight", {});
        expect(tag("Midnight")).toBeNull();

        writeSettingsTag("Plain", {});
        expect(DOMManager.bdThemeSettings.children).toHaveLength(0);
    });

    test("gives each theme its own tag, in the order they first got values", () => {
        writeSettingsTag("First", {"--a": "1px"});
        writeSettingsTag("Second", {"--b": "2px"});
        writeSettingsTag("First", {"--a": "3px"});
        expect(Array.from(DOMManager.bdThemeSettings.children).map(c => c.id)).toEqual(["First-theme-settings", "Second-theme-settings"]);
    });
});

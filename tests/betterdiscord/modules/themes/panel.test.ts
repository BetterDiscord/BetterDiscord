import {describe, test, expect} from "bun:test";
import {groupSettings, themeHasSettings} from "@modules/themes/panel";
import {parseThemeSettings} from "@modules/themes/settings";

function rule(property: string, group?: string) {
    return `@property ${property} {
    syntax: "<color>";
    inherits: true;
    initial-value: red;
    name: "${property}";${group ? `\n    group: "${group}";` : ""}
}`;
}

const withSettings = rule("--accent");
const withoutSettings = "@property --helper { syntax: \"<color>\"; inherits: true; initial-value: red; }\nbody { color: red; }";

describe("themeHasSettings", () => {
    test("uses the source of a theme that hasn't started", () => {
        expect(themeHasSettings({fileContent: withSettings} as never)).toBe(true);
        expect(themeHasSettings({fileContent: withoutSettings} as never)).toBe(false);
    });

    test("uses the parsed settings of a running theme", () => {
        expect(themeHasSettings({css: withSettings, properties: parseThemeSettings(withSettings).settings} as never)).toBe(true);
        expect(themeHasSettings({css: withoutSettings, properties: []} as never)).toBe(false);
    });

    test("trusts the parsed settings over the source", () => {
        // A rule the browser dropped leaves the source looking like it has settings
        expect(themeHasSettings({css: withSettings, properties: []} as never)).toBe(false);
    });

    test("uses the source of a theme that stopped before it was parsed", () => {
        expect(themeHasSettings({css: withSettings} as never)).toBe(true);
    });

    test("is false for an empty theme", () => {
        expect(themeHasSettings({} as never)).toBe(false);
    });
});

describe("groupSettings", () => {
    test("puts ungrouped settings first and groups in order of first use", () => {
        const source = [rule("--a", "Layout"), rule("--b"), rule("--c", "Colors"), rule("--d", "Layout"), rule("--e")].join("\n");
        const {ungrouped, groups} = groupSettings(parseThemeSettings(source).settings);

        expect(ungrouped.map(s => s.property)).toEqual(["--b", "--e"]);
        expect(groups.map(g => [g.name, g.settings.map(s => s.property)])).toEqual([
            ["Layout", ["--a", "--d"]],
            ["Colors", ["--c"]]
        ]);
    });

    test("returns no groups when nothing is grouped", () => {
        const {ungrouped, groups} = groupSettings(parseThemeSettings(rule("--a")).settings);
        expect(ungrouped).toHaveLength(1);
        expect(groups).toEqual([]);
    });
});

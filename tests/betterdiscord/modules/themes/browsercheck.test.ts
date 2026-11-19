import {describe, test, expect} from "bun:test";
import {findRootDefaults, readRegisteredProperties, removeDroppedSettings, type RegisteredProperty} from "@modules/themes/browsercheck";
import {parseThemeSettings} from "@modules/themes/settings";

const source = `@property --a {
    syntax: "light  |  dark | <color>";
    inherits: true;
    initial-value: dark;
    name: "A";
}
@property --b {
    syntax: "<length>";
    inherits: true;
    initial-value: /* a comment */ 8px;
    name: "B";
}`;

const {settings} = parseThemeSettings(source);

/** The rules as Chromium reports them for `source`, with the syntax quoted and comments gone. */
const registered: RegisteredProperty[] = [
    {name: "--a", syntax: `"light  |  dark | <color>"`, inherits: true, initialValue: "dark"},
    {name: "--b", syntax: `"<length>"`, inherits: true, initialValue: "8px"}
];

describe("removeDroppedSettings", () => {
    test("keeps every setting the browser registered", () => {
        expect(removeDroppedSettings(settings, registered)).toEqual({settings, warnings: []});
    });

    test("removes a setting the browser dropped, with a warning", () => {
        const result = removeDroppedSettings(settings, [registered[0]]);
        expect(result.settings.map(s => s.property)).toEqual(["--a"]);
        expect(result.warnings).toEqual([{property: "--b", line: 7, message: expect.stringContaining("dropped by the browser")}]);
    });

    test("removes a setting whose last copy was dropped while an earlier one was kept", () => {
        const earlier = [{...registered[0], initialValue: "light"}, registered[1]];
        expect(removeDroppedSettings(settings, earlier).settings.map(s => s.property)).toEqual(["--b"]);

        const otherSyntax = [registered[0], {...registered[1], syntax: `"<length> | auto"`}];
        expect(removeDroppedSettings(settings, otherSyntax).settings.map(s => s.property)).toEqual(["--a"]);

        const otherInherits = [registered[0], {...registered[1], inherits: false}];
        expect(removeDroppedSettings(settings, otherInherits).settings.map(s => s.property)).toEqual(["--a"]);
    });

    test("compares against the last registered rule of each name", () => {
        const twice = [{...registered[0], initialValue: "light"}, ...registered];
        expect(removeDroppedSettings(settings, twice).warnings).toEqual([]);
    });

    test("ignores differences in whitespace", () => {
        const spaced = [{...registered[0], syntax: `'light | dark | <color>'`}, registered[1]];
        expect(removeDroppedSettings(settings, spaced).warnings).toEqual([]);
    });

    test("removes everything when the browser registered nothing", () => {
        const result = removeDroppedSettings(settings, []);
        expect(result.settings).toEqual([]);
        expect(result.warnings).toHaveLength(2);
    });
});

describe("findRootDefaults", () => {
    const rootSource = `@property --accent { syntax: "<color>"; inherits: true; initial-value: #ffffff; name: "Accent"; }
@property --radius { syntax: "<length>"; inherits: true; initial-value: 4px; name: "Radius"; }
:root {
    --accent: #fff;
    --radius: 8px;
    --accent: nonsense;
}`;
    const parsed = parseThemeSettings(rootSource);

    /** Treats `#fff` as the default and `nonsense` as invalid, like the browser would for a `<color>`. */
    const probe = (entries: Array<[unknown, string]>) => entries.map(([, value]) => value === "#fff" ? "default" as const : value === "nonsense" ? "invalid" as const : "changed" as const);

    test("warns only about a value that computes to something else than the default", () => {
        const warnings = findRootDefaults(parsed.settings, parsed.rootValues, probe);
        expect(warnings.map(w => [w.property, w.line])).toEqual([["--radius", 5]]);
        expect(warnings[0].message).toContain("`8px`");
        expect(warnings[0].message).toContain("`4px`");
    });

    test("skips values for settings the browser dropped, and doesn't probe without values", () => {
        let probed = false;
        const spy = (entries: Array<[unknown, string]>) => {
            probed = true;
            return probe(entries);
        };
        expect(findRootDefaults(parsed.settings.slice(0, 1), [], spy)).toEqual([]);
        expect(probed).toBe(false);
        expect(findRootDefaults([], parsed.rootValues, spy)).toEqual([]);
        expect(probed).toBe(false);
    });
});

describe("readRegisteredProperties", () => {
    test("returns nothing without a sheet", () => {
        expect(readRegisteredProperties(null)).toEqual([]);
        expect(readRegisteredProperties(undefined)).toEqual([]);
    });
});

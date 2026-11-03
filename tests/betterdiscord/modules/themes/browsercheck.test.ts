import {describe, test, expect} from "bun:test";
import {readRegisteredProperties, removeDroppedSettings, type RegisteredProperty} from "@modules/themes/browsercheck";
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

describe("readRegisteredProperties", () => {
    test("returns nothing without a sheet", () => {
        expect(readRegisteredProperties(null)).toEqual([]);
        expect(readRegisteredProperties(undefined)).toEqual([]);
    });
});

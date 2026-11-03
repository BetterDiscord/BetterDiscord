import {describe, test, expect} from "bun:test";
import {groupSettings, keywordLabel, pickControl, pickerHex, quoteCssString, readCssString, readCssUrl, readNumber, themeHasSettings, writeCssUrl, writeNumber} from "@modules/themes/panel";
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

/** Parses one setting from its syntax and extra descriptors. */
function setting(syntax: string, initial: string, extra = "") {
    const [parsed] = parseThemeSettings(`@property --x { syntax: "${syntax}"; inherits: true; initial-value: ${initial}; name: "X"; ${extra} }`).settings;
    if (!parsed) throw new Error(`no setting for ${syntax}`);
    return parsed;
}

describe("pickControl", () => {
    test("gives true | false a switch in either order", () => {
        expect(pickControl(setting("true | false", "true"))).toEqual({kind: "switch"});
        expect(pickControl(setting("false | true", "true"))).toEqual({kind: "switch"});
    });

    test("gives three keywords or fewer a radio and more a dropdown, with labels", () => {
        expect(pickControl(setting("high-contrast | soft", "soft"))).toEqual({
            kind: "radio",
            options: [{value: "high-contrast", label: "High contrast"}, {value: "soft", label: "Soft"}]
        });
        const dropdown = pickControl(setting("compact | cozy | spacious | roomy", "cozy"));
        expect(dropdown.kind).toBe("dropdown");
    });

    test("gives a number with both ends of its range a slider, and a number field otherwise", () => {
        expect(pickControl(setting("<number>", "0.5", "min: 0; max: 1; step: 0.05;"))).toEqual({kind: "slider", min: 0, max: 1, step: 0.05, units: []});
        expect(pickControl(setting("<integer>", "3"))).toEqual({kind: "number", min: undefined, max: undefined, step: 1, units: []});
        expect(pickControl(setting("<number>", "3", "min: 0;"))).toEqual({kind: "number", min: 0, max: undefined, step: 1, units: []});
    });

    test("picks a slider step that suits the range when none is given", () => {
        expect(pickControl(setting("<number>", "0.5", "min: 0; max: 1;"))).toMatchObject({step: 0.01});
        expect(pickControl(setting("<length>", "8px", "min: 0px; max: 24px;"))).toMatchObject({step: 1});
        expect(pickControl(setting("<integer>", "1", "min: 0; max: 4;"))).toMatchObject({step: 1});
    });

    test("offers the units a setting allows, locked to one by a range with a unit", () => {
        expect(pickControl(setting("<length>", "8px", "min: 0px; max: 24px;"))).toEqual({kind: "slider", min: 0, max: 24, step: 1, units: ["px"]});
        expect(pickControl(setting("<length>", "8px", "min: 0; max: 24;"))).toEqual({kind: "slider", min: 0, max: 24, step: 1, units: ["px", "rem", "vw", "vh"]});
        expect(pickControl(setting("<length>", "8px"))).toEqual({kind: "number", min: undefined, max: undefined, step: 1, units: ["px", "rem", "vw", "vh"]});
        expect(pickControl(setting("<percentage>", "50%"))).toEqual({kind: "number", min: undefined, max: undefined, step: 1, units: ["%"]});
    });

    test("gives a mixed range a number field with every unit", () => {
        expect(pickControl(setting("<length>", "0px", "min: 0px; max: 2rem;"))).toMatchObject({kind: "number", units: ["px", "rem", "vw", "vh"]});
    });

    test("gives colors, strings and links their own controls", () => {
        expect(pickControl(setting("<color>", "red", "palette: #5865f2, #eb459e;"))).toEqual({kind: "color", palette: ["#5865f2", "#eb459e"]});
        expect(pickControl(setting("<string>", "\"hi\""))).toEqual({kind: "string"});
        expect(pickControl(setting("<url>", "url(\"a.png\")"))).toEqual({kind: "url"});
    });

    test("gives keywords plus a type a Custom option with the type's control", () => {
        expect(pickControl(setting("none | <color>", "none"))).toEqual({
            kind: "custom",
            display: "radio",
            options: [{value: "none", label: "None"}],
            control: {kind: "color", palette: undefined},
            starter: "#000000"
        });
    });

    test("counts Custom as an option when choosing a dropdown", () => {
        expect(pickControl(setting("light | dark | <color>", "dark"))).toMatchObject({kind: "custom", display: "radio"});
        expect(pickControl(setting("a | b | c | <color>", "a"))).toMatchObject({kind: "custom", display: "dropdown"});
    });

    test("starts Custom from a value that suits the type", () => {
        expect(pickControl(setting("none | <color>", "none", "palette: #5865f2, #eb459e;"))).toMatchObject({starter: "#5865f2"});
        expect(pickControl(setting("auto | <length>", "auto"))).toMatchObject({starter: "0px"});
        expect(pickControl(setting("auto | <length>", "auto", "min: 4; max: 40;"))).toMatchObject({starter: "4px"});
        expect(pickControl(setting("auto | <number>", "auto", "min: 0.5;"))).toMatchObject({starter: "0.5"});
        expect(pickControl(setting("none | <string>", "none"))).toMatchObject({starter: "\"\""});
        expect(pickControl(setting("none | <url>", "none"))).toMatchObject({starter: null});
    });
});

describe("keywordLabel", () => {
    test("turns dashes into spaces in sentence case and keeps the rest as written", () => {
        expect(keywordLabel("high-contrast")).toBe("High contrast");
        expect(keywordLabel("soft")).toBe("Soft");
        expect(keywordLabel("dark-UI")).toBe("Dark UI");
        expect(keywordLabel("a--b_c")).toBe("A b c");
    });
});

describe("readNumber and writeNumber", () => {
    const lengths = ["px", "rem", "vw", "vh"];

    test("read a number and its unit when the unit is offered", () => {
        expect(readNumber("12px", lengths)).toEqual({number: 12, unit: "px"});
        expect(readNumber(" 1.25rem", lengths)).toEqual({number: 1.25, unit: "rem"});
        expect(readNumber("-.5", [])).toEqual({number: -0.5, unit: ""});
        expect(readNumber("50%", ["%"])).toEqual({number: 50, unit: "%"});
        expect(readNumber("12PX", lengths)).toEqual({number: 12, unit: "px"});
    });

    test("count a plain 0 as the first unit", () => {
        expect(readNumber("0", lengths)).toEqual({number: 0, unit: "px"});
        expect(readNumber("3", lengths)).toBeNull();
    });

    test("refuse a unit that isn't offered, or anything that isn't one number", () => {
        expect(readNumber("12em", lengths)).toBeNull();
        expect(readNumber("12rem", ["px"])).toBeNull();
        expect(readNumber("calc(1rem + 2px)", lengths)).toBeNull();
        expect(readNumber("12px", [])).toBeNull();
    });

    test("write without float noise", () => {
        expect(writeNumber(0.15000000000000002, "")).toBe("0.15");
        expect(writeNumber(12, "px")).toBe("12px");
        expect(writeNumber(1e-7, "px")).toBe("0px");
    });
});

describe("CSS strings and links", () => {
    test("quote text and read it back", () => {
        for (const text of ["Hello there", "say \"hi\"", "back\\slash", "", "two\nlines"]) {
            expect(readCssString(quoteCssString(text))).toBe(text);
        }
        expect(quoteCssString("say \"hi\"")).toBe("\"say \\\"hi\\\"\"");
    });

    test("read a theme's single-quoted default", () => {
        expect(readCssString("'Panel test'")).toBe("Panel test");
    });

    test("wrap a link and read it back, quoted or not", () => {
        expect(writeCssUrl(" https://i.imgur.com/x.png ")).toBe("url(\"https://i.imgur.com/x.png\")");
        expect(readCssUrl(writeCssUrl("https://a.b/c d.png"))).toBe("https://a.b/c d.png");
        expect(readCssUrl("url(https://a.b/c.png)")).toBe("https://a.b/c.png");
        expect(readCssUrl("url( 'a.png' )")).toBe("a.png");
        expect(readCssUrl("none")).toBe("none");
    });
});

describe("pickerHex", () => {
    /** Answers like a canvas for the few colors these tests use. */
    const fakeCanvas = (value: string) => ({
        "gray": "#808080",
        "transparent": "rgba(0, 0, 0, 0)",
        "rgb(88 101 242 / 50%)": "rgba(88, 101, 242, 0.5)",
        "hsl(0 100% 50%)": "#ff0000",
        "rgb(1 2 3 / 100%)": "#010203"
    } as Record<string, string>)[value] ?? null;

    test("gives the picker a hex, with alpha only when the color is see-through", () => {
        expect(pickerHex("#5865F2", fakeCanvas)).toBe("#5865f2");
        expect(pickerHex("#f0a", fakeCanvas)).toBe("#ff00aa");
        expect(pickerHex("#5865f280", fakeCanvas)).toBe("#5865f280");
        expect(pickerHex("#f0a8", fakeCanvas)).toBe("#ff00aa88");
        expect(pickerHex("#5865f2ff", fakeCanvas)).toBe("#5865f2");
    });

    test("reads named colors, rgb() and hsl() through the browser", () => {
        expect(pickerHex("Gray", fakeCanvas)).toBe("#808080");
        expect(pickerHex("transparent", fakeCanvas)).toBe("#00000000");
        expect(pickerHex("rgb(88 101 242 / 50%)", fakeCanvas)).toBe("#5865f280");
        expect(pickerHex("hsl(0 100% 50%)", fakeCanvas)).toBe("#ff0000");
        expect(pickerHex("rgb(1 2 3 / 100%)", fakeCanvas)).toBe("#010203");
    });

    test("refuses colors the picker can't show", () => {
        const readColor = (value: string) => {
            throw new Error(`read ${value}`);
        };
        expect(pickerHex("oklch(70% 0.1 200)", readColor)).toBeNull();
        expect(pickerHex("currentcolor", readColor)).toBeNull();
        expect(pickerHex("light-dark(red, blue)", readColor)).toBeNull();
        expect(pickerHex("color-mix(in srgb, red, blue)", readColor)).toBeNull();
        expect(pickerHex("rgb(calc(10 + 1) 0 0)", readColor)).toBeNull();
        expect(pickerHex("#12345", readColor)).toBeNull();
    });

    test("refuses a value the browser refuses", () => {
        expect(pickerHex("notacolor", fakeCanvas)).toBeNull();
        expect(pickerHex("rgb(1 2)", fakeCanvas)).toBeNull();
    });
});

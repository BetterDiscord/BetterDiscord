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
        expect(pickControl(setting("<number>", "0.5", "min: 0; max: 1; step: 0.05;"))).toEqual({kind: "slider", min: 0, max: 1, step: 0.05, unit: ""});
        expect(pickControl(setting("<integer>", "3"))).toEqual({kind: "number", min: undefined, max: undefined, step: 1, unit: ""});
        expect(pickControl(setting("<number>", "3", "min: 0;"))).toEqual({kind: "number", min: 0, max: undefined, step: 1, unit: ""});
    });

    test("picks a slider step that suits the range when none is given", () => {
        expect(pickControl(setting("<number>", "0.5", "min: 0; max: 1;"))).toMatchObject({step: 0.01});
        expect(pickControl(setting("<length>", "8px", "min: 0px; max: 24px;"))).toMatchObject({step: 1});
        expect(pickControl(setting("<integer>", "1", "min: 0; max: 4;"))).toMatchObject({step: 1});
    });

    test("uses the one unit a setting allows", () => {
        expect(pickControl(setting("<length>", "8px", "min: 0px; max: 24px;"))).toEqual({kind: "slider", min: 0, max: 24, step: 1, unit: "px"});
        expect(pickControl(setting("<percentage>", "50%"))).toEqual({kind: "number", min: undefined, max: undefined, step: 1, unit: "%"});
    });

    test("gives colors, strings and links their own controls", () => {
        expect(pickControl(setting("<color>", "red", "palette: #5865f2, #eb459e;"))).toEqual({kind: "color", palette: ["#5865f2", "#eb459e"]});
        expect(pickControl(setting("<string>", "\"hi\""))).toEqual({kind: "string"});
        expect(pickControl(setting("<url>", "url(\"a.png\")"))).toEqual({kind: "url"});
    });

    test("falls back to a text field for several units and for keywords plus a type", () => {
        expect(pickControl(setting("<length>", "8px"))).toEqual({kind: "text"});
        expect(pickControl(setting("none | <color>", "none"))).toEqual({kind: "text"});
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
    test("read a number in the expected unit", () => {
        expect(readNumber("12px", "px")).toBe(12);
        expect(readNumber(" 1.25rem", "rem")).toBe(1.25);
        expect(readNumber("-.5", "")).toBe(-0.5);
        expect(readNumber("50%", "%")).toBe(50);
        expect(readNumber("12PX", "px")).toBe(12);
    });

    test("count a plain 0 in any unit", () => {
        expect(readNumber("0", "px")).toBe(0);
        expect(readNumber("3", "px")).toBeNull();
    });

    test("refuse another unit or anything that isn't one number", () => {
        expect(readNumber("12rem", "px")).toBeNull();
        expect(readNumber("calc(1rem + 2px)", "px")).toBeNull();
        expect(readNumber("12px", "")).toBeNull();
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
    test("gives the picker a 6-digit hex", () => {
        expect(pickerHex("#5865F2")).toBe("#5865f2");
        expect(pickerHex("#f0a")).toBe("#ff00aa");
    });

    test("refuses colors the picker can't show", () => {
        expect(pickerHex("red")).toBeNull();
        expect(pickerHex("#5865f280")).toBeNull();
        expect(pickerHex("oklch(70% 0.1 200)")).toBeNull();
    });
});

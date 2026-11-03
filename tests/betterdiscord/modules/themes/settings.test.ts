import {describe, test, expect} from "bun:test";
import {hasThemeSettings, parseThemeSettings} from "@modules/themes/settings";

/** Builds one `@property` rule. Pass a descriptor as null to leave it out. */
function rule(property: string, descriptors: Record<string, string | null>) {
    const defaults: Record<string, string | null> = {inherits: "true", name: `"Setting"`};
    const body = Object.entries({...defaults, ...descriptors})
        .filter(([, value]) => value !== null)
        .map(([key, value]) => `    ${key}: ${value};`)
        .join("\n");
    return `@property ${property} {\n${body}\n}\n`;
}

/** Parses one rule and returns its setting, or undefined when it got none. */
function settingFor(descriptors: Record<string, string | null>) {
    return parseThemeSettings(rule("--x", descriptors)).settings[0];
}

function warningsFor(source: string) {
    return parseThemeSettings(source).warnings.map(w => w.message);
}

describe("parseThemeSettings", () => {
    describe("supported syntaxes", () => {
        test("<color>", () => {
            expect(settingFor({"syntax": `"<color>"`, "initial-value": "#5865f2", "name": `"Accent color"`, "note": `"The main accent"`})).toEqual({
                property: "--x",
                syntax: {raw: "<color>", keywords: [], type: "color"},
                initialValue: "#5865f2",
                inherits: true,
                name: "Accent color",
                note: "The main accent",
                units: [],
                line: 1
            });
        });

        test("<color> with a palette, including commas inside rgb()", () => {
            const setting = settingFor({"syntax": `"<color>"`, "initial-value": "#5865f2", "palette": "#5865f2, rgb(235, 69, 158), #57f287"});
            expect(setting.palette).toEqual(["#5865f2", "rgb(235, 69, 158)", "#57f287"]);
        });

        test("<color> with an oklch() initial value", () => {
            expect(settingFor({"syntax": `"<color>"`, "initial-value": "oklch(70% 0.15 250)"}).initialValue).toBe("oklch(70% 0.15 250)");
        });

        test("none | <color>", () => {
            expect(settingFor({"syntax": `"none | <color>"`, "initial-value": "none"}).syntax).toEqual({raw: "none | <color>", keywords: ["none"], type: "color"});
        });

        test("light | dark | <color>", () => {
            expect(settingFor({"syntax": `"light | dark | <color>"`, "initial-value": "dark"}).syntax).toEqual({raw: "light | dark | <color>", keywords: ["light", "dark"], type: "color"});
        });

        test("keywords only", () => {
            expect(settingFor({"syntax": `"high-contrast | soft"`, "initial-value": "soft"}).syntax).toEqual({raw: "high-contrast | soft", keywords: ["high-contrast", "soft"]});
            expect(settingFor({"syntax": `"compact | cozy | spacious | roomy"`, "initial-value": "cozy"}).syntax.keywords).toHaveLength(4);
        });

        test("true | false in either order", () => {
            expect(settingFor({"syntax": `"true | false"`, "initial-value": "true"}).syntax.keywords).toEqual(["true", "false"]);
            expect(settingFor({"syntax": `"false | true"`, "initial-value": "true"}).syntax.keywords).toEqual(["false", "true"]);
        });

        test("<length> with a range in px locks the unit", () => {
            const setting = settingFor({"syntax": `"<length>"`, "initial-value": "8px", "min": "0px", "max": "24px", "step": "1"});
            expect(setting.range).toEqual({min: 0, max: 24, step: 1, unit: "px"});
            expect(setting.units).toEqual(["px"]);
        });

        test("<length> with a unitless range works in any unit", () => {
            const setting = settingFor({"syntax": `"<length>"`, "initial-value": "12px", "min": "0", "max": "24"});
            expect(setting.range).toEqual({min: 0, max: 24});
            expect(setting.units).toEqual(["px", "rem", "vw", "vh"]);
        });

        test("<length> with a mixed range gets no range and a warning", () => {
            const {settings, warnings} = parseThemeSettings(rule("--x", {"syntax": `"<length>"`, "initial-value": "1px", "min": "0px", "max": "2rem"}));
            expect(settings[0].range).toBeUndefined();
            expect(settings[0].units).toEqual(["px", "rem", "vw", "vh"]);
            expect(warnings).toHaveLength(1);
            expect(warnings[0].message).toContain("different units");
        });

        test("<length> with no range", () => {
            const setting = settingFor({"syntax": `"<length>"`, "initial-value": "1px"});
            expect(setting.range).toBeUndefined();
            expect(setting.units).toEqual(["px", "rem", "vw", "vh"]);
        });

        test("<length> with inherits: false leaves out rem", () => {
            const setting = settingFor({"syntax": `"<length>"`, "initial-value": "12px", "inherits": "false"});
            expect(setting.inherits).toBe(false);
            expect(setting.units).toEqual(["px", "vw", "vh"]);
        });

        test("<length> | <percentage> and <length-percentage> are the same", () => {
            const both = settingFor({"syntax": `"<length> | <percentage>"`, "initial-value": "50%"});
            const single = settingFor({"syntax": `"<length-percentage>"`, "initial-value": "50%"});
            expect(both.syntax.type).toBe("length-percentage");
            expect(single.syntax.type).toBe("length-percentage");
            expect(both.units).toEqual(["px", "rem", "vw", "vh", "%"]);
        });

        test("auto | <length>", () => {
            const setting = settingFor({"syntax": `"auto | <length>"`, "initial-value": "auto"});
            expect(setting.syntax).toEqual({raw: "auto | <length>", keywords: ["auto"], type: "length"});
            expect(setting.units).toEqual(["px", "rem", "vw", "vh"]);
        });

        test("<percentage> with a range", () => {
            const setting = settingFor({"syntax": `"<percentage>"`, "initial-value": "85%", "min": "0%", "max": "100%"});
            expect(setting.range).toEqual({min: 0, max: 100, unit: "%"});
            expect(setting.units).toEqual(["%"]);
        });

        test("<number> with a range and step", () => {
            const setting = settingFor({"syntax": `"<number>"`, "initial-value": "0.85", "min": "0", "max": "1", "step": "0.05"});
            expect(setting.range).toEqual({min: 0, max: 1, step: 0.05});
            expect(setting.units).toEqual([]);
        });

        test("<integer> with no range", () => {
            const setting = settingFor({"syntax": `"<integer>"`, "initial-value": "3"});
            expect(setting.syntax.type).toBe("integer");
            expect(setting.range).toBeUndefined();
        });

        test("<angle>", () => {
            expect(settingFor({"syntax": `"<angle>"`, "initial-value": "45deg"}).units).toEqual(["deg", "turn"]);
        });

        test("<time> with a range in ms", () => {
            const setting = settingFor({"syntax": `"<time>"`, "initial-value": "200ms", "min": "0ms", "max": "500ms"});
            expect(setting.range).toEqual({min: 0, max: 500, unit: "ms"});
            expect(setting.units).toEqual(["ms"]);
        });

        test("<string>, including a value with ; and }", () => {
            expect(settingFor({"syntax": `"<string>"`, "initial-value": `"Hello there"`}).syntax.type).toBe("string");
            expect(settingFor({"syntax": `"<string>"`, "initial-value": `"a;b}c"`}).initialValue).toBe(`"a;b}c"`);
        });

        test("<string> whose text looks like an em value", () => {
            expect(settingFor({"syntax": `"<string>"`, "initial-value": `"2em wide, var(x)"`})).toBeDefined();
        });

        test("<url>, including a data URI", () => {
            expect(settingFor({"syntax": `"<url>"`, "initial-value": `url("https://i.imgur.com/x.png")`}).syntax.type).toBe("url");
            expect(settingFor({"syntax": `"<url>"`, "initial-value": "url(data:image/svg+xml;utf8,<svg/>)"}).initialValue).toBe("url(data:image/svg+xml;utf8,<svg/>)");
        });

        test("a dropdown mix of keywords and one type", () => {
            expect(settingFor({"syntax": `"a | b | c | <color>"`, "initial-value": "a"}).syntax).toEqual({raw: "a | b | c | <color>", keywords: ["a", "b", "c"], type: "color"});
        });

        test("a valid rule logs no warnings", () => {
            expect(warningsFor(rule("--x", {"syntax": `"<color>"`, "initial-value": "red"}))).toEqual([]);
        });
    });

    describe("descriptors", () => {
        test("unquotes name, note and group, with escapes", () => {
            const setting = settingFor({"syntax": `"<color>"`, "initial-value": "red", "name": `"Say \\"hi\\""`, "note": `'It\\'s; fine'`, "group": `"Colors"`});
            expect([setting.name, setting.note, setting.group]).toEqual([`Say "hi"`, "It's; fine", "Colors"]);
        });

        test("accepts an unquoted name", () => {
            expect(settingFor({"syntax": `"<color>"`, "initial-value": "red", "name": "Accent"}).name).toBe("Accent");
        });

        test("an empty name gets no setting", () => {
            const source = rule("--x", {"syntax": `"<color>"`, "initial-value": "red", "name": `""`});
            expect(parseThemeSettings(source).settings).toEqual([]);
            expect(warningsFor(source)[0]).toContain("empty `name`");
        });

        test("accepts inherits in any case", () => {
            expect(settingFor({"syntax": `"<color>"`, "initial-value": "red", "inherits": "FALSE"}).inherits).toBe(false);
        });

        test("ignores a palette on a syntax without <color>", () => {
            const source = rule("--x", {"syntax": `"<length>"`, "initial-value": "1px", "palette": "#fff"});
            expect(parseThemeSettings(source).settings[0].palette).toBeUndefined();
            expect(warningsFor(source)[0]).toContain("palette");
        });
    });

    describe("ranges", () => {
        test("ignores a range on a syntax that isn't numeric", () => {
            const source = rule("--x", {"syntax": `"<color>"`, "initial-value": "red", "min": "0"});
            expect(parseThemeSettings(source).settings[0].range).toBeUndefined();
            expect(warningsFor(source)[0]).toContain("numeric");
        });

        test("ignores a range with a unit the picker can't offer", () => {
            const em = rule("--x", {"syntax": `"<length>"`, "initial-value": "1px", "min": "0em", "max": "2em"});
            expect(parseThemeSettings(em).settings[0].range).toBeUndefined();
            expect(warningsFor(em)[0]).toContain("`em`");
        });

        test("ignores a rem range when inherits is false", () => {
            const source = rule("--x", {"syntax": `"<length>"`, "initial-value": "1px", "inherits": "false", "min": "0rem", "max": "2rem"});
            expect(parseThemeSettings(source).settings[0].range).toBeUndefined();
        });

        test("ignores a unit on a <number> range", () => {
            const source = rule("--x", {"syntax": `"<number>"`, "initial-value": "1", "min": "0px", "max": "2px"});
            expect(parseThemeSettings(source).settings[0].range).toBeUndefined();
            expect(warningsFor(source)[0]).toContain("no unit");
        });

        test("ignores a range that isn't a number", () => {
            const source = rule("--x", {"syntax": `"<number>"`, "initial-value": "1", "min": "zero"});
            expect(parseThemeSettings(source).settings[0].range).toBeUndefined();
        });

        test("ignores a min larger than max but keeps the step", () => {
            const source = rule("--x", {"syntax": `"<number>"`, "initial-value": "1", "min": "5", "max": "1", "step": "1"});
            expect(parseThemeSettings(source).settings[0].range).toEqual({step: 1});
            expect(warningsFor(source)[0]).toContain("larger");
        });

        test("ignores a step that isn't positive", () => {
            const source = rule("--x", {"syntax": `"<number>"`, "initial-value": "1", "min": "0", "max": "2", "step": "0"});
            expect(parseThemeSettings(source).settings[0].range).toEqual({min: 0, max: 2});
        });

        test("ignores a step in a different unit from the range", () => {
            const source = rule("--x", {"syntax": `"<time>"`, "initial-value": "1s", "min": "0s", "max": "2s", "step": "100ms"});
            expect(parseThemeSettings(source).settings[0].range).toEqual({min: 0, max: 2, unit: "s"});
        });

        test("accepts only one end of a range", () => {
            expect(settingFor({"syntax": `"<number>"`, "initial-value": "1", "min": "-1.5"}).range).toEqual({min: -1.5});
        });
    });

    describe("no setting", () => {
        test("a rule without name is skipped without a warning", () => {
            const source = rule("--x", {"syntax": `"<color>"`, "initial-value": "red", "name": null});
            expect(parseThemeSettings(source)).toEqual({settings: [], warnings: []});
        });

        test.each([
            ["two data types", `"<color> | <length>"`, "red", "more than one data type"],
            ["a list with +", `"<color>+"`, "red", "lists"],
            ["a list with #", `"<length>#"`, "1px", "lists"],
            ["the universal syntax", `"*"`, "red", "universal"],
            ["<image>", `"<image>"`, "none", "isn't a supported type"],
            ["<custom-ident>", `"<custom-ident>"`, "a", "isn't a supported type"],
            ["<resolution>", `"<resolution>"`, "1dppx", "isn't a supported type"],
            ["<transform-list>", `"<transform-list>"`, "none", "isn't a supported type"]
        ])("%s", (_, syntax, initialValue, reason) => {
            const source = rule("--x", {"syntax": syntax, "initial-value": initialValue});
            const {settings, warnings} = parseThemeSettings(source);
            expect(settings).toEqual([]);
            expect(warnings).toHaveLength(1);
            expect(warnings[0]).toMatchObject({property: "--x", line: 1});
            expect(warnings[0].message).toContain(reason);
        });

        test("a rule inside @media or @supports", () => {
            for (const wrapper of ["@media (min-width: 1px)", "@supports (color: red)"]) {
                const source = `${wrapper} {\n${rule("--x", {"syntax": `"<color>"`, "initial-value": "red"})}}`;
                const {settings, warnings} = parseThemeSettings(source);
                expect(settings).toEqual([]);
                expect(warnings).toEqual([{property: "--x", line: 2, message: expect.stringContaining(wrapper.split(" ")[0])}]);
            }
        });

        test("a top-level copy plus a copy inside @media gets no setting", () => {
            const good = rule("--x", {"syntax": `"<color>"`, "initial-value": "red"});
            const {settings, warnings} = parseThemeSettings(`${good}@media print { ${good} }`);
            expect(settings).toEqual([]);
            expect(warnings).toHaveLength(1);
        });

        test("an unnamed copy inside @media only warns when another copy is named", () => {
            const unnamed = rule("--x", {"syntax": `"<color>"`, "initial-value": "red", "name": null});
            expect(warningsFor(`@media print { ${unnamed} }`)).toEqual([]);
        });
    });

    describe("dropped by the browser", () => {
        test.each([
            ["no inherits", {"syntax": `"<color>"`, "initial-value": "red", "inherits": null}, "no `inherits`"],
            ["no initial-value", {syntax: `"<color>"`}, "no `initial-value`"],
            ["no syntax", {"initial-value": "red"}, "no `syntax`"],
            ["an unquoted syntax", {"syntax": "<color>", "initial-value": "red"}, "quoted string"],
            ["inherits that isn't a boolean", {"syntax": `"<color>"`, "initial-value": "red", "inherits": "yes"}, "`true` or `false`"],
            ["an initial value outside the keywords", {"syntax": `"light | dark"`, "initial-value": "blue"}, "isn't one of the keywords"],
            ["a hex list", {"syntax": `"#ff0000 | #00ff00"`, "initial-value": "#ff0000"}, "palette"],
            ["an em initial value", {"syntax": `"<length>"`, "initial-value": "2em"}, "depends on the element"],
            ["a rem initial value", {"syntax": `"<length>"`, "initial-value": "1rem"}, "depends on the element"],
            ["a ch initial value", {"syntax": `"<length>"`, "initial-value": "1ch"}, "depends on the element"],
            ["a var() initial value", {"syntax": `"<length>"`, "initial-value": "var(--b)"}, "depends on the element"],
            ["CSS-wide keywords", {"syntax": `"inherit | initial"`, "initial-value": "initial"}, "reserved keyword `inherit`"],
            ["the default keyword", {"syntax": `"default | fancy"`, "initial-value": "fancy"}, "reserved keyword `default`"],
            ["a type the browser doesn't know", {"syntax": `"<colour>"`, "initial-value": "red"}, "isn't a type the browser knows"],
            ["an empty syntax option", {"syntax": `"a | | b"`, "initial-value": "a"}, "empty option"]
        ])("%s", (_, descriptors, reason) => {
            const {settings, warnings} = parseThemeSettings(rule("--x", descriptors as Record<string, string | null>));
            expect(settings).toEqual([]);
            expect(warnings).toHaveLength(1);
            expect(warnings[0].message).toContain(reason);
        });

        test("keywords are case-sensitive", () => {
            const source = rule("--x", {"syntax": `"Dark | light"`, "initial-value": "dark"});
            expect(parseThemeSettings(source).settings).toEqual([]);
            expect(settingFor({"syntax": `"Dark | light"`, "initial-value": "Dark"}).syntax.keywords).toEqual(["Dark", "light"]);
        });

        test("currentcolor is fine", () => {
            expect(settingFor({"syntax": `"<color>"`, "initial-value": "currentcolor"})).toBeDefined();
        });

        test("px, vw, vh and % initial values are fine", () => {
            for (const value of ["2px", "10vw", "5vh", "50%"]) {
                expect(settingFor({"syntax": `"<length-percentage>"`, "initial-value": value})).toBeDefined();
            }
        });

        test("a property name without dashes", () => {
            const {settings, warnings} = parseThemeSettings(rule("accent", {"syntax": `"<color>"`, "initial-value": "red"}));
            expect(settings).toEqual([]);
            expect(warnings[0].message).toContain("`--`");
        });

        test("a rule inside a style rule is ignored, and a top-level copy still counts", () => {
            const good = rule("--x", {"syntax": `"<color>"`, "initial-value": "red"});
            const {settings, warnings} = parseThemeSettings(`.a { ${good} }\n${good}`);
            expect(settings).toHaveLength(1);
            expect(warnings).toHaveLength(1);
            expect(warnings[0].message).toContain("style rule `.a`");
        });
    });

    describe("duplicates and grouping at-rules", () => {
        test("the last copy wins, with a warning", () => {
            const first = rule("--accent", {"syntax": `"<color>"`, "initial-value": "red"});
            const last = rule("--accent", {"syntax": `"<color>"`, "initial-value": "blue", "palette": "#5865f2, #eb459e"});
            const {settings, warnings} = parseThemeSettings(first + last);
            expect(settings).toHaveLength(1);
            expect(settings[0]).toMatchObject({initialValue: "blue", palette: ["#5865f2", "#eb459e"], line: 7});
            expect(warnings).toEqual([{property: "--accent", line: 7, message: expect.stringContaining("line 1")}]);
        });

        test("a duplicate takes the place of its last copy", () => {
            const a = rule("--a", {"syntax": `"<color>"`, "initial-value": "red"});
            const b = rule("--b", {"syntax": `"<color>"`, "initial-value": "red"});
            expect(parseThemeSettings(a + b + a).settings.map(s => s.property)).toEqual(["--b", "--a"]);
        });

        test("a theme wrapped in @layer gets its settings", () => {
            const source = `@layer theme {\n${rule("--x", {"syntax": `"<color>"`, "initial-value": "red"})}}`;
            const {settings, warnings} = parseThemeSettings(source);
            expect(settings).toHaveLength(1);
            expect(warnings).toEqual([]);
        });

        test("a rule inside @scope counts like a top-level one", () => {
            const source = `@scope (.a) {\n${rule("--x", {"syntax": `"<color>"`, "initial-value": "red"})}}`;
            expect(parseThemeSettings(source).settings).toHaveLength(1);
        });

        test("a later unnamed copy wins and removes the setting", () => {
            const named = rule("--x", {"syntax": `"<color>"`, "initial-value": "red"});
            const unnamed = rule("--x", {"syntax": `"<color>"`, "initial-value": "red", "name": null});
            const {settings, warnings} = parseThemeSettings(named + unnamed);
            expect(settings).toEqual([]);
            expect(warnings).toHaveLength(1);
        });
    });

    describe("overrides that beat BD's :root rule", () => {
        const accent = rule("--x", {"syntax": `"<color>"`, "initial-value": "red"});

        test("a plain :root or html block is fine", () => {
            expect(warningsFor(`${accent}:root { --x: blue; }\nhtml { --x: blue; }\n:root, html { --x: blue; }`)).toEqual([]);
        });

        test("a :root block inside @media or @layer is fine", () => {
            expect(warningsFor(`${accent}@media print { :root { --x: blue; } } @layer a { :root { --x: blue; } }`)).toEqual([]);
        });

        test("keyframes are ignored", () => {
            expect(warningsFor(`${accent}@keyframes k { from { --x: blue; } }`)).toEqual([]);
        });

        test("other properties are ignored", () => {
            expect(warningsFor(`${accent}.a { --y: blue; }`)).toEqual([]);
        });

        test.each([
            ["!important", ":root { --x: blue !important; }", "`!important`"],
            ["a stronger selector", "html.theme-dark { --x: blue; }", "`html.theme-dark`"],
            ["a deeper element", "#app-mount { --x: blue; }", "`#app-mount`"],
            ["a selector list with a deeper part", ":root, .theme-dark { --x: blue; }", "`:root, .theme-dark`"],
            ["a nested rule", ":root { .a { --x: blue; } }", "`:root .a`"],
            ["@scope", "@scope (.a) { :root { --x: blue; } }", "`:root` inside `@scope`"]
        ])("%s", (_, css, reason) => {
            const {settings, warnings} = parseThemeSettings(`${accent}${css}`);
            expect(settings).toHaveLength(1);
            expect(warnings).toEqual([{property: "--x", line: 1, message: expect.stringContaining(`line 7 (${reason})`)}]);
        });

        test("lists up to three places in one warning", () => {
            const overrides = [".a", ".b", ".c", ".d", ".e"].map(selector => `${selector} { --x: blue; }`).join("\n");
            const warnings = warningsFor(`${accent}${overrides}`);
            expect(warnings).toHaveLength(1);
            expect(warnings[0]).toContain("line 7 (`.a`), line 8 (`.b`), line 9 (`.c`) and 2 more");
        });
    });

    test("ignores a commented-out rule", () => {
        expect(parseThemeSettings(`/* ${rule("--x", {"syntax": `"<color>"`, "initial-value": "red"})} */`)).toEqual({settings: [], warnings: []});
    });

    test("a theme with no @property rules", () => {
        expect(parseThemeSettings(`/**\n * @name Plain\n */\n:root { --a: red; }\n.a { color: var(--a); }`)).toEqual({settings: [], warnings: []});
    });

    test("the full example theme", () => {
        const source = `@property --mytheme-scheme {
  syntax: "light | dark | <color>";
  inherits: true;
  initial-value: dark;
  name: "Color scheme";
  note: "Light, Dark, or Custom to pick your own background";
}

@property --mytheme-accent {
  syntax: "<color>";
  inherits: true;
  initial-value: #5865f2;
  name: "Accent color";
  palette: #5865f2, #eb459e, #57f287;
  group: "Colors";
}

@property --mytheme-radius {
  syntax: "<length>";
  inherits: true;
  initial-value: 8px;
  name: "Corner radius";
  min: 0px;
  max: 24px;
  step: 1;
  group: "Layout";
}

@property --mytheme-blur {
  syntax: "true | false";
  inherits: true;
  initial-value: false;
  name: "Blur behind popouts";
  group: "Layout";
}

@container style(--mytheme-scheme: dark) {
  #app-mount { --mytheme-bg: #1e1f22; }
}

@container not (style(--mytheme-scheme: light) or style(--mytheme-scheme: dark)) {
  #app-mount { --mytheme-bg: var(--mytheme-scheme); }
}

#app-mount {
  background: var(--mytheme-bg);
  --brand-500: var(--mytheme-accent);
}`;
        const {settings, warnings} = parseThemeSettings(source);
        expect(warnings).toEqual([]);
        expect(settings.map(s => [s.property, s.name, s.group])).toEqual([
            ["--mytheme-scheme", "Color scheme", undefined],
            ["--mytheme-accent", "Accent color", "Colors"],
            ["--mytheme-radius", "Corner radius", "Layout"],
            ["--mytheme-blur", "Blur behind popouts", "Layout"]
        ]);
        expect(settings[2]).toMatchObject({range: {min: 0, max: 24, step: 1, unit: "px"}, units: ["px"]});
        expect(settings[1].palette).toEqual(["#5865f2", "#eb459e", "#57f287"]);
    });
});

describe("hasThemeSettings", () => {
    test("finds an @property rule with a name", () => {
        expect(hasThemeSettings(`@property --a { syntax: "<color>"; name: "A"; }`)).toBe(true);
        expect(hasThemeSettings(`@property --a{name:"A"}`)).toBe(true);
        expect(hasThemeSettings(`@property --a {\n  syntax: "<color>";\n  NAME : "A";\n}`)).toBe(true);
    });

    test("ignores rules without a name", () => {
        expect(hasThemeSettings(`@property --a { syntax: "<color>"; inherits: true; }`)).toBe(false);
        expect(hasThemeSettings(`@property --a { font-name: x; }`)).toBe(false);
        expect(hasThemeSettings(`@property --a { syntax: "*"; } .x { name: y; }`)).toBe(false);
        expect(hasThemeSettings(`:root { --a: red; }`)).toBe(false);
    });
});

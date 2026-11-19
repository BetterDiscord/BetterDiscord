import {describe, test, expect} from "bun:test";
import {scanCss, parseCssString, splitTopLevel} from "@modules/themes/scanner";

const accent = `@property --accent {
    syntax: "<color>";
    inherits: true;
    initial-value: #5865f2;
    name: "Accent color";
}`;

describe("scanCss", () => {
    describe("@property rules", () => {
        test("reads the descriptors of a rule", () => {
            const {properties} = scanCss(accent);
            expect(properties).toEqual([{
                property: "--accent",
                descriptors: {
                    "syntax": `"<color>"`,
                    "inherits": "true",
                    "initial-value": "#5865f2",
                    "name": `"Accent color"`
                },
                line: 1,
                context: []
            }]);
        });

        test("reads every rule in order, with its line", () => {
            const source = `/** @name Test */\n${accent}\n\n@property --b { syntax: "*"; inherits: false; }`;
            const {properties} = scanCss(source);
            expect(properties.map(p => [p.property, p.line])).toEqual([["--accent", 2], ["--b", 9]]);
        });

        test("lowercases descriptor names and keeps the last of a repeated one", () => {
            const {properties} = scanCss(`@property --a { NAME: "One"; name: "Two"; Initial-Value: 1px; }`);
            expect(properties[0].descriptors).toEqual({"name": `"Two"`, "initial-value": "1px"});
        });

        test("reads a rule with no trailing semicolon and no space", () => {
            const {properties} = scanCss(`@property --a{syntax:"<length>";inherits:true;initial-value:0px}`);
            expect(properties[0].descriptors["initial-value"]).toBe("0px");
        });

        test("keeps the rest of the sheet readable after a rule", () => {
            const {properties, declarations} = scanCss(`${accent} :root { --accent: red; }`);
            expect(properties).toHaveLength(1);
            expect(declarations.map(d => d.property)).toEqual(["--accent"]);
        });
    });

    describe("comments", () => {
        test("skips a commented-out rule", () => {
            expect(scanCss(`/* ${accent} */`).properties).toEqual([]);
        });

        test("removes comments from descriptor values", () => {
            const {properties} = scanCss(`@property --a { initial-value: /* the brand */ #fff /* end */; name: "A"; }`);
            expect(properties[0].descriptors["initial-value"]).toBe("#fff");
        });

        test("ignores a } or ; inside a comment", () => {
            const {properties} = scanCss(`@property --a { name: "A"; /* } ; */ note: "B"; }`);
            expect(properties[0].descriptors).toEqual({name: `"A"`, note: `"B"`});
        });

        test("treats // as text, because CSS has no line comments", () => {
            const {properties} = scanCss(`@property --a { initial-value: url(https://e.com/a.png); }`);
            expect(properties[0].descriptors["initial-value"]).toBe("url(https://e.com/a.png)");
        });

        test("stops at an unclosed comment", () => {
            expect(scanCss(`/* ${accent}`).properties).toEqual([]);
        });
    });

    describe("strings", () => {
        test("keeps a ; and } inside a string", () => {
            const {properties} = scanCss(`@property --s { syntax: "<string>"; initial-value: "a;b}c"; note: 'x; y }'; }`);
            expect(properties[0].descriptors).toEqual({"syntax": `"<string>"`, "initial-value": `"a;b}c"`, "note": `'x; y }'`});
        });

        test("keeps an escaped quote inside a string", () => {
            const {properties} = scanCss(`@property --s { name: "Say \\"hi\\"; ok"; note: "n"; }`);
            expect(properties[0].descriptors).toEqual({name: `"Say \\"hi\\"; ok"`, note: `"n"`});
        });

        test("keeps a comment opener inside a string", () => {
            const {properties} = scanCss(`@property --s { note: "a /* b"; name: "N"; }`);
            expect(properties[0].descriptors).toEqual({note: `"a /* b"`, name: `"N"`});
        });

        test("ends an unclosed string at the line break, like the browser", () => {
            const {properties} = scanCss(`@property --a { note: "oops; }\n}\n@property --b { name: "B"; }`);
            expect(properties.map(p => p.property)).toEqual(["--a", "--b"]);
        });
    });

    describe("url()", () => {
        test("keeps a ; inside an unquoted data URI", () => {
            const value = `url(data:image/svg+xml;utf8,<svg xmlns='x'/>)`;
            const {properties} = scanCss(`@property --u { syntax: "<url>"; initial-value: ${value}; name: "U"; }`);
            expect(properties[0].descriptors["initial-value"]).toBe(value);
            expect(properties[0].descriptors.name).toBe(`"U"`);
        });

        test("keeps a } inside an unquoted url", () => {
            const {properties} = scanCss(`@property --u { initial-value: url(a}b.png); name: "U"; }`);
            expect(properties[0].descriptors).toEqual({"initial-value": "url(a}b.png)", "name": `"U"`});
        });

        test("keeps a quoted url", () => {
            const {properties} = scanCss(`@property --u { initial-value: url("a;b.png"); name: "U"; }`);
            expect(properties[0].descriptors["initial-value"]).toBe(`url("a;b.png")`);
        });

        test("treats another function ending in url as a normal function", () => {
            const {properties} = scanCss(`@property --u { initial-value: myurl(a); name: "U"; }`);
            expect(properties[0].descriptors["initial-value"]).toBe("myurl(a)");
        });
    });

    describe("parentheses", () => {
        test("keeps a ; inside parentheses", () => {
            const {properties} = scanCss(`@property --a { palette: rgb(1 2 3), color-mix(in srgb; red, blue); name: "A"; }`);
            expect(properties[0].descriptors.palette).toBe("rgb(1 2 3), color-mix(in srgb; red, blue)");
        });
    });

    describe("nesting", () => {
        test("records the at-rules around a rule", () => {
            const {properties} = scanCss(`@layer theme { @media (min-width: 1px) { ${accent} } }`);
            expect(properties[0].context).toEqual([
                {kind: "at-rule", name: "layer", prelude: "theme"},
                {kind: "at-rule", name: "media", prelude: "(min-width: 1px)"}
            ]);
        });

        test("lowercases at-rule names", () => {
            const {properties} = scanCss(`@SUPPORTS (color: red) { ${accent} }`);
            expect(properties[0].context).toEqual([{kind: "at-rule", name: "supports", prelude: "(color: red)"}]);
        });

        test("records a style rule around a nested rule", () => {
            const {properties} = scanCss(`.x { color: red; ${accent} }`);
            expect(properties[0].context).toEqual([{kind: "style", selector: ".x"}]);
        });

        test("returns to the top level after a nested block closes", () => {
            const {properties} = scanCss(`@media print { .a { color: red; } } ${accent}`);
            expect(properties[0].context).toEqual([]);
        });

        test("skips statement at-rules", () => {
            const {properties} = scanCss(`@import url("https://e.com/a;b.css"); @charset "utf-8"; ${accent}`);
            expect(properties).toHaveLength(1);
            expect(properties[0].context).toEqual([]);
        });

        test("survives a stray closing brace at the top level", () => {
            expect(scanCss(`} ${accent}`).properties).toHaveLength(1);
        });

        test("stops cleanly at an unclosed block", () => {
            expect(scanCss(`@media print { ${accent}`).properties).toHaveLength(1);
            expect(scanCss(`@property --a { name: "A"`).properties[0].descriptors).toEqual({name: `"A"`});
        });
    });

    describe("declarations", () => {
        test("records custom property declarations with their selector", () => {
            const {declarations} = scanCss(`:root { color: red; --a: 1px; --b: blue }`);
            expect(declarations).toEqual([
                {property: "--a", value: "1px", important: false, line: 1, context: [{kind: "style", selector: ":root"}]},
                {property: "--b", value: "blue", important: false, line: 1, context: [{kind: "style", selector: ":root"}]}
            ]);
        });

        test("notices !important in any case and spacing", () => {
            const {declarations} = scanCss(`:root { --a: red !important; --b: red ! IMPORTANT; --c: "!important" }`);
            expect(declarations.map(d => [d.value, d.important])).toEqual([["red", true], ["red", true], [`"!important"`, false]]);
        });

        test("records the selector chain of nested style rules", () => {
            const {declarations} = scanCss(`@layer a { html { .theme-dark & { --a: red; } } }`);
            expect(declarations[0].context).toEqual([
                {kind: "at-rule", name: "layer", prelude: "a"},
                {kind: "style", selector: "html"},
                {kind: "style", selector: ".theme-dark &"}
            ]);
        });

        test("keeps braces inside a custom property's value", () => {
            const {declarations} = scanCss(`.a { --a: { b: c; }; --b: red; }`);
            expect(declarations.map(d => [d.property, d.value])).toEqual([["--a", "{ b: c; }"], ["--b", "red"]]);
        });

        test("keeps a ; inside a string value", () => {
            const {declarations} = scanCss(`.a { --a: "x; y"; --b: red; }`);
            expect(declarations.map(d => d.value)).toEqual([`"x; y"`, "red"]);
        });

        test("ignores custom properties outside any rule", () => {
            expect(scanCss(`--a: red;`).declarations).toEqual([]);
        });

        test("ignores declarations inside @property", () => {
            expect(scanCss(accent).declarations).toEqual([]);
        });

        test("records the line of each declaration", () => {
            const {declarations} = scanCss(`:root {\n  --a: red;\n\n  --b: blue;\n}`);
            expect(declarations.map(d => d.line)).toEqual([2, 4]);
        });

        test("reads a selector with a pseudo-class and attribute", () => {
            const {declarations} = scanCss(`[class*="popout;"]:hover { --a: red; }`);
            expect(declarations[0].context).toEqual([{kind: "style", selector: `[class*="popout;"]:hover`}]);
        });
    });
});

describe("parseCssString", () => {
    test("removes the quotes", () => {
        expect(parseCssString(`"Accent color"`)).toBe("Accent color");
        expect(parseCssString(`'Accent color'`)).toBe("Accent color");
    });

    test("resolves escapes", () => {
        expect(parseCssString(`"Say \\"hi\\""`)).toBe(`Say "hi"`);
        expect(parseCssString(`'it\\'s'`)).toBe("it's");
        expect(parseCssString(`"back\\\\slash"`)).toBe("back\\slash");
    });

    test("resolves hex escapes and eats one space after them", () => {
        expect(parseCssString(`"\\26 B"`)).toBe("&B");
        expect(parseCssString(`"\\1F600"`)).toBe("😀");
        expect(parseCssString(`"\\0"`)).toBe("\uFFFD");
    });

    test("drops an escaped line break", () => {
        expect(parseCssString(`"a\\\nb"`)).toBe("ab");
    });

    test("returns null for anything that isn't one whole string", () => {
        expect(parseCssString("Accent")).toBeNull();
        expect(parseCssString(`"open`)).toBeNull();
        expect(parseCssString(`"a" "b"`)).toBeNull();
        expect(parseCssString(`"a\nb"`)).toBeNull();
        expect(parseCssString(`"`)).toBeNull();
    });
});

describe("splitTopLevel", () => {
    test("splits outside parentheses", () => {
        expect(splitTopLevel("rgb(1, 2, 3), #fff,hsl(1 2% 3%)", ",")).toEqual(["rgb(1, 2, 3)", "#fff", "hsl(1 2% 3%)"]);
    });

    test("doesn't split inside strings, even with an escaped quote", () => {
        expect(splitTopLevel(`"a | \\" | b" | c`, "|")).toEqual([`"a | \\" | b"`, "c"]);
    });

    test("returns one part when there's no separator", () => {
        expect(splitTopLevel("  <color>  ", "|")).toEqual(["<color>"]);
    });
});

import {describe, test, expect} from "bun:test";
import {invalidKeyword, probeRule, probeValues, releaseProbes, verdictFor} from "@modules/themes/probe";
import {parseThemeSettings} from "@modules/themes/settings";

const {settings} = parseThemeSettings(`@property --scheme {
    syntax: "light | dark | <color>";
    inherits: true;
    initial-value: dark;
    name: "Scheme";
}
@property --label {
    syntax: "<string>";
    inherits: true;
    initial-value: "a } b";
    name: "Label";
}`);

const host = () => document.getElementById("bd-theme-settings-probe");

describe("probeRule", () => {
    test("copies the syntax and initial value, adds the invalid keyword, and always inherits", () => {
        expect(probeRule("--bd-probe-0", settings[0])).toBe(`@property --bd-probe-0 { syntax: "light | dark | <color> | ${invalidKeyword}"; inherits: true; initial-value: dark; }`);
        expect(probeRule("--bd-probe-1", settings[1])).toContain(`initial-value: "a } b";`);
    });
});

describe("verdictFor", () => {
    test("tells invalid, default and changed values apart", () => {
        expect(verdictFor(invalidKeyword, "rgb(255, 0, 0)")).toBe("invalid");
        expect(verdictFor("rgb(255, 0, 0)", "rgb(255, 0, 0)")).toBe("default");
        expect(verdictFor("rgb(0, 0, 255)", "rgb(255, 0, 0)")).toBe("changed");
    });
});

describe("probe bookkeeping", () => {
    test("registers one rule per setting, and the parent holds the invalid keyword for each", () => {
        probeValues("Midnight", settings, [[settings[0], "blue"]]);
        const style = host()!.querySelector("style")!;
        const parent = host()!.querySelector("div")!;

        const names = [...style.textContent!.matchAll(/@property (--bd-probe-\d+)/g)].map(m => m[1]);
        expect(names).toHaveLength(2);
        for (const name of names) expect(parent.style.getPropertyValue(name)).toBe(invalidKeyword);
        expect(parent.children).toHaveLength(0);
        expect((host() as HTMLElement).hidden).toBe(true);
        releaseProbes("Midnight");
    });

    test("keeps the rules while the settings are the same, and renames them when they change", () => {
        probeValues("Midnight", settings, []);
        const first = host()!.querySelector("style")!.textContent;
        probeValues("Midnight", settings, []);
        expect(host()!.querySelector("style")!.textContent).toBe(first);

        probeValues("Midnight", [...settings], []);
        expect(host()!.querySelector("style")!.textContent).not.toBe(first);
        releaseProbes("Midnight");
    });

    test("removes a theme's rules on release, and the probe once no theme is left", () => {
        probeValues("Midnight", settings, []);
        probeValues("Other", settings.slice(0, 1), []);
        releaseProbes("Midnight");
        expect(host()!.querySelector("style")!.textContent!.match(/@property/g)).toHaveLength(1);

        releaseProbes("Other");
        expect(host()).toBeNull();
    });
});

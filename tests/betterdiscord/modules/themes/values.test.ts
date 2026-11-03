import {describe, test, expect, beforeEach} from "bun:test";
import {ThemeValues, type ProbeVerdict, type SavedValues} from "@modules/themes/values";
import {parseThemeSettings} from "@modules/themes/settings";
import type {Theme} from "@modules/thememanager";

const source = `@property --accent {
    syntax: "<color>";
    inherits: true;
    initial-value: red;
    name: "Accent";
}
@property --radius {
    syntax: "<length>";
    inherits: true;
    initial-value: 4px;
    name: "Radius";
}`;

function makeTheme(id = "Midnight", css = source): Theme {
    return {id, name: id, properties: parseThemeSettings(css).settings} as Theme;
}

/** A probe that treats `red` and `4px` as the defaults and anything containing "bad" as invalid. */
function fakeProbe(value: string): ProbeVerdict {
    if (value.includes("bad")) return "invalid";
    if (value === "red" || value === "4px") return "default";
    return "changed";
}

let stored: unknown;
let saves: SavedValues[];
let writes: Array<[string, Record<string, string>]>;
let probes: string[][];
let frames: Array<() => void>;

/** Builds a store that records into this test's arrays, so a timer left over from another test can't reach them. */
function makeValues(saveDelay = 0) {
    const log = {saves, writes, probes, frames};
    return new ThemeValues({
        load: () => stored,
        save: values => log.saves.push(structuredClone(values)),
        probe: (_theme, entries) => {
            log.probes.push(entries.map(([, value]) => value));
            return entries.map(([, value]) => fakeProbe(value));
        },
        write: (theme, values) => log.writes.push([theme.id, {...values}]),
        requestFrame: callback => log.frames.push(callback),
        saveDelay
    });
}

function runFrames() {
    for (const callback of frames.splice(0)) callback();
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

beforeEach(() => {
    stored = undefined;
    saves = [];
    writes = [];
    probes = [];
    frames = [];
});

describe("ThemeValues", () => {
    describe("setValue", () => {
        test("saves a value that differs from the default, trimmed", () => {
            const values = makeValues();
            const theme = makeTheme();
            values.apply(theme);

            expect(values.setValue(theme, "--accent", "  oklch(0.7 0.1 200) ")).toBe("saved");
            expect(values.getSaved("Midnight")).toEqual({"--accent": "oklch(0.7 0.1 200)"});
            expect(values.getValue(theme, "--accent")).toBe("oklch(0.7 0.1 200)");
        });

        test("doesn't save the default, and removes a saved value", () => {
            stored = {Midnight: {"--accent": "blue"}};
            const values = makeValues();
            const theme = makeTheme();
            values.apply(theme);

            expect(values.setValue(theme, "--accent", "red")).toBe("default");
            expect(values.getSaved("Midnight")).toEqual({});
            expect(values.getValue(theme, "--accent")).toBe("red");
        });

        test("changes nothing for an invalid value", () => {
            stored = {Midnight: {"--accent": "blue"}};
            const values = makeValues();
            const theme = makeTheme();
            values.apply(theme);
            const before = values.getSaved("Midnight");

            expect(values.setValue(theme, "--accent", "bad)")).toBe("invalid");
            expect(values.getSaved("Midnight")).toBe(before);
            expect(frames).toEqual([]);
        });

        test("refuses a theme that isn't running or a property that isn't a setting", () => {
            const values = makeValues();
            const theme = makeTheme();
            expect(values.setValue(theme, "--accent", "blue")).toBe("invalid");

            values.apply(theme);
            expect(values.setValue(theme, "--missing", "blue")).toBe("invalid");
            expect(probes).toEqual([]);
        });

        test("emits a change synchronously, only when the saved values change", () => {
            const values = makeValues();
            const theme = makeTheme();
            values.apply(theme);
            let changes = 0;
            values.addChangeListener(() => changes++);

            values.setValue(theme, "--accent", "blue");
            expect(changes).toBe(1);
            values.setValue(theme, "--accent", "bad");
            values.setValue(theme, "--radius", "4px");
            expect(changes).toBe(1);
        });

        test("replaces the saved object on every change, so it works as a snapshot", () => {
            const values = makeValues();
            const theme = makeTheme();
            values.apply(theme);

            values.setValue(theme, "--accent", "blue");
            const first = values.getSaved("Midnight");
            values.setValue(theme, "--radius", "1rem");
            expect(values.getSaved("Midnight")).not.toBe(first);
            expect(first).toEqual({"--accent": "blue"});
            expect(Object.isFrozen(values.getSaved("Midnight"))).toBe(true);
        });
    });

    describe("live apply", () => {
        test("writes to the page once per frame, with the latest values", () => {
            const values = makeValues();
            const theme = makeTheme();
            values.apply(theme);

            values.setValue(theme, "--radius", "1px");
            values.setValue(theme, "--radius", "2px");
            values.setValue(theme, "--accent", "blue");
            expect(writes).toEqual([]);
            expect(frames).toHaveLength(1);

            runFrames();
            expect(writes).toEqual([["Midnight", {"--radius": "2px", "--accent": "blue"}]]);
        });

        test("writes an empty set when the last value goes back to the default", () => {
            stored = {Midnight: {"--accent": "blue"}};
            const values = makeValues();
            const theme = makeTheme();
            values.apply(theme);
            writes.length = 0;

            values.reset(theme, "--accent");
            runFrames();
            expect(writes).toEqual([["Midnight", {}]]);
        });

        test("skips a pending frame for a theme that stopped", () => {
            const values = makeValues();
            const theme = makeTheme();
            values.apply(theme);
            values.setValue(theme, "--accent", "blue");
            values.remove(theme);
            writes.length = 0;

            runFrames();
            expect(writes).toEqual([]);
        });
    });

    describe("saving", () => {
        test("debounces the disk write", async () => {
            const values = makeValues(20);
            const theme = makeTheme();
            values.apply(theme);

            values.setValue(theme, "--accent", "blue");
            values.setValue(theme, "--radius", "1rem");
            expect(saves).toEqual([]);

            await wait(40);
            expect(saves).toEqual([{Midnight: {"--accent": "blue", "--radius": "1rem"}}]);
        });

        test("flush writes pending changes at once, and only when there are some", () => {
            const values = makeValues(10_000);
            const theme = makeTheme();
            values.apply(theme);

            values.flush();
            expect(saves).toEqual([]);

            values.setValue(theme, "--accent", "blue");
            values.flush();
            expect(saves).toEqual([{Midnight: {"--accent": "blue"}}]);
            values.flush();
            expect(saves).toHaveLength(1);
        });

        test("drops a theme's entry once its last value is reset", () => {
            stored = {Midnight: {"--accent": "blue"}, Other: {"--x": "1px"}};
            const values = makeValues(10_000);
            const theme = makeTheme();

            values.reset(theme, "--accent");
            values.flush();
            expect(saves).toEqual([{Other: {"--x": "1px"}}]);
        });

        test("reads only string values from the file", () => {
            stored = {Midnight: {"--accent": " blue ", "--radius": 4, "--empty": " "}, Broken: "x", List: ["a"]};
            expect(makeValues().getSaved("Midnight")).toEqual({"--accent": "blue"});
            expect(makeValues().getSaved("Broken")).toEqual({});

            stored = "not json";
            expect(makeValues().getSaved("Midnight")).toEqual({});
        });
    });

    describe("reset", () => {
        test("reset removes one value and resetAll removes the rest", () => {
            stored = {Midnight: {"--accent": "blue", "--radius": "1rem"}};
            const values = makeValues();
            const theme = makeTheme();
            values.apply(theme);

            values.reset(theme, "--accent");
            expect(values.getSaved("Midnight")).toEqual({"--radius": "1rem"});
            expect(values.getValue(theme, "--accent")).toBe("red");

            values.resetAll(theme);
            expect(values.getSaved("Midnight")).toEqual({});
            expect(values.getValue(theme, "--radius")).toBe("4px");
        });

        test("works on a theme that isn't running", () => {
            stored = {Midnight: {"--accent": "blue"}};
            const values = makeValues();
            values.resetAll(makeTheme());
            expect(values.getSaved("Midnight")).toEqual({});
            expect(frames).toEqual([]);
        });
    });

    describe("apply and remove", () => {
        test("applies valid saved values in one probe, and writes nothing without values", () => {
            stored = {Midnight: {"--accent": "blue", "--radius": "1rem"}};
            const values = makeValues();
            values.apply(makeTheme());
            expect(probes).toEqual([["blue", "1rem"]]);
            expect(writes).toEqual([["Midnight", {"--accent": "blue", "--radius": "1rem"}]]);

            writes.length = 0;
            probes.length = 0;
            values.apply(makeTheme("Plain"));
            expect(probes).toEqual([]);
            expect(writes).toEqual([]);
        });

        test("skips values that no longer fit, but keeps them saved", () => {
            stored = {Midnight: {"--accent": "bad-now", "--radius": "4px", "--gone": "1px", "--kept": "2px"}};
            const values = makeValues();
            const theme = makeTheme("Midnight", source + `\n@property --kept { syntax: "<length>"; inherits: true; initial-value: 1px; name: "Kept"; }`);
            values.apply(theme);

            expect(writes).toEqual([["Midnight", {"--kept": "2px"}]]);
            expect(values.getValue(theme, "--accent")).toBe("red");
            expect(values.getSaved("Midnight")).toEqual({"--accent": "bad-now", "--radius": "4px", "--gone": "1px", "--kept": "2px"});
            expect(saves).toEqual([]);
        });

        test("remove takes the values off the page and keeps them saved", () => {
            stored = {Midnight: {"--accent": "blue"}};
            const values = makeValues();
            const theme = makeTheme();
            values.apply(theme);
            writes.length = 0;

            values.remove(theme);
            expect(writes).toEqual([["Midnight", {}]]);
            expect(values.getSaved("Midnight")).toEqual({"--accent": "blue"});
            expect(values.getValue(theme, "--accent")).toBe("blue");
            expect(values.setValue(theme, "--accent", "green")).toBe("invalid");
        });

        test("a reload applies the saved values to the new theme object", () => {
            stored = {Midnight: {"--accent": "blue"}};
            const values = makeValues();
            values.apply(makeTheme());
            values.remove(makeTheme());
            writes.length = 0;

            const reloaded = makeTheme();
            values.apply(reloaded);
            expect(writes).toEqual([["Midnight", {"--accent": "blue"}]]);
            expect(values.setValue(reloaded, "--radius", "1rem")).toBe("saved");
        });
    });

    describe("forget", () => {
        test("deletes a theme's values and saves", () => {
            stored = {Midnight: {"--accent": "blue"}, Other: {"--x": "1px"}};
            const values = makeValues(10_000);
            let changes = 0;
            values.addChangeListener(() => changes++);

            values.forget("Midnight");
            values.flush();
            expect(values.getSaved("Midnight")).toEqual({});
            expect(saves).toEqual([{Other: {"--x": "1px"}}]);
            expect(changes).toBe(1);
        });

        test("does nothing for a theme without values", () => {
            const values = makeValues(10_000);
            values.forget("Midnight");
            values.flush();
            expect(saves).toEqual([]);
        });
    });
});

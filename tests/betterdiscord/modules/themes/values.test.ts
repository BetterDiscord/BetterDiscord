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
let timers: Array<{callback: () => void, delay: number, cancelled: boolean}>;
let releases: string[];

/** Builds a store that records into this test's arrays, and whose timers only run from `runTimers`. */
function makeValues() {
    const log = {saves, writes, probes, timers, releases};
    return new ThemeValues({
        load: () => stored,
        save: values => log.saves.push(structuredClone(values)),
        probe: (_theme, entries) => {
            log.probes.push(entries.map(([, value]) => value));
            return entries.map(([, value]) => fakeProbe(value));
        },
        write: (theme, values) => log.writes.push([theme.id, {...values}]),
        release: theme => log.releases.push(theme.id),
        schedule: (callback, delay) => {
            const timer = {callback, delay, cancelled: false};
            log.timers.push(timer);
            return () => timer.cancelled = true;
        },
        delay: 100
    });
}

/** Timers that were scheduled and not cancelled. */
function liveTimers() {
    return timers.filter(timer => !timer.cancelled);
}

/** Runs the timers that are waiting, as if the delay passed. */
function runTimers() {
    for (const timer of liveTimers()) {
        timer.cancelled = true;
        timer.callback();
    }
}

beforeEach(() => {
    stored = undefined;
    saves = [];
    writes = [];
    probes = [];
    timers = [];
    releases = [];
});

describe("ThemeValues", () => {
    describe("setValue", () => {
        test("saves a value that differs from the default, trimmed", () => {
            const values = makeValues();
            const theme = makeTheme();
            values.apply(theme);

            expect(values.setValue(theme, "--accent", "  oklch(0.7 0.1 200) ")).toBe("oklch(0.7 0.1 200)");
            expect(values.getSaved("Midnight")).toEqual({"--accent": "oklch(0.7 0.1 200)"});
            expect(values.getValue(theme, "--accent")).toBe("oklch(0.7 0.1 200)");
        });

        test("doesn't save the default, and removes a saved value", () => {
            stored = {Midnight: {"--accent": "blue"}};
            const values = makeValues();
            const theme = makeTheme();
            values.apply(theme);

            expect(values.setValue(theme, "--accent", "red")).toBe("red");
            expect(values.getSaved("Midnight")).toEqual({});
            expect(values.getValue(theme, "--accent")).toBe("red");
        });

        test("changes nothing for an invalid value", () => {
            stored = {Midnight: {"--accent": "blue"}};
            const values = makeValues();
            const theme = makeTheme();
            values.apply(theme);
            const before = values.getSaved("Midnight");

            expect(values.setValue(theme, "--accent", "bad)")).toBeNull();
            expect(values.getSaved("Midnight")).toBe(before);
            expect(timers).toEqual([]);
        });

        test("refuses a theme that isn't running or a property that isn't a setting", () => {
            const values = makeValues();
            const theme = makeTheme();
            expect(values.setValue(theme, "--accent", "blue")).toBeNull();

            values.apply(theme);
            expect(values.setValue(theme, "--missing", "blue")).toBeNull();
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

        test("a change listener reads the new value from getValue", () => {
            const values = makeValues();
            const theme = makeTheme();
            values.apply(theme);
            const seen: string[] = [];
            values.addChangeListener(() => seen.push(values.getValue(theme, "--accent")));

            values.setValue(theme, "--accent", "blue");
            values.reset(theme, "--accent");
            values.setValue(theme, "--accent", "green");
            values.resetAll(theme);
            expect(seen).toEqual(["blue", "red", "green", "red"]);
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

    describe("debounce", () => {
        test("writes to the page and saves once, after changes stop", () => {
            const values = makeValues();
            const theme = makeTheme();
            values.apply(theme);

            values.setValue(theme, "--radius", "1px");
            values.setValue(theme, "--radius", "2px");
            values.setValue(theme, "--accent", "blue");
            expect(writes).toEqual([]);
            expect(saves).toEqual([]);
            expect(liveTimers()).toHaveLength(1);
            expect(liveTimers()[0].delay).toBe(100);

            runTimers();
            expect(writes).toEqual([["Midnight", {"--radius": "2px", "--accent": "blue"}]]);
            expect(saves).toEqual([{Midnight: {"--radius": "2px", "--accent": "blue"}}]);
        });

        test("getValue returns the new value while the write waits", () => {
            const values = makeValues();
            const theme = makeTheme();
            values.apply(theme);

            values.setValue(theme, "--radius", "2px");
            expect(writes).toEqual([]);
            expect(values.getValue(theme, "--radius")).toBe("2px");
        });

        test("a value set back to the default waits like any other", () => {
            stored = {Midnight: {"--radius": "2px"}};
            const values = makeValues();
            const theme = makeTheme();
            values.apply(theme);
            writes.length = 0;

            expect(values.setValue(theme, "--radius", "4px")).toBe("4px");
            expect(writes).toEqual([]);
            expect(values.getValue(theme, "--radius")).toBe("4px");

            runTimers();
            expect(writes).toEqual([["Midnight", {}]]);
            expect(saves).toEqual([{}]);
        });

        test("a reset writes and saves at once, along with anything waiting", () => {
            stored = {Midnight: {"--accent": "blue"}};
            const values = makeValues();
            const theme = makeTheme();
            values.apply(theme);
            writes.length = 0;

            values.setValue(theme, "--radius", "1rem");
            values.reset(theme, "--accent");
            expect(writes).toEqual([["Midnight", {"--radius": "1rem"}]]);
            expect(saves).toEqual([{Midnight: {"--radius": "1rem"}}]);
            expect(liveTimers()).toEqual([]);
        });

        test("skips a waiting write for a theme that stopped, but still saves", () => {
            const values = makeValues();
            const theme = makeTheme();
            values.apply(theme);
            values.setValue(theme, "--accent", "blue");
            values.remove(theme);
            writes.length = 0;

            runTimers();
            expect(writes).toEqual([]);
            expect(saves).toEqual([{Midnight: {"--accent": "blue"}}]);
        });

        test("apply writes at once and drops a waiting write for the same theme", () => {
            const values = makeValues();
            const theme = makeTheme();
            values.apply(theme);
            values.setValue(theme, "--accent", "blue");

            values.apply(makeTheme());
            expect(writes).toEqual([["Midnight", {"--accent": "blue"}]]);
            runTimers();
            expect(writes).toHaveLength(1);
        });
    });

    describe("saving", () => {
        test("flush writes pending changes at once, and only when there are some", () => {
            const values = makeValues();
            const theme = makeTheme();
            values.apply(theme);

            values.flush();
            expect(saves).toEqual([]);
            expect(writes).toEqual([]);

            values.setValue(theme, "--accent", "blue");
            values.flush();
            expect(writes).toEqual([["Midnight", {"--accent": "blue"}]]);
            expect(saves).toEqual([{Midnight: {"--accent": "blue"}}]);
            expect(liveTimers()).toEqual([]);

            values.flush();
            expect(saves).toHaveLength(1);
            expect(writes).toHaveLength(1);
        });

        test("drops a theme's entry once its last value is reset", () => {
            stored = {Midnight: {"--accent": "blue"}, Other: {"--x": "1px"}};
            const values = makeValues();
            const theme = makeTheme();

            values.reset(theme, "--accent");
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
            expect(writes).toEqual([]);
            expect(saves).toEqual([{}]);
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
            expect(releases).toEqual(["Midnight"]);
            expect(values.getSaved("Midnight")).toEqual({"--accent": "blue"});
            expect(values.getValue(theme, "--accent")).toBe("red");
            expect(values.setValue(theme, "--accent", "green")).toBeNull();
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
            expect(values.setValue(reloaded, "--radius", "1rem")).toBe("1rem");
        });
    });

    describe("forget", () => {
        test("deletes a theme's values and saves", () => {
            stored = {Midnight: {"--accent": "blue"}, Other: {"--x": "1px"}};
            const values = makeValues();
            let changes = 0;
            values.addChangeListener(() => changes++);

            values.forget("Midnight");
            values.flush();
            expect(values.getSaved("Midnight")).toEqual({});
            expect(saves).toEqual([{Other: {"--x": "1px"}}]);
            expect(changes).toBe(1);
        });

        test("does nothing for a theme without values", () => {
            const values = makeValues();
            values.forget("Midnight");
            values.flush();
            expect(saves).toEqual([]);
        });
    });
});

import Store from "@stores/base";
import type {Theme} from "@modules/thememanager";
import type {ThemeSetting} from "./types";


/** How a value compares to its setting's default once the browser has computed both. */
export type ProbeVerdict = "invalid" | "default" | "changed";

/** Saved values, keyed by theme id and then by property name. */
export type SavedValues = Record<string, Readonly<Record<string, string>>>;

export interface ThemeValuesOptions {
    /** Reads the saved values from disk. */
    load(): unknown;

    /** Writes every saved value to disk. */
    save(values: SavedValues): void;

    /** Checks each value against its setting in the browser, in order. Only called for a running theme. */
    probe(theme: Theme, entries: Array<[ThemeSetting, string]>): ProbeVerdict[];

    /** Puts a running theme's values on the page. An empty object removes the theme's tag. */
    write(theme: Theme, values: Readonly<Record<string, string>>): void;

    /** Frees what `probe` set up for a theme that stopped. */
    release(theme: Theme): void;

    /** Runs a callback after `delay` milliseconds, and returns a function that cancels it. */
    schedule(callback: () => void, delay: number): () => void;

    /** How long the page and disk writes wait for more changes, in milliseconds. */
    delay: number;
}

const noValues: Readonly<Record<string, string>> = Object.freeze({});

/**
 * Holds the values a user picked for each theme's settings, and keeps the page and the file in step with them.
 * Only values that differ from a setting's default are saved. Stopping or reloading a theme leaves its values
 * alone, so only a reset or `forget` removes them.
 *
 * It emits a change synchronously whenever the saved values change, and `getValue` returns the new value at once.
 * The page and the file update together once changes stop for `delay`, because each write to the page restyles
 * all of Discord. A reset, `apply` and `remove` reach the page at once.
 */
export class ThemeValues extends Store {
    private options: ThemeValuesOptions;
    private saved: SavedValues | null = null;

    /**
     * The values on the page for each running theme, so a theme is running exactly when it has an entry here. A
     * saved value that no longer fits its setting is left out.
     */
    private applied = new Map<string, Readonly<Record<string, string>>>();

    /** Running themes whose applied values changed since the last write to the page. */
    private pendingWrites = new Map<string, Theme>();

    /** Cancels the wait before the next flush. Set only while changes wait. */
    private cancelFlush: (() => void) | null = null;

    constructor(options: ThemeValuesOptions) {
        super();
        this.options = options;
    }

    /** The saved values for one theme, keyed by property. The object is replaced on every change. */
    getSaved(themeId: string): Readonly<Record<string, string>> {
        return this.load()[themeId] ?? noValues;
    }

    /**
     * The value the page uses for a setting: the applied value, or else the setting's default. A theme that isn't
     * running has nothing on the page, so it always gets the default.
     */
    getValue(theme: Theme, property: string) {
        const setting = theme.properties?.find(s => s.property === property);
        return this.applied.get(theme.id)?.[property] ?? setting?.initialValue ?? "";
    }

    /**
     * Checks a value in the browser and stores it when it differs from the default. A value that computes to the
     * default removes any saved value instead. The theme must be running.
     *
     * @returns The value the page now uses, or null when the value was refused and nothing changed.
     */
    setValue(theme: Theme, property: string, value: string): string | null {
        const setting = theme.properties?.find(s => s.property === property);
        if (!setting || !this.applied.has(theme.id)) return null;

        value = value.trim();
        const [verdict] = this.options.probe(theme, [[setting, value]]);
        if (verdict === "invalid") return null;

        if (verdict === "default") {
            this.removeValues(theme, [property]);
        }
        else {
            // Applied first, so a listener that reads `getValue` during the change sees the new value
            this.updateApplied(theme, {...this.applied.get(theme.id), [property]: value});
            this.updateSaved(theme.id, {...this.getSaved(theme.id), [property]: value});
        }
        return this.getValue(theme, property);
    }

    /** Removes one saved value, so the setting goes back to its default. */
    reset(theme: Theme, property: string) {
        this.removeValues(theme, [property]);
        this.flush();
    }

    /** Removes every saved value for a theme. */
    resetAll(theme: Theme) {
        this.removeValues(theme, Object.keys(this.getSaved(theme.id)));
        this.flush();
    }

    /**
     * Puts a starting theme's saved values on the page. A value is skipped when its property is no longer a setting,
     * or when it's invalid or the default under the setting's current syntax. Skipped values stay saved, because a
     * reload may come from a file that's only half written.
     */
    apply(theme: Theme) {
        const entries: Array<[ThemeSetting, string]> = [];
        for (const [property, value] of Object.entries(this.getSaved(theme.id))) {
            const setting = theme.properties?.find(s => s.property === property);
            if (setting) entries.push([setting, value]);
        }

        const verdicts = entries.length ? this.options.probe(theme, entries) : [];
        const applied: Record<string, string> = {};
        entries.forEach(([setting, value], i) => {
            if (verdicts[i] === "changed") applied[setting.property] = value;
        });

        this.applied.set(theme.id, applied);
        this.pendingWrites.delete(theme.id);
        if (Object.keys(applied).length) this.options.write(theme, applied);
    }

    /** Takes a stopping theme's values off the page. Its saved values stay. */
    remove(theme: Theme) {
        this.applied.delete(theme.id);
        this.pendingWrites.delete(theme.id);
        this.options.write(theme, noValues);
        this.options.release(theme);
    }

    /** Deletes every saved value for a theme, for when BD deletes the theme's file. */
    forget(themeId: string) {
        if (themeId in this.load()) this.updateSaved(themeId, {});
    }

    /**
     * Writes waiting changes to the page and to disk now instead of waiting. Every change that waits also changes the
     * saved values, so a flush always saves.
     */
    flush() {
        if (!this.cancelFlush) return;
        this.cancelFlush();
        this.cancelFlush = null;
        this.writeAndSave();
    }

    private load(): SavedValues {
        if (this.saved) return this.saved;
        this.saved = readSavedValues(this.options.load());
        return this.saved;
    }

    private removeValues(theme: Theme, properties: string[]) {
        // Applied first, so a listener that reads `getValue` during the change sees the new value
        const applied = this.applied.get(theme.id);
        if (applied && properties.some(p => p in applied)) this.updateApplied(theme, omit(applied, properties));

        const saved = this.getSaved(theme.id);
        if (properties.some(p => p in saved)) this.updateSaved(theme.id, omit(saved, properties));
    }

    private updateSaved(themeId: string, values: Record<string, string>) {
        const {[themeId]: _, ...rest} = this.load();
        this.saved = Object.keys(values).length ? {...rest, [themeId]: Object.freeze(values)} : rest;
        this.scheduleFlush();
        this.emitChange();
    }

    private updateApplied(theme: Theme, values: Record<string, string>) {
        this.applied.set(theme.id, values);
        this.pendingWrites.set(theme.id, theme);
        this.scheduleFlush();
    }

    /** Restarts the wait, so a drag writes once after it stops instead of on every step. */
    private scheduleFlush() {
        this.cancelFlush?.();
        this.cancelFlush = this.options.schedule(() => {
            this.cancelFlush = null;
            this.writeAndSave();
        }, this.options.delay);
    }

    private writeAndSave() {
        for (const [themeId, theme] of this.pendingWrites) this.options.write(theme, this.applied.get(themeId) ?? noValues);
        this.pendingWrites.clear();
        this.options.save(this.load());
    }
}

/** Keeps only string values under object keys, so a hand-edited or damaged file can't break a theme. */
function readSavedValues(data: unknown): SavedValues {
    const saved: SavedValues = {};
    if (!isRecord(data)) return saved;

    for (const [themeId, values] of Object.entries(data)) {
        if (!isRecord(values)) continue;
        const kept: Record<string, string> = {};
        for (const [property, value] of Object.entries(values)) {
            if (typeof value === "string" && value.trim()) kept[property] = value.trim();
        }
        if (Object.keys(kept).length) saved[themeId] = Object.freeze(kept);
    }

    return saved;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function omit(values: Readonly<Record<string, string>>, properties: string[]) {
    const copy = {...values};
    for (const property of properties) delete copy[property];
    return copy;
}

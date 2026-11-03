import Store from "@stores/base";
import type {Theme} from "@modules/thememanager";
import type {ThemeSetting} from "./types";


/** What `setValue` did: stored the value, removed a saved value because the new one is the default, or nothing. */
export type SetResult = "saved" | "default" | "invalid";

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

    /** Runs a callback before the next repaint. */
    requestFrame(callback: () => void): void;

    /** How long the disk write waits for more changes, in milliseconds. */
    saveDelay: number;
}

const noValues: Readonly<Record<string, string>> = Object.freeze({});

/**
 * Holds the values a user picked for each theme's settings, and keeps the page and the file in step with them.
 * Only values that differ from a setting's default are saved. Stopping or reloading a theme leaves its values
 * alone, so only a reset or `forget` removes them.
 *
 * It emits a change synchronously whenever the saved values change. The page updates on the next frame, and the
 * file once changes stop for `saveDelay`.
 */
export class ThemeValues extends Store {
    private options: ThemeValuesOptions;
    private saved: SavedValues | null = null;

    /** Running themes by id. */
    private running = new Map<string, Theme>();

    /** The values on the page for each running theme. A saved value that no longer fits its setting is left out. */
    private applied = new Map<string, Readonly<Record<string, string>>>();

    private pendingFrame = new Set<string>();
    private saveTimer: ReturnType<typeof setTimeout> | null = null;

    constructor(options: ThemeValuesOptions) {
        super();
        this.options = options;
    }

    /** The saved values for one theme, keyed by property. The object is replaced on every change. */
    getSaved(themeId: string): Readonly<Record<string, string>> {
        return this.load()[themeId] ?? noValues;
    }

    /** The value the page uses for a setting: the applied value, or else the setting's default. */
    getValue(theme: Theme, property: string) {
        const setting = theme.properties?.find(s => s.property === property);
        const value = this.running.has(theme.id) ? this.applied.get(theme.id)?.[property] : this.getSaved(theme.id)[property];
        return value ?? setting?.initialValue ?? "";
    }

    /**
     * Checks a value in the browser and stores it when it differs from the default. A value that computes to the
     * default removes any saved value instead. The theme must be running.
     */
    setValue(theme: Theme, property: string, value: string): SetResult {
        const setting = theme.properties?.find(s => s.property === property);
        if (!setting || !this.running.has(theme.id)) return "invalid";

        value = value.trim();
        const [verdict] = this.options.probe(theme, [[setting, value]]);
        if (verdict === "invalid") return "invalid";

        if (verdict === "default") {
            this.removeValues(theme.id, [property]);
            return "default";
        }

        this.updateSaved(theme.id, {...this.getSaved(theme.id), [property]: value});
        this.updateApplied(theme.id, {...this.applied.get(theme.id), [property]: value});
        return "saved";
    }

    /** Removes one saved value, so the setting goes back to its default. */
    reset(theme: Theme, property: string) {
        this.removeValues(theme.id, [property]);
    }

    /** Removes every saved value for a theme. */
    resetAll(theme: Theme) {
        this.removeValues(theme.id, Object.keys(this.getSaved(theme.id)));
    }

    /**
     * Puts a starting theme's saved values on the page. A value is skipped when its property is no longer a setting,
     * or when it's invalid or the default under the setting's current syntax. Skipped values stay saved, because a
     * reload may come from a file that's only half written.
     */
    apply(theme: Theme) {
        this.running.set(theme.id, theme);

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
        this.pendingFrame.delete(theme.id);
        if (Object.keys(applied).length) this.options.write(theme, applied);
    }

    /** Takes a stopping theme's values off the page. Its saved values stay. */
    remove(theme: Theme) {
        const running = this.running.get(theme.id);
        this.running.delete(theme.id);
        this.applied.delete(theme.id);
        this.pendingFrame.delete(theme.id);
        this.options.write(running ?? theme, noValues);
    }

    /** Deletes every saved value for a theme, for when BD deletes the theme's file. */
    forget(themeId: string) {
        const saved = this.load();
        if (!(themeId in saved)) return;

        const {[themeId]: _, ...rest} = saved;
        this.saved = rest;
        this.scheduleSave();
        this.emitChange();
    }

    /** Writes pending changes to disk now instead of waiting. */
    flush() {
        if (this.saveTimer === null) return;
        clearTimeout(this.saveTimer);
        this.saveTimer = null;
        this.options.save(this.load());
    }

    private load(): SavedValues {
        if (this.saved) return this.saved;
        this.saved = readSavedValues(this.options.load());
        return this.saved;
    }

    private removeValues(themeId: string, properties: string[]) {
        const saved = this.getSaved(themeId);
        if (properties.some(p => p in saved)) this.updateSaved(themeId, omit(saved, properties));

        const applied = this.applied.get(themeId);
        if (applied && properties.some(p => p in applied)) this.updateApplied(themeId, omit(applied, properties));
    }

    private updateSaved(themeId: string, values: Record<string, string>) {
        const {[themeId]: _, ...rest} = this.load();
        this.saved = Object.keys(values).length ? {...rest, [themeId]: Object.freeze(values)} : rest;
        this.scheduleSave();
        this.emitChange();
    }

    private updateApplied(themeId: string, values: Record<string, string>) {
        this.applied.set(themeId, values);
        if (this.pendingFrame.has(themeId)) return;

        this.pendingFrame.add(themeId);
        this.options.requestFrame(() => {
            if (!this.pendingFrame.delete(themeId)) return;
            const theme = this.running.get(themeId);
            if (theme) this.options.write(theme, this.applied.get(themeId) ?? noValues);
        });
    }

    private scheduleSave() {
        if (this.saveTimer !== null) clearTimeout(this.saveTimer);
        this.saveTimer = setTimeout(() => {
            this.saveTimer = null;
            this.options.save(this.load());
        }, this.options.saveDelay);
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

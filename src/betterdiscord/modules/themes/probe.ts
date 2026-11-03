import DOMManager from "@modules/dommanager";
import type {ThemeSetting} from "./types";
import type {ProbeVerdict} from "./values";


/**
 * A keyword added to each probe's syntax. The probe's parent holds it, so a value the browser refuses computes to
 * exactly this, while any valid value computes to something else.
 */
export const invalidKeyword = "bd-invalid";

const hostId = "bd-theme-settings-probe";

/** The private probe property for each setting, by theme id and then by the theme's property name. */
const probeNames = new Map<string, {settings: readonly ThemeSetting[], names: Map<string, string>}>();
let nextProbe = 0;

/**
 * Builds the private `@property` rule that probes one setting. It copies the setting's syntax and initial value,
 * adds the invalid keyword, and always inherits, so it answers the same for every theme setup and never touches
 * the theme's own property.
 */
export function probeRule(name: string, setting: ThemeSetting) {
    const syntax = `${setting.syntax.raw} | ${invalidKeyword}`.replace(/["\\]/g, "\\$&");
    return `@property ${name} { syntax: "${syntax}"; inherits: true; initial-value: ${setting.initialValue}; }`;
}

/** Compares a value's computed form with the default's. */
export function verdictFor(computedValue: string, computedDefault: string): ProbeVerdict {
    if (computedValue === invalidKeyword) return "invalid";
    if (computedValue === computedDefault) return "default";
    return "changed";
}

/**
 * Sets each value and its setting's default on hidden elements and compares what the browser computes. Reading
 * them all after setting them all costs one style recalculation for the batch.
 */
export function probeValues(themeId: string, settings: readonly ThemeSetting[], entries: Array<[ThemeSetting, string]>): ProbeVerdict[] {
    const host = getHost();
    const names = registerProbes(host, themeId, settings);

    const parent = host.querySelector("div")!;
    parent.replaceChildren();

    const pairs = entries.map(([setting, value]) => {
        const name = names.get(setting.property)!;
        const valueElement = probeElement(name, value);
        const defaultElement = probeElement(name, setting.initialValue);
        parent.append(valueElement, defaultElement);
        return [name, valueElement, defaultElement] as const;
    });

    const verdicts = pairs.map(([name, valueElement, defaultElement]) => verdictFor(
        getComputedStyle(valueElement).getPropertyValue(name).trim(),
        getComputedStyle(defaultElement).getPropertyValue(name).trim()
    ));

    parent.replaceChildren();
    return verdicts;
}

/** Removes a theme's probe rules, and the probe itself when no theme is left. */
export function releaseProbes(themeId: string) {
    if (!probeNames.delete(themeId)) return;

    const host = document.getElementById(hostId);
    if (!host) return;
    if (probeNames.size) writeProbeRules(host);
    else host.remove();
}

function probeElement(name: string, value: string) {
    const element = document.createElement("div");
    element.style.setProperty(name, value);
    return element;
}

/** The hidden probe: a style tag of probe rules, and a parent element that holds the invalid keyword. */
function getHost() {
    const existing = document.getElementById(hostId);
    if (existing) return existing;

    const host = DOMManager.createElement("div", {id: hostId, hidden: true}, DOMManager.createElement("style"), document.createElement("div"));
    DOMManager.bdThemeSettings.append(host);
    return host;
}

/** Makes sure the probe rules match the theme's current settings, which change when the theme reloads. */
function registerProbes(host: HTMLElement, themeId: string, settings: readonly ThemeSetting[]) {
    const known = probeNames.get(themeId);
    if (known?.settings === settings) return known.names;

    const names = new Map<string, string>();
    for (const setting of settings) names.set(setting.property, `--bd-probe-${nextProbe++}`);
    probeNames.set(themeId, {settings, names});
    writeProbeRules(host);
    return names;
}

function writeProbeRules(host: HTMLElement) {
    const rules: string[] = [];
    for (const {settings, names} of probeNames.values()) {
        for (const setting of settings) rules.push(probeRule(names.get(setting.property)!, setting));
    }

    host.querySelector("style")!.textContent = rules.join("\n");

    // Each probe property inherits the invalid keyword from here
    const parent = host.querySelector("div")!;
    parent.style.cssText = "";
    for (const {names} of probeNames.values()) {
        for (const name of names.values()) parent.style.setProperty(name, invalidKeyword);
    }
}

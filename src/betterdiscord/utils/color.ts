import type {HexString} from "@data/settings";

/** A color as hue (0 to 360), saturation and value (each 0 to 1), the way a picker's square and hue strip show it. */
export interface Hsv {
    h: number;
    s: number;
    v: number;
}

/** Splits a hex into its 6-digit color and its opacity from 0 to 1. A hex without alpha is fully opaque. */
export function splitAlpha(hex: HexString): [HexString, number] {
    if (/^#[0-9a-f]{8}$/i.test(hex)) return [hex.slice(0, 7) as HexString, Number.parseInt(hex.slice(7), 16) / 255];
    return [hex, 1];
}

/** Adds an opacity to a 6-digit hex, and leaves a fully opaque color at 6 digits. */
export function withAlpha(hex: HexString, alpha: number): HexString {
    const byte = Math.round(alpha * 255);
    return byte >= 255 ? hex : `${hex}${byte.toString(16).padStart(2, "0")}` as HexString;
}

/**
 * Reads a hex someone typed, with or without the `#`, in 3, 6 or (when alpha is allowed) 8 digits. Returns it
 * as a lowercase 6- or 8-digit hex, or null when it isn't one.
 */
export function readHex(text: string, allowAlpha: boolean): HexString | null {
    const digits = text.trim().replace(/^#/, "").toLowerCase();
    if (/^[0-9a-f]{3}$/.test(digits)) return `#${[...digits].map(d => d + d).join("")}` as HexString;
    if (/^[0-9a-f]{6}$/.test(digits)) return `#${digits}` as HexString;
    if (allowAlpha && /^[0-9a-f]{8}$/.test(digits)) return withAlpha(`#${digits.slice(0, 6)}` as HexString, Number.parseInt(digits.slice(6), 16) / 255);
    return null;
}

/** Converts a 6-digit hex to HSV. A grey has no hue, so it gets 0. */
export function hexToHsv(hex: HexString): Hsv {
    const [r, g, b] = [1, 3, 5].map(i => Number.parseInt(hex.slice(i, i + 2), 16) / 255);
    const max = Math.max(r, g, b);
    const range = max - Math.min(r, g, b);

    let h = 0;
    if (range > 0) {
        if (max === r) h = ((g - b) / range) % 6;
        else if (max === g) h = (b - r) / range + 2;
        else h = (r - g) / range + 4;
    }

    return {h: (h * 60 + 360) % 360, s: max === 0 ? 0 : range / max, v: max};
}

/** Converts HSV to a 6-digit hex. */
export function hsvToHex({h, s, v}: Hsv): HexString {
    const channel = (n: number) => {
        const k = (n + h / 60) % 6;
        const value = v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
        return Math.round(value * 255).toString(16).padStart(2, "0");
    };
    return `#${channel(5)}${channel(3)}${channel(1)}` as HexString;
}

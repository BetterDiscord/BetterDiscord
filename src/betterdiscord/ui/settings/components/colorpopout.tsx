import React, {useRef, useState} from "react";
import {t} from "@common/i18n";
import {PipetteIcon} from "lucide-react";
import type {HexString} from "@data/settings";
import {hexToHsv, hsvToHex, readHex, splitAlpha, withAlpha, type Hsv} from "@utils/color";

interface EyeDropperApi {
    open(): Promise<{sRGBHex: string;}>;
}

// Chromium's screen color picker, which TypeScript's DOM types don't include yet
const EyeDropper = (window as unknown as {EyeDropper?: new () => EyeDropperApi;}).EyeDropper;

const clamp = (n: number) => Math.min(1, Math.max(0, n));

export interface ColorPopoutProps {
    value: HexString;

    /** Shows the opacity strip and field, and lets the value be an 8-digit hex. */
    alpha: boolean;
    onChange(value: HexString): void;
}

/**
 * The inside of the color popout: a saturation and brightness square, a hue strip, an optional opacity strip, and
 * the hex as text. It keeps the hue while the color is grey, which the hex alone can't hold.
 */
export default function ColorPopout({value, alpha, onChange}: ColorPopoutProps) {
    const [opaqueValue, opacity] = splitAlpha(value);
    const [hsv, setHsv] = useState(() => hexToHsv(opaqueValue));

    // A value from outside the popout, such as a swatch or a reset, moves the square and strips to it
    const [shownValue, setShownValue] = useState(value);
    if (value !== shownValue) {
        setShownValue(value);
        setHsv(hexToHsv(opaqueValue));
    }

    const change = (next: Hsv, nextOpacity = opacity) => {
        const hex = alpha ? withAlpha(hsvToHex(next), nextOpacity) : hsvToHex(next);
        setHsv(next);
        setShownValue(hex);
        onChange(hex);
    };

    const changeHex = (hex: HexString) => {
        const [opaque, newOpacity] = splitAlpha(hex);
        change(hexToHsv(opaque), alpha ? newOpacity : 1);
    };

    const hueColor = hsvToHex({h: hsv.h, s: 1, v: 1});
    const percent = Math.round(opacity * 100);

    return <>
        <SaturationArea hsv={hsv} hueColor={hueColor} onChange={change} />
        <input
            type="range"
            className="bd-color-popout-strip bd-color-popout-hue"
            min={0}
            max={360}
            step={1}
            value={Math.round(hsv.h)}
            aria-label={t("Settings.hue")}
            onChange={e => change({...hsv, h: e.currentTarget.valueAsNumber})}
        />
        {alpha && <input
            type="range"
            className="bd-color-popout-strip bd-color-popout-opacity"
            min={0}
            max={100}
            step={1}
            value={percent}
            aria-label={t("Settings.opacity")}
            style={{"--bd-opacity-color": opaqueValue} as React.CSSProperties}
            onChange={e => change(hsv, e.currentTarget.valueAsNumber / 100)}
        />}
        <div className="bd-color-popout-fields">
            <HexField value={value} alpha={alpha} onChange={changeHex} />
            {alpha && <div className="bd-color-popout-percent">
                <input
                    type="number"
                    className="bd-text-input"
                    min={0}
                    max={100}
                    value={percent}
                    aria-label={t("Settings.opacity")}
                    onChange={e => {
                        const n = e.currentTarget.valueAsNumber;
                        if (Number.isFinite(n)) change(hsv, Math.min(100, Math.max(0, n)) / 100);
                    }}
                />
                <span>%</span>
            </div>}
            {EyeDropper && <button
                type="button"
                className="bd-color-popout-eyedropper"
                aria-label={t("Settings.eyedropper")}
                onClick={() => {
                    // Escape or a click elsewhere cancels the pick and rejects the promise
                    new EyeDropper().open().then(result => {
                        const picked = readHex(result.sRGBHex, false);
                        if (picked) changeHex(alpha ? withAlpha(picked, opacity) : picked);
                    }, () => {});
                }}
            >
                <PipetteIcon size="16px" />
            </button>}
        </div>
    </>;
}

interface SaturationAreaProps {
    hsv: Hsv;
    hueColor: HexString;
    onChange(hsv: Hsv): void;
}

/** The square that picks saturation (left to right) and brightness (bottom to top), by pointer or arrow keys. */
function SaturationArea({hsv, hueColor, onChange}: SaturationAreaProps) {
    const areaRef = useRef<HTMLDivElement>(null);

    const pick = (event: React.PointerEvent) => {
        const bounds = areaRef.current!.getBoundingClientRect();
        onChange({...hsv, s: clamp((event.clientX - bounds.left) / bounds.width), v: 1 - clamp((event.clientY - bounds.top) / bounds.height)});
    };

    const onKeyDown = (event: React.KeyboardEvent) => {
        const step = event.shiftKey ? 0.1 : 0.01;
        const moves: Record<string, Partial<Hsv>> = {
            ArrowLeft: {s: clamp(hsv.s - step)},
            ArrowRight: {s: clamp(hsv.s + step)},
            ArrowDown: {v: clamp(hsv.v - step)},
            ArrowUp: {v: clamp(hsv.v + step)}
        };
        if (!(event.key in moves)) return;
        event.preventDefault();
        onChange({...hsv, ...moves[event.key]});
    };

    return <div
        ref={areaRef}
        className="bd-color-popout-area"
        role="slider"
        tabIndex={0}
        aria-label={t("Settings.saturationBrightness")}
        aria-valuetext={t("Settings.saturationBrightnessValue", {saturation: Math.round(hsv.s * 100), brightness: Math.round(hsv.v * 100)})}
        style={{"--bd-hue-color": hueColor} as React.CSSProperties}
        onPointerDown={event => {
            event.currentTarget.setPointerCapture(event.pointerId);
            pick(event);
        }}
        onPointerMove={event => {
            if (event.buttons & 1) pick(event);
        }}
        onKeyDown={onKeyDown}
    >
        <div className="bd-color-popout-area-knob" style={{left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`}} />
    </div>;
}

interface HexFieldProps {
    value: HexString;
    alpha: boolean;
    onChange(value: HexString): void;
}

/** The hex as text. It keeps what the user typed until it's a whole hex, or until the value changes elsewhere. */
function HexField({value, alpha, onChange}: HexFieldProps) {
    const [draft, setDraft] = useState<{text: string; value: HexString;} | null>(null);

    return <input
        type="text"
        className="bd-text-input bd-color-popout-hex"
        spellCheck={false}
        maxLength={alpha ? 9 : 7}
        aria-label={t("Settings.hex")}
        value={draft?.value === value ? draft.text : value}
        onChange={e => {
            const text = e.currentTarget.value;
            const hex = readHex(text, alpha);
            if (hex) onChange(hex);
            setDraft({text, value: hex ?? value});
        }}
        onBlur={() => setDraft(null)}
    />;
}

import React from "react";
import DiscordModules from "@modules/discordmodules";
import {t} from "@common/i18n";
import {CheckIcon, PipetteIcon} from "lucide-react";
import type {Color as ColorType, HexString} from "@data/settings";
import {useItemProps, type BaseSettingProps} from "./utils";

const defaultColors = [1752220, 3066993, 3447003, 10181046, 15277667, 15844367, 15105570, 15158332, 9807270, 6323595, 1146986, 2067276, 2123412, 7419530, 11342935, 12745742, 11027200, 10038562, 9936031, 5533306];

// TODO: consider creating a color util
function resolveColor(color: ColorType, hex: false): number;
function resolveColor(color: ColorType, hex?: true): HexString;
function resolveColor(color: ColorType, hex = true): HexString | number {
    switch (typeof color) {
        case (hex && "number"): return `#${color.toString(16).padStart(6, "0")}`;
        case (!hex && "string"): return Number.parseInt((color as HexString).replace("#", ""), 16);
        case (!hex && "number"): return color;
        case (hex && "string"): return color;

        default: return color;
    }
};

const getRGB = (color: HexString) => {
    let result = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(color);
    if (result) return [parseInt(result[1]), parseInt(result[2]), parseInt(result[3])];

    result = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)%\s*,\s*([0-9]+(?:\.[0-9]+)?)%\s*,\s*([0-9]+(?:\.[0-9]+)?)%\s*\)/.exec(color);
    if (result) return [parseFloat(result[1]) * 2.55, parseFloat(result[2]) * 2.55, parseFloat(result[3]) * 2.55];

    result = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(color);
    if (result) return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];

    result = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(color);
    if (result) return [parseInt(result[1] + result[1], 16), parseInt(result[2] + result[2], 16), parseInt(result[3] + result[3], 16)];
};

/** Splits a hex into its 6-digit color and its opacity from 0 to 1. A hex without alpha is fully opaque. */
const splitAlpha = (hex: HexString): [HexString, number] => {
    if (/^#[0-9a-f]{8}$/i.test(hex)) return [hex.slice(0, 7) as HexString, Number.parseInt(hex.slice(7), 16) / 255];
    return [hex, 1];
};

/** Adds an opacity to a 6-digit hex, and leaves a fully opaque color at 6 digits. */
const withAlpha = (hex: HexString, alpha: number): HexString => {
    const byte = Math.round(alpha * 255);
    return byte >= 255 ? hex : `${hex}${byte.toString(16).padStart(2, "0")}` as HexString;
};

const luma = (color: HexString | number[]) => {
    const rgb = (typeof (color) === "string") ? getRGB(color) : color;
    return (0.2126 * rgb![0]) + (0.7152 * rgb![1]) + (0.0722 * rgb![2]); // SMPTE C, Rec. 709 weightings
};

const getContrastColor = (color: HexString | number[]) => {
    return (luma(color) >= 150) ? "#000" : "#fff";
};

interface ColorpickerPropsBase {
    colors?: ColorType[];
    defaultColor?: ColorType;

    /**
     * Shows an opacity slider under the picker, and lets the value be an 8-digit hex such as `#5865f280`. A fully
     * opaque color stays a 6-digit hex.
     */
    alpha?: boolean;
}

export type ColorpickerProps = ColorpickerPropsBase & BaseSettingProps<ColorType>;

export default function ColorPicker(props: ColorpickerProps) {
    const {colors = defaultColors, defaultColor, alpha} = props;

    // The system picker can't show alpha, so a new pick keeps the current opacity
    const {state, setState, disabled} = useItemProps<ColorType, ColorType | React.ChangeEvent<HTMLInputElement>>(props, (e, current) => {
        if (typeof e !== "object") return resolveColor(e);
        const picked = e.currentTarget.value as HexString;
        return alpha ? withAlpha(picked, splitAlpha(resolveColor(current, true))[1]) : resolveColor(picked);
    });

    const intValue: number = resolveColor(state, false);
    const hexValue: HexString = resolveColor(state, true);
    const [opaqueValue, opacity] = splitAlpha(hexValue);
    const percent = Math.round(opacity * 100);

    const opacitySlider = alpha && <div className="bd-color-picker-opacity">
        <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={percent}
            disabled={disabled}
            aria-label={t("Settings.opacity")}
            style={{"--bd-opacity-color": opaqueValue} as React.CSSProperties}
            onChange={e => setState(withAlpha(opaqueValue, Number(e.currentTarget.value) / 100))}
        />
        <span className="bd-color-picker-opacity-value">{percent}%</span>
    </div>;

    // With alpha, the faces paint the color over a checkerboard, so a see-through color shows as one
    const face = (color: ColorType) => alpha ? {"--bd-picker-face": resolveColor(color)} as React.CSSProperties : {backgroundColor: resolveColor(color)};

    const controls = <div className="bd-color-picker-controls">
            {defaultColor && <DiscordModules.Tooltip text="Default" position="bottom">
                {tooltipProps => (
                    <button {...tooltipProps} type="button" aria-label="Default" aria-pressed={intValue === resolveColor(defaultColor, false)} disabled={disabled} className="bd-color-picker-default" style={face(defaultColor)} onClick={() => setState(defaultColor)}>
                        {intValue === resolveColor(defaultColor, false)
                            ? <CheckIcon size="25px" color={getContrastColor(resolveColor(defaultColor, true))} />
                            : null
                        }
                    </button>
                )}
            </DiscordModules.Tooltip>}
            <DiscordModules.Tooltip text={t("Settings.customColor")} position="bottom">
                {tooltipProps => (
                    <div className="bd-color-picker-custom" style={alpha ? face(hexValue) : undefined}>
                        <PipetteIcon size="14px" color={getContrastColor(opaqueValue)} />
                        <input {...tooltipProps} style={{backgroundColor: opaqueValue}} type="color" className="bd-color-picker" value={opaqueValue} onChange={setState} disabled={disabled} />
                    </div>
                )}
            </DiscordModules.Tooltip>
        </div>;

    return <div className={`bd-color-picker-container${disabled ? " bd-color-picker-disabled" : ""}${alpha ? " bd-color-picker-alpha" : ""}`}>
        {alpha ? <div className="bd-color-picker-column">{controls}{opacitySlider}</div> : controls}
        {colors?.length > 0 && <div className="bd-color-picker-swatch" role="group" aria-label={t("Settings.presetColors")}>
            {
                colors.map((int, index) => (
                    <button key={index} type="button" aria-label={resolveColor(int)} aria-pressed={intValue === resolveColor(int, false)} disabled={disabled} className="bd-color-picker-swatch-item" style={{backgroundColor: resolveColor(int)}} onClick={() => setState(int)}>
                        {intValue === resolveColor(int, false)
                            ? <CheckIcon size="16px" color={getContrastColor(hexValue)} />
                            : null
                        }
                    </button>
                ))
            }
        </div>}
    </div>;
}
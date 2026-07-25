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
        case (hex && "number"): return `#${color.toString(16)}`;
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
}

export type ColorpickerProps = ColorpickerPropsBase & BaseSettingProps<ColorType>;

export default function ColorPicker(props: ColorpickerProps) {
    const {colors = defaultColors, defaultColor} = props;

    const {state, setState, disabled} = useItemProps<ColorType, ColorType | React.ChangeEvent<HTMLInputElement>>(props, (e) => {
        if (typeof e === "object") return resolveColor(e.currentTarget.value as ColorType);
        return resolveColor(e);
    });

    const intValue: number = resolveColor(state, false);
    const hexValue: HexString = resolveColor(state, true);

    return <div className={`bd-color-picker-container${disabled ? " bd-color-picker-disabled" : ""}`}>
        <div className="bd-color-picker-controls">
            {defaultColor && <DiscordModules.Tooltip text="Default" position="bottom">
                {tooltipProps => (
                    <div {...tooltipProps} className="bd-color-picker-default" style={{backgroundColor: resolveColor(defaultColor)}} onClick={() => setState(defaultColor)}>
                        {intValue === resolveColor(defaultColor, false)
                            ? <CheckIcon size="25px" color={getContrastColor(resolveColor(defaultColor, true))} />
                            : null
                        }
                    </div>
                )}
            </DiscordModules.Tooltip>}
            <DiscordModules.Tooltip text={t("Settings.customColor")} position="bottom">
                {tooltipProps => (
                    <div className="bd-color-picker-custom">
                        <PipetteIcon size="14px" color={getContrastColor(hexValue)} />
                        <input {...tooltipProps} style={{backgroundColor: hexValue}} type="color" className="bd-color-picker" value={hexValue} onChange={setState} disabled={disabled} />
                    </div>
                )}
            </DiscordModules.Tooltip>
        </div>
        {colors?.length > 0 && <div className="bd-color-picker-swatch">
            {
                colors.map((int, index) => (
                    <div key={index} className="bd-color-picker-swatch-item" style={{backgroundColor: resolveColor(int)}} onClick={() => setState(int)}>
                        {intValue === int
                            ? <CheckIcon size="16px" color={getContrastColor(hexValue)} />
                            : null
                        }
                    </div>
                ))
            }
        </div>}
    </div>;
}
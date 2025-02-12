import React from "@modules/react";
import DiscordModules from "@modules/discordmodules";
import Strings from "@modules/strings";
import {CheckIcon, PipetteIcon} from "lucide-react";
import {none, SettingsContext} from "@ui/contexts";

const {useState, useCallback, useContext} = React;


const defaultColors = [1752220, 3066993, 3447003, 10181046, 15277667, 15844367, 15105570, 15158332, 9807270, 6323595, 1146986, 2067276, 2123412, 7419530, 11342935, 12745742, 11027200, 10038562, 9936031, 5533306];

const resolveColor = (color, hex = true) => {
    switch (typeof color) {
        case (hex && "number"): return `#${color.toString(16)}`;
        case (!hex && "string"): return Number.parseInt(color.replace("#", ""), 16);
        case (!hex && "number"): return color;
        case (hex && "string"): return color;

        default: return color;
    }
};

const getRGB = (color) => {
    let result = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(color);
    if (result) return [parseInt(result[1]), parseInt(result[2]), parseInt(result[3])];

    result = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)%\s*,\s*([0-9]+(?:\.[0-9]+)?)%\s*,\s*([0-9]+(?:\.[0-9]+)?)%\s*\)/.exec(color);
    if (result) return [parseFloat(result[1]) * 2.55, parseFloat(result[2]) * 2.55, parseFloat(result[3]) * 2.55];

    result = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(color);
    if (result) return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];

    result = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(color);
    if (result) return [parseInt(result[1] + result[1], 16), parseInt(result[2] + result[2], 16), parseInt(result[3] + result[3], 16)];
};

const luma = (color) => {
    const rgb = (typeof (color) === "string") ? getRGB(color) : color;
    return (0.2126 * rgb[0]) + (0.7152 * rgb[1]) + (0.0722 * rgb[2]); // SMPTE C, Rec. 709 weightings
};

const getContrastColor = (color) => {
    return (luma(color) >= 150) ? "#000" : "#fff";
};


export default function Color({value: initialValue, onChange, colors = defaultColors, defaultValue, disabled}) {
    const [internalValue, setValue] = useState(initialValue);
    const contextValue = useContext(SettingsContext);

    const value = contextValue !== none ? contextValue : internalValue;

    const change = useCallback((e) => {
        if (disabled) return;
        onChange?.(resolveColor(e.target.value));
        setValue(e.target.value);
    }, [onChange, disabled]);

    const intValue = resolveColor(value, false);
    return <div className={`bd-color-picker-container ${disabled ? "bd-color-picker-disabled" : ""}`}>
        <div className="bd-color-picker-controls">
            {defaultValue && <DiscordModules.Tooltip text="Default" position="bottom">
                {props => (
                    <div {...props} className="bd-color-picker-default" style={{backgroundColor: resolveColor(defaultValue)}} onClick={() => change({target: {value: defaultValue}})}>
                        {intValue === resolveColor(defaultValue, false)
                            ? <CheckIcon size="25px" color={getContrastColor(resolveColor(defaultValue, true))} />
                            : null
                        }
                    </div>
                )}
            </DiscordModules.Tooltip>}
            <DiscordModules.Tooltip text={Strings.Settings.customColor} position="bottom">
                {props => (
                    <div className="bd-color-picker-custom">
                        <PipetteIcon size="14px" color={getContrastColor(resolveColor(value, true))} />
                        <input {...props} style={{backgroundColor: resolveColor(value)}} type="color" className="bd-color-picker" value={resolveColor(value)} onChange={change} disabled={disabled} />
                    </div>
                )}
            </DiscordModules.Tooltip>
        </div>
        {colors?.length > 0 && <div className="bd-color-picker-swatch">
            {
                colors.map((int, index) => (
                    <div key={index} className="bd-color-picker-swatch-item" style={{backgroundColor: resolveColor(int)}} onClick={() => change({target: {value: int}})}>
                        {intValue === int
                            ? <CheckIcon size="16px" color={getContrastColor(resolveColor(value, true))} />
                            : null
                        }
                    </div>
                ))
            }
        </div>}
    </div>;
}
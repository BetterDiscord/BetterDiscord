import React, {useEffect, useLayoutEffect, useRef, useState} from "react";
import DiscordModules from "@modules/discordmodules";
import {t} from "@common/i18n";
import {CheckIcon, PipetteIcon} from "lucide-react";
import type {Color as ColorType, HexString} from "@data/settings";
import {splitAlpha} from "@utils/color";
import {useItemProps, type BaseSettingProps} from "./utils";
import ColorPopout from "./colorpopout";

const defaultColors = [1752220, 3066993, 3447003, 10181046, 15277667, 15844367, 15105570, 15158332, 9807270, 6323595, 1146986, 2067276, 2123412, 7419530, 11342935, 12745742, 11027200, 10038562, 9936031, 5533306];

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
     * Shows an opacity strip and field in the picker, and lets the value be an 8-digit hex such as `#5865f280`. A
     * fully opaque color stays a 6-digit hex.
     */
    alpha?: boolean;
}

export type ColorpickerProps = ColorpickerPropsBase & BaseSettingProps<ColorType>;

// The faces and swatches paint their color over a checkerboard, so a see-through color shows as one
const faceStyle = (color: ColorType) => ({"--bd-picker-face": resolveColor(color)} as React.CSSProperties);

export default function ColorPicker(props: ColorpickerProps) {
    const {colors = defaultColors, defaultColor, alpha = false} = props;
    // Swatches and defaults can be numbers, so every pick goes out as a hex
    const {state, setState, disabled} = useItemProps<ColorType>(props, color => resolveColor(color));

    const intValue: number = resolveColor(state, false);
    const hexValue: HexString = resolveColor(state, true);
    const [opaqueValue] = splitAlpha(hexValue);

    const faceRef = useRef<HTMLButtonElement>(null);
    const popoutRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);

    // The face opens the popout, the same way BD's dropdown opens its list, and the popout closes once the face
    // scrolls out of view
    useLayoutEffect(() => {
        const face = faceRef.current;
        const popout = popoutRef.current;
        if (!face || !popout) return;

        face.popoverTargetElement = popout;
        face.popoverTargetAction = "toggle";

        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) popout.togglePopover(false);
        });
        observer.observe(face);
        return () => observer.disconnect();
    }, []);

    // Discord's modal closes on Escape too, so while the popout is open it takes the key first and closes only itself
    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== "Escape") return;
            event.stopImmediatePropagation();
            event.preventDefault();
            const hadFocus = popoutRef.current?.contains(document.activeElement);
            popoutRef.current?.hidePopover();
            if (hadFocus) faceRef.current?.focus();
        };
        document.addEventListener("keydown", onKeyDown, true);
        return () => document.removeEventListener("keydown", onKeyDown, true);
    }, [isOpen]);

    return <div className={`bd-color-picker-container${disabled ? " bd-color-picker-disabled" : ""}`}>
        <div className="bd-color-picker-controls">
            {defaultColor && <DiscordModules.Tooltip text={t("Settings.defaultColor")} position="bottom">
                {tooltipProps => (
                    <button {...tooltipProps} type="button" aria-label={t("Settings.defaultColor")} aria-pressed={intValue === resolveColor(defaultColor, false)} disabled={disabled} className="bd-color-picker-default" style={faceStyle(defaultColor)} onClick={() => setState(defaultColor)}>
                        {intValue === resolveColor(defaultColor, false)
                            ? <CheckIcon size="25px" color={getContrastColor(resolveColor(defaultColor, true))} />
                            : null
                        }
                    </button>
                )}
            </DiscordModules.Tooltip>}
            <div className="bd-color-picker-custom">
                <DiscordModules.Tooltip text={t("Settings.customColor")} position="bottom">
                    {tooltipProps => (
                        <button {...tooltipProps} ref={faceRef} type="button" className="bd-color-picker" aria-label={t("Settings.customColor")} aria-haspopup="dialog" aria-expanded={isOpen} disabled={disabled} style={faceStyle(hexValue)}>
                            <PipetteIcon size="14px" color={getContrastColor(opaqueValue)} />
                        </button>
                    )}
                </DiscordModules.Tooltip>
                <div ref={popoutRef} popover="auto" role="dialog" aria-label={t("Settings.customColor")} className="bd-color-popout" onToggle={e => setIsOpen(e.newState === "open")}>
                    {isOpen && <ColorPopout value={hexValue} alpha={alpha} onChange={setState} />}
                </div>
            </div>
        </div>
        {colors?.length > 0 && <div className="bd-color-picker-swatch" role="group" aria-label={t("Settings.presetColors")}>
            {
                colors.map((int, index) => (
                    <button key={index} type="button" aria-label={resolveColor(int)} aria-pressed={intValue === resolveColor(int, false)} disabled={disabled} className="bd-color-picker-swatch-item" style={faceStyle(int)} onClick={() => setState(int)}>
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

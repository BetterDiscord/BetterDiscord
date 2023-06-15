import React from "@modules/react";
import Utilities from "@modules/utilities";


export const Colors = Object.freeze({
    STANDARD: "bd-text-normal",
    MUTED: "bd-text-muted",
    ERROR: "bd-text-error",
    BRAND: "bd-text-brand",
    LINK: "bd-text-link",
    HEADER_PRIMARY: "bd-header-primary",
    HEADER_SECONDARY: "bd-header-secondary",
    STATUS_YELLOW: "bd-text-yellow",
    STATUS_GREEN: "bd-text-green",
    STATUS_RED: "bd-text-red",
    ALWAYS_WHITE: "bd-text-white",
    CUSTOM: null
});


export const Sizes = Object.freeze({
    SIZE_10: "bd-text-10",
    SIZE_12: "bd-text-12",
    SIZE_14: "bd-text-14",
    SIZE_16: "bd-text-16",
    SIZE_20: "bd-text-20",
    SIZE_24: "bd-text-24",
    SIZE_32: "bd-text-32"
});


export default function Text({tag: Tag = "div", className, children, color = Colors.STANDARD, size = Sizes.SIZE_14, selectable, strong, style}) {
    return <Tag
                className={
                    Utilities.className(
                        color, size, className,
                        {
                            "bd-selectable": selectable,
                            "bd-text-strong": strong
                        }
                    )}
                style={style}
            >
            {children}
            </Tag>;
}

Text.Colors = Colors;
Text.Sizes = Sizes;

// te = WebpackModules.getModule(m => m?.Sizes?.SIZE_32 && m.Colors)
// foo = []
// for (const color in te.Colors) foo.push(BdApi.React.createElement(te, {color: te.Colors[color]}, color))
// for (const size in te.Sizes) foo.push(BdApi.React.createElement(te, {size: te.Sizes[size]}, size))
// BdApi.showConfirmationModal("Text Elements", foo)
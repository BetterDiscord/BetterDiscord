import clsx from "clsx";
import React from "@modules/react";
import type {CSSProperties, ElementType, HTMLAttributes, PropsWithChildren} from "react";


export const TextColors = Object.freeze({
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


export const TextSizes = Object.freeze({
    SIZE_10: "bd-text-10",
    SIZE_12: "bd-text-12",
    SIZE_14: "bd-text-14",
    SIZE_16: "bd-text-16",
    SIZE_20: "bd-text-20",
    SIZE_24: "bd-text-24",
    SIZE_32: "bd-text-32"
});


type TextProps = PropsWithChildren<{
    tag?: ElementType<HTMLAttributes<HTMLElement>>;
    className?: string;
    color?: typeof TextColors[keyof typeof TextColors];
    size?: typeof TextSizes[keyof typeof TextSizes];
    selectable?: boolean;
    strong?: boolean;
    style?: CSSProperties;
    [other: string]: any;
}>;
export default function Text({tag: Tag = "div", className = "", children = null, color = TextColors.STANDARD, size = TextSizes.SIZE_14, selectable, strong, style, ...props}: TextProps) {
    return <Tag
        className={
            clsx(
                color, size, className,
                {
                    "bd-selectable": selectable,
                    "bd-text-strong": strong
                }
            )}
        style={style}
        {...props}
    >
        {children}
    </Tag>;
}

Text.Colors = TextColors;
Text.Sizes = TextSizes;
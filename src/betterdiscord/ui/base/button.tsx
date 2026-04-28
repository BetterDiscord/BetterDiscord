import clsx from "clsx";
import React from "@modules/react";
import type {KeyboardEventHandler, MouseEvent, MouseEventHandler, PropsWithChildren, RefObject} from "react";


const {useCallback} = React;

export const ButtonLooks = Object.freeze({
    FILLED: "bd-button-filled",
    OUTLINED: "bd-button-outlined",
    LINK: "bd-button-link",
    BLANK: "bd-button-blank"
});

export const ButtonColors = Object.freeze({
    BRAND: "bd-button-color-brand",
    BLURPLE: "bd-button-color-blurple",
    RED: "bd-button-color-red",
    GREEN: "bd-button-color-green",
    YELLOW: "bd-button-color-yellow",
    PRIMARY: "bd-button-color-primary",
    LINK: "bd-button-color-link",
    WHITE: "bd-button-color-white",
    TRANSPARENT: "bd-button-color-transparent",
    CUSTOM: ""
});


export const ButtonSizes = Object.freeze({
    NONE: "",
    TINY: "bd-button-tiny",
    SMALL: "bd-button-small",
    MEDIUM: "bd-button-medium",
    LARGE: "bd-button-large",
    ICON: "bd-button-icon"
});


export type ButtonProps = PropsWithChildren<{
    className?: string;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    onKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
    buttonRef?: RefObject<HTMLButtonElement | null>;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
    look?: typeof ButtonLooks[keyof typeof ButtonLooks];
    color?: typeof ButtonColors[keyof typeof ButtonColors];
    size?: typeof ButtonSizes[keyof typeof ButtonSizes];
    grow?: boolean;
}>;

export default function Button({
    className,
    children,
    onClick,
    onKeyDown,
    buttonRef,
    disabled = false,
    type = "button",
    look = ButtonLooks.FILLED,
    color = ButtonColors.BRAND,
    size = ButtonSizes.MEDIUM,
    grow = true,
    ...others
}: ButtonProps) {

    const handleClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
        onClick?.(event);
    }, [onClick]);

    return <button {...others} className={
        clsx(
            "bd-button",
            className,
            look,
            color,
            size,
            grow ? "bd-button-grow" : ""
        )}
        ref={buttonRef}
        type={type === "button" ? undefined : type}
        onClick={disabled ? () => {} : handleClick}
        onKeyDown={disabled ? () => {} : onKeyDown}
        disabled={disabled}
    >
        <div className="bd-button-content">{children}</div>
    </button>;
}

Button.Looks = ButtonLooks;
Button.Colors = ButtonColors;
Button.Sizes = ButtonSizes;
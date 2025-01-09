import React from "@modules/react";
import Utilities from "@modules/utilities";

// S.Looks = y;
// S.Colors = I;
// S.BorderColors = O;
// S.Hovers = T;
// S.Sizes = v;

const {useCallback} = React;

export const Looks = Object.freeze({
    FILLED: "bd-button-filled",
    OUTLINED: "bd-button-outlined",
    LINK: "bd-button-link",
    BLANK: "bd-button-blank"
});

export const Colors = Object.freeze({
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


export const Sizes = Object.freeze({
    NONE: "",
    TINY: "bd-button-tiny",
    SMALL: "bd-button-small",
    MEDIUM: "bd-button-medium",
    LARGE: "bd-button-large",
    ICON: "bd-button-icon"
});


export default function Button({
    className,
    children,
    onClick,
    onKeyDown,
    buttonRef,
    disabled = false,
    type = "button",
    look = Looks.FILLED,
    color = Colors.BRAND,
    size = Sizes.MEDIUM,
    grow = true,
    ...others
}) {
    
    const handleClick = useCallback(event => {
        event.preventDefault();
        event.stopPropagation();
        onClick?.(event);
    }, [onClick]);
    
    return <button {...others} className={
        Utilities.className(
            "bd-button",
            className,
            look,
            color,
            size,
            grow ? "bd-button-grow" : ""
        )}
        ref={buttonRef}
        type={type === "button" ? null : type}
        onClick={disabled ? () => {} : handleClick}
        onKeyDown={disabled ? () => {} : onKeyDown}
        disabled={disabled}
        >
        <div className="bd-button-content">{children}</div>
    </button>;
}

Button.Looks = Looks;
Button.Colors = Colors;
Button.Sizes = Sizes;
// window.BDButton = Button;
// (() => {
//     const buttons = [];
//     for (const look in window.BDButton.Looks) {
//         if (!window.BDButton.Looks[look] || look === "BLANK") continue;
//         for (const color in window.BDButton.Colors) {
//             if (!window.BDButton.Colors[color]) continue;
//             for (const size in window.BDButton.Sizes) {
//                 if (!window.BDButton.Sizes[size]) continue;
//                 buttons.push(window.BdApi.React.createElement(window.BDButton, {
//                     look: window.BDButton.Looks[look],
//                     color: window.BDButton.Colors[color],
//                     size: window.BDButton.Sizes[size]
//                 }, "Hello World!"));
//                 buttons.push(window.BdApi.React.createElement("br"));
//             }
//         }
//     }
//     window.BdApi.showConfirmationModal("Buttons", buttons);
// })();
import React from "@modules/react";
import Utilities from "@modules/utilities";


export const Direction = Object.freeze({
    VERTICAL: "bd-flex-vertical",
    HORIZONTAL: "bd-flex-horizontal",
    HORIZONTAL_REVERSE: "bd-flex-reverse"
});

export const Justify = Object.freeze({
    START: "bd-flex-justify-start",
    END: "bd-flex-justify-end",
    CENTER: "bd-flex-justify-center",
    BETWEEN: "bd-flex-justify-between",
    AROUND: "bd-flex-justify-around"
});

export const Align = Object.freeze({
    START: "bd-flex-align-start",
    END: "bd-flex-align-end",
    CENTER: "bd-flex-align-center",
    STRETCH: "bd-flex-align-stretch",
    BASELINE: "bd-flex-align-baseline"
});

export const Wrap = Object.freeze({
    NO_WRAP: "bd-flex-no-wrap",
    WRAP: "bd-flex-wrap",
    WRAP_REVERSE: "bd-flex-wrap-reverse"
});


export function Child(props) {
    if (!props.className) props.className = "";
    props.className = Utilities.className(props.className, "bd-flex-child");
    return <Flex {...props} />;
}


export default function Flex({
        children,
        className,
        style,
        shrink = 1,
        grow = 1,
        basis = "auto",
        direction = Direction.HORIZONTAL,
        align = Align.STRETCH,
        justify = Justify.START,
        wrap = Wrap.NO_WRAP,
        ...props
    }) {
    return <div
                {...props}
                className={Utilities.className(
                    "bd-flex",
                    direction,
                    justify,
                    align,
                    wrap,
                    className
                )}
                style={Object.assign({
                    flexShrink: shrink,
                    flexGrow: grow,
                    flexBasis: basis
                }, style)}
            >
        {children}
        </div>;
}

Flex.Child = Child;
Flex.Direction = Direction;
Flex.Align = Align;
Flex.Justify = Justify;
Flex.Wrap = Wrap;
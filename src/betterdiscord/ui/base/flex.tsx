import clsx from "clsx";
import React from "@modules/react";
import type {CSSProperties, MouseEventHandler, PropsWithChildren} from "react";


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


export function Child(props: {className?: string;[x: string]: any;}) {
    if (!props.className) props.className = "";
    props.className = clsx(props.className, "bd-flex-child");
    return <Flex {...props} />;
}

type FlexProps = PropsWithChildren<{
    id?: string;
    className?: string;
    style?: CSSProperties;
    shrink?: number;
    grow?: number;
    basis?: "auto",
    justify?: typeof Justify[keyof typeof Justify];
    direction?: typeof Direction[keyof typeof Direction];
    align?: typeof Align[keyof typeof Align];
    wrap?: typeof Wrap[keyof typeof Wrap];
    onClick?: MouseEventHandler<HTMLDivElement>;
}>;

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
}: FlexProps) {
    return <div
        {...props}
        className={clsx(
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
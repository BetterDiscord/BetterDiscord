import clsx from "clsx";
import React, {type CSSProperties, type MouseEventHandler, type PropsWithChildren} from "react";


export const FlexDirection = Object.freeze({
    VERTICAL: "bd-flex-vertical",
    HORIZONTAL: "bd-flex-horizontal",
    HORIZONTAL_REVERSE: "bd-flex-reverse"
});

export const FlexJustify = Object.freeze({
    START: "bd-flex-justify-start",
    END: "bd-flex-justify-end",
    CENTER: "bd-flex-justify-center",
    BETWEEN: "bd-flex-justify-between",
    AROUND: "bd-flex-justify-around"
});

export const FlexAlign = Object.freeze({
    START: "bd-flex-align-start",
    END: "bd-flex-align-end",
    CENTER: "bd-flex-align-center",
    STRETCH: "bd-flex-align-stretch",
    BASELINE: "bd-flex-align-baseline"
});

export const FlexWrap = Object.freeze({
    NO_WRAP: "bd-flex-no-wrap",
    WRAP: "bd-flex-wrap",
    WRAP_REVERSE: "bd-flex-wrap-reverse"
});


export function FlexChild(props: {className?: string;[x: string]: any;}) {
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
    justify?: typeof FlexJustify[keyof typeof FlexJustify];
    direction?: typeof FlexDirection[keyof typeof FlexDirection];
    align?: typeof FlexAlign[keyof typeof FlexAlign];
    wrap?: typeof FlexWrap[keyof typeof FlexWrap];
    onClick?: MouseEventHandler<HTMLDivElement>;
}>;

export default function Flex(props: FlexProps) {
    const {
        children,
        className,
        style,
        shrink = 1,
        grow = 1,
        basis = "auto",
        direction = FlexDirection.HORIZONTAL,
        align = FlexAlign.STRETCH,
        justify = FlexJustify.START,
        wrap = FlexWrap.NO_WRAP,
        ...rest
    } = props;

    return <div
        {...rest}
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

Flex.Child = FlexChild;
Flex.Direction = FlexDirection;
Flex.Align = FlexAlign;
Flex.Justify = FlexJustify;
Flex.Wrap = FlexWrap;
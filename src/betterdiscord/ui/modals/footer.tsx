import clsx from "clsx";
import React from "@modules/react";

import Flex from "../base/flex";
import type {PropsWithChildren} from "react";


type FooterProps = PropsWithChildren<{
    id?: string;
    className?: string;
    justify?: typeof Flex.Justify[keyof typeof Flex.Justify];
    direction?: typeof Flex.Direction[keyof typeof Flex.Direction];
    align?: typeof Flex.Align[keyof typeof Flex.Align];
    wrap?: typeof Flex.Wrap[keyof typeof Flex.Wrap];
}>;

export default function Footer({id, className, children, justify, direction, align, wrap}: FooterProps) {
    return <Flex
                id={id}
                className={clsx("bd-modal-footer", className)}
                grow={0}
                shrink={0}
                direction={direction ?? Flex.Direction.HORIZONTAL_REVERSE}
                justify={justify ?? Flex.Justify.START}
                align={align ?? Flex.Align.STRETCH}
                wrap={wrap ?? Flex.Wrap.NO_WRAP}
            >
        {children}
    </Flex>;
}
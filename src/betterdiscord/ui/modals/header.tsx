import clsx from "clsx";
import React from "@modules/react";

import Flex from "../base/flex";
import type {PropsWithChildren} from "react";


export default function Header({id, className, children}: PropsWithChildren<{id?: string; className?: string;}>) {
    return <Flex
                id={id}
                className={clsx("bd-modal-header", className)}
                grow={0}
                shrink={0}
                direction={Flex.Direction.HORIZONTAL}
                justify={Flex.Justify.START}
                align={Flex.Align.CENTER}
                wrap={Flex.Wrap.NO_WRAP}
            >
        {children}
    </Flex>;
}
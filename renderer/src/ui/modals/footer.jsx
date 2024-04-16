import React from "@modules/react";
import Utilities from "@modules/utilities";

import Flex from "../base/flex";


export default function Footer({id, className, children, justify, direction, align, wrap}) {
    return <Flex
                id={id}
                className={Utilities.className("bd-modal-footer", className)}
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
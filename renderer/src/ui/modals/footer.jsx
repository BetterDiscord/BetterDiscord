import {React, Utilities} from "modules";
import Flex from "../base/flex";


export default function Footer({id, className, children}) {
    return <Flex
                id={id}
                className={Utilities.className("bd-modal-footer", className)}
                grow={0}
                shrink={0}
                direction={Flex.Direction.HORIZONTAL_REVERSE}
                justify={Flex.Justify.START}
                align={Flex.Align.STRETCH}
                wrap={Flex.Wrap.NO_WRAP}
            >
        {children}
    </Flex>;
}
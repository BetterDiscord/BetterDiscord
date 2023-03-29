import {React, Utilities} from "modules";
import Flex from "../base/flex";


export default function Header({id, className, children}) {
    return <Flex
                id={id}
                className={Utilities.className("bd-modal-header", className)}
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
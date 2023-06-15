import React from "@modules/react";
import Utilities from "@modules/utilities";


export default function Content({id, className, children, scroller = true}) {
    return <div id={id} className={Utilities.className("bd-modal-content", {"bd-scroller-base bd-scroller-thin": scroller}, className)}>
        {children}
    </div>;
}
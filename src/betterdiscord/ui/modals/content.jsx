import clsx from "clsx";
import React from "@modules/react";


export default function Content({id, className, children, scroller = true}) {
    return <div id={id} className={clsx("bd-modal-content", {"bd-scroller-base bd-scroller-thin": scroller}, className)}>
        {children}
    </div>;
}
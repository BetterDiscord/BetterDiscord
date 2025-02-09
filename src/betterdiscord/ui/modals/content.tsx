import clsx from "clsx";
import React from "@modules/react";
import type {PropsWithChildren} from "react";


export default function Content({id, className, children, scroller = true}: PropsWithChildren<{id?: string; className?: string; scroller?: boolean}>) {
    return <div id={id} className={clsx("bd-modal-content", {"bd-scroller-base bd-scroller-thin": scroller}, className)}>
        {children}
    </div>;
}
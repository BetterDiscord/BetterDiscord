import {React, Utilities} from "modules";


export default function Content({id, className, children, scroller = true}) {
    return <div id={id} className={Utilities.className("bd-modal-content", {"bd-scroller-base bd-scroller-thin": scroller}, className)}>
        {children}
    </div>;
}
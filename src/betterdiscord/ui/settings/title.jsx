import React from "@modules/react";

import Button from "../base/button";

const {useCallback} = React;


const basicClass = "bd-settings-title";
const groupClass = "bd-settings-title bd-settings-group-title";

export default function SettingsTitle({isGroup, className, button, onClick, text, children}) {
    const click = useCallback((event) => {
        event.stopPropagation();
        event.preventDefault();
        button?.onClick?.(event);
    }, [button]);


    const baseClass = isGroup ? groupClass : basicClass;
    const titleClass = className ? `${baseClass} ${className}` : baseClass;
    return <h2 className={titleClass} onClick={() => {onClick?.();}}>
            {text}
            {button && <Button className="bd-button-title" onClick={click} size={Button.Sizes.NONE}>{button.title}</Button>}
            {children}
            </h2>;

}
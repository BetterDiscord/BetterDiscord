import React from "@modules/react";

const {useCallback} = React;


const basicClass = "bd-settings-title";
const groupClass = "bd-settings-title bd-settings-group-title";

export default function SettingsTitle({isGroup, className, button, onClick, text, otherChildren}) {
    const click = useCallback((event) => {
        event.stopPropagation();
        event.preventDefault();
        button?.onClick?.(event);
    }, [button]);


    const baseClass = isGroup ? groupClass : basicClass;
    const titleClass = className ? `${baseClass} ${className}` : baseClass;
    return <h2 className={titleClass} onClick={() => {onClick?.();}}>
            {text}
            {button && <button className="bd-button bd-button-title" onClick={click}>{button.title}</button>}
            {otherChildren}
            </h2>;

}
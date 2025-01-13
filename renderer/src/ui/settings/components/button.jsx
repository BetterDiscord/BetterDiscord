import React from "@modules/react";

const {useCallback} = React;


export default function Button({value: initialValue, onClick, disabled}) {
    const handleClick = useCallback(event => {
        onClick?.(event);
    }, [onClick]);
    return <input onClick={handleClick} type="button" className="bd-button bd-button-filled bd-button-color-brand bd-button-medium" value={initialValue} disabled={disabled}></input>;
}
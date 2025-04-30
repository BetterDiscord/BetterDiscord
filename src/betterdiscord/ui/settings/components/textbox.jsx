import React from "@modules/react";
import {none, SettingsContext} from "@ui/contexts";

const {useState, useCallback, useContext} = React;


export default function Textbox({value: initialValue, maxLength, placeholder, onKeyDown, onChange, disabled}) {
    const [internalValue, setValue] = useState(initialValue);
    const contextValue = useContext(SettingsContext);

    const value = contextValue !== none ? contextValue : internalValue;

    const change = useCallback((e) => {
        if (disabled) return;
        onChange?.(e.target.value);
        setValue(e.target.value);
    }, [onChange, disabled]);

    return <input onChange={change} onKeyDown={onKeyDown} type="text" className="bd-text-input" placeholder={placeholder} maxLength={maxLength} value={value} disabled={disabled} />;
}
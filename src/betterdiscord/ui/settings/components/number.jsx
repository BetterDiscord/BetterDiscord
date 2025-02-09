import React from "@modules/react";
import {none, SettingsContext} from "@ui/contexts";

const {useState, useCallback, useContext} = React;


export default function Number({value: initialValue, min, max, step, onChange, disabled}) {
    const [internalValue, setValue] = useState(initialValue);
    const contextValue = useContext(SettingsContext);

    const value = contextValue !== none ? contextValue : internalValue;

    const change = useCallback((e) => {
        onChange?.(e.target.value);
        setValue(e.target.value);
    }, [onChange]);

    return <input onChange={change} type="number" className="bd-number-input" min={min} max={max} step={step} value={value} disabled={disabled} />;
}
import React from "@modules/react";

const {useState, useCallback} = React;


export default function Textbox({value: initialValue, maxLength, placeholder, onKeyDown, onChange, disabled}) {
    const [value, setValue] = useState(initialValue);
    const change = useCallback((e) => {
        if (disabled) return;
        onChange?.(e.target.value);
        setValue(e.target.value);
    }, [onChange, disabled]);

    return <input onChange={change} onKeyDown={onKeyDown} type="text" className="bd-text-input" placeholder={placeholder} maxLength={maxLength} value={value} disabled={disabled} />;
}
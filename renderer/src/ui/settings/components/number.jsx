import React from "@modules/react";

const {useState, useCallback} = React;


export default function Number({value: initialValue, min, max, step, onChange}) {
    const [value, setValue] = useState(initialValue);
    const change = useCallback((e) => {
        onChange?.(e.target.value);
        setValue(e.target.value);
    }, [onChange]);

    return <input onChange={change} type="number" className="bd-number-input" min={min} max={max} step={step} value={value} />;
}
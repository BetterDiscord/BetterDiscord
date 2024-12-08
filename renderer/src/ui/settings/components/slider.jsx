import React from "@modules/react";

const {useState, useCallback} = React;


export default function Slider({value: initialValue, min, max, step, onChange, disabled}) {
    const [value, setValue] = useState(initialValue);
    const change = useCallback((e) => {
        if (disabled) return;
        onChange?.(e.target.value);
        setValue(e.target.value);
    }, [onChange, disabled]);

    return <div className={`bd-slider-wrap ${disabled ? "bd-slider-disabled" : ""}`}>
        <div className="bd-slider-label">{value}</div><input onChange={change} type="range" className="bd-slider-input" min={min} max={max} step={step} value={value} style={{backgroundSize: (value - min) * 100 / (max - min) + "% 100%"}} disabled={disabled} />
    </div>;
}
import React from "@modules/react";
import {none, SettingsContext} from "@ui/contexts";

const {useState, useCallback, useMemo, useRef, useContext} = React;


export default function Slider({value: initialValue, min, max, step, onChange, disabled, units = "", markers = []}) {
    const [internalValue, setValue] = useState(initialValue);
    const contextValue = useContext(SettingsContext);

    const value = contextValue !== none ? contextValue : internalValue;
    const inputRef = useRef(null);

    const change = useCallback((e) => {
        if (disabled) return;
        onChange?.(e.target.value);
        setValue(e.target.value);
    }, [onChange, disabled]);

    const jumpToValue = useCallback(val => {
        if (disabled) return;
        onChange?.(val);
        setValue(val);
    }, [onChange, disabled]);

    const percent = useCallback(val => {
        return (val - min) * 100 / (max - min);
    }, [min, max]);

    const labelOffset = useMemo(() => {
        const slope = (-62.5 - -25) / (max - min);
        const offset = (value * slope) + -25;
        if (offset < -62.5) return -62.5;
        return offset;
    }, [value, min, max]);

    const trackClick = useCallback(e => {
        const bounds = e.target.getBoundingClientRect();
        const offsetX = e.clientX - bounds.left;
        const offsetPercent = (offsetX / bounds.width);
        const newValue = (offsetPercent * (max - min)) + min;
        inputRef.current.value = newValue;
        jumpToValue(inputRef.current?.value);

    }, [max, min, jumpToValue, inputRef]);

    return <div className={`bd-slider-wrap ${disabled ? "bd-slider-disabled" : ""} ${markers.length > 0 ? "bd-slider-markers" : ""}`}>
        <input onChange={change} type="range" className="bd-slider-input" min={min} max={max} step={step} value={value} disabled={disabled} ref={inputRef} />
        <div className="bd-slider-label" style={{left: `${percent(value)}%`, transform: `translateX(${labelOffset}%)`}}>{value}{units}</div>
        <div className="bd-slider-track" style={{backgroundSize: percent(value) + "% 100%"}} onClick={trackClick}></div>
        {markers?.length > 0 && <div className="bd-slider-marker-container">
            {markers.map(m => {
                const markerValue = m?.value ?? m;
                const markerLabel = m?.label ?? m;
                const showUnits = units && !m?.label;
                return <div className="bd-slider-marker" style={{left: percent(markerValue) + "%"}} onClick={() => jumpToValue(markerValue)}>
                    {markerLabel}{showUnits && units}
                </div>;
            })}
        </div>}
    </div>;
}



/**
 * label offset left:
 *
 * value - min
 * -----------   x 100
 *  max - min
 */
import React from "@modules/react";
import {none, SettingsContext} from "@ui/contexts";
import type {ChangeEvent, MouseEvent} from "react";

const {useState, useCallback, useMemo, useRef, useContext} = React;


export interface SliderMarker {
    value: number;
    label: string;
}

export interface SliderProps {
    value: number | string;
    min: number;
    max: number;
    step?: number;
    onChange?(newValue: number | string): void;
    disabled?: boolean;
    units?: string;
    markers?: Array<number | SliderMarker>;
}

export default function Slider({value: initialValue, min, max, step, onChange, disabled, units = "", markers = []}: SliderProps) {
    const [internalValue, setValue] = useState(initialValue);
    const {value: contextValue, disabled: contextDisabled} = useContext(SettingsContext);

    const value = (contextValue !== none ? contextValue : internalValue) as number;
    const isDisabled = contextValue !== none ? contextDisabled : disabled;
    const inputRef = useRef<HTMLInputElement>(null);

    const change = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        if (isDisabled) return;
        onChange?.(e.target.value);
        setValue(e.target.value);
    }, [onChange, isDisabled]);

    const jumpToValue = useCallback((val: number | string) => {
        if (isDisabled) return;
        onChange?.(val);
        setValue(val);
    }, [onChange, isDisabled]);

    const percent = useCallback((val: number) => {
        return (val - min) * 100 / (max - min);
    }, [min, max]);

    const labelOffset = useMemo(() => {
        const slope = (-62.5 - -25) / (max - min);
        const offset = (value * slope) + -25;
        if (offset < -62.5) return -62.5;
        return offset;
    }, [value, min, max]);

    const trackClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
        const bounds = e.currentTarget.getBoundingClientRect();
        const offsetX = e.clientX - bounds.left;
        const offsetPercent = (offsetX / bounds.width);
        const newValue = (offsetPercent * (max - min)) + min;
        inputRef.current!.value = newValue.toString();
        jumpToValue(inputRef.current!.value);

    }, [max, min, jumpToValue, inputRef]);

    return <div className={`bd-slider-wrap ${isDisabled ? "bd-slider-disabled" : ""} ${markers.length > 0 ? "bd-slider-markers" : ""}`}>
        <input onChange={change} type="range" className="bd-slider-input" min={min} max={max} step={step} value={value} disabled={disabled} ref={inputRef} />
        <div className="bd-slider-label" style={{left: `${percent(value)}%`, transform: `translateX(${labelOffset}%)`}}>{value}{units}</div>
        <div className="bd-slider-track" style={{backgroundSize: percent(value) + "% 100%"}} onClick={trackClick}></div>
        {markers?.length > 0 && <div className="bd-slider-marker-container">
            {markers.map(m => {
                const markerValue = typeof m === "number" ? m : m.value;
                const markerLabel = typeof m === "number" ? m : m?.label;
                const showUnits = units && typeof m === "number";
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
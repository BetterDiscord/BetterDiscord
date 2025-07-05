import React from "@modules/react";
import {none, SettingsContext} from "@ui/contexts";
import type {ChangeEvent} from "react";

const {useState, useCallback, useContext} = React;


export interface NumberInputProps {
    value: number | string;
    min?: number;
    max?: number;
    step?: number;
    onChange?(newValue: number | string): void;
    disabled?: boolean;
}

export default function Number({value: initialValue, min, max, step, onChange, disabled}: NumberInputProps) {
    const [internalValue, setValue] = useState(initialValue);
    const {value: contextValue, disabled: contextDisabled} = useContext(SettingsContext);

    const value = (contextValue !== none ? contextValue : internalValue) as number | string;
    const isDisabled = contextValue !== none ? contextDisabled : disabled;

    const change = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        onChange?.(e.target.value);
        setValue(e.target.value);
    }, [onChange]);

    return <input onChange={change} type="number" className="bd-number-input" min={min} max={max} step={step} value={value} disabled={isDisabled} />;
}
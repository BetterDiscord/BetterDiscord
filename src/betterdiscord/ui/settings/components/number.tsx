import React from "@modules/react";
import {none, SettingsContext} from "@ui/contexts";
import Button from "@ui/base/button";
import {Plus, Minus} from "lucide-react";
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

export default function Number({value: initialValue, min, max, step = 1, onChange, disabled}: NumberInputProps) {
    const [internalValue, setValue] = useState(initialValue);
    const {value: contextValue, disabled: contextDisabled} = useContext(SettingsContext);

    const value = (contextValue !== none ? contextValue : internalValue) as number | string;
    const isDisabled = contextValue !== none ? contextDisabled : disabled;

    const change = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        onChange?.(e.target.value);
        setValue(e.target.value);
    }, [onChange]);

    const increment = useCallback(() => {
        const currentValue = parseFloat(String(value));
        const incrementedValue = currentValue + step;
        if (max !== undefined && incrementedValue > max) return;
        onChange?.(incrementedValue);
        setValue(incrementedValue);
    }, [onChange, value, max, step]);

    const decrement = useCallback(() => {
        const currentValue = parseFloat(String(value));
        const decrementedValue = currentValue - step;
        if (min !== undefined && decrementedValue < min) return;
        onChange?.(decrementedValue);
        setValue(decrementedValue);
    }, [onChange, value, min, step]);

    return <div className={`bd-number-input-wrapper ${isDisabled ? "bd-number-input-disabled" : ""}`}>
        <Button size={Button.Sizes.ICON} look={Button.Looks.FILLED} color={Button.Colors.PRIMARY} className="bd-number-input-decrement" onClick={decrement}><Minus size="24px" /></Button>
        <input onChange={change} type="number" className="bd-number-input" min={min} max={max} step={step} value={value} disabled={isDisabled} />
        <Button size={Button.Sizes.ICON} look={Button.Looks.FILLED} color={Button.Colors.PRIMARY} className="bd-number-input-increment" onClick={increment}><Plus size="24px" /></Button>
    </div>;
}
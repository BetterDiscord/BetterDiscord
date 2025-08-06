import React from "@modules/react";
import {none, SettingsContext} from "@ui/contexts";
import type {ChangeEvent, KeyboardEvent} from "react";

const {useState, useCallback, useContext} = React;


export interface TextboxProps {
    value: string;
    maxLength?: number;
    placeholder?: string;
    onKeyDown?(event: KeyboardEvent<HTMLInputElement>): void;
    onChange?(newValue: string): void;
    disabled?: boolean;
}

export default function Textbox({value: initialValue, maxLength, placeholder, onKeyDown, onChange, disabled}: TextboxProps) {
    const [internalValue, setValue] = useState(initialValue);
    const {value: contextValue, disabled: contextDisabled} = useContext(SettingsContext);

    const value = (contextValue !== none ? contextValue : internalValue) as string;
    const isDisabled = contextValue !== none ? contextDisabled : disabled;

    const change = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        if (isDisabled) return;
        onChange?.(e.currentTarget.value);
        setValue(e.currentTarget.value);
    }, [onChange, isDisabled]);

    return <input onChange={change} onKeyDown={onKeyDown} type="text" className="bd-text-input" placeholder={placeholder} maxLength={maxLength} value={value} disabled={isDisabled} />;
}
import React from "@modules/react";
import {none, SettingsContext} from "@ui/contexts";

import {CircleCheckIcon, CircleIcon} from "lucide-react";
import type {ChangeEvent} from "react";

const {useState, useCallback, useContext} = React;


export interface RadioOption {
    name: string;
    value: any;
    color?: string;
    description?: string;
    /** @deprecated */
    desc?: string;
}

export interface RadioProps {
    name?: string;
    value: any;
    options: RadioOption[];
    onChange?(newValue: any): void;
    disabled?: boolean;
}

export default function Radio({name, value: initialValue, options, onChange, disabled}: RadioProps) {
    const {value: contextValue, disabled: contextDisabled} = useContext(SettingsContext);
    const value = contextValue !== none ? contextValue : initialValue;
    const isDisabled = contextValue !== none ? contextDisabled : disabled;
    const [index, setIndex] = useState(options.findIndex(o => o.value === value));

    const change = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        if (isDisabled) return;
        const newIndex = parseInt(e.target.value);
        const newValue = options[newIndex].value;
        onChange?.(newValue);
        setIndex(newIndex);
    }, [options, onChange, isDisabled]);

    function renderOption(opt: RadioOption, i: number) {
        const isSelected = index === i;
        return <label className={"bd-radio-option" + (isSelected ? " bd-radio-selected" : "")} style={{borderColor: opt.color ?? "transparent"}}>
            <input onChange={change} type="radio" name={name} checked={isSelected} value={i} disabled={isDisabled} />
            {isSelected ? <CircleCheckIcon className="bd-radio-icon" size="24" /> : <CircleIcon className="bd-radio-icon" size="24" />}
            <div className="bd-radio-label-wrap">
                <div className="bd-radio-label">{opt.name}</div>
                <div className="bd-radio-description">{opt.desc || opt.description}</div>
            </div>
        </label>;
    }

    return <div className={`bd-radio-group ${isDisabled ? "bd-radio-disabled" : ""}`}>{options.map(renderOption)}</div>;
}
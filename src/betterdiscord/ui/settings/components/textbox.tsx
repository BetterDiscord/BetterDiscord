import React, {type ChangeEvent, type KeyboardEvent} from "react";
import {useItemProps, type BaseSettingProps} from "./utils";

interface BaseTextboxProps {
    maxLength?: number;
    placeholder?: string;
    onKeyDown?(event: KeyboardEvent<HTMLInputElement>): void;
    onChange?(newValue: string): void;
    disabled?: boolean;
}

export type TextboxProps = BaseTextboxProps & BaseSettingProps<string>;

export default function Textbox(props: TextboxProps) {
    const {maxLength, placeholder, onKeyDown} = props;

    const {state, setState, disabled} = useItemProps<string, ChangeEvent<HTMLInputElement>>(props, e => e.currentTarget.value);

    return (
        <input
            onChange={setState}
            onKeyDown={onKeyDown}
            type="text"
            className="bd-text-input"
            placeholder={placeholder}
            maxLength={maxLength}
            value={state}
            disabled={disabled}
        />
    );
}
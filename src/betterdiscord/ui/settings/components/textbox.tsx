import React, {type ChangeEvent, type KeyboardEvent} from "react";
import {useItemProps, type BaseSettingProps} from "./utils";

interface BaseTextboxProps {
    id?: string;
    maxLength?: number;
    placeholder?: string;
    onKeyDown?(event: KeyboardEvent<HTMLInputElement>): void;
    onChange?(newValue: string): void;
    disabled?: boolean;
    ariaLabel?: string;
}

export type TextboxProps = BaseTextboxProps & BaseSettingProps<string>;

export default function Textbox(props: TextboxProps) {
    const {id, maxLength, placeholder, onKeyDown, ariaLabel} = props;

    const {state, setState, disabled} = useItemProps<string, ChangeEvent<HTMLInputElement>>(props, e => e.currentTarget.value);

    return (
        <input
            id={id}
            onChange={setState}
            onKeyDown={onKeyDown}
            type="text"
            className="bd-text-input"
            placeholder={placeholder}
            aria-label={ariaLabel}
            maxLength={maxLength}
            value={state}
            disabled={disabled}
        />
    );
}
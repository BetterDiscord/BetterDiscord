import React from "@modules/react";

import Button from "../../base/button";
import {KeyboardIcon, XIcon} from "lucide-react";
import {none, SettingsContext} from "@ui/contexts";
import type {MouseEvent} from "react";
import {remapKeyCode, reverseRemapArray} from "../../../../betterdiscord/api/keybinds";

const {useState, useCallback, useEffect, useContext} = React;

export interface KeybindProps {
    value: Array<string | number>;
    onChange?(newValue: Array<string | number>): void;
    max?: number;
    clearable?: boolean;
    useKeyCode?: boolean;
    disabled?: boolean;
}

export default function Keybind({value: initialValue, onChange, max = 4, clearable = false, useKeyCode = false, disabled}: KeybindProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [accumulator, setAccumulator] = useState<Array<string | number>>([]);

    const [internalValue, setInternalValue] = useState<string[] | number[]>(
        useKeyCode
            ? reverseRemapArray((initialValue as number[]))
            : (initialValue as string[])
    );
    const {value: contextValue, disabled: contextDisabled} = useContext(SettingsContext);

    const value = (contextValue !== none ? contextValue : internalValue) as string[];
    const isDisabled = contextValue !== none ? contextDisabled : disabled;

    useEffect(() => {
        window.addEventListener("keydown", keyDownHandler, true);
        window.addEventListener("keyup", keyUpHandler, true);
        return () => {
            window.removeEventListener("keydown", keyDownHandler, true);
            window.removeEventListener("keyup", keyUpHandler, true);
        };
    });

    const keyDownHandler = useCallback((event: KeyboardEvent) => {
        if (!isRecording) return;
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();
        const key = useKeyCode ? remapKeyCode(event.keyCode, event.location) : event.key;
        if (!useKeyCode && (event.repeat || accumulator.includes(key))) return;

        accumulator.push(key);
        if (accumulator.length == max) {
            setIsRecording(false);
            setAccumulator([]);
            if (useKeyCode) setInternalValue(reverseRemapArray((accumulator as number[]).slice(0)));
            else setInternalValue((accumulator as string[]).slice(0));
            onChange?.(accumulator);
        }
    }, [isRecording, accumulator, max, onChange, useKeyCode]);

    const keyUpHandler = useCallback((event: KeyboardEvent) => {
        if (!isRecording) return;
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();
        const key = useKeyCode ? remapKeyCode(event.keyCode, event.location) : event.key;

        if (key === accumulator[0]) {
            setIsRecording(false);
            setAccumulator([]);
            if (useKeyCode) setInternalValue(reverseRemapArray((accumulator as number[]).slice(0)));
            else setInternalValue((accumulator as string[]).slice(0));
            onChange?.(accumulator);
        }
    }, [isRecording, accumulator, onChange, useKeyCode]);

    const clearKeybind = useCallback((event: MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();
        if (isDisabled) return;
        if (onChange) onChange([]);
        setInternalValue([]);
        setIsRecording(false);
        setAccumulator([]);
    }, [onChange, isDisabled]);

    const onClick = useCallback((e: MouseEvent) => {
        if (isDisabled) return;
        if (e.currentTarget?.className?.includes?.("bd-keybind-clear") || e.currentTarget?.closest(".bd-button")?.className?.includes("bd-keybind-clear")) return clearKeybind(e);
        setIsRecording(!isRecording);
    }, [isRecording, clearKeybind, isDisabled]);


    const displayValue = !value.length ? "" : value.map(k => k === "Control" ? "Ctrl" : k).join(" + ");
    return <div className={"bd-keybind-wrap" + (isRecording ? " recording" : "") + (isDisabled ? " bd-keybind-disabled" : "")} onClick={onClick}>
        <Button size={Button.Sizes.ICON} look={Button.Looks.FILLED} color={isRecording ? Button.Colors.RED : Button.Colors.PRIMARY} className="bd-keybind-record" onClick={onClick}><KeyboardIcon size="24px" /></Button>
        <input readOnly={true} type="text" className="bd-keybind-input" size={displayValue.length} value={displayValue} placeholder="No keybind set" disabled={isDisabled} />
        {clearable && <Button size={Button.Sizes.ICON} look={Button.Looks.BLANK} onClick={clearKeybind} className="bd-keybind-clear"><XIcon size="24px" /></Button>}
    </div>;
};
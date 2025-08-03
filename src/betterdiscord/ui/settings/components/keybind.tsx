import React from "@modules/react";

import Button from "../../base/button";
import {KeyboardIcon, XIcon} from "lucide-react";
import {none, SettingsContext} from "@ui/contexts";
import type {MouseEvent} from "react";

const {useState, useCallback, useEffect, useContext} = React;


export interface KeybindProps {
    value: string[];
    onChange?(newValue: string[]): void;
    max?: number;
    clearable?: boolean;
    disabled?: boolean;
}

export default function Keybind({value: initialValue, onChange, max = 4, clearable = false, disabled}: KeybindProps) {
    // TODO: make these their own states
    const [state, setState] = useState<{isRecording: boolean; accum: string[];}>({isRecording: false, accum: []});

    const [internalValue, setValue] = useState(initialValue);
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
        if (!state.isRecording) return;
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();
        if (event.repeat || state.accum.includes(event.key)) return;

        state.accum.push(event.key);
        if (state.accum.length == max) {
            setState({isRecording: false, accum: []});
            setValue(state.accum.slice(0));
            onChange?.(state.accum);
        }
    }, [state, max, onChange]);

    const keyUpHandler = useCallback((event: KeyboardEvent) => {
        if (!state.isRecording) return;
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        if (event.key === state.accum[0]) {
            setState({isRecording: false, accum: []});
            setValue(state.accum.slice(0));
            onChange?.(state.accum);
        }
    }, [state, onChange]);

    const clearKeybind = useCallback((event: MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();
        if (isDisabled) return;
        if (onChange) onChange([]);
        setValue([]);
        setState({...state, isRecording: false, accum: []});
    }, [onChange, state, isDisabled]);

    const onClick = useCallback((e: MouseEvent) => {
        if (isDisabled) return;
        if (e.currentTarget?.className?.includes?.("bd-keybind-clear") || e.currentTarget?.closest(".bd-button")?.className?.includes("bd-keybind-clear")) return clearKeybind(e);
        setState({...state, isRecording: !state.isRecording});
    }, [state, clearKeybind, isDisabled]);


    const displayValue = !value.length ? "" : value.map(k => k === "Control" ? "Ctrl" : k).join(" + ");
    return <div className={"bd-keybind-wrap" + (state.isRecording ? " recording" : "") + (isDisabled ? " bd-keybind-disabled" : "")} onClick={onClick}>
        <Button size={Button.Sizes.ICON} look={Button.Looks.FILLED} color={state.isRecording ? Button.Colors.RED : Button.Colors.PRIMARY} className="bd-keybind-record" onClick={onClick}><KeyboardIcon size="24px" /></Button>
        <input readOnly={true} type="text" className="bd-keybind-input" value={displayValue} placeholder="No keybind set" disabled={disabled} />
        {clearable && <Button size={Button.Sizes.ICON} look={Button.Looks.BLANK} onClick={clearKeybind} className="bd-keybind-clear"><XIcon size="24px" /></Button>}
    </div>;
}
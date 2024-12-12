import React from "@modules/react";

import Button from "../../base/button";
import Keyboard from "@ui/icons/keyboard";
import Close from "@ui/icons/close";

const {useState, useCallback, useEffect} = React;


export default function Keybind({value: initialValue, onChange, max = 4, clearable = false, disabled}) {
    const [state, setState] = useState({value: initialValue, isRecording: false, accum: []});

    useEffect(() => {
        window.addEventListener("keydown", keyDownHandler, true);
        window.addEventListener("keyup", keyUpHandler, true);
        return () => {
            window.removeEventListener("keydown", keyDownHandler, true);
            window.removeEventListener("keyup", keyUpHandler, true);
        };
    });

    const keyDownHandler = useCallback((event) => {
        if (!state.isRecording) return;
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();
        if (event.repeat || state.accum.includes(event.key)) return;

        state.accum.push(event.key);
        if (state.accum.length == max) {
            if (onChange) onChange(state.accum);
            setState({value: state.accum.slice(0), isRecording: false, accum: []});
        }
    }, [state, max, onChange]);

    const keyUpHandler = useCallback((event) => {
        if (!state.isRecording) return;
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        if (event.key === state.accum[0]) {
            onChange?.(state.accum);
            setState({value: state.accum.slice(0), isRecording: false, accum: []});
        }
    }, [state, onChange]);

    const clearKeybind = useCallback((event) => {
        event.stopPropagation();
        event.preventDefault();
        if (disabled) return;
        if (onChange) onChange([]);
        setState({...state, isRecording: false, value: [], accum: []});
    }, [onChange, state, disabled]);

    const onClick = useCallback((e) => {
        if (disabled) return;
        if (e.target?.className?.includes?.("bd-keybind-clear") || e.target?.closest(".bd-button")?.className?.includes("bd-keybind-clear")) return clearKeybind(e);
        setState({...state, isRecording: !state.isRecording});
    }, [state, clearKeybind, disabled]);


    const displayValue = !state.value.length ? "" : state.value.map(k => k === "Control" ? "Ctrl" : k).join(" + ");
    return <div className={"bd-keybind-wrap" + (state.isRecording ? " recording" : "") + (disabled ? " bd-keybind-disabled" : "")} onClick={onClick}>
            <Button size={Button.Sizes.ICON} look={Button.Looks.FILLED} color={state.isRecording ? Button.Colors.RED : Button.Colors.PRIMARY} className="bd-keybind-record" onClick={onClick}><Keyboard size="24px" /></Button>
            <input readOnly={true} type="text" className="bd-keybind-input" value={displayValue} placeholder="No keybind set" disabled={disabled} />
            {clearable && <Button size={Button.Sizes.ICON} look={Button.Looks.BLANK} onClick={clearKeybind} className="bd-keybind-clear"><Close size="24px" /></Button>}
        </div>;
}
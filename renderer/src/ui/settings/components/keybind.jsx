import React from "@modules/react";

import Keyboard from "@ui/icons/keyboard";
import Close from "@ui/icons/close";

const {useState, useCallback, useEffect} = React;


export default function Keybind({value: initialValue, onChange, max = 2, clearable = true}) {
    const [state, setState] = useState({value: initialValue, isRecording: false, accum: []});

    useEffect(() => {
        window.addEventListener("keydown", keyHandler, true);
        return () => window.removeEventListener("keydown", keyHandler, true);
    });

    const keyHandler = useCallback((event) => {
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

    const clearKeybind = useCallback((event) => {
        event.stopPropagation();
        event.preventDefault();
        if (onChange) onChange([]);
        setState({...state, isRecording: false, value: [], accum: []});
    }, [onChange, state]);

    const onClick = useCallback((e) => {
        if (e.target?.className?.includes?.("bd-keybind-clear") || e.target?.closest(".bd-button")?.className?.includes("bd-keybind-clear")) return clearKeybind(e);
        setState({...state, isRecording: !state.isRecording});
    }, [state, clearKeybind]);


    const displayValue = state.isRecording ? "Recording..." : !state.value.length ? "N/A" : state.value.join(" + ");
    return <div className={"bd-keybind-wrap" + (state.isRecording ? " recording" : "")} onClick={onClick}>
            <input readOnly={true} type="text" className="bd-keybind-input" value={displayValue} />
            <div className="bd-keybind-controls">
                <button className={"bd-button bd-keybind-record" + (state.isRecording ? " bd-button-danger" : "")}><Keyboard size="24px" /></button>
                {clearable && <button onClick={clearKeybind} className="bd-button bd-keybind-clear"><Close size="24px" /></button>}
            </div>
        </div>;
}
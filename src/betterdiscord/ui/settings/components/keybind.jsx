import React from "@modules/react";

import Button from "../../base/button";
import {KeyboardIcon, XIcon} from "lucide-react";
import {none, SettingsContext} from "@ui/contexts";
import {remapKeyCode, reverseRemapArray} from "../../../../betterdiscord/api/keybinds";

const {useState, useCallback, useEffect, useContext} = React;

export default function Keybind({value: initialValue, onChange, max = 4, clearable = false, useKeyCode = false, disabled}) {
    const [isRecording, setIsRecording] = useState(false);
    const [accum, setAccum] = useState([]);

    const [internalValue, setValue] = useState(useKeyCode ? reverseRemapArray(initialValue) : initialValue);
    const contextValue = useContext(SettingsContext);

    const value = contextValue !== none ? contextValue : internalValue;

    useEffect(() => {
        window.addEventListener("keydown", keyDownHandler, true);
        window.addEventListener("keyup", keyUpHandler, true);
        return () => {
            window.removeEventListener("keydown", keyDownHandler, true);
            window.removeEventListener("keyup", keyUpHandler, true);
        };
    });

    const keyDownHandler = useCallback((event) => {
        if (!isRecording) return;
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();
        const key = useKeyCode ? remapKeyCode(event.keyCode, event.location) : event.key;
        if (event.repeat || accum.includes(key)) return;

        accum.push(key);
        if (accum.length == max) {
            setIsRecording(false);
            setAccum([]);
            useKeyCode ? setValue(reverseRemapArray(accum.slice(0))) : setValue(accum.slice(0));
            onChange?.(accum);
        }
    }, [isRecording, accum, max, onChange, useKeyCode]);

    const keyUpHandler = useCallback((event) => {
        if (!isRecording) return;
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();
        const key = useKeyCode ? remapKeyCode(event.keyCode, event.location) : event.key;

        if (key === accum[0]) {
            setIsRecording(false);
            setAccum([]);
            useKeyCode ? setValue(reverseRemapArray(accum.slice(0))) : setValue(accum.slice(0));
            onChange?.(accum);
        }
    }, [isRecording, accum, onChange, useKeyCode]);

    const clearKeybind = useCallback((event) => {
        event.stopPropagation();
        event.preventDefault();
        if (disabled) return;
        if (onChange) onChange([]);
        setValue([]);
        setIsRecording(false);
        setAccum([]);
    }, [onChange, disabled]);

    const onClick = useCallback((e) => {
        if (disabled) return;
        if (e.target?.className?.includes?.("bd-keybind-clear") || e.target?.closest(".bd-button")?.className?.includes("bd-keybind-clear")) return clearKeybind(e);
        setIsRecording(!isRecording);
    }, [isRecording, clearKeybind, disabled]);


    const displayValue = !value.length ? "" : value.map(k => k === "Control" ? "Ctrl" : k).join(" + ");
    return <div className={"bd-keybind-wrap" + (isRecording ? " recording" : "") + (disabled ? " bd-keybind-disabled" : "")} onClick={onClick}>
        <Button size={Button.Sizes.ICON} look={Button.Looks.FILLED} color={isRecording ? Button.Colors.RED : Button.Colors.PRIMARY} className="bd-keybind-record" onClick={onClick}><KeyboardIcon size="24px" /></Button>
        <input readOnly={true} type="text" className="bd-keybind-input" size={displayValue.length} value={displayValue} placeholder="No keybind set" disabled={disabled} />
        {clearable && <Button size={Button.Sizes.ICON} look={Button.Looks.BLANK} onClick={clearKeybind} className="bd-keybind-clear"><XIcon size="24px" /></Button>}
    </div>;
}
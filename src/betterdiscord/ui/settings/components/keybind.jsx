import React from "@modules/react";

import Button from "../../base/button";
import {KeyboardIcon, XIcon} from "lucide-react";
import {none, SettingsContext} from "@ui/contexts";
import {getModule} from "@webpack";

const {useState, useCallback, useEffect, useContext} = React;

const platform = process.platform;
const ctrl = platform === "win32" ? 0xa2 : platform === "darwin" ? 0xe0 : 0x25;
const keybindModule = getModule(m => m.ctrl === ctrl, {searchExports: true});
const reversedKeybindModule = (() => {
    if (!keybindModule) return {};
    return Object.entries(keybindModule).reduce((acc, [key, value]) => {
        acc[value] = key;
        return acc;
    }, {});
})();

function remapKeyCode(keyCode, location) {
    if (keyCode === 18 || keyCode === 17 || keyCode === 16) {
        let key = "";
        if (location === 2) {
            key = "right ";
        }
        if (keyCode == 18) key += "alt";
        if (keyCode == 17) key += "ctrl";
        if (keyCode == 16) key += "shift";
        keyCode = keybindModule[key];
    }

    return keyCode;
};

function reverseRemapArray(arr) {
    return arr.map((key) => {
        let keyName = reversedKeybindModule[key];
        if (keyName.startsWith("alt") || keyName.startsWith("ctrl") || keyName.startsWith("meta") || keyName.startsWith("shift")) {
            keyName = "left " + keyName;
        }
        return keyName;
    });
}


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
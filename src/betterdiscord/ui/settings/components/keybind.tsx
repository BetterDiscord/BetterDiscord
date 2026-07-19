import React, {useEffect, useEffectEvent, useRef, useState, type MouseEvent} from "react";

import Button from "@ui/base/button";
import {KeyboardIcon, XIcon} from "lucide-react";
import {useItemProps, type BaseSettingProps} from "./utils";

interface BaseKeybindProps {
    onChange?(newValue: string[]): void;
    max?: number;
    clearable?: boolean;
    disabled?: boolean;
}

export type KeybindProps = BaseKeybindProps & BaseSettingProps<string[]>;

export default function Keybind(props: KeybindProps) {
    const {max = 4, clearable = false} = props;
    const {state, setState, disabled} = useItemProps<string[]>(props);

    const [isRecording, setRecording] = useState(false);
    const accum = useRef<string[]>([]);

    const dispatch = useEffectEvent(() => {
        setRecording(false);

        try {
            setState(accum.current.concat());
        }
        finally {
            accum.current.length = 0;
        }
    });

    const keyDownHandler = useEffectEvent((event: KeyboardEvent) => {
        if (!isRecording) return;

        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        if (event.repeat || accum.current.includes(event.key)) return;

        accum.current.push(event.key);

        if (accum.current.length >= max) dispatch();
    });

    const keyUpHandler = useEffectEvent((event: KeyboardEvent) => {
        if (!isRecording) return;

        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        if (event.key === accum.current[0]) dispatch();
    });

    useEffect(() => {
        window.addEventListener("keydown", keyDownHandler, true);
        window.addEventListener("keyup", keyUpHandler, true);

        return () => {
            window.removeEventListener("keydown", keyDownHandler, true);
            window.removeEventListener("keyup", keyUpHandler, true);
        };
    }, []);

    const clearKeybind = useEffectEvent((event: MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();

        if (disabled) return;

        dispatch();
    });

    const onClick = useEffectEvent((e: MouseEvent) => {
        if (disabled) return;
        if (e.currentTarget?.className?.includes?.("bd-keybind-clear") || e.currentTarget?.closest(".bd-button")?.className?.includes("bd-keybind-clear")) return clearKeybind(e);

        accum.current.length = 0;
        setRecording(v => !v);
    });

    const displayValue = !state.length ? "" : state.map(k => k === "Control" ? "Ctrl" : k).join(" + ");
    return (
        <div className={"bd-keybind-wrap" + (isRecording ? " recording" : "") + (disabled ? " bd-keybind-disabled" : "")} onClick={onClick}>
            <Button size={Button.Sizes.ICON} look={Button.Looks.FILLED} color={isRecording ? Button.Colors.RED : Button.Colors.PRIMARY} className="bd-keybind-record" onClick={onClick}>
                <KeyboardIcon size="24px" />
            </Button>

            <input readOnly={true} type="text" className="bd-keybind-input" value={displayValue} placeholder="No keybind set" disabled={disabled} />

            {clearable && (
                <Button size={Button.Sizes.ICON} look={Button.Looks.BLANK} onClick={clearKeybind} className="bd-keybind-clear">
                    <XIcon size="24px" />
                </Button>
            )}
        </div>
    );
}
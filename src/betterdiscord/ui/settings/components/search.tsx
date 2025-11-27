import React from "@modules/react";
import Button from "@ui/base/button";
import {SearchIcon, XIcon} from "lucide-react";
import type {ChangeEvent, KeyboardEvent} from "react";

const {useState, useEffect, useCallback, useRef} = React;


export interface SearchProps {
    onChange?(event: ChangeEvent | {target: {value: string;};}): void;
    className?: string;
    placeholder?: string;
    onKeyDown?(event: KeyboardEvent<HTMLInputElement>): void;
}

export default function Search({onChange, className, onKeyDown, placeholder}: SearchProps) {
    const input = useRef<HTMLInputElement>(null);
    const [value, setValue] = useState("");

    // focus search bar on page select
    useEffect(() => {
        if (!input.current) return;
        input.current.focus();
    }, []);

    const change = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        onChange?.(e);
        setValue(e.target.value);
    }, [onChange]);

    const reset = useCallback(() => {
        setValue("");
        onChange?.({target: {value: ""}, currentTarget: {value: ""}} as any);
        input.current?.focus();
    }, [onChange]);

    return <div className={"bd-search-wrapper" + (className ? ` ${className}` : "")}>
        <input onChange={change} onKeyDown={onKeyDown} type="text" className="bd-search" placeholder={placeholder} maxLength={50} value={value} ref={input} />
        {!value && <SearchIcon size="18px" />}
        {value && <Button look={Button.Looks.BLANK} color={Button.Colors.TRANSPARENT} size={Button.Sizes.NONE} onClick={reset}><XIcon size="16px" /></Button>}
    </div>;

}
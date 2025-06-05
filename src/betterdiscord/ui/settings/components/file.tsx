import {webUtils} from "electron";
import React from "@modules/react";
import Button from "@ui/base/button";
import {XIcon} from "lucide-react";
import type {ChangeEvent} from "react";

const {useRef, useCallback, useEffect} = React;


export interface BaseFilepickerProp {
    multiple?: boolean;
    accept?: string;
    clearable?: boolean;
    onChange?(newValue: string[] | string): void;
    disabled?: boolean;
    actions?: {
        clear?(): void;
    };
}

export interface SingleFilepickerProp extends BaseFilepickerProp {
    multiple: true;
    onChange?(newValue: string[]): void;
}

export interface MultipleFilepickerProp extends BaseFilepickerProp {
    multiple?: false;
    onChange?(newValue: string): void;
}

export default function Filepicker({multiple, accept, clearable, onChange, disabled, actions}: SingleFilepickerProp | MultipleFilepickerProp) {
    const inputRef = useRef<HTMLInputElement>(null);

    const change = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;
        const files = [];
        for (const file of e.target.files!) {
            files.push(webUtils.getPathForFile(file));
        }
        if (multiple === true) onChange?.(files);
        else onChange?.(files[0]);
    }, [onChange, disabled, multiple]);

    const clear = useCallback(() => {
        inputRef.current!.value = "";
        if (multiple === true) onChange?.([]);
        else onChange?.("");
    }, [onChange, multiple]);

    useEffect(() => {
        if (!actions) return;
        actions.clear = clear;
    }, [clear, actions]);

    const onClick = useCallback(() => {
        inputRef.current?.click();
    }, []);

    return <div className={`bd-file-input-wrap ${disabled ? "bd-file-input-disabled" : ""}`}>
        <Button size={Button.Sizes.ICON} look={Button.Looks.FILLED} color={Button.Colors.PRIMARY} className="bd-file-input-browse" onClick={onClick}>Browse</Button>
        <input onChange={change} type="file" className="bd-file-input" multiple={multiple} accept={accept} disabled={disabled} ref={inputRef} />
        {clearable && <Button size={Button.Sizes.ICON} look={Button.Looks.BLANK} onClick={clear} className="bd-file-input-clear"><XIcon size="24px" /></Button>}
    </div>;
}
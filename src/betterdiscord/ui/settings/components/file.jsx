import {webUtils} from "electron";
import React from "@modules/react";
import Button from "@ui/base/button";
import Close from "@ui/icons/close";

const {useRef, useCallback, useEffect} = React;


export default function Filepicker({multiple, accept, clearable, onChange, disabled, actions}) {
    const inputRef = useRef(null);

    const change = useCallback((e) => {
        if (disabled) return;
        const files = [];
        for (const file of e.target.files) {
            files.push(webUtils.getPathForFile(file));
        }
        onChange?.(multiple ? files : files[0]);
    }, [onChange, disabled, multiple]);

    const clear = useCallback(() => {
        inputRef.current.value = "";
        onChange?.(multiple ? [] : "");
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
        {clearable && <Button size={Button.Sizes.ICON} look={Button.Looks.BLANK} onClick={clear} className="bd-file-input-clear"><Close size="24px" /></Button>}
        </div>;
}
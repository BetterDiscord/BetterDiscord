import React, {useCallback, useEffect, useRef, type KeyboardEvent} from "react";
import Button from "@ui/base/button";
import {SearchIcon, XIcon} from "lucide-react";
import {useItemProps, type BaseSettingProps} from "./utils";
import clsx from "clsx";

interface BaseSearchProps {
    className?: string;
    placeholder?: string;
    max?: number;
    onKeyDown?(event: KeyboardEvent<HTMLInputElement>): void;
}

export type SearchProps = BaseSearchProps & BaseSettingProps<string>;

export default function Search(props: SearchProps) {
    const {className, onKeyDown, placeholder, max = 50} = props;

    const {state, setState, disabled} = useItemProps<string, string | React.ChangeEvent<HTMLInputElement>>(props, (e) => {
        if (typeof e === "object") return e.currentTarget.value;
        return e;
    });

    const input = useRef<HTMLInputElement>(null);

    const reset = useCallback(() => {
        if (disabled) return;

        setState("");

        input.current?.focus();
    }, [disabled]);

    useEffect(() => {
        if (!disabled) input.current?.focus();
    }, [disabled]);

    return <div className={clsx("bd-search-wrapper", disabled && "bd-search-disabled", className)}>
        <input autoFocus disabled={disabled} onChange={setState} onKeyDown={onKeyDown} type="text" className="bd-search" placeholder={placeholder} maxLength={max} value={state} ref={input} />
        {!state && <SearchIcon size="18px" />}
        {state && (
            <Button look={Button.Looks.BLANK} color={Button.Colors.TRANSPARENT} size={Button.Sizes.NONE} onClick={reset}>
                <XIcon size="16px" />
            </Button>
        )}
    </div>;

}
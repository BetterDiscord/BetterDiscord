import React from "@modules/react";
import Button from "@ui/base/button";
import Close from "@ui/icons/close";
import SearchIcon from "@ui/icons/search";

const {useState, useEffect, useCallback, useRef} = React;


export default function Search({onChange, className, onKeyDown, placeholder}) {
    const input = useRef(null);
    const [value, setValue] = useState("");

    // focus search bar on page select
    useEffect(()=>{
        if (!input.current) return;
        input.current.focus();
    }, []);

    const change = useCallback((e) => {
        onChange?.(e);
        setValue(e.target.value);
    }, [onChange]);

    const reset = useCallback(() => {
        onChange?.({target: {value: ""}});
        setValue("");
        if (!input.current) return;
        input.current.focus();
    }, [onChange, input]);

    return <div className={"bd-search-wrapper" + (className ? ` ${className}` : "")}>
                <input onChange={change} onKeyDown={onKeyDown} type="text" className="bd-search" placeholder={placeholder} maxLength="50" value={value} ref={input}/>
                {!value && <SearchIcon />}
                {value && <Button look={Button.Looks.BLANK} color={Button.Colors.TRANSPARENT} size={Button.Sizes.NONE} onClick={reset}><Close size="16px" /></Button>}
            </div>;

}
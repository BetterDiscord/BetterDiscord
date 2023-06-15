import React from "@modules/react";
import SearchIcon from "@ui/icons/search";

const {useState, useCallback} = React;


export default function Search({onChange, className, onKeyDown, placeholder}) {
    const [value, setValue] = useState("");
    const change = useCallback((e) => {
        onChange?.(e);
        setValue(e.target.value);
    }, [onChange]);


    return <div className={"bd-search-wrapper" + (className ? ` ${className}` : "")}>
                <input onChange={change} onKeyDown={onKeyDown} type="text" className="bd-search" placeholder={placeholder} maxLength="50" value={value} />
                <SearchIcon />
            </div>;

}
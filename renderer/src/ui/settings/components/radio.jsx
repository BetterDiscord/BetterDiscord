import React from "@modules/react";

import RadioIcon from "@ui/icons/radio";

const {useState, useCallback} = React;


export default function Radio({name, value, options, onChange, disabled}) {
    const [index, setIndex] = useState(options.findIndex(o => o.value === value));
    const change = useCallback((e) => {
        if (disabled) return;
        const newIndex = parseInt(e.target.value);
        const newValue = options[newIndex].value;
        onChange?.(newValue);
        setIndex(newIndex);
    }, [options, onChange, disabled]);

    function renderOption(opt, i) {
        const isSelected = index === i;
        return <label className={"bd-radio-option" + (isSelected ? " bd-radio-selected" : "")} style={{borderColor: opt.color ?? "transparent"}}>
                <input onChange={change} type="radio" name={name} checked={isSelected} value={i} disabled={disabled} />
                {/* <span className="bd-radio-button"></span> */}
                <RadioIcon className="bd-radio-icon" size="24" checked={isSelected} />
                <div className="bd-radio-label-wrap">
                    <div className="bd-radio-label">{opt.name}</div>
                    <div className="bd-radio-description">{opt.desc || opt.description}</div>
                </div>
            </label>;
    }

    return <div className={`bd-radio-group ${disabled ? "bd-radio-disabled" : ""}`}>{options.map(renderOption)}</div>;
}
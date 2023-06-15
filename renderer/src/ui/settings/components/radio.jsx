import React from "@modules/react";

import RadioIcon from "@ui/icons/radio";

const {useState, useCallback} = React;


export default function Radio({name, value, options, onChange}) {
    const [index, setIndex] = useState(options.findIndex(o => o.value === value));
    const change = useCallback((e) => {
        const newIndex = parseInt(e.target.value);
        const newValue = options[newIndex].value;
        onChange?.(newValue);
        setIndex(newIndex);
    }, [options, onChange]);

    function renderOption(opt, i) {
        const isSelected = index === i;
        return <label className={"bd-radio-option" + (isSelected ? " bd-radio-selected" : "")}>
                <input onChange={change} type="radio" name={name} checked={isSelected} value={i} />
                {/* <span className="bd-radio-button"></span> */}
                <RadioIcon className="bd-radio-icon" size="24" checked={isSelected} />
                <div className="bd-radio-label-wrap">
                    <div className="bd-radio-label">{opt.name}</div>
                    <div className="bd-radio-description">{opt.desc || opt.description}</div>
                </div>
            </label>;
    }

    return <div className="bd-radio-group">{options.map(renderOption)}</div>;
}
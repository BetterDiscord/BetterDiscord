import React, {useMemo} from "react";
import {useItemProps, type BaseSettingProps} from "./utils";


export interface RadioOption {
    name: string;
    value: any;
    color?: string;
    description?: string;
}

interface BaseRadioProps {
    name?: string;
    options: RadioOption[];
}

export type RadioProps = BaseRadioProps & BaseSettingProps<RadioOption[]>;

function RadioIndicator({checked}: {checked: boolean;}) {
    return <svg className="bd-radio-indicator" width="24" height="24" viewBox="0 0 24 24">
        <circle
            cx="12"
            cy="12"
            r="12"
            strokeWidth="2"
            fill="none"
            className="bd-radio-icon"
        />
        {checked && (
            <circle
                cx="12"
                cy="12"
                r="5"
                fill="#fff"
            />
        )}
    </svg>;
}

export default function Radio(props: RadioProps) {
    const {name, options} = props;

    const {state, setState, disabled} = useItemProps<RadioOption[], React.ChangeEvent<HTMLInputElement>>(props, (index) => (
        options[index.currentTarget.valueAsNumber].value
    ));

    const index = useMemo(() => options.findIndex(o => o.value === state), [state, options]);

    function renderOption(opt: RadioOption, i: number) {
        const isSelected = index === i;

        return (
            <label key={i} className={"bd-radio-option" + (isSelected ? " bd-radio-selected" : "")} style={{borderColor: opt.color ?? "transparent"}}>
                <input onChange={setState} type="radio" name={name} checked={isSelected} value={i} disabled={disabled} />
                <RadioIndicator checked={isSelected} />
                <div className="bd-radio-label-wrap">
                    <div className="bd-radio-label">{opt.name}</div>
                    <div className="bd-radio-description">{opt.description}</div>
                </div>
            </label>
        );
    }

    return <div className={`bd-radio-group${disabled ? " bd-radio-disabled" : ""}`}>{options.map(renderOption)}</div>;
}
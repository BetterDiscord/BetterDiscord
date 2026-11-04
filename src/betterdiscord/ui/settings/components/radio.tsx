import React, {useMemo, type ReactNode} from "react";
import {useItemProps, type BaseSettingProps} from "./utils";

export interface RadioOption {
    name: string;
    value: any;
    color?: string;
    description?: string;

    /** Shown in the option's row after its label, such as a field for a custom value. Clicks on it don't pick the option. */
    control?: ReactNode;
}

interface BaseRadioProps {
    name?: string;
    options: RadioOption[];
}

export type RadioProps = BaseRadioProps & BaseSettingProps<any>;

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

    const {state, setState, disabled} = useItemProps<any>(props);

    const index = useMemo(() => options.findIndex(o => o.value === state), [state, options]);

    return (
        <div className={`bd-radio-group${disabled ? " bd-radio-disabled" : ""}`}>
            {options.map((opt, i) => {
                const isSelected = index === i;

                const optionClass = "bd-radio-option" + (isSelected ? " bd-radio-selected" : "");
                const style = {borderColor: opt.color ?? "transparent"};
                const body = <>
                    <input onChange={setState.bind(null, opt.value, false)} type="radio" name={name} checked={isSelected} value={i} disabled={disabled} />

                    <RadioIndicator checked={isSelected} />

                    <div className="bd-radio-label-wrap">
                        <div className="bd-radio-label">{opt.name}</div>
                        <div className="bd-radio-description">{opt.description}</div>
                    </div>
                </>;

                // The control sits outside the label, so clicking or typing in it leaves the option as it is
                if (opt.control) {
                    return <div key={i} className={optionClass + " bd-radio-option-with-control"} style={style}>
                        <label className="bd-radio-option-label">{body}</label>
                        <div className="bd-radio-option-control">{opt.control}</div>
                    </div>;
                }

                return <label key={i} className={optionClass} style={style}>{body}</label>;
            })}
        </div>
    );
}
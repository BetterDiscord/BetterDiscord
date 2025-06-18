import React, {useContext} from "@modules/react";
import {none, SettingsContext} from "@ui/contexts";

const {useState, useCallback} = React;


export interface SwitchProps {
    id?: string;
    value: boolean;
    disabled?: boolean;
    onChange?(newValue?: boolean): void;
    internalState?: boolean;
}

export default function Switch({id = undefined, value: initialValue, disabled = undefined, onChange, internalState = true}: SwitchProps) {
    const [checked, setChecked] = useState(initialValue);
    const {value: contextValue, disabled: contextDisable} = useContext(SettingsContext);

    const shouldUseContext = contextValue !== none;
    const isChecked = (shouldUseContext ? contextValue : internalState ? checked : initialValue) as boolean;
    const isDisabled = shouldUseContext ? contextDisable : disabled;

    const change = useCallback(() => {
        onChange?.(!isChecked);
        setChecked(!isChecked);
    }, [onChange, isChecked]);

    const enabledClass = isDisabled ? " bd-switch-disabled" : "";
    const checkedClass = isChecked ? " bd-switch-checked" : "";
    return <div className={`bd-switch` + enabledClass + checkedClass}>
        <input id={id} type="checkbox" disabled={isDisabled} checked={isChecked} onChange={change} />
        <div className="bd-switch-body">
            <svg className="bd-switch-slider" viewBox="0 0 28 20" preserveAspectRatio="xMinYMid meet">
                <rect className="bd-switch-handle" fill="white" x="4" y="0" height="20" width="20" rx="10"></rect>
                <svg className="bd-switch-symbol" viewBox="0 0 20 20" fill="none">
                    <path></path>
                    <path></path>
                </svg>
            </svg>
        </div>
    </div>;
}
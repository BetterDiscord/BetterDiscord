import React from "@modules/react";

const {useState, useCallback} = React;


export default function Switch({id, checked: initialValue, disabled, onChange}) {
    const [checked, setChecked] = useState(initialValue);
    const change = useCallback(() => {
        onChange?.(!checked);
        setChecked(!checked);
    }, [checked, onChange]);

    const enabledClass = disabled ? " bd-switch-disabled" : "";
    const checkedClass = checked ? " bd-switch-checked" : "";
    return <div className={`bd-switch` + enabledClass + checkedClass}>
        <input id={id} type="checkbox" disabled={disabled} checked={checked} onChange={change} />
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
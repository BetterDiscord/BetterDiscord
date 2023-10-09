import React from "@modules/react";

const {useState, useCallback} = React;


export default function Checkbox({checked: initialState, text, onChange: notifyParent}) {
    const [checked, setChecked] = useState(initialState);
    const onClick = useCallback(() => {
        notifyParent?.(!checked);
        setChecked(!checked);
    }, [notifyParent, checked]);

    return <div className="checkbox-item">
            <div className="checkbox-label label-JWQiNe da-label">{text}</div>
            <div className="checkbox-wrapper checkbox-3kaeSU da-checkbox checkbox-3EVISJ da-checkbox" onClick={onClick}>
                <div className="checkbox-inner checkboxInner-3yjcPe da-checkboxInner">
                    <input className="checkbox checkboxElement-1qV33p da-checkboxElement" checked={checked} type="checkbox" />
                    <span></span>
                </div>
                <span></span>
            </div>
        </div>;
}
import React from "react";
import Divider from "@ui/divider";

export interface SettingItemProps {
    id: string;
    name?: string;
    note?: string;
    inline?: boolean;
    children?: React.ReactNode;
    divider?: boolean;

    /** Shown right after the label, such as a reset button. */
    action?: React.ReactNode;

    /** Shown under the note, after the children when the item isn't inline. */
    below?: React.ReactNode;
};

export default function SettingItem(props: SettingItemProps) {
    const {id, name, note, inline, children, divider = true, action, below} = props;
    const label = <label htmlFor={id} className={"bd-setting-title"}>{name}</label>;
    return <div className={"bd-setting-item" + (inline ? " inline" : "")}>
        <div className={"bd-setting-header"}>
            {action ? <div className="bd-setting-title-wrap">{label}{action}</div> : label}
            {inline && children}
        </div>
        <div className={"bd-setting-note"}>{note}</div>
        {!inline && children}
        {below}
        {divider && <Divider className="bd-setting-divider" />}
    </div>;
}
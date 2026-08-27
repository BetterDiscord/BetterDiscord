import React from "react";
import Divider from "@ui/divider";

export interface SettingItemProps {
    id: string;
    name?: string;
    note?: string;
    inline?: boolean;
    children?: React.ReactNode;
};

export default function SettingItem(props: SettingItemProps) {
    const {id, name, note, inline, children} = props;
    return <div className={"bd-setting-item" + (inline ? " inline" : "")}>
        <div className={"bd-setting-header"}>
            <label htmlFor={id} className={"bd-setting-title"}>{name}</label>
            {inline && children}
        </div>
        <div className={"bd-setting-note"}>{note}</div>
        {!inline && children}
        <Divider className="bd-setting-divider" />
    </div>;
}
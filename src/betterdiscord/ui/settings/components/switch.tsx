import React from "react";
import {useItemProps, type BaseSettingProps} from "./utils";
import clsx from "clsx";

interface SwitchPropsBase {
    id?: string;
    value: boolean;
    disabled?: boolean;
    onChange?(newValue?: boolean): void;
}

export type SwitchProps = SwitchPropsBase & BaseSettingProps<boolean>;

export default function Switch(props: SwitchProps) {
    const {state, setState: toggle, disabled} = useItemProps<boolean, unknown>(props, (_, state) => !state);

    return (
        <div
            className={clsx("bd-switch", {
                "bd-switch-disabled": disabled,
                "bd-switch-checked": state
            })}
        >
            <input id={props.id} type="checkbox" disabled={disabled} checked={state} onChange={toggle} />

            <div className="bd-switch-body">
                <svg className="bd-switch-slider" viewBox="0 0 28 20" preserveAspectRatio="xMinYMid meet">
                    <rect className="bd-switch-handle" fill="white" x="4" y="0" height="20" width="20" rx="10"></rect>
                    <svg className="bd-switch-symbol" viewBox="0 0 20 20" fill="none">
                        <path></path>
                        <path></path>
                    </svg>
                </svg>
            </div>
        </div>
    );
}
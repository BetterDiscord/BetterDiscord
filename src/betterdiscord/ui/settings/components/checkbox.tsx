import clsx from "clsx";
import React from "react";
import Flex from "@ui/base/flex";
import {CheckIcon} from "lucide-react";
import {useItemProps, type BaseSettingProps} from "./utils";

interface CheckboxPropsBase {
    defaultValue?: boolean,
    onChange(newState: boolean): void,
    className?: string,
    inputClassName?: string,
    iconClassName?: string,
    id?: string,
    label?: React.ReactNode,
    labelClassName?: string,
    disabled?: boolean,
    reverse?: boolean;
}

export type CheckboxProps = CheckboxPropsBase & BaseSettingProps<boolean>;

export default function CheckBox(props: CheckboxProps) {
    const {state, setState: toggle, disabled} = useItemProps<boolean, React.MouseEvent>(props, (_, bool) => !bool);

    return (
        <Flex
            className={clsx("bd-checkbox", props.className, {"bd-checkbox-disabled": disabled, "bd-checkbox-has-label": props.label, "bd-checkbox-reverse": props.reverse})}
            align={Flex.Align.CENTER}
            direction={props.reverse ? Flex.Direction.HORIZONTAL_REVERSE : Flex.Direction.HORIZONTAL}
            onClick={toggle}
        >
            <input
                type="checkbox"
                checked={state}
                id={props.id}
                className={clsx("bd-checkbox-input", props.inputClassName)}
            />
            <div className={clsx("bd-checkbox-box", props.iconClassName)}>
                <CheckIcon size="18px" />
            </div>
            {props.label && (
                <div className={clsx("bd-checkbox-label", props.labelClassName)}>{props.label}</div>
            )}
        </Flex>
    );
}
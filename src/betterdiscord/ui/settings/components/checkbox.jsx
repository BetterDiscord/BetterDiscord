import clsx from "clsx";
import React from "@modules/react";
import Flex from "@ui/base/flex";
import {CheckIcon} from "lucide-react";

/**
 *
 * @param {{
 *      value: boolean,
 *      onChange(newState: boolean): void,
 *      className?: string,
 *      inputClassName?: string,
 *      iconClassName?: string,
 *      id?: string,
 *      label?: string,
 *      labelClassName?: string,
 *      disabled?: boolean,
 *      reverse?: boolean
 * }} props
 */
export default function CheckBox(props) {
    const [state, setState] = React.useState(props.value);

    const onChange = React.useCallback(() => {
        if (props.disabled) return;
        setState((value) => {
            props.onChange?.(!value);

            return !value;
        });
    }, [props]);

    return (
        <Flex
            className={clsx("bd-checkbox", props.className, {"bd-checkbox-disabled": props.disabled, "bd-checkbox-has-label": props.label, "bd-checkbox-reverse": props.reverse})}
            align={Flex.Align.CENTER}
            direction={props.reverse ? Flex.Direction.HORIZONTAL_REVERSE : Flex.Direction.HORIZONTAL}
            onClick={onChange}
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
                <div className={clsx("bd-checkbox-label", props.label)}>{props.label}</div>
            )}
        </Flex>
    );
}
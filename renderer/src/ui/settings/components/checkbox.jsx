import React from "@modules/react";
import Utilities from "@modules/utilities";
import Flex from "@ui/base/flex";
import Checkmark from "@ui/icons/check";

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
            className={Utilities.className("bd-checkbox", props.className, {"bd-checkbox-disabled": props.disabled, "bd-checkbox-has-label": props.label, "bd-checkbox-reverse": props.reverse})} 
            align={Flex.Align.CENTER}
            direction={props.reverse ? Flex.Direction.HORIZONTAL_REVERSE : Flex.Direction.HORIZONTAL}
            onClick={onChange}
        >
            <input 
                type="checkbox" 
                checked={state} 
                id={props.id} 
                className={Utilities.className("bd-checkbox-input", props.inputClassName)}
            />
            <div className={Utilities.className("bd-checkbox-box", props.iconClassName)}>
                <Checkmark size={18} />
            </div>
            {props.label && (
                <div className={Utilities.className("bd-checkbox-label", props.label)}>{props.label}</div>
            )}
        </Flex>
    );
}
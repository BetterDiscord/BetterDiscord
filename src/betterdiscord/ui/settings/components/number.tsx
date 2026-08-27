import React, {useCallback} from "react";
import Button from "@ui/base/button";
import {Plus, Minus} from "lucide-react";
import {useItemProps, type BaseSettingProps} from "./utils";

interface BaseNumberInputProps {
    min?: number;
    max?: number;
    step?: number;
}

export type NumberInputProps = BaseNumberInputProps & BaseSettingProps<number>;

export default function Number(props: NumberInputProps) {
    const {min, max, step = 1} = props;

    const {state, setState, disabled} = useItemProps<number, number | React.ChangeEvent<HTMLInputElement>>(props, (newValue) => {
        if (typeof newValue === "object") return newValue.currentTarget.valueAsNumber;
        return newValue;
    });

    const increment = useCallback(() => {
        const currentValue = typeof state === "number" ? state : parseFloat(state);
        const incrementedValue = currentValue + step;

        if (max !== undefined && incrementedValue > max) return;

        setState(incrementedValue);
    }, [max, setState, state, step]);

    const decrement = useCallback(() => {
        const currentValue = typeof state === "number" ? state : parseFloat(state);
        const decrementedValue = currentValue - step;

        if (max !== undefined && decrementedValue < max) return;

        setState(decrementedValue);
    }, [state, step, max, setState]);

    return (
        <div className={`bd-number-input-wrapper${disabled ? " bd-number-input-disabled" : ""}`}>
            <Button size={Button.Sizes.ICON} look={Button.Looks.FILLED} color={Button.Colors.PRIMARY} className="bd-number-input-decrement" onClick={decrement}>
                <Minus size="24px" />
            </Button>
            <input onChange={setState} type="number" className="bd-number-input" min={min} max={max} step={step} value={state} disabled={disabled} />
            <Button size={Button.Sizes.ICON} look={Button.Looks.FILLED} color={Button.Colors.PRIMARY} className="bd-number-input-increment" onClick={increment}>
                <Plus size="24px" />
            </Button>
        </div>

    );
}
import {useSettingsContext} from "@ui/contexts";
import {useCallbackRef} from "@ui/hooks";
import {useState} from "react";

export type BaseSettingProps<T> = ({
    value: T;
    defaultValue?: never;
} | {
    value?: never;
    defaultValue: T;
}) & {
    onChange?(value: T): void;
    disabled?: boolean;
};

interface HandledValue<T, V> {
    disabled: boolean | undefined;
    state: T;
    original: T;
    setState(value: V, stateOnly?: boolean): void;
}

export function useItemProps<T, V extends any = T>(props: BaseSettingProps<T>, convertValue: (newValue: V, currentValue: T) => T = (x) => x as unknown as T): HandledValue<T, V> {
    const ctx = useSettingsContext<T>();
    const [usesDefaultValue] = useState(() => !("value" in props));
    const [internalState, setState] = useState(props.defaultValue);

    const [original] = useState(() => (ctx.fail ? usesDefaultValue ? props.defaultValue : props.value : ctx.value) as T);

    const change = useCallbackRef<HandledValue<T, V>["setState"]>((value, stateOnly) => {
        if (ctx.fail ? props.disabled : ctx.disabled) return;

        const out = convertValue(value, ctx.fail ? (usesDefaultValue ? internalState : props.value) as T : ctx.value);

        if (!stateOnly) props.onChange?.(out);

        setState(out);
    });

    if (!ctx.fail) {
        return {
            original: original,
            disabled: ctx.disabled,
            state: ctx.value,

            setState: change
        };
    }

    return {
        original: original,
        disabled: props.disabled,
        state: (usesDefaultValue ? internalState : props.value) as T,

        setState: change
    };
}
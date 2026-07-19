import React, {useEffectEvent, useLayoutEffect, useRef, useState} from "react";
import clsx from "clsx";
import {ChevronDown} from "lucide-react";
import {useItemProps, type BaseSettingProps} from "./utils";

export interface SelectOption {
    id?: string;
    value: any;
    label: string;
}

interface BaseSelectProps {
    value?: any;
    options: SelectOption[];
    style?: "transparent" | "default";
    onChange?(newValue: any): void;
    disabled?: boolean;
}

export type SelectProps = BaseSelectProps & BaseSettingProps<any>;

export default function Select(props: SelectProps) {
    const {options, style} = props;

    const {state, setState, disabled} = useItemProps(props);

    const selectRef = useRef<HTMLButtonElement>(null);
    const optionsRef = useRef<HTMLUListElement>(null);
    const selectedRef = useRef<HTMLLIElement>(null);

    const [isOpen, setIsOpen] = useState(false);

    const change = useEffectEvent((val: any) => {
        setState(val);
        optionsRef.current?.togglePopover(false);
    });

    useLayoutEffect(() => {
        const selectButton = selectRef.current;
        const optionsPopover = optionsRef.current;

        if (!selectButton || !optionsPopover) return;

        selectButton.popoverTargetElement = optionsPopover;
        selectButton.popoverTargetAction = "toggle";

        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) {
                optionsPopover.togglePopover(false);
            }
        });
        observer.observe(selectButton);

        return () => {
            if (selectButton) observer.unobserve(selectButton);
        };
    }, []);

    useLayoutEffect(() => {
        if (isOpen) {
            selectedRef.current?.scrollIntoView({block: "center", behavior: "instant"});
        }
    }, [isOpen]);

    // ?? options[0] provides a double failsafe
    const selected = options.find(o => o.value == state) ?? options[0];

    return (
        <>
            <button
                ref={selectRef}
                type="button"
                className={clsx("bd-select", disabled && "bd-select-disabled", style == "transparent" && "bd-select-transparent")}
                disabled={disabled}
            >
                <span className="bd-select-value">{selected.label}</span>
                <ChevronDown size="16px" className="bd-select-arrow" />
            </button>
            <ul
                ref={optionsRef}
                onToggle={(e) => setIsOpen(e.newState === "open")}
                popover="auto"
                role="listbox"
                className="bd-select-options bd-scroller-thin"
            >
                {options.map(opt =>
                    <li
                        ref={selected.value == opt.value ? selectedRef : null}
                        className={clsx("bd-select-option", selected.value == opt.value && "selected")}
                        role="option"
                        onClick={() => change(opt.value)}
                    >
                        {opt.label}
                    </li>
                )}
            </ul>
        </>
    );
}
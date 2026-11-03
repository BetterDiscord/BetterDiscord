import React, {useId, useLayoutEffect, useRef, useState} from "react";
import clsx from "clsx";
import {ChevronDown} from "lucide-react";
import {useItemProps, type BaseSettingProps} from "./utils";
import {useCallbackRef} from "@ui/hooks";

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

    /** The option the arrow keys are on while the list is open. */
    const [activeIndex, setActiveIndex] = useState(-1);
    const listId = useId();

    const change = useCallbackRef((val: any) => {
        setState(val);
        optionsRef.current?.togglePopover(false);
    });

    // ?? options[0] provides a double failsafe
    const selected = options.find(o => o.value == state) ?? options[0];
    const selectedIndex = Math.max(options.indexOf(selected), 0);

    const toggle = useCallbackRef((event: React.ToggleEvent<HTMLUListElement>) => {
        const opening = event.newState === "open";
        setIsOpen(opening);
        setActiveIndex(opening ? selectedIndex : -1);
        if (opening) {
            optionsRef.current?.focus();
            return;
        }

        // The list had focus, so hiding it drops focus to the body unless Tab or a click already moved it on
        const focus = document.activeElement;
        if (!focus || focus === document.body || optionsRef.current?.contains(focus)) selectRef.current?.focus();
    });

    // The arrow keys open the list from the button, like a native select
    const onButtonKeyDown = useCallbackRef((event: React.KeyboardEvent) => {
        if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
        event.preventDefault();
        optionsRef.current?.togglePopover(true);
    });

    const onListKeyDown = useCallbackRef((event: React.KeyboardEvent) => {
        const last = options.length - 1;
        const moves: Record<string, number> = {
            ArrowDown: Math.min(activeIndex + 1, last),
            ArrowUp: Math.max(activeIndex - 1, 0),
            Home: 0,
            End: last,
            PageDown: Math.min(activeIndex + 5, last),
            PageUp: Math.max(activeIndex - 5, 0)
        };

        if (event.key in moves) {
            event.preventDefault();
            setActiveIndex(moves[event.key]);
        }
        else if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (options[activeIndex]) change(options[activeIndex].value);
        }
        else if (event.key === "Tab") {
            optionsRef.current?.togglePopover(false);
        }
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

    useLayoutEffect(() => {
        if (activeIndex < 0) return;
        optionsRef.current?.children[activeIndex]?.scrollIntoView({block: "nearest", behavior: "instant"});
    }, [activeIndex]);

    return (
        <>
            <button
                ref={selectRef}
                type="button"
                className={clsx("bd-select", disabled && "bd-select-disabled", style == "transparent" && "bd-select-transparent")}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={listId}
                onKeyDown={onButtonKeyDown}
            >
                <span className="bd-select-value">{selected.label}</span>
                <ChevronDown size="16px" className="bd-select-arrow" />
            </button>
            <ul
                ref={optionsRef}
                id={listId}
                onToggle={toggle}
                onKeyDown={onListKeyDown}
                popover="auto"
                role="listbox"
                tabIndex={-1}
                aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
                className="bd-select-options bd-scroller-thin"
            >
                {options.map((opt, i) =>
                    <li
                        ref={selected.value == opt.value ? selectedRef : null}
                        id={`${listId}-${i}`}
                        className={clsx("bd-select-option", selected.value == opt.value && "selected", i === activeIndex && "active")}
                        role="option"
                        aria-selected={selected.value == opt.value}
                        onClick={() => change(opt.value)}
                        onMouseMove={() => setActiveIndex(i)}
                    >
                        {opt.label}
                    </li>
                )}
            </ul>
        </>
    );
}
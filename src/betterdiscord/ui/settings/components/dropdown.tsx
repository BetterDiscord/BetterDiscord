import React, {useId, useLayoutEffect, useRef, useState} from "react";
import clsx from "clsx";
import {CheckIcon, ChevronDown} from "lucide-react";
import {t} from "@common/i18n";
import {useItemProps, type BaseSettingProps} from "./utils";
import {useCallbackRef} from "@ui/hooks";

export interface SelectOption {
    id?: string;
    value: any;
    label: string;
    icon?: string;
}

interface BaseSelectProps {
    value?: any;
    options: SelectOption[];
    style?: "transparent" | "default";
    onChange?(newValue: any): void;
    disabled?: boolean;
    search?: boolean;
    multiple?: boolean;
    className?: string;
    ariaLabel?: string;
}

export type SelectProps = BaseSelectProps & BaseSettingProps<any>;

export function useAnchorPopover(buttonRef: React.RefObject<HTMLButtonElement | null>, popoverRef: React.RefObject<HTMLElement | null>) {
    useLayoutEffect(() => {
        const button = buttonRef.current;
        const popover = popoverRef.current;
        if (!button || !popover) return;

        button.popoverTargetElement = popover;
        button.popoverTargetAction = "toggle";

        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) popover.togglePopover(false);
        });
        observer.observe(button);
        return () => observer.disconnect();
    }, [buttonRef, popoverRef]);
}

function optionIcon(icon?: string) {
    const src = icon?.trim();
    if (!src || !src.toLowerCase().startsWith("https://")) return null;
    return <img className="bd-select-option-icon" src={src} alt="" />;
}

function pinChosen(list: SelectOption[], chosen: (option: SelectOption) => boolean) {
    return [...list.filter(chosen), ...list.filter(option => !chosen(option))];
}

function OptionContent({option}: {option: SelectOption;}) {
    return (
        <span className="bd-select-option-label">
            {optionIcon(option.icon)}
            <span>{option.label}</span>
        </span>
    );
}

export default function Select(props: SelectProps) {
    const {options, style, search, multiple, className, ariaLabel} = props;
    const {state, setState, disabled} = useItemProps(props);
    const selectRef = useRef<HTMLButtonElement>(null);
    const optionsRef = useRef<HTMLDivElement>(null);
    const selectedRef = useRef<HTMLLIElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [ordered, setOrdered] = useState(options);
    const valueRef = useRef<HTMLSpanElement>(null);
    const [summarizedKey, setSummarizedKey] = useState<string | null>(null);
    const picked = multiple && Array.isArray(state) ? state : [];
    const chosen = multiple ? options.filter(option => picked.some(value => value == option.value)) : [];
    const chosenKey = chosen.map(option => String(option.value)).join("\0");
    const summarize = summarizedKey === chosenKey;

    /** The option the arrow keys are on while the list is open, as an index into the shown options. */
    const [activeIndex, setActiveIndex] = useState(-1);
    const listId = useId();

    const selected = options.find(option => option.value == state) ?? options[0];
    const longest = options.reduce((best, option) => option.label.length > best.length ? option.label : best, "");
    const needle = query.trim().toLowerCase();
    const source = multiple ? ordered : options;
    const shown = search && needle ? source.filter(option => option.label.toLowerCase().includes(needle)) : source;

    const change = useCallbackRef((val: any) => {
        setState(val);
        if (!multiple) optionsRef.current?.togglePopover(false);
    });

    const choose = (option: SelectOption) => {
        if (!multiple) {
            change(option.value);
            return;
        }
        const on = picked.some(value => value == option.value);
        const next = on ? picked.filter(value => value != option.value) : [...picked, option.value];
        change(options.filter(item => next.some(value => value == item.value)).map(item => item.value));
    };

    useAnchorPopover(selectRef, optionsRef);

    const toggle = useCallbackRef((event: React.ToggleEvent<HTMLDivElement>) => {
        const open = event.newState === "open";
        setIsOpen(open);
        if (open && multiple) {
            setOrdered(pinChosen(options, option => Array.isArray(state) && state.some(value => value == option.value)));
        }
        if (!open) setQuery("");

        // A multiple choice list starts at the top, because the chosen options are pinned there
        setActiveIndex(open ? (multiple ? 0 : Math.max(options.indexOf(selected), 0)) : -1);
        if (open) {
            if (!search) optionsRef.current?.focus();
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
        const last = shown.length - 1;
        const isTyping = event.target === searchRef.current;
        const moves: Record<string, number> = {
            ArrowDown: Math.min(activeIndex + 1, last),
            ArrowUp: Math.max(activeIndex - 1, 0),
            PageDown: Math.min(activeIndex + 5, last),
            PageUp: Math.max(activeIndex - 5, 0)
        };
        // Home and End move the caret while typing in the search field
        if (!isTyping) Object.assign(moves, {Home: 0, End: last});

        if (event.key in moves) {
            event.preventDefault();
            setActiveIndex(moves[event.key]);
        }
        else if (event.key === "Enter" || (event.key === " " && !isTyping)) {
            event.preventDefault();
            if (shown[activeIndex]) choose(shown[activeIndex]);
        }
        else if (event.key === "Tab") {
            optionsRef.current?.togglePopover(false);
        }
        else if (event.key === "Escape") {
            // The popover closes itself, and Discord's settings shouldn't also take the Escape
            event.stopPropagation();
        }
    });

    useLayoutEffect(() => {
        if (!multiple || summarize || chosen.length < 2) return;
        const box = valueRef.current;
        if (box && box.scrollWidth > box.clientWidth) setSummarizedKey(chosenKey);
    }, [multiple, summarize, chosen.length, chosenKey]);

    useLayoutEffect(() => {
        if (!isOpen) return;
        if (search) searchRef.current?.focus();
        if (multiple) listRef.current?.scrollTo({top: 0});
        else selectedRef.current?.scrollIntoView({block: "center", behavior: "instant"});
    }, [isOpen, search, multiple]);

    useLayoutEffect(() => {
        if (activeIndex < 0) return;
        listRef.current?.children[activeIndex]?.scrollIntoView({block: "nearest", behavior: "instant"});
    }, [activeIndex]);

    if (!options.length) return null;

    const activeId = activeIndex >= 0 && shown[activeIndex] ? `${listId}-${activeIndex}` : undefined;

    return (
        <>
            <button
                ref={selectRef}
                type="button"
                className={clsx("bd-select", className, multiple && "bd-select-multiple", disabled && "bd-select-disabled", style == "transparent" && "bd-select-transparent", isOpen && "is-open", multiple && !chosen.length && "is-empty")}
                disabled={disabled}
                aria-label={ariaLabel}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={listId}
                onKeyDown={onButtonKeyDown}
            >
                <span className={clsx("bd-select-value", multiple && "bd-select-values")} title={summarize ? chosen.map(option => option.label).join(", ") : undefined}>
                    <span className="bd-select-sizer">{longest}</span>
                    <span ref={valueRef} className="bd-select-current">
                        {multiple && !chosen.length && <span>{t("Table.none")}</span>}
                        {multiple && chosen.length > 0 && summarize && <span>{t("Table.selected", {count: chosen.length})}</span>}
                        {multiple && chosen.length > 0 && !summarize && chosen.map(option => <OptionContent key={String(option.value)} option={option} />)}
                        {!multiple && selected && <OptionContent option={selected} />}
                    </span>
                </span>
                <ChevronDown size="16px" className="bd-select-arrow" />
            </button>
            <div
                ref={optionsRef}
                popover="auto"
                onToggle={toggle}
                onKeyDown={onListKeyDown}
                tabIndex={-1}
                aria-activedescendant={search ? undefined : activeId}
                className={clsx("bd-select-options", "bd-scroller-thin", search && "bd-select-options-search")}
            >
                {search && (
                    <input
                        ref={searchRef}
                        className="bd-select-search"
                        type="text"
                        placeholder={t("Table.search")}
                        aria-label={t("Table.search")}
                        aria-controls={listId}
                        aria-activedescendant={activeId}
                        value={query}
                        spellCheck={false}
                        autoComplete="off"
                        onChange={(event) => {
                            setQuery(event.currentTarget.value);
                            setActiveIndex(0);
                        }}
                    />
                )}
                <ul ref={listRef} id={listId} className={clsx("bd-select-list", search && "bd-scroller-thin")} role="listbox" aria-multiselectable={multiple || undefined}>
                    {shown.map((option, i) => {
                        const isSelected = multiple ? picked.some(value => value == option.value) : selected?.value == option.value;
                        return (
                            <li
                                key={option.id ?? String(option.value)}
                                id={`${listId}-${i}`}
                                ref={isSelected ? selectedRef : null}
                                className={clsx("bd-select-option", isSelected && "selected", i === activeIndex && "active")}
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => choose(option)}
                                onMouseMove={() => setActiveIndex(i)}
                            >
                                <OptionContent option={option} />
                                {isSelected && multiple && <CheckIcon size="12px" strokeWidth={3} className="bd-select-check" />}
                            </li>
                        );
                    })}
                    {search && needle && !shown.length && <li className="bd-select-empty">{t("Table.noMatches")}</li>}
                </ul>
            </div>
        </>
    );
}

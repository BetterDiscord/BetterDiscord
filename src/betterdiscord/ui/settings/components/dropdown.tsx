import React, {useLayoutEffect, useRef, useState} from "react";
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
    const [summarize, setSummarize] = useState(false);
    const picked = multiple && Array.isArray(state) ? state : [];
    const chosen = multiple ? options.filter(option => picked.some(value => value == option.value)) : [];
    const chosenKey = chosen.map(option => String(option.value)).join("\0");
    const [fitKey, setFitKey] = useState(chosenKey);
    if (fitKey !== chosenKey) {
        setFitKey(chosenKey);
        setSummarize(false);
    }

    const change = useCallbackRef((val: any) => {
        setState(val);
        if (!multiple) optionsRef.current?.togglePopover(false);
    });

    useAnchorPopover(selectRef, optionsRef);

    useLayoutEffect(() => {
        if (!multiple || summarize || chosen.length < 2) return;
        const box = valueRef.current;
        if (box && box.scrollWidth > box.clientWidth) setSummarize(true);
    }, [multiple, summarize, chosen.length, chosenKey]);

    useLayoutEffect(() => {
        if (!isOpen) return;
        if (search) searchRef.current?.focus();
        if (multiple) listRef.current?.scrollTo({top: 0});
        else selectedRef.current?.scrollIntoView({block: "center", behavior: "instant"});
    }, [isOpen, search, multiple]);

    if (!options.length) return null;

    const selected = options.find(option => option.value == state) ?? options[0];
    const longest = options.reduce((best, option) => option.label.length > best.length ? option.label : best, "");
    const needle = query.trim().toLowerCase();
    const source = multiple ? ordered : options;
    const shown = search && needle ? source.filter(option => option.label.toLowerCase().includes(needle)) : source;

    const choose = (option: SelectOption) => {
        if (!multiple) {
            change(option.value);
            return;
        }
        const on = picked.some(value => value == option.value);
        const next = on ? picked.filter(value => value != option.value) : [...picked, option.value];
        change(options.filter(item => next.some(value => value == item.value)).map(item => item.value));
    };

    return (
        <>
            <button
                ref={selectRef}
                type="button"
                className={clsx("bd-select", className, multiple && "bd-select-multiple", disabled && "bd-select-disabled", style == "transparent" && "bd-select-transparent", isOpen && "is-open", multiple && !chosen.length && "is-empty")}
                disabled={disabled}
                aria-label={ariaLabel}
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
                onToggle={(event) => {
                    const open = event.newState === "open";
                    setIsOpen(open);
                    if (open && multiple) {
                        setOrdered(pinChosen(options, option => Array.isArray(state) && state.some(value => value == option.value)));
                    }
                    if (!open) setQuery("");
                }}
                className={clsx("bd-select-options", "bd-scroller-thin", search && "bd-select-options-search")}
            >
                {search && (
                    <input
                        ref={searchRef}
                        className="bd-select-search"
                        type="text"
                        placeholder={t("Table.search")}
                        aria-label={t("Table.search")}
                        value={query}
                        spellCheck={false}
                        autoComplete="off"
                        onChange={(event) => setQuery(event.currentTarget.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") event.preventDefault();
                        }}
                    />
                )}
                <ul ref={listRef} className={clsx("bd-select-list", search && "bd-scroller-thin")} role="listbox" aria-multiselectable={multiple || undefined}>
                    {shown.map(option => {
                        const isSelected = multiple ? picked.some(value => value == option.value) : selected?.value == option.value;
                        return (
                            <li
                                key={option.id ?? String(option.value)}
                                ref={isSelected ? selectedRef : null}
                                className={clsx("bd-select-option", isSelected && "selected")}
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => choose(option)}
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

import React, {useEffect, useLayoutEffect, useRef, useState} from "react";
import clsx from "clsx";
import {EllipsisVertical, GripVertical, Plus, Trash2, XIcon} from "lucide-react";
import {t} from "@common/i18n";
import {none, SettingsContext} from "@ui/contexts";
import {useItemProps, type BaseSettingProps} from "./utils";
import Select, {useAnchorPopover} from "./dropdown";
import Textbox from "./textbox";
import Switch from "./switch";
import CheckBox from "./checkbox";
import type {TableCellValue, TableColumn, TableColumns, TableRow} from "@data/settings";

interface TablePropsBase {
    columns: TableColumns;
    id?: string;
    addLabel?: string;
    itemName?: string | [string, string];
}

export type TableProps = TablePropsBase & BaseSettingProps<TableRow[]>;

type Column = TableColumn & {id: string};

const columnTypes = new Set(["string", "array", "boolean", "switch", "dropdown", "multiselect"]);
const cellContext = {value: none, disabled: false, fail: true};

function listColumns(columns: TableColumns | undefined): Column[] {
    if (!columns || typeof columns !== "object") throw new Error("Table setting missing columns");

    const list = Array.isArray(columns)
        ? columns.map(column => {
            if (!column?.id || !column.type) throw new Error("Table column missing id or type");
            return column;
        })
        : Object.entries(columns).map(([id, column]) => {
            if (!column?.type) throw new Error(`Table column ${id} missing type`);
            return {...column, id};
        });

    for (const column of list) {
        if (!columnTypes.has(column.type)) throw new Error(`Table column ${column.id} has unknown type ${column.type}`);
        if ((column.type === "dropdown" || column.type === "multiselect") && !Array.isArray(column.options)) {
            throw new Error(`Table column ${column.id} missing options`);
        }
    }

    if (!list.length) throw new Error("Table setting missing columns");
    return list;
}

function asText(value: TableCellValue | undefined): string {
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
    return "";
}

function asList(value: TableCellValue | undefined): string[] {
    if (Array.isArray(value)) return value.map(item => String(item));
    if (typeof value === "string" && value.trim()) return value.split(",").map(part => part.trim()).filter(Boolean);
    return [];
}

function choiceValue(value: TableCellValue | undefined): string | number {
    if (typeof value === "string" || typeof value === "number") return value;
    return "";
}

function choiceList(value: TableCellValue | undefined): Array<string | number> {
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is string | number => typeof item === "string" || typeof item === "number");
}

function createRow(columns: Column[]): TableRow {
    const row: TableRow = {};

    for (const column of columns) {
        if (column.default !== undefined) {
            row[column.id] = Array.isArray(column.default) ? [...column.default] : column.default;
            continue;
        }
        switch (column.type) {
            case "string":
                row[column.id] = "";
                break;
            case "boolean":
            case "switch":
                row[column.id] = false;
                break;
            case "array":
            case "multiselect":
                row[column.id] = [];
                break;
            case "dropdown":
                row[column.id] = column.options[0]?.value ?? "";
                break;
        }
    }

    return row;
}

function columnTrack(column: Column) {
    if (column.width) return column.width;
    if (column.type === "string") return "160px";
    if (column.type === "array") return "220px";
    return "max-content";
}

function columnAlign(column: Column) {
    if (column.align) return column.align;
    if (column.type === "boolean" || column.type === "switch") return "center";
    return "start";
}

function countLabel(count: number, itemName?: string | [string, string]) {
    let name = t("Table.item", {count});
    if (Array.isArray(itemName)) name = (count === 1 ? itemName[0] : itemName[1]) || name;
    else if (typeof itemName === "string" && itemName) name = itemName;
    return t("Table.count", {count, name});
}

function copyRow(row: TableRow): TableRow {
    const next: TableRow = {};
    for (const [id, value] of Object.entries(row)) next[id] = Array.isArray(value) ? [...value] : value;
    return next;
}

function ArrayCell({column, value, disabled, onChange}: {column: Extract<Column, {type: "array";}>; value: TableCellValue | undefined; disabled?: boolean; onChange(next: string[]): void;}) {
    const list = asList(value);
    const [draft, setDraft] = useState("");

    const commit = (raw: string) => {
        const parts = raw.split(/[\s,]+/).map(part => part.trim()).filter(Boolean);
        setDraft("");
        if (!parts.length) return;
        const add = parts.filter((item, index) => !list.includes(item) && parts.indexOf(item) === index);
        if (add.length) onChange([...list, ...add]);
    };

    return (
        <div className={clsx("bd-table-tags", disabled && "is-disabled")}>
            {list.map((item, index) => {
                const valid = !column.validate || column.validate(item);
                return (
                    <span key={`${item}-${index}`} className={clsx("bd-table-tag", !valid && "is-invalid")} title={valid ? undefined : column.invalidHint}>
                        <span className="bd-table-tag-label">{item}</span>
                        <button
                            type="button"
                            className="bd-table-tag-x"
                            aria-label={t("Table.remove", {name: item})}
                            disabled={disabled}
                            onClick={() => onChange(list.filter((_, itemIndex) => itemIndex !== index))}
                        >
                            <XIcon size="10px" />
                        </button>
                    </span>
                );
            })}
            <input
                className="bd-table-tag-input"
                type="text"
                aria-label={column.label}
                disabled={disabled}
                spellCheck={false}
                autoComplete="off"
                placeholder={list.length ? (column.placeholderFilled || t("Table.add")) : (column.placeholder || "")}
                value={draft}
                onChange={(event) => {
                    const next = event.currentTarget.value;
                    if (/[\s,]/.test(next)) commit(next);
                    else setDraft(next);
                }}
                onKeyDown={(event) => {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        commit(event.currentTarget.value);
                    }
                    else if (event.key === "Backspace" && !event.currentTarget.value && list.length) {
                        onChange(list.slice(0, -1));
                    }
                }}
                onBlur={(event) => {
                    if (event.currentTarget.value) commit(event.currentTarget.value);
                }}
            />
        </div>
    );
}

function RowMenu({disabled, label, onDuplicate, onDelete}: {disabled?: boolean; label: string; onDuplicate(): void; onDelete(): void;}) {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const over = useRef(false);
    const [remove, setRemove] = useState(false);
    useAnchorPopover(buttonRef, menuRef);

    useEffect(() => {
        const key = (event: KeyboardEvent) => {
            if (event.key !== "Shift") return;
            setRemove(over.current && event.type === "keydown" && !buttonRef.current?.disabled);
        };
        window.addEventListener("keydown", key);
        window.addEventListener("keyup", key);
        return () => {
            window.removeEventListener("keydown", key);
            window.removeEventListener("keyup", key);
        };
    }, []);

    const choose = (action: () => void) => {
        action();
        menuRef.current?.togglePopover(false);
    };

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                className={clsx("bd-table-more", remove && "is-delete")}
                aria-label={remove ? t("Table.delete") : label}
                title={remove ? t("Table.delete") : t("Table.rowActions")}
                disabled={disabled}
                onMouseEnter={(event) => {
                    over.current = true;
                    setRemove(event.shiftKey && !disabled);
                }}
                onMouseLeave={() => {
                    over.current = false;
                    setRemove(false);
                }}
                onClick={(event) => {
                    if (!event.shiftKey || disabled) return;
                    event.preventDefault();
                    event.stopPropagation();
                    menuRef.current?.togglePopover(false);
                    onDelete();
                }}
            >
                {remove ? <Trash2 size="14px" /> : <EllipsisVertical size="14px" />}
            </button>
            <div ref={menuRef} popover="auto" className="bd-select-options">
                <ul role="menu" className="bd-select-list">
                    <li className="bd-select-option" onClick={() => choose(onDuplicate)}>{t("Table.duplicate")}</li>
                    <li className="bd-select-option bd-select-option-danger" onClick={() => choose(onDelete)}>{t("Table.delete")}</li>
                </ul>
            </div>
        </>
    );
}

function Cell({column, value, disabled, onChange}: {column: Column; value: TableCellValue | undefined; disabled?: boolean; onChange(next: TableCellValue): void;}) {
    switch (column.type) {
        case "string":
            return <Textbox value={asText(value)} disabled={disabled} ariaLabel={column.label} placeholder={column.placeholder} onChange={onChange} />;
        case "array":
            return <ArrayCell column={column} value={value} disabled={disabled} onChange={onChange} />;
        case "boolean":
            return <CheckBox grow={0} shrink={0} value={value === true} disabled={disabled} ariaLabel={column.label} onChange={onChange} />;
        case "switch":
            return <Switch value={value === true} disabled={disabled} ariaLabel={column.label} onChange={(next) => onChange(next === true)} />;
        case "dropdown":
            return <Select options={column.options} value={choiceValue(value)} disabled={disabled} ariaLabel={column.label} search={column.search} onChange={onChange} />;
        case "multiselect":
            return <Select multiple options={column.options} value={choiceList(value)} disabled={disabled} ariaLabel={column.label} search={column.search} onChange={onChange} />;
    }
}

export default function Table(props: TableProps) {
    const {state, setState, disabled} = useItemProps<TableRow[]>(props);
    const rows = Array.isArray(state) ? state : [];
    const [rowKeys, setRowKeys] = useState<string[]>(() => rows.map(() => crypto.randomUUID()));
    const columns = listColumns(props.columns);
    const wrapRef = useRef<HTMLDivElement>(null);
    const dragging = useRef(false);
    const [drag, setDrag] = useState<{key: string; overKey: string | null; pos: "before" | "after" | null;} | null>(null);
    const [overflowing, setOverflowing] = useState(false);
    const tracks = [overflowing ? "42px" : "22px", ...columns.map(columnTrack), "34px"].join(" ");

    useLayoutEffect(() => {
        const wrap = wrapRef.current;
        if (!wrap) return;
        const check = () => {
            const next = wrap.scrollWidth - wrap.clientWidth > 1;
            setOverflowing(current => current === next ? current : next);
        };
        check();
        const observer = new ResizeObserver(check);
        observer.observe(wrap);
        if (wrap.firstElementChild) observer.observe(wrap.firstElementChild);
        return () => observer.disconnect();
    }, [tracks, rows.length]);

    const keys = rows.map((_, index) => rowKeys[index] ?? `row-${index}`);

    const updateCell = (index: number, id: string, value: TableCellValue) => {
        setState(rows.map((row, rowIndex) => rowIndex === index ? {...row, [id]: value} : row));
    };

    const removeRow = (index: number) => {
        setRowKeys(keys.filter((_, keyIndex) => keyIndex !== index));
        setState(rows.filter((_, rowIndex) => rowIndex !== index));
    };

    const duplicateRow = (index: number) => {
        const next = rows.slice();
        next.splice(index + 1, 0, copyRow(rows[index]));
        const copy = keys.slice();
        copy.splice(index + 1, 0, crypto.randomUUID());
        setRowKeys(copy);
        setState(next);
    };

    const addRow = () => {
        setRowKeys([...keys, crypto.randomUUID()]);
        setState([...rows, createRow(columns)]);
    };

    const reorder = (fromKey: string, toKey: string, pos: "before" | "after") => {
        if (fromKey === toKey) return;
        const order = keys.slice();
        const from = order.indexOf(fromKey);
        if (from < 0) return;
        const nextRows = rows.slice();
        const [row] = nextRows.splice(from, 1);
        order.splice(from, 1);
        let to = order.indexOf(toKey);
        if (to < 0) return;
        if (pos === "after") to += 1;
        nextRows.splice(to, 0, row);
        order.splice(to, 0, fromKey);
        setRowKeys(order);
        setState(nextRows);
    };

    const moveBy = (key: string, delta: number) => {
        const index = keys.indexOf(key);
        const target = index + delta;
        if (index < 0 || target < 0 || target >= keys.length) return;
        reorder(key, keys[target], delta < 0 ? "before" : "after");
    };

    return (
        <SettingsContext value={cellContext}>
            <div ref={wrapRef} className={clsx("bd-table-wrap", disabled && "bd-table-disabled")}>
                <div className="bd-table" role="table" style={{gridTemplateColumns: tracks}}>
                    <div className="bd-table-grid bd-table-head" role="row">
                        <div role="columnheader"><span className="bd-table-sr">Order</span></div>
                        {columns.map(column => (
                            <div key={column.id} role="columnheader" className="bd-table-heading" title={column.label}>
                                {column.label}
                            </div>
                        ))}
                        <div role="columnheader"><span className="bd-table-sr">Actions</span></div>
                    </div>
                    {rows.map((row, index) => {
                        const key = keys[index];
                        const rowClass = clsx(
                            "bd-table-grid",
                            "bd-table-row",
                            drag?.key === key && "is-dragging",
                            drag?.key && drag.overKey === key && drag.key !== key && (drag.pos === "before" ? "drop-before" : "drop-after")
                        );
                        return (
                            <div
                                key={key}
                                role="row"
                                data-row=""
                                className={rowClass}
                                onDragStart={(event) => {
                                    dragging.current = true;
                                    event.dataTransfer.effectAllowed = "move";
                                    event.dataTransfer.setData("text/plain", key);
                                    setDrag({key, overKey: null, pos: null});
                                }}
                                onDragOver={(event) => {
                                    if (!drag || disabled) return;
                                    event.preventDefault();
                                    const rect = event.currentTarget.getBoundingClientRect();
                                    const pos = event.clientY < rect.top + rect.height / 2 ? "before" : "after";
                                    if (drag.overKey !== key || drag.pos !== pos) setDrag({key: drag.key, overKey: key, pos});
                                }}
                                onDrop={(event) => {
                                    event.preventDefault();
                                    if (drag && drag.pos) reorder(drag.key, key, drag.pos);
                                    setDrag(null);
                                }}
                                onDragEnd={(event) => {
                                    dragging.current = false;
                                    event.currentTarget.draggable = false;
                                    setDrag(null);
                                }}
                            >
                                <div role="cell" className={clsx("bd-table-cell", overflowing && "bd-table-lead")}>
                                    <button
                                        type="button"
                                        className="bd-table-handle"
                                        title={t("Table.reorder", {index: index + 1})}
                                        aria-label={t("Table.reorder", {index: index + 1})}
                                        disabled={disabled}
                                        onMouseDown={(event) => {
                                            const rowNode = event.currentTarget.closest<HTMLElement>("[data-row]");
                                            if (rowNode) rowNode.draggable = true;
                                        }}
                                        onMouseUp={(event) => {
                                            if (dragging.current) return;
                                            const rowNode = event.currentTarget.closest<HTMLElement>("[data-row]");
                                            if (rowNode) rowNode.draggable = false;
                                        }}
                                        onKeyDown={(event) => {
                                            if (event.key === "ArrowUp") {
                                                event.preventDefault();
                                                moveBy(key, -1);
                                            }
                                            else if (event.key === "ArrowDown") {
                                                event.preventDefault();
                                                moveBy(key, 1);
                                            }
                                        }}
                                    >
                                        <GripVertical size="12px" />
                                    </button>
                                    {overflowing && <RowMenu disabled={disabled} label={t("Table.actionsFor", {index: index + 1})} onDuplicate={() => duplicateRow(index)} onDelete={() => removeRow(index)} />}
                                </div>
                                {columns.map(column => {
                                    const locked = Boolean(disabled) || Boolean(column.enableWith && row[column.enableWith] !== true);
                                    return (
                                        <div key={column.id} role="cell" className={clsx("bd-table-cell", columnAlign(column) === "center" && "is-center", locked && "is-locked")}>
                                            <Cell column={column} value={row[column.id]} disabled={locked} onChange={(value) => updateCell(index, column.id, value)} />
                                        </div>
                                    );
                                })}
                                <div role="cell" className="bd-table-cell is-center">
                                    <RowMenu disabled={disabled} label={t("Table.actionsFor", {index: index + 1})} onDuplicate={() => duplicateRow(index)} onDelete={() => removeRow(index)} />
                                </div>
                            </div>
                        );
                    })}
                    {rows.length === 0 && (
                        <div className="bd-table-empty">
                            <strong>{t("Table.emptyTitle")}</strong>
                            <span>{t("Table.emptyBody")}</span>
                        </div>
                    )}
                    <div className="bd-table-footer">
                        <button type="button" className="bd-table-add" disabled={disabled} onClick={addRow}>
                            <Plus size="12px" />
                            {props.addLabel || t("Table.add")}
                        </button>
                        <span className="bd-table-count">{countLabel(rows.length, props.itemName)}</span>
                    </div>
                </div>
            </div>
        </SettingsContext>
    );
}

import React, {useCallback, useMemo, useState, type ReactNode} from "react";
import {RotateCcwIcon} from "lucide-react";

import {t} from "@common/i18n";
import DiscordModules from "@modules/discordmodules";
import ThemeManager, {type Theme} from "@modules/thememanager";
import ThemeValues from "@modules/themes/store";
import {groupSettings, maxRadioChoices, pickControl, pickerHex, quoteCssString, readCssString, readCssUrl, readNumber, writeCssUrl, writeNumber, type ThemeControl} from "@modules/themes/panel";
import type {ThemeSetting} from "@modules/themes/types";
import Modals from "@ui/modals";
import {useStateFromStores} from "@ui/hooks";
import Button from "@ui/base/button";

import Drawer from "./drawer";
import SettingItem from "./components/item";
import Textbox from "./components/textbox";
import Switch from "./components/switch";
import Radio from "./components/radio";
import Dropdown from "./components/dropdown";
import Slider from "./components/slider";
import NumberInput from "./components/number";
import ColorPicker from "./components/color";
import type {HexString} from "@data/settings";


/**
 * The settings panel for one theme, shown in the addon settings modal. It looks the theme up by id on every
 * change, because reloading a theme's file replaces its object.
 */
export default function ThemeSettingsPanel({themeId}: {themeId: string;}) {
    const {theme, isEnabled} = useStateFromStores(ThemeManager, () => ({
        theme: ThemeManager.resolveAddon(themeId) as Theme | undefined,
        isEnabled: ThemeManager.isEnabled(themeId)
    }), [themeId], true);
    const saved = useStateFromStores(ThemeValues, () => ThemeValues.getSaved(themeId), [themeId]);

    if (!theme || !isEnabled || !theme.properties) {
        return <div className="bd-theme-settings-stopped">{t("ThemeSettings.notEnabled", {name: theme?.name ?? themeId})}</div>;
    }

    const {ungrouped, groups} = groupSettings(theme.properties);
    const renderSetting = (setting: ThemeSetting) => <SettingRow key={setting.property} theme={theme} setting={setting} hasSavedValue={setting.property in saved} />;

    return <div className="bd-theme-settings">
        <div className="bd-theme-settings-toolbar">
            <Button size={Button.Sizes.NONE} color={Button.Colors.PRIMARY} className="bd-theme-settings-reset-all" disabled={!Object.keys(saved).length} onClick={() => confirmResetAll(theme)}>
                <RotateCcwIcon size="16px" />
                {t("ThemeSettings.resetAll")}
            </Button>
        </div>
        {ungrouped.map(renderSetting)}
        {groups.map(group => <Drawer key={group.name} name={group.name} collapsible={true} shown={true}>
            {group.settings.map(renderSetting)}
        </Drawer>)}
    </div>;
}

function confirmResetAll(theme: Theme) {
    Modals.showConfirmationModal(t("ThemeSettings.resetAllTitle"), t("ThemeSettings.resetAllMessage", {name: theme.name}), {
        danger: true,
        confirmText: t("ThemeSettings.resetAll"),
        onConfirm: () => ThemeValues.resetAll(theme)
    });
}

interface SettingRowProps {
    theme: Theme;
    setting: ThemeSetting;
    hasSavedValue: boolean;
}

/**
 * Sets a value and says what the page now uses: the new applied value, or null when the value was refused and
 * nothing changed.
 */
type ApplyValue = (value: string) => string | null;

function SettingRow({theme, setting, hasSavedValue}: SettingRowProps) {
    const control = useMemo(() => pickControl(setting), [setting]);
    const applied = ThemeValues.getValue(theme, setting.property);

    // The invalid message stays until a value is accepted, or the value changes from somewhere else such as a reset
    const [isInvalid, setIsInvalid] = useState(false);
    const [checkedValue, setCheckedValue] = useState(applied);
    if (applied !== checkedValue) {
        setCheckedValue(applied);
        setIsInvalid(false);
    }

    const apply = useCallback<ApplyValue>(value => {
        const isRefused = ThemeValues.setValue(theme, setting.property, value) === "invalid";
        setIsInvalid(isRefused);
        if (isRefused) return null;

        const newValue = ThemeValues.getValue(theme, setting.property);
        setCheckedValue(newValue);
        return newValue;
    }, [theme, setting.property]);

    const custom = useCustomChoice(control, applied, apply);
    const {element, inline, below} = buildControl(setting, control, applied, apply, custom);
    const reset = hasSavedValue && <ResetButton name={setting.name} onClick={() => ThemeValues.reset(theme, setting.property)} />;

    // The error goes under the part that can take a refused value, which is the Custom control when it sits below
    const controlClass = "bd-theme-setting-control" + (isInvalid ? " bd-theme-setting-invalid" : "");
    const error = isInvalid && <div className="bd-theme-setting-error" role="alert">{t("ThemeSettings.invalid")}</div>;

    return <SettingItem
        id={setting.property}
        name={setting.name}
        note={setting.note}
        inline={inline}
        action={reset}
        below={below && <div className={controlClass}>{below}{error}</div>}
    >
        <div className={below ? "bd-theme-setting-control" : controlClass}>
            {element}
            {!below && error}
        </div>
    </SettingItem>;
}

const identity = (value: string) => value;

interface BuiltControl {
    element: ReactNode;
    inline: boolean;

    /** Shown under the setting's note, for an inline control that has more to show. */
    below?: ReactNode;
}

/**
 * Builds the control for a setting's current value. A number or color the control can't show, such as `calc()`
 * or `oklch()`, gets a text field instead. A `custom` control needs the row's `CustomChoice`.
 */
function buildControl(setting: ThemeSetting, control: ThemeControl, value: string, apply: ApplyValue, custom?: CustomChoice | null): BuiltControl {
    const textField = (read: (value: string) => string = identity, write: (text: string) => string = identity) => ({
        element: <TextSetting id={setting.property} value={value} read={read} write={write} apply={apply} />,
        inline: true
    });

    switch (control.kind) {
        case "switch":
            return {element: <Switch id={setting.property} value={value === "true"} onChange={isOn => apply(isOn ? "true" : "false")} />, inline: true};

        case "radio": {
            const options = control.options.map(o => ({name: o.label, value: o.value}));
            return {element: <Radio name={setting.property} options={options} value={value} onChange={apply} />, inline: false};
        }

        case "dropdown":
            return {element: <Dropdown options={control.options} value={value} onChange={apply} />, inline: true};

        case "custom": {
            if (!custom) return textField();
            const options = [...control.options, {value: customChoice, label: t("ThemeSettings.custom")}];
            const typeControl = custom.isCustom && buildControl(setting, control.control, custom.isKeyword ? "" : value, apply).element;

            // A dropdown stays in the header like any other dropdown, and the Custom control goes under the note
            if (control.display === "dropdown") {
                return {
                    element: <div className="bd-theme-keyword-dropdown"><Dropdown options={options} value={custom.picked} onChange={custom.pick} /></div>,
                    inline: true,
                    below: typeControl && <div className="bd-theme-custom bd-theme-custom-below">{typeControl}</div>
                };
            }

            return {
                element: <>
                    <Radio name={setting.property} options={options.map(o => ({name: o.label, value: o.value}))} value={custom.picked} onChange={custom.pick} />
                    {typeControl && <div className="bd-theme-custom">{typeControl}</div>}
                </>,
                inline: false
            };
        }

        case "slider": {
            const parsed = readNumber(value, control.units);
            if (!parsed) return textField();
            const {number, unit} = parsed;
            return {
                element: <div className="bd-theme-slider-row">
                    <Slider min={control.min} max={control.max} step={control.step} units={unit} value={number} onChange={n => apply(writeNumber(n, unit))} />
                    <div className="bd-theme-slider-value">{writeNumber(number, unit)}</div>
                    {control.units.length > 1 && <UnitPicker setting={setting} units={control.units} value={unit} onChange={u => apply(writeNumber(number, u))} />}
                </div>,
                inline: false
            };
        }

        case "number": {
            const parsed = readNumber(value, control.units);
            if (!parsed) return textField();
            const {number, unit} = parsed;
            const change = (n: number) => {
                if (Number.isFinite(n)) apply(writeNumber(n, unit));
            };
            return {
                element: <div className="bd-theme-number">
                    <NumberInput min={control.min} max={control.max} step={control.step} value={number} onChange={change} />
                    {control.units.length > 1
                        ? <UnitPicker setting={setting} units={control.units} value={unit} onChange={u => apply(writeNumber(number, u))} />
                        : unit && <span className="bd-theme-number-unit">{unit}</span>}
                </div>,
                inline: true
            };
        }

        case "color": {
            const hex = pickerHex(value);
            if (!hex) return textField();
            const change = (color: string | number) => apply(typeof color === "number" ? "#" + color.toString(16).padStart(6, "0") : color);
            return {
                element: <ColorPicker value={hex as HexString} defaultColor={(pickerHex(setting.initialValue) ?? setting.initialValue) as HexString} colors={control.palette as HexString[] | undefined} onChange={change} />,
                inline: true
            };
        }

        case "string":
            return textField(readCssString, quoteCssString);

        case "url":
            return textField(readCssUrl, writeCssUrl);
    }
}

interface UnitPickerProps {
    setting: ThemeSetting;
    units: string[];
    value: string;
    onChange(unit: string): void;
}

/**
 * A row of radio buttons, one per unit, or a dropdown when there are too many units to fit beside a label.
 * Switching units keeps the number, so 12px becomes 12rem.
 */
function UnitPicker({setting, units, value, onChange}: UnitPickerProps) {
    const label = t("ThemeSettings.unit", {name: setting.name});
    if (units.length > maxRadioChoices) {
        return <div className="bd-theme-unit-dropdown" role="group" aria-label={label}>
            <Dropdown options={units.map(unit => ({value: unit, label: unit}))} value={value} onChange={onChange} />
        </div>;
    }

    return <div className="bd-theme-unit-picker" role="radiogroup" aria-label={label}>
        {units.map(unit => <label key={unit}>
            <input type="radio" name={`${setting.property}-unit`} value={unit} checked={unit === value} onChange={() => onChange(unit)} />
            <span>{unit}</span>
        </label>)}
    </div>;
}

/** Stands for the Custom option among the keywords, and can't match any keyword. */
const customChoice = Symbol("custom");

/** What a `custom` control shows, and how picking from its keywords and Custom changes the value. */
interface CustomChoice {
    isKeyword: boolean;
    isCustom: boolean;
    picked: string | typeof customChoice;
    pick(choice: string | typeof customChoice): void;
}

/**
 * Tracks the Custom option of a `custom` control, and is null for any other control. Picking Custom applies the
 * starter value, so the control always matches the page. A setting with no starter, such as a link, shows an empty
 * field and waits for the user.
 */
function useCustomChoice(control: ThemeControl, value: string, apply: ApplyValue): CustomChoice | null {
    const [isWaiting, setIsWaiting] = useState(false);
    if (control.kind !== "custom") return null;

    const isKeyword = control.options.some(o => o.value === value);
    if (isWaiting && !isKeyword) setIsWaiting(false);
    const isCustom = !isKeyword || isWaiting;

    const pick = (choice: string | typeof customChoice) => {
        if (choice !== customChoice) {
            setIsWaiting(false);
            apply(choice);
            return;
        }
        if (isCustom) return;
        if (control.starter === null) setIsWaiting(true);
        else apply(control.starter);
    };

    return {isKeyword, isCustom, picked: isCustom ? customChoice : value, pick};
}

interface TextSettingProps {
    id: string;
    value: string;
    read(value: string): string;
    write(text: string): string;
    apply: ApplyValue;
}

/** A text field that keeps what the user typed, even when it's invalid, until the value changes from somewhere else. */
function TextSetting({id, value, read, write, apply}: TextSettingProps) {
    const [draft, setDraft] = useState(() => read(value));

    // The applied value the draft last matched
    const [shownValue, setShownValue] = useState(value);
    if (value !== shownValue) {
        setShownValue(value);
        setDraft(read(value));
    }

    const change = (text: string) => {
        setDraft(text);
        const newValue = apply(write(text));
        if (newValue !== null) setShownValue(newValue);
    };

    return <Textbox id={id} value={draft} onChange={change} />;
}

function ResetButton({name, onClick}: {name: string; onClick(): void;}) {
    return <DiscordModules.Tooltip color="primary" position="top" text={t("ThemeSettings.reset")}>
        {props => <button {...props} type="button" className="bd-theme-setting-reset" aria-label={t("ThemeSettings.resetSetting", {name})} onClick={onClick}>
            <RotateCcwIcon size="16px" />
        </button>}
    </DiscordModules.Tooltip>;
}

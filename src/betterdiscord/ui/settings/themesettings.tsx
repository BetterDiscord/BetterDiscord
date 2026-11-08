import {webUtils} from "electron";
import React, {useMemo, useRef, useState, type ChangeEvent, type ReactNode} from "react";
import {RotateCcwIcon, XIcon} from "lucide-react";

import {t} from "@common/i18n";
import DiscordModules from "@modules/discordmodules";
import ThemeManager, {type Theme} from "@modules/thememanager";
import ThemeValues, {themeImages} from "@modules/themes/store";
import {describeUrlValue, maxImageBytes, type CopyError} from "@modules/themes/images";
import {customOption, groupSettings, isInline, maxRadioChoices, pickControl, pickCustomChoice, pickerHex, quoteCssString, readCssString, readCssUrl, readCustomChoice, readNumber, sliderMarkers, writeCssUrl, writeNumber, type CustomChoiceState, type ThemeControl} from "@modules/themes/panel";
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


/** Reset all for a theme's settings page. It's disabled until the theme has a saved value. */
export function ThemeResetAllButton({themeId}: {themeId: string;}) {
    const theme = useStateFromStores(ThemeManager, () => ThemeManager.resolveAddon(themeId) as Theme | undefined, [themeId]);
    const hasSaved = useStateFromStores(ThemeValues, () => Object.keys(ThemeValues.getSaved(themeId)).length > 0, [themeId]);

    return <Button size={Button.Sizes.NONE} color={Button.Colors.PRIMARY} className="bd-theme-settings-reset-all" disabled={!theme || !hasSaved} onClick={() => theme && confirmResetAll(theme)}>
        <RotateCcwIcon size="16px" />
        {t("ThemeSettings.resetAll")}
    </Button>;
}

/**
 * The settings panel for one theme, shown on the addon settings page. It looks the theme up by id on every
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
    const renderSetting = (setting: ThemeSetting) => <SettingRow key={setting.property} theme={theme} setting={setting} savedValue={saved[setting.property]} />;

    return <div className="bd-theme-settings">
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

    /** The value saved for the setting, which differs from the applied one when the page can't use it. */
    savedValue: string | undefined;
}

/**
 * Sets a value and says what the page now uses: the new applied value, or null when the value was refused and
 * nothing changed.
 */
type ApplyValue = (value: string) => string | null;

function SettingRow({theme, setting, savedValue}: SettingRowProps) {
    const control = useMemo(() => pickControl(setting), [setting]);
    const applied = useStateFromStores(ThemeValues, () => ThemeValues.getValue(theme, setting.property), [theme, setting.property]);

    // The applied value when a value was refused, so the message stays until a value is accepted or the value
    // changes from somewhere else, such as a reset
    const [refusedAt, setRefusedAt] = useState<string | null>(null);
    const isInvalid = refusedAt === applied;

    const apply: ApplyValue = value => {
        const newValue = ThemeValues.setValue(theme, setting.property, value);
        setRefusedAt(newValue === null ? applied : null);
        return newValue;
    };

    // `custom` is set exactly when the control is a `custom` one
    const custom = useCustomChoice(control, applied, apply);
    const {element, below} = control.kind === "custom"
        ? buildCustomControl(setting, control, custom!, applied, apply, savedValue)
        : buildControl(setting, control, applied, apply, savedValue);
    const reset = savedValue !== undefined && <ResetButton name={setting.name} onClick={() => ThemeValues.reset(theme, setting.property)} />;

    // The error goes under the part that can take a refused value, which is the Custom control when it sits below
    const controlClass = "bd-theme-setting-control" + (isInvalid ? " bd-theme-setting-invalid" : "");
    const error = isInvalid && <div className="bd-theme-setting-error" role="alert">{t("ThemeSettings.invalid")}</div>;

    return <SettingItem
        id={setting.property}
        name={setting.name}
        note={setting.note}
        inline={isInline(control)}
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

    /** Shown under the setting's note, for an inline control that has more to show. */
    below?: ReactNode;
}

type CustomControl = Extract<ThemeControl, {kind: "custom";}>;

/**
 * Builds the control for a setting's current value. A number or color the control can't show, such as `calc()`
 * or `oklch()`, gets a text field instead.
 */
function buildControl(setting: ThemeSetting, control: Exclude<ThemeControl, CustomControl>, value: string, apply: ApplyValue, savedValue: string | undefined): BuiltControl {
    const textField = (read: (value: string) => string = identity, write: (text: string) => string = identity) => ({
        element: <TextSetting id={setting.property} value={value} read={read} write={write} apply={apply} />
    });

    switch (control.kind) {
        case "switch":
            return {element: <Switch id={setting.property} value={value === "true"} onChange={isOn => apply(isOn ? "true" : "false")} />};

        case "radio": {
            const options = control.options.map(o => ({name: o.label, value: o.value}));
            return {element: <Radio name={setting.property} options={options} value={value} onChange={apply} />};
        }

        case "dropdown":
            return {element: <Dropdown options={control.options} value={value} onChange={apply} />};

        case "slider": {
            const parsed = readNumber(value, control.units);
            if (!parsed) return textField();
            const {number, unit} = parsed;
            const markers = sliderMarkers(control.min, control.max, control.step).map(m => ({value: m, label: writeNumber(m, unit)}));
            return {
                element: <div className="bd-theme-slider">
                    {control.units.length > 1 && <UnitPicker setting={setting} units={control.units} value={unit} onChange={u => apply(writeNumber(number, u))} />}
                    <Slider min={control.min} max={control.max} step={control.step} units={unit} markers={markers} value={number} onChange={n => apply(writeNumber(n, unit))} />
                </div>
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
                </div>
            };
        }

        case "color": {
            const hex = pickerHex(value);
            if (!hex) return textField();

            // The picker only takes hex, so a default or palette color it can't show, such as `oklch()`, is left out
            const defaultHex = pickerHex(setting.initialValue) ?? undefined;
            const palette = control.palette?.map(color => pickerHex(color)).filter(color => color !== null);
            return {
                element: <ColorPicker alpha={true} value={hex as HexString} defaultColor={defaultHex as HexString | undefined} colors={palette as HexString[] | undefined} onChange={color => apply(color as string)} />
            };
        }

        case "string":
            return textField(readCssString, quoteCssString);

        case "url":
            return {
                element: <UrlSetting id={setting.property} value={value} savedValue={savedValue} initialValue={setting.initialValue} apply={apply} />
            };
    }
}

/**
 * Builds a `custom` control: its keywords and Custom, and the type's control. Under a dropdown the type's control
 * shows under the note once Custom is picked. Under radios it sits in the Custom option's row and is greyed out
 * until Custom is picked, showing the value Custom would apply.
 */
function buildCustomControl(setting: ThemeSetting, control: CustomControl, custom: CustomChoice, value: string, apply: ApplyValue, savedValue: string | undefined): BuiltControl {
    const options = [...control.options, {value: customOption, label: t("ThemeSettings.custom")}];
    const typeValue = custom.isKeyword ? control.starter ?? "" : value;
    const typeControl = buildControl(setting, control.control, typeValue, apply, savedValue).element;

    if (control.display === "dropdown") {
        return {
            element: <div className="bd-theme-keyword-dropdown"><Dropdown options={options} value={custom.picked} onChange={custom.pick} /></div>,
            below: custom.isCustom && <div className="bd-theme-custom-below">{typeControl}</div>
        };
    }

    // A disabled fieldset disables every field and button inside it, and the class stops clicks on the rest
    const customControl = <fieldset className="bd-theme-custom" disabled={!custom.isCustom}>{typeControl}</fieldset>;
    const radioOptions = options.map(o => ({name: o.label, value: o.value, control: o.value === customOption ? customControl : undefined}));
    return {
        element: <Radio name={setting.property} options={radioOptions} value={custom.picked} onChange={custom.pick} />
    };
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

/** What a `custom` control shows, and how picking from its keywords and Custom changes the value. */
interface CustomChoice extends CustomChoiceState {
    pick(choice: string | typeof customOption): void;
}

/**
 * Tracks the Custom option of a `custom` control, and is null for any other control. Picking Custom applies the
 * starter value, so the control always matches the page. A setting with no starter, such as a link, shows an empty
 * field and waits for the user.
 */
function useCustomChoice(control: ThemeControl, value: string, apply: ApplyValue): CustomChoice | null {
    const [isWaiting, setIsWaiting] = useState(false);
    if (control.kind !== "custom") return null;

    const state = readCustomChoice(control.options, value, isWaiting);
    if (isWaiting && !state.isKeyword) setIsWaiting(false);

    const pick = (choice: string | typeof customOption) => {
        const action = pickCustomChoice(control, choice, state.isCustom);
        if (!action) return;
        setIsWaiting("wait" in action);
        if ("apply" in action) apply(action.apply);
    };

    return {...state, pick};
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
    // What the user typed, and the applied value it goes with
    const [draft, setDraft] = useState<{text: string; value: string;} | null>(null);

    const change = (text: string) => {
        const newValue = apply(write(text));
        setDraft({text, value: newValue ?? value});
    };

    return <Textbox id={id} value={draft?.value === value ? draft.text : read(value)} onChange={change} />;
}

/** The formats the image store accepts, so the file dialog offers them first. */
const imageAccept = "image/png,image/jpeg,image/gif,image/webp,image/avif,image/svg+xml";

const copyErrorText: Record<CopyError, () => string> = {
    notImage: () => t("ThemeSettings.imageNotImage"),
    tooLarge: () => t("ThemeSettings.imageTooLarge", {size: maxImageBytes / 1024 / 1024}),
    unreadable: () => t("ThemeSettings.imageUnreadable")
};

interface UrlSettingProps {
    id: string;
    value: string;
    savedValue: string | undefined;
    initialValue: string;
    apply: ApplyValue;
}

/**
 * A link field with a Browse button for a local image. A picked image replaces the field with a thumbnail and a
 * button that clears it back to the default. A refused file shows why, and nothing changes.
 */
function UrlSetting({id, value, savedValue, initialValue, apply}: UrlSettingProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    // Why a picked file was refused, and the value it was picked over, so the message stays until the value changes
    const [refusal, setRefusal] = useState<{error: CopyError; value: string;} | null>(null);

    const pick = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.currentTarget.files?.[0];

        // Cleared so that picking the same file again still counts as a change
        event.currentTarget.value = "";
        if (!file) return;

        const error = themeImages.pick(webUtils.getPathForFile(file), apply);
        setRefusal(error && {error, value});
    };

    const view = describeUrlValue(value, savedValue);
    let message: string | null = null;
    if (refusal?.value === value) message = copyErrorText[refusal.error]();
    else if (view.kind === "link" && view.isImageMissing) message = t("ThemeSettings.imageMissing");

    return <div className="bd-theme-url">
        <div className="bd-theme-url-row">
            {view.kind === "image"
                ? <div className="bd-theme-image">
                    <img className="bd-theme-image-thumb" src={themeImages.urlFor(view.name) ?? undefined} alt="" />
                    <span className="bd-theme-image-label">{t("ThemeSettings.localImage")}</span>
                    <button type="button" className="bd-theme-image-clear" aria-label={t("ThemeSettings.removeImage")} onClick={() => apply(initialValue)}>
                        <XIcon size="16px" />
                    </button>
                </div>
                : <TextSetting id={id} value={value} read={readCssUrl} write={writeCssUrl} apply={apply} />}
            <Button size={Button.Sizes.NONE} color={Button.Colors.PRIMARY} className="bd-theme-url-browse" onClick={() => inputRef.current?.click()}>
                {t("Settings.browse")}
            </Button>
            <input ref={inputRef} type="file" hidden accept={imageAccept} onChange={pick} />
        </div>
        {message && <div className="bd-theme-setting-error" role="alert">{message}</div>}
    </div>;
}

function ResetButton({name, onClick}: {name: string; onClick(): void;}) {
    return <DiscordModules.Tooltip color="primary" position="top" text={t("ThemeSettings.reset")}>
        {props => <button {...props} type="button" className="bd-theme-setting-reset" aria-label={t("ThemeSettings.resetSetting", {name})} onClick={onClick}>
            <RotateCcwIcon size="16px" />
        </button>}
    </DiscordModules.Tooltip>;
}

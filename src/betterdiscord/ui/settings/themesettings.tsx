import React, {useCallback, useState} from "react";
import {RotateCcwIcon} from "lucide-react";

import {t} from "@common/i18n";
import DiscordModules from "@modules/discordmodules";
import ThemeManager, {type Theme} from "@modules/thememanager";
import ThemeValues from "@modules/themes/store";
import {groupSettings} from "@modules/themes/panel";
import type {ThemeSetting} from "@modules/themes/types";
import Modals from "@ui/modals";
import {useStateFromStores} from "@ui/hooks";
import Button from "@ui/base/button";

import Drawer from "./drawer";
import SettingItem from "./components/item";
import Textbox from "./components/textbox";


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

function SettingRow({theme, setting, hasSavedValue}: SettingRowProps) {
    const applied = ThemeValues.getValue(theme, setting.property);

    // The field keeps what the user typed, even when it's invalid, until the value changes from somewhere else
    // such as a reset. `shownValue` is the applied value the draft last matched.
    const [draft, setDraft] = useState(applied);
    const [shownValue, setShownValue] = useState(applied);
    const [isInvalid, setIsInvalid] = useState(false);

    if (applied !== shownValue) {
        setShownValue(applied);
        setDraft(applied);
        setIsInvalid(false);
    }

    const change = useCallback((text: string) => {
        setDraft(text);
        const result = ThemeValues.setValue(theme, setting.property, text);
        setIsInvalid(result === "invalid");
        if (result !== "invalid") setShownValue(ThemeValues.getValue(theme, setting.property));
    }, [theme, setting.property]);

    const reset = hasSavedValue && <ResetButton name={setting.name} onClick={() => ThemeValues.reset(theme, setting.property)} />;

    return <SettingItem id={setting.property} name={setting.name} note={setting.note} inline={false} action={reset}>
        <div className={"bd-theme-setting-control" + (isInvalid ? " bd-theme-setting-invalid" : "")}>
            <Textbox value={draft} onChange={change} />
            {isInvalid && <div className="bd-theme-setting-error" role="alert">{t("ThemeSettings.invalid")}</div>}
        </div>
    </SettingItem>;
}

function ResetButton({name, onClick}: {name: string; onClick(): void;}) {
    return <DiscordModules.Tooltip color="primary" position="top" text={t("ThemeSettings.reset")}>
        {props => <button {...props} type="button" className="bd-theme-setting-reset" aria-label={t("ThemeSettings.resetSetting", {name})} onClick={onClick}>
            <RotateCcwIcon size="16px" />
        </button>}
    </DiscordModules.Tooltip>;
}

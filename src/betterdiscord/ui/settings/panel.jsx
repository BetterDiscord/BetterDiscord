import React from "@modules/react";
import {t} from "@common/i18n";
import Settings from "@stores/settings";
import DiscordModules from "@modules/discordmodules";

import Button from "@ui/base/button";
import Modals from "@ui/modals";

import SettingsGroup from "@ui/settings/group";
import SettingsTitle from "@ui/settings/title";

import {ListRestartIcon} from "lucide-react";


function makeResetButton(collectionId, refresh) {
    const action = confirmReset(() => {
        Settings.resetCollection(collectionId);
        refresh?.();
    });
    return <DiscordModules.Tooltip color="primary" position="top" text={t("Settings.resetSettings")}>
        {(props) =>
            <Button {...props} aria-label={t("Settings.resetSettings")} size={Button.Sizes.ICON} look={Button.Looks.BLANK} color={Button.Colors.TRANSPARENT} onClick={action}>
                <ListRestartIcon />
            </Button>
        }
    </DiscordModules.Tooltip>;
}

/**
 * @param {function} action
 * @returns
 */
function confirmReset(action) {
    return () => {
        Modals.showConfirmationModal(t("Modals.confirmAction"), t("Settings.resetSettingsWarning"), {
            confirmText: t("Modals.okay"),
            cancelText: t("Modals.cancel"),
            danger: true,
            onConfirm: action,
        });
    };
}

export default function SettingsPanel({id, title, groups, onChange, onDrawerToggle, getDrawerState}) {
    return <>
        <SettingsTitle text={title}>
            {makeResetButton(id)}
        </SettingsTitle>
        {groups.map(section => {
            const props = Object.assign({}, section, {
                collection: id,
                onChange,
                onDrawerToggle: state => onDrawerToggle(id, section.id, state),
                shown: getDrawerState(id, section.id, section.hasOwnProperty("shown") ? section.shown : true)
            });
            return <SettingsGroup {...props} />;
        })}
    </>;

}
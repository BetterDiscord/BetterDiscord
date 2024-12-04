import React from "@modules/react";
import Strings from "@modules/strings";
import Utilities from "@modules/utilities";
import Events from "@modules/emitter";
import Settings from "@modules/settingsmanager";
import DataStore from "@modules/datastore";
import WebpackModules, {Filters} from "@modules/webpackmodules";
import Patcher from "@modules/patcher";
import DiscordModules from "@modules/discordmodules";

import Button from "@ui/base/button";
import Modals from "@ui/modals";

import AddonList from "@ui/settings/addonlist";
import SettingsGroup from "@ui/settings/group";
import SettingsTitle from "@ui/settings/title";
import Header from "@ui/settings/sidebarheader";

import Restore from "@ui/icons/restore";


const {useCallback, useEffect, useReducer} = React;

function makeResetButton(collectionId) {
    const action = confirmReset(() => Settings.resetCollection(collectionId));
    return <DiscordModules.Tooltip color="primary" position="top" text={Strings.Settings.resetSettings}>
                {(props) =>
                    <Button {...props} size={Button.Sizes.ICON} look={Button.Looks.BLANK} color={Button.Colors.TRANSPARENT} onClick={action}>
                        <Restore />
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
        Modals.showConfirmationModal(Strings.Modals.confirmAction, Strings.Settings.resetSettingsWarning, {
            confirmText: Strings.Modals.okay,
            cancelText: Strings.Modals.cancel,
            danger: true,
            onConfirm: action,
        });
    };
}

export default function SettingsPanel({id, title, groups, onChange, onDrawerToggle, getDrawerState}) {

    // TODO: add onChange here to lift and manage state here

    return <>
        <SettingsTitle text={title}>
            {makeResetButton(id)}
        </SettingsTitle>,
        {groups.map(section => {
            const props = Object.assign({}, section, {
                onChange,
                onDrawerToggle: state => onDrawerToggle(id, section.id, state),
                shown: getDrawerState(id, section.id, section.hasOwnProperty("shown") ? section.shown : true)
            });
            return <SettingsGroup {...props} />;
        })}
    </>;

}
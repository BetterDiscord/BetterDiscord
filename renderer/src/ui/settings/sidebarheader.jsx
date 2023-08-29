import Changelog from "@data/changelog";

import React from "@modules/react";
import DiscordModules from "@modules/discordmodules";
import Strings from "@modules/strings";

import HistoryIcon from "@ui/icons/history";

import Modals from "@ui/modals";


export default function SettingsTitle() {
    return <div className="bd-sidebar-header">
                <h2 className="bd-sidebar-header-label">BetterDiscord</h2>
                <DiscordModules.Tooltip color="primary" position="top" text={Strings.Modals.changelog}>
                    {props =>
                        <div {...props} className="bd-changelog-button" onClick={() => Modals.showChangelogModal(Changelog)}>
                            <HistoryIcon className="bd-icon" size="16px" />
                        </div>
                    }
                </DiscordModules.Tooltip>
            </div>;
}
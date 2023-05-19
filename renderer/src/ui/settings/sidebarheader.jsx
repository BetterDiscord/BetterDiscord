import {Changelog} from "data";
import React from "@modules/react";
import DiscordModules from "@modules/discordmodules";
import HistoryIcon from "../icons/history";
import Modals from "../modals";


export default function SettingsTitle() {
    return <div className="bd-sidebar-header">
                <h2 className="bd-sidebar-header-label">BetterDiscord</h2>
                <DiscordModules.Tooltip color="primary" position="top" text="Changelog">
                    {props =>
                        <div {...props} className="bd-changelog-button" onClick={() => Modals.showChangelogModal(Changelog)}>
                            <HistoryIcon className="bd-icon" size="16px" />
                        </div>
                    }
                </DiscordModules.Tooltip>
            </div>;
}
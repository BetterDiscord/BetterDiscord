import Changelog from "@data/changelog";

import React from "@modules/react";
import DiscordModules from "@modules/discordmodules";
import {t} from "@common/i18n";

import Modals from "@ui/modals";
import Button from "@ui/base/button";
import {HistoryIcon} from "lucide-react";


export default function SettingsTitle() {
    return <div className="bd-sidebar-header">
        <h2 className="bd-sidebar-header-label">BetterDiscord</h2>
        <DiscordModules.Tooltip color="primary" position="top" aria-label={t("Modals.changelog")} text={t("Modals.changelog")}>
            {props =>
                <Button {...props} aria-label={t("Modals.changelog")} className="bd-changelog-button" look={Button.Looks.BLANK} color={Button.Colors.TRANSPARENT} size={Button.Sizes.NONE} onClick={() => Modals.showChangelogModal(Changelog)}>
                    <HistoryIcon className="bd-icon" size="16px" />
                </Button>
            }
        </DiscordModules.Tooltip>
    </div>;
}
import {Logo} from "@ui/logo";
import React from "react";

import {CogIcon, HistoryIcon, PaletteIcon, PencilIcon, PlugIcon, RotateCcwIcon, type LucideIcon} from "lucide-react";
import clsx from "clsx";
import DiscordModules from "@modules/discordmodules";
import {t} from "@common/i18n";
import {useStateFromStores} from "@ui/hooks";
import settings from "@stores/settings";
import Modals from "@ui/modals";
import changelog from "@data/changelog";
import config from "@stores/config";

interface ButtonProps {
    icon: LucideIcon;
    label: string;
    badge?: number;
    href: string;
    disabled?: boolean;
}

function Button(props: ButtonProps) {
    const href = props.href.startsWith("/") ? props.href : `/${props.href}`;
    const trueHref = `/betterdiscord${href === "/" ? "" : href}`;

    return (
        <li className="bd-sidebar-button">
            <div
                className={clsx(
                    "bd-sidebar-button-interactive",
                    {
                        "bd-sidebar-button-disabled": props.disabled,
                        "bd-sidebar-button-selected": location.pathname === trueHref
                    }
                )}
            >
                <div
                    role="button"
                    className="bd-sidebar-button-link"
                    onClick={() => !props.disabled && DiscordModules.transitionTo(trueHref)}
                >
                    <div className="bd-sidebar-button-layout">
                        <div className="bd-sidebar-button-icon">
                            <props.icon />
                        </div>
                        <div className="bd-sidebar-button-label">
                            {props.label}
                        </div>
                    </div>

                    {props.badge !== undefined && (
                        <div
                            className="bd-sidebar-button-badge"
                            style={{width: Math.floor(Math.log10(props.badge)) * 6 + 16}}
                        >{props.badge}</div>
                    )}
                </div>
            </div>
        </li>
    );
}

function Sidebar() {
    const isCanary = useStateFromStores(config, () => config.isCanary, []);
    const isAddonStoreEnabled = useStateFromStores(settings, () => settings.get<boolean>("settings", "store", "bdAddonStore"), []);
    const isCustomcssEnabled = useStateFromStores(settings, () => settings.get<boolean>("settings", "customcss", "customcss"), []);

    return (
        <nav className="bd-sidebar">
            <div className="bd-sidebar-header">
                <div>BetterDiscord</div>

                {/* Maybe do a drop down to hold more data? */}
                <DiscordModules.Tooltip text={t("Modals.changelog")}>
                    {(props) => (
                        <div
                            {...props}
                            role="button"
                            className="bd-sidebar-changelog"
                            onClick={() => Modals.showChangelogModal(changelog)}
                        >
                            <HistoryIcon size={20} />
                        </div>
                    )}
                </DiscordModules.Tooltip>
            </div>

            <div className="bd-sidebar-scroller">
                <ul>
                    {/* Discord does this btw */}
                    <div style={{height: 8}} />

                    <Button icon={Logo} label="Home" href="" />
                    <Button icon={CogIcon} label="Settings" href="/settings" />
                    <Button icon={RotateCcwIcon} label="Updater" href="/updater" badge={1} />

                    <div className="bd-sidebar-seperator" />

                    <div className="bd-sidebar-section">
                        {/* <div className="bd-sidebar-section-icon">
                            <CodeXmlIcon />
                        </div> */}

                        <div className="bd-sidebar-section-label">Addons</div>
                    </div>

                    <Button icon={PlugIcon} label="Plugins" href="/plugins" />
                    <Button icon={PaletteIcon} label="Themes" href="/themes" />

                    {/* TODO: Nuke custom css in favor of snippets */}
                    <Button icon={PencilIcon} label="Custom CSS" href="/custom-css" disabled={!isCustomcssEnabled} />
                    {/* <Button icon={ScissorsIcon} label="Snippets" href="/snippets" /> */}

                    {isAddonStoreEnabled && (
                        <>
                            <div className="bd-sidebar-seperator" />

                            <div className="bd-sidebar-section">
                                {/* <div className="bd-sidebar-section-icon">
                                    <StoreIcon />
                                </div> */}

                                <div className="bd-sidebar-section-label">Store</div>
                            </div>
                            <Button icon={PlugIcon} label="Plugins" href="/store/plugins" badge={1 /* New addon count maybe ? */} />
                            <Button icon={PaletteIcon} label="Themes" href="/store/themes" badge={1} />
                        </>
                    )}

                    {isCanary && (
                        <>
                            <div className="bd-sidebar-seperator" />

                            <div className="bd-sidebar-section">
                                {/* <div className="bd-sidebar-section-icon">
                                    <StoreIcon />
                                </div> */}

                                <div className="bd-sidebar-section-label">Debug Kit</div>
                            </div>

                            <Button icon={PlugIcon} label="Crash" href="/_debug/crash" />
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
}

export default Sidebar;
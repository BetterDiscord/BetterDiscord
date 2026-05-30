import React from "react";
import {t} from "@common/i18n";
import DiscordModules from "@modules/discordmodules";

import Button from "@ui/base/button";
import JsonStore from "@stores/json";
import SettingsTitle from "@ui/settings/title";
import {BadgeCheckIcon, ChevronRightIcon} from "lucide-react";
import {SettingsTitleContext} from "@ui/settings";
import type AddonManager from "@modules/addonmanager";

export const buildDirectionOptions = () => [
    {label: t("Sorting.ascending"), value: true},
    {label: t("Sorting.descending"), value: false}
];

export function makeBasicButton(title: string, children: React.ReactElement, action: (event: React.MouseEvent) => void, key: string) {
    return <DiscordModules.Tooltip color="primary" position="top" aria-label={title} text={title} key={key}>
        {(props) => <Button {...props} aria-label={title} size={Button.Sizes.NONE} look={Button.Looks.BLANK} className="bd-button" onClick={action}>{children}</Button>}
    </DiscordModules.Tooltip>;
}

export function getState(type: string, control: string, defaultValue: any) {
    const addonlistControls = JsonStore.get("misc", "addonlistControls") as Record<string, Record<string, any>> || {};
    if (!addonlistControls[type]) return defaultValue;
    if (!Object.prototype.hasOwnProperty.call(addonlistControls[type], control)) return defaultValue;
    return addonlistControls[type][control];
}
export function saveState(type: string, control: string, value: any) {
    const addonlistControls = JsonStore.get("misc", "addonlistControls") as Record<string, Record<string, any>> || {};
    if (!addonlistControls[type]) addonlistControls[type] = {};
    addonlistControls[type][control] = value;
    JsonStore.set("misc", "addonlistControls", addonlistControls);
}

export interface AddonContext {
    title: string;
    toggleStore(): void;
    showingStore: boolean;
    store: AddonManager;
}

export const addonContext = React.createContext<AddonContext>({} as AddonContext);

interface AddonHeaderProps {
    children: React.ReactNode;
    count: number;
    searching: boolean;
}

export function AddonHeader({children, count, searching}: AddonHeaderProps) {
    const {title, toggleStore, showingStore} = React.useContext(addonContext);

    const exitStore = React.useCallback(() => {
        if (!showingStore) return;
        toggleStore();
    }, [showingStore, toggleStore]);

    const set = React.useContext(SettingsTitleContext);

    return set(
        <SettingsTitle
            text={(
                <div className="bd-addon-title" data-showing-store={showingStore}>
                    <span onClick={exitStore}>{title}</span>
                    {showingStore && (
                        <>
                            <ChevronRightIcon size="24px" />
                            <span>{t("Addons.store")}</span>
                        </>
                    )}
                    {searching && <span> - {t("Addons.results", {count: count})}</span>}
                </div>
            )}
        >
            {children}
        </SettingsTitle>
    );
}

export function FlowerStar({size = 16}) {
    return (
        <DiscordModules.Tooltip text={t("Addons.official")} aria-label={t("Addons.official")} hideOnClick={false}>
            {(props) => (
                <div className="bd-flower-star" {...props}>
                    <BadgeCheckIcon size={`${size}px`} />
                </div>
            )}
        </DiscordModules.Tooltip>
    );
}
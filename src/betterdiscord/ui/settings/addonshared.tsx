import React from "@modules/react";
import {t} from "@common/i18n";
import DiscordModules from "@modules/discordmodules";

import Button from "@ui/base/button";
import JsonStore from "@stores/json";
import SettingsTitle from "@ui/settings/title";
import {BadgeCheckIcon, ChevronRightIcon} from "lucide-react";
import {SettingsTitleContext} from "@ui/settings";

export const buildDirectionOptions = () => [
    {label: t("Sorting.ascending"), value: true},
    {label: t("Sorting.descending"), value: false}
];

// TODO: let doggy do these types
export function makeBasicButton(title, children, action, key) {
    return <DiscordModules.Tooltip color="primary" position="top" aria-label={title} text={title} key={key}>
        {(props) => <Button {...props} aria-label={title} size={Button.Sizes.NONE} look={Button.Looks.BLANK} className="bd-button" onClick={action}>{children}</Button>}
    </DiscordModules.Tooltip>;
}

export function getState(type, control, defaultValue) {
    const addonlistControls = JsonStore.get("misc", "addonlistControls") || {};
    if (!addonlistControls[type]) return defaultValue;
    if (!Object.prototype.hasOwnProperty.call(addonlistControls[type], control)) return defaultValue;
    return addonlistControls[type][control];
}
export function saveState(type, control, value) {
    const addonlistControls = JsonStore.get("misc", "addonlistControls") || {};
    if (!addonlistControls[type]) addonlistControls[type] = {};
    addonlistControls[type][control] = value;
    JsonStore.set("misc", "addonlistControls", addonlistControls);
}

export const addonContext = React.createContext();

/**
 * @param {{ children: any, count: number, searching: boolean}} param0
 */
export function AddonHeader({children, count, searching}) {
    /** @type {{ title: any, toggleStore(): void, showingStore: boolean }} */
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
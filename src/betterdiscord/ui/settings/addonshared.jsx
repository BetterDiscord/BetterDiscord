import React from "@modules/react";
import Strings from "@modules/strings";
import DiscordModules from "@modules/discordmodules";

import Button from "@ui/base/button";
import DataStore from "@modules/datastore";
import SettingsTitle from "@ui/settings/title";
import {BadgeCheckIcon, ChevronRightIcon} from "lucide-react";

export const buildDirectionOptions = () => [
    {label: Strings.Sorting.ascending, value: true},
    {label: Strings.Sorting.descending, value: false}
];

export function makeBasicButton(title, children, action, key) {
    return <DiscordModules.Tooltip color="primary" position="top" aria-label={title} text={title} key={key}>
        {(props) => <Button {...props} aria-label={title} size={Button.Sizes.NONE} look={Button.Looks.BLANK} className="bd-button" onClick={action}>{children}</Button>}
    </DiscordModules.Tooltip>;
}

export function getState(type, control, defaultValue) {
    const addonlistControls = DataStore.getBDData("addonlistControls") || {};
    if (!addonlistControls[type]) return defaultValue;
    if (!Object.prototype.hasOwnProperty.call(addonlistControls[type], control)) return defaultValue;
    return addonlistControls[type][control];
}
export function saveState(type, control, value) {
    const addonlistControls = DataStore.getBDData("addonlistControls") || {};
    if (!addonlistControls[type]) addonlistControls[type] = {};
    addonlistControls[type][control] = value;
    DataStore.setBDData("addonlistControls", addonlistControls);
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

    return (
        <SettingsTitle
            text={(
                <div className="bd-addon-title" data-showing-store={showingStore}>
                    <span onClick={exitStore}>{title}</span>
                    {showingStore && (
                        <>
                            <ChevronRightIcon size="24px" />
                            <span>{Strings.Addons.store}</span>
                        </>
                    )}
                    {searching && <span> - {Strings.Addons.results.format({count: String(count)})}</span>}
                </div>
            )}
        >
            {children}
        </SettingsTitle>
    );
}

export function FlowerStar({size = 16}) {

    return (
        <DiscordModules.Tooltip text={Strings.Addons.official} aria-label={Strings.Addons.official} hideOnClick={false}>
            {(props) => (
                <div className="bd-flower-star" {...props}>
                    <BadgeCheckIcon size={`${size}px`} />
                </div>
            )}
        </DiscordModules.Tooltip>
    );
}
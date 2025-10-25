import React from "@modules/react";
import Strings from "@modules/strings";
import DiscordModules from "@modules/discordmodules";

import Button from "@ui/base/button";
import DataStore from "@modules/datastore";
import SettingsTitle from "@ui/settings/title";
import Caret from "@ui/icons/caret";
import Checkmark from "@ui/icons/check";
import {SettingsTitleContext} from "@ui/settings";

export const buildDirectionOptions = () => [
  {label: Strings.Sorting.ascending, value: true},
  {label: Strings.Sorting.descending, value: false}
];

export function makeBasicButton(title, children, action, key) {
    return <DiscordModules.Tooltip color="primary" position="top" text={title} key={key}>
        {(props) => <Button {...props} size={Button.Sizes.NONE} look={Button.Looks.BLANK} className="bd-button" onClick={action}>{children}</Button>}
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

    const set = React.useContext(SettingsTitleContext);

    const exitStore = React.useCallback(() => {
        if (!showingStore) return;
        toggleStore();
    }, [showingStore, toggleStore]);

    const text = (
        <div className="bd-addon-title" data-showing-store={showingStore}>
            <span onClick={exitStore}>{title}</span>
            {showingStore && (
                <>
                    <Caret size={24} />
                    <span>{Strings.Addons.store}</span>
                </>
            )}
            {searching && <span> - {Strings.Addons.results.format({count: String(count)})}</span>}
        </div>
    );

    if (set) {
        set({title: text, children});
        return;
    }

    return (
        <SettingsTitle text={text}>
            {children}
        </SettingsTitle>
    );
}

export function FlowerStar({size = 16}) {
    const checksize = React.useMemo(() => 10 / 16 * size, [size]);

    return (
        <DiscordModules.Tooltip text={Strings.Addons.official} aria-label={Strings.Addons.official} hideOnClick={false}>
            {(props) => (
                <div className="bd-flower-star" {...props}>
                    <svg viewBox="0 0 16 15.2" width={size} height={size}>
                        <path d="m16 7.6c0 .79-1.28 1.38-1.52 2.09s.44 2 0 2.59-1.84.35-2.46.8-.79 1.84-1.54 2.09-1.67-.8-2.47-.8-1.75 1-2.47.8-.92-1.64-1.54-2.09-2-.18-2.46-.8.23-1.84 0-2.59-1.54-1.3-1.54-2.09 1.28-1.38 1.52-2.09-.44-2 0-2.59 1.85-.35 2.48-.8.78-1.84 1.53-2.12 1.67.83 2.47.83 1.75-1 2.47-.8.91 1.64 1.53 2.09 2 .18 2.46.8-.23 1.84 0 2.59 1.54 1.3 1.54 2.09z" fill="currentColor" fillRule="evenodd" />
                    </svg>
                    <div className="bd-flower-star-checkmark">
                        <Checkmark size={checksize} />
                    </div>
                </div>
            )}
        </DiscordModules.Tooltip>
    );
}
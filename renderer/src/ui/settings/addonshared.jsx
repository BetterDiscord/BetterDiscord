import React from "@modules/react";
import Strings from "@modules/strings";
import Discordmodules from "@modules/discordmodules";

import Button from "@ui/base/button";
import DataStore from "@modules/datastore";

export const buildDirectionOptions = () => [
  {label: Strings.Sorting.ascending, value: true},
  {label: Strings.Sorting.descending, value: false}
];

export function makeBasicButton(title, children, action, key) {
    return <Discordmodules.Tooltip color="primary" position="top" text={title} key={key}>
        {(props) => <Button {...props} size={Button.Sizes.NONE} look={Button.Looks.BLANK} className="bd-button" onClick={action}>{children}</Button>}
    </Discordmodules.Tooltip>;
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

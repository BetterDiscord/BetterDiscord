import React from "@modules/react";

import Drawer from "./drawer";
import Switch from "./components/switch";
import Dropdown from "./components/dropdown";
import Number from "./components/number";
import Item from "./components/item";
import Textbox from "./components/textbox";
import Slider from "./components/slider";
import Radio from "./components/radio";
import Keybind from "./components/keybind";
import Color from "./components/color";
import Filepicker from "./components/file";
import Button from "../base/button";
import Position from "@ui/settings/components/position";
import {SettingsContext} from "@ui/contexts";
import {useInternalStore} from "@ui/hooks";
import SettingsStore from "@stores/settings";

const {useCallback} = React;


function SettingsProvider({collection, category, id, children}) {
    const state = useInternalStore(SettingsStore, () => SettingsStore.get(collection, category, id));
    return <SettingsContext.Provider value={state}>{children}</SettingsContext.Provider>;
}

export default function Group({onChange, id, name, button, shown, onDrawerToggle, showDivider, collapsible, settings, children, collection}) {
    const change = useCallback((settingId, value) => {
        if (id) onChange?.(id, settingId, value);
        else onChange?.(settingId, value);
    }, [id, onChange]);

    return <Drawer collapsible={collapsible} name={name} button={button} shown={shown} onDrawerToggle={onDrawerToggle} showDivider={showDivider}>
                {settings?.length > 0 && settings.filter(s => !s.hidden).map((setting) => {
                    const callback = value => {
                        setting?.onChange?.(value);
                        change(setting.id, value);
                    };
                    const settingItem = buildSetting({...setting, onChange: callback});
                    if (!collection) return settingItem;
                    return <SettingsProvider collection={collection} category={id} id={setting.id}>{settingItem}</SettingsProvider>;
                })}
                {children}
            </Drawer>;
}


export function buildSetting(setting) {
    let children = null;
    if (setting.type === "dropdown") children = <Dropdown {...setting} />;
    if (setting.type === "number") children = <Number {...setting} />;
    if (setting.type === "switch") children = <Switch {...setting} />;
    if (setting.type === "text") children = <Textbox {...setting} />;
    if (setting.type === "file") children = <Filepicker {...setting} />;
    if (setting.type === "slider") children = <Slider {...setting} />;
    if (setting.type === "radio") children = <Radio {...setting} />;
    if (setting.type === "keybind") children = <Keybind {...setting} />;
    if (setting.type === "color") children = <Color {...setting} />;
    if (setting.type === "button") children = <Button {...setting} />;
    if (setting.type === "position") children = <Position {...setting} />;
    if (setting.type === "custom") children = setting.children;
    if (!children) return null;
    return <Item id={setting.id} inline={setting.hasOwnProperty("inline") ? setting.inline : setting.type !== "radio"} key={setting.id} name={setting.name} note={setting.note}>{children}</Item>;
}
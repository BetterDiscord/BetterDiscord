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

const {useCallback} = React;


export default function Group({onChange, id, name, button, shown, onDrawerToggle, showDivider, collapsible, settings, children}) {
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
                    return buildSetting({...setting, onChange: callback});
                })}
                {children}
            </Drawer>;
}


export function buildSetting(setting) {
    let children = null;
    if (setting.type == "dropdown") children = <Dropdown {...setting} />;
    if (setting.type == "number") children = <Number {...setting} />;
    if (setting.type == "switch") children = <Switch {...setting} />;
    if (setting.type == "text") children = <Textbox {...setting} />;
    if (setting.type == "file") children = <Filepicker {...setting} />;
    if (setting.type == "slider") children = <Slider {...setting} />;
    if (setting.type == "radio") children = <Radio {...setting} />;
    if (setting.type == "keybind") children = <Keybind {...setting} />;
    if (setting.type == "color") children = <Color {...setting} />;
    if (setting.type == "button") children = <Button {...setting} />;
    if (setting.type == "custom") children = setting.children;
    if (!children) return null;
    return <Item id={setting.id} inline={setting.hasOwnProperty("inline") ? setting.inline : setting.type !== "radio"} key={setting.id} name={setting.name} note={setting.note}>{children}</Item>;
}
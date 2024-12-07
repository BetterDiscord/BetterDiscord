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

const {useCallback} = React;


export default function Group({onChange, id, name, button, shown, onDrawerToggle, showDivider, collapsible, settings, children}) {
    const change = useCallback((settingId, value) => {
        if (id) onChange?.(id, settingId, value);
        else onChange?.(settingId, value);
    }, [id, onChange]);

    return <Drawer collapsible={collapsible} name={name} button={button} shown={shown} onDrawerToggle={onDrawerToggle} showDivider={showDivider}>
                {settings.length && settings.filter(s => !s.hidden).map((setting) => {
                    const callback = value => change(setting.id, value);
                    return buildSetting({...setting, onChange: callback});
                })}
                {children}
            </Drawer>;
}


export function buildSetting(setting) {
    let children = null;
    if (setting.type == "dropdown") children = <Dropdown disabled={setting.disabled} id={setting.id} options={setting.options} value={setting.value} onChange={setting.onChange} />;
    if (setting.type == "number") children = <Number disabled={setting.disabled} id={setting.id} min={setting.min} max={setting.max} step={setting.step} value={setting.value} onChange={setting.onChange} />;
    if (setting.type == "switch") children = <Switch disabled={setting.disabled} id={setting.id} value={setting.value} onChange={setting.onChange} />;
    if (setting.type == "text") children = <Textbox disabled={setting.disabled} id={setting.id} value={setting.value} onChange={setting.onChange} />;
    if (setting.type == "slider") children = <Slider disabled={setting.disabled} id={setting.id} min={setting.min} max={setting.max} step={setting.step} value={setting.value} onChange={setting.onChange} />;
    if (setting.type == "radio") children = <Radio disabled={setting.disabled} id={setting.id} name={setting.id} options={setting.options} value={setting.value} onChange={setting.onChange} />;
    if (setting.type == "keybind") children = <Keybind disabled={setting.disabled} id={setting.id} value={setting.value} max={setting.max} onChange={setting.onChange} />;
    if (setting.type == "color") children = <Color disabled={setting.disabled} id={setting.id} value={setting.value} defaultValue={setting.defaultValue} colors={setting.colors} onChange={setting.onChange} />;
    if (setting.type == "custom") children = setting.children;
    if (!children) return null;
    return <Item id={setting.id} inline={setting.hasOwnProperty("inline") ? setting.inline : setting.type !== "radio"} key={setting.id} name={setting.name} note={setting.note}>{children}</Item>;
}
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


export default function Group({onChange, id, name, button, shown, onDrawerToggle, showDivider, collapsible, settings}) {
    const change = useCallback((settingId, value) => {
        if (id) onChange?.(id, settingId, value);
        else onChange?.(settingId, value);
    }, [id, onChange]);

    return <Drawer collapsible={collapsible} name={name} button={button} shown={shown} onDrawerToggle={onDrawerToggle} showDivider={showDivider}>
                {settings.filter(s => !s.hidden).map((setting) => {
                    let component = null;
                    const callback = value => change(setting.id, value);
                    if (setting.type == "dropdown") component = <Dropdown disabled={setting.disabled} id={setting.id} options={setting.options} value={setting.value} onChange={callback} />;
                    if (setting.type == "number") component = <Number disabled={setting.disabled} id={setting.id} min={setting.min} max={setting.max} step={setting.step} value={setting.value} onChange={callback} />;
                    if (setting.type == "switch") component = <Switch disabled={setting.disabled} id={setting.id} checked={setting.value} onChange={callback} />;
                    if (setting.type == "text") component = <Textbox disabled={setting.disabled} id={setting.id} value={setting.value} onChange={callback} />;
                    if (setting.type == "slider") component = <Slider disabled={setting.disabled} id={setting.id} min={setting.min} max={setting.max} step={setting.step} value={setting.value} onChange={callback} />;
                    if (setting.type == "radio") component = <Radio disabled={setting.disabled} id={setting.id} name={setting.id} options={setting.options} value={setting.value} onChange={callback} />;
                    if (setting.type == "keybind") component = <Keybind disabled={setting.disabled} id={setting.id} value={setting.value} max={setting.max} onChange={callback} />;
                    if (setting.type == "color") component = <Color disabled={setting.disabled} id={setting.id} value={setting.value} defaultValue={setting.defaultValue} colors={setting.colors} onChange={callback} />;
                    if (!component) return null;
                    return <Item id={setting.id} inline={setting.type !== "radio"} key={setting.id} name={setting.name} note={setting.note}>{component}</Item>;
                })}
            </Drawer>;
}
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
import Button, {type ButtonProps} from "../base/button";
import Position from "@ui/settings/components/position";
import {SettingsContext} from "@ui/contexts";
import {useStateFromStores} from "@ui/hooks";
import SettingsStore from "@stores/settings";
import type {Setting, SettingItem} from "@data/settings";
import type {PropsWithChildren, ReactNode} from "react";

const {useCallback} = React;


function SettingsProvider({collection, category, id, children}: PropsWithChildren<{collection: string; category: string; id: string;}>) {
    const getSettingState = React.useCallback(() => {
        const setting = SettingsStore.getSetting(collection, category, id);
        return {
            value: SettingsStore.get(collection, category, id),
            disabled: setting?.disabled ?? false
        };
    }, [collection, category, id]);

    const settingState = useStateFromStores(SettingsStore, getSettingState);

    // Only recreate context value when data actually changes
    const context = React.useMemo(() => settingState, [settingState]);

    return <SettingsContext.Provider value={context}>{children}</SettingsContext.Provider>;
}

export type GroupProps = PropsWithChildren<{
    id: string;
    name?: string;
    button?: object;
    shown?: boolean;
    showDivider?: boolean;
    collapsible?: boolean;
    onDrawerToggle?(state?: boolean): void;
    onChange?(id: string, cid: string, value: any): void;
    onChange?(id: string, value: any): void;
    settings: any;
    collection: any;
}>;

export default function Group({onChange, id, name = "", shown, onDrawerToggle, showDivider = false, collapsible, settings, children = null, collection}: GroupProps) {
    const change = useCallback((settingId: string, value: any) => {
        if (id) onChange?.(id, settingId, value);
        else onChange?.(settingId, value);
    }, [id, onChange]);

    return <Drawer collapsible={collapsible} name={name} shown={shown} onDrawerToggle={onDrawerToggle} showDivider={showDivider}>
        {settings?.length > 0 && settings.filter((s: any) => !s.hidden).map((setting: any) => {
            const callback = (value: any) => {
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


interface CustomSetting extends SettingItem {
    type: "custom";
    children: ReactNode;
}

interface ButtonSetting extends ButtonProps, SettingItem {
    type: "button";
}

export function buildSetting(setting: Setting | CustomSetting | ButtonSetting) {
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
    return <Item
        id={setting.id}
        inline={setting.hasOwnProperty("inline") ? setting.inline : setting.type !== "radio"}
        key={setting.id}
        name={setting.name}
        note={setting.note}>
        {children}
    </Item>;
}
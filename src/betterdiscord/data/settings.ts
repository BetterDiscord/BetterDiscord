import config from "@stores/config";


const DefaultSettings = [
    {
        type: "category",
        id: "general",
        collapsible: true,
        settings: [
            {type: "switch", id: "voiceDisconnect", value: false},
            {type: "switch", id: "showToasts", value: true},
            {type: "switch", id: "mediaKeys", value: false},
            {type: "switch", id: "bdContextMenu", value: true},
            {type: "switch", id: "themeAttributes", value: true},
            {type: "position", id: "notificationPosition", value: "top-right", inline: false, enableWith: "notificationEnabled"},
            {type: "switch", id: "notificationEnabled", value: true},
        ]
    },
    {
        type: "category",
        id: "addons",
        collapsible: true,
        shown: false,
        settings: [
            {type: "switch", id: "addonErrors", value: true},
            {type: "dropdown", id: "editAction", value: "detached", options: [{value: "detached"}, {value: "external"}, {value: "system"}]},
            {type: "switch", id: "checkForUpdates", value: true},
            {type: "slider", id: "updateInterval", value: 4, min: 2, max: 12, step: 1, markers: [2, 4, 6, 8, 10, 12], units: "hrs", enableWith: "checkForUpdates"}
        ]
    },
    {
        type: "category",
        id: "store",
        collapsible: true,
        shown: false,
        settings: [
            {type: "switch", id: "bdAddonStore", value: true},
            {type: "switch", id: "alwaysEnable", value: false},
            {type: "switch", id: "addonEmbeds", value: true}
        ]
    },
    {
        type: "category",
        id: "customcss",
        collapsible: true,
        shown: false,
        settings: [
            {type: "switch", id: "customcss", value: true},
            {type: "switch", id: "liveUpdate", value: false},
            {type: "dropdown", id: "openAction", value: "settings", options: [{value: "settings"}, {value: "detached"}, {value: "external"}, {value: "system"}]},
        ]
    },
    {
        type: "category",
        id: "editor",
        collapsible: true,
        shown: false,
        settings: [
            {type: "dropdown", id: "theme", value: "system", options: [{value: "system"}, {value: "vs-dark"}, {value: "vs"}, {value: "hc-black"}, {value: "hc-light"}]},
            {type: "switch", id: "lineNumbers", value: true},
            {type: "switch", id: "minimap", value: true},
            {type: "switch", id: "hover", value: true},
            {type: "switch", id: "quickSuggestions", value: true},
            {type: "switch", id: "insertSpaces", value: false},
            {type: "number", id: "tabSize", min: 1, value: 4},
            {type: "number", id: "fontSize", min: 2, value: 14},
            {type: "dropdown", id: "renderWhitespace", value: "selection", options: [{value: "none"}, {value: "all"}, {value: "selection"}]}
        ]
    },
    {
        type: "category",
        id: "window",
        collapsible: true,
        shown: false,
        settings: [
            {type: "switch", id: "transparency", value: false},
            {type: "switch", id: "removeMinimumSize", value: false},
            {type: "switch", id: "frame", value: false},
            // MacOS exclusive
            {type: "switch", id: "inAppTrafficLights", value: false, disabled: process.env.BETTERDISCORD_NATIVE_FRAME === "true", hidden: process.platform !== "darwin"}
        ]
    },
    {
        type: "category",
        id: "developer",
        collapsible: true,
        shown: false,
        settings: [
            {type: "switch", id: "debugLogs", value: false},
            {type: "switch", id: "devTools", value: false},
            {type: "switch", id: "debuggerHotkey", value: false, enableWith: "devTools"},
            {type: "switch", id: "reactDevTools", value: false, enableWith: "devTools"},
            {type: "switch", id: "inspectElement", value: false, enableWith: "devTools"},
            {type: "switch", id: "devToolsWarning", value: false, enableWith: "devTools"},
            {type: "switch", id: "recovery", value: true, enableWith: "devTools"},
            {type: "switch", id: "canary", value: config.isCanary, hidden: true},
        ]
    }
] as SettingsCategory[];

if (config.isDevelopment) {
    DefaultSettings.push(
        {
            type: "category",
            id: "debug",
            name: "Debug",
            collapsible: true,
            shown: true,
            settings: [
                {name: "Text test", note: "Just testing it", type: "text", id: "texttest", value: ""},
                {
                    name: "Slider test",
                    note: "Just testing it",
                    type: "slider",
                    id: "slidertest",
                    value: 30,
                    min: 20,
                    max: 50,
                    step: 10,
                    units: "em",
                    markers: [
                        {label: "max", value: 50},
                        30,
                        {label: "min", value: 20},
                        {label: "anything", value: 40}
                    ],
                },
                {
                    name: "Radio test",
                    note: "Just testing it",
                    type: "radio",
                    id: "radiotest",
                    value: "test",
                    options: [
                        {name: "First", value: 30, description: "little hint"},
                        {name: "IDK", value: "test", description: "who cares"},
                        {name: "Something", value: 666, description: "something else"},
                        {name: "Last", value: "last", description: "nothing more to add"}
                    ]
                },
                {
                    type: "slider",
                    id: "maxWidth",
                    name: "Notification Width",
                    note: "Maximum width of notifications",
                    value: 370,
                    min: 100,
                    max: 400,
                    markers: [100, 200, 300, 400],
                    units: "px",
                    defaultValue: 370,
                    stickToMarkers: false
                },
                {name: "Keybind test", note: "Just testing it", type: "keybind", id: "keybindtest", value: ["Control", "H"]},
                {name: "Color test", note: "Just testing it", type: "color", id: "colortest", value: "#ff0000", defaultValue: "#ffffff"},
            ]
        } as SettingsCategory
    );
}

export default DefaultSettings;


export type SettingType = "button" | "custom" | "switch" | "dropdown" | "switch" | "slider" | "color" | "text" | "position" | "radio" | "file" | "keybind" | "number";

export interface SettingItem {
    type: SettingType;
    id: string;
    value: unknown;
    name?: string;
    note?: string;
    disabled?: boolean;
    enableWith?: string;
    disableWith?: string;
    defaultValue?: unknown;
    inline?: boolean;
    hidden?: boolean;
}

export interface SwitchSetting extends SettingItem {
    type: "switch";
    value: boolean;
}

export interface DropdownSetting<T> extends SettingItem {
    type: "dropdown";
    value: T;
    options: Array<{id?: string; label: string; value: T;}>;
    style?: "transparent" | "default";
}

export interface SliderSetting extends SettingItem {
    type: "slider";
    value: number;
    min: number;
    max: number;
    step?: number;
    units: string;
    markers: Array<(number | {label: string; value: number;})>;
}

export interface TextSetting extends SettingItem {
    type: "text";
    value: string;
    placeholder?: string;
    maxLength?: number;
}

export interface RadioSetting<T> extends SettingItem {
    type: "radio";
    value: T;
    options: Array<{name: string, value: T, description: string;}>;
}

export interface KeybindSetting extends SettingItem {
    type: "keybind";
    value: string[];
    clearable?: boolean;
    max?: number;
}

type HexString = `#${string}`;
type Color = HexString | number;
export interface ColorSetting extends SettingItem {
    type: "color";
    value: Color;
    defaultValue?: Color;
    colors?: Color[];
}

export interface PositionSetting extends SettingItem {
    type: "position";
    value: "top-right" | "bottom-right" | "bottom-left" | "top-left";
}

export interface NumberSetting extends SettingItem {
    type: "number";
    value: number;
    min: number;
    max: number;
    step?: number;
}

export interface FileSetting extends SettingItem {
    type: "file";
    value: string;
    clearable?: boolean;
    accept?: string;
    multiple?: boolean;
}

export type Setting<T = any> = FileSetting | NumberSetting | PositionSetting | ColorSetting | KeybindSetting | RadioSetting<T> | TextSetting | SliderSetting | DropdownSetting<T> | SwitchSetting;

export interface SettingsCategory {
    type: "category";
    id: string;
    name?: string;
    collapsible: boolean;
    shown: boolean;
    settings: SettingItem[];
}

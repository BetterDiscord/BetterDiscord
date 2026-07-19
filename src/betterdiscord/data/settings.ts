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
            {type: "switch", id: "alwaysEnable", value: false, enableWith: "bdAddonStore"},
            {type: "switch", id: "addonEmbeds", value: true, enableWith: "bdAddonStore"}
        ]
    },
    {
        type: "category",
        id: "customcss",
        collapsible: true,
        shown: false,
        settings: [
            {type: "switch", id: "customcss", value: true},
            {type: "switch", id: "liveUpdate", value: true, enableWith: "customcss"},
            {type: "dropdown", id: "openAction", value: "settings", options: [{value: "settings"}, {value: "detached"}, {value: "external"}, {value: "system"}], enableWith: "customcss"},
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
            {type: "dropdown", id: "renderWhitespace", value: "selection", options: [{value: "none"}, {value: "all"}, {value: "selection"}]},
            {type: "switch", id: "alwaysOnTop", value: false}
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

export interface BaseSettingItem {
    type: SettingType;
    /** An identifier used for callbacks */
    id: string;
    /** The visual name to display */
    name?: string;
    /** The visual description to display */
    note?: string;
    /** Whether this setting is disabled */
    disabled?: boolean;
    /** The id of another setting that is required to use this one */
    enableWith?: string;
    /** The id of another setting that disables this setting */
    disableWith?: string;
    /** A value to use if no value is provided */
    defaultValue?: unknown;
    /** Whether the input should render inline with the name (this is false by default for radio type) */
    inline?: boolean;
    /** Whether the setting should be hidden */
    hidden?: boolean;
}

export interface ValueSettingItem<T> extends BaseSettingItem {
    /** The current value of the setting */
    value: T;
    /** A callback run when the setting changes */
    onChange?(value: T): void;
}

export interface SwitchSetting extends ValueSettingItem<boolean> {
    type: "switch";
}

export interface DropdownSetting<T> extends ValueSettingItem<T> {
    type: "dropdown";
    options: Array<{id?: string; label: string; value: T;}>;
    style?: "transparent" | "default";
}

export interface SliderSetting extends ValueSettingItem<number> {
    type: "slider";
    min: number;
    max: number;
    step?: number;
    units?: string;
    markers: Array<(number | {label: string; value: number;})>;
}

export interface TextSetting extends ValueSettingItem<string> {
    type: "text";
    placeholder?: string;
    maxLength?: number;
}

export interface RadioOption<T> {
    name: string;
    value: T;
    description?: string;
    color?: string;
}

export interface RadioSetting<T> extends ValueSettingItem<T> {
    type: "radio";
    options: Array<{name: string, value: T, description: string;}>;
}

export interface KeybindSetting extends ValueSettingItem<string[]> {
    type: "keybind";
    clearable?: boolean;
    max?: number;
}

export type HexString = `#${string}`;
export type Color = HexString | number;
export interface ColorSetting extends ValueSettingItem<Color> {
    type: "color";
    defaultValue?: Color;
    colors?: Color[];
}

export type Position = "top-right" | "bottom-right" | "bottom-left" | "top-left";
export interface PositionSetting extends ValueSettingItem<Position> {
    type: "position";
}

export interface NumberSetting extends ValueSettingItem<number> {
    type: "number";
    min: number;
    max: number;
    step?: number;
}

export interface SingleFileSetting extends ValueSettingItem<string> {
    type: "file";
    multiple?: false;
    clearable?: boolean;
    accept?: string;
    actions?: {
        clear?(): void;
    };
}

export interface MultipleFileSetting extends ValueSettingItem<string[]> {
    type: "file";
    multiple: true;
    clearable?: boolean;
    accept?: string;
    actions?: {
        clear?(): void;
    };
}

export type FileSetting = SingleFileSetting | MultipleFileSetting;

type BaseSetting<T = any> = FileSetting | NumberSetting | PositionSetting | ColorSetting | KeybindSetting | RadioSetting<T> | TextSetting | SliderSetting | DropdownSetting<T> | SwitchSetting;

export type Setting<T = any> = Omit<BaseSetting<T>, "defaultValue"> & {
    defaultValue?: never | unknown | any | T;
};

export interface SettingsCategory {
    type: "category";
    id: string;
    name?: string;
    collapsible: boolean;
    shown: boolean;
    settings: Setting[];
}

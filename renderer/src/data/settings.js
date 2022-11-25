export default [
    {
        type: "category",
        id: "general",
        collapsible: true,
        settings: [
            {type: "switch", id: "publicServers", value: true},
            {type: "switch", id: "voiceDisconnect", value: false},
            {type: "switch", id: "showToasts", value: true},
            {type: "switch", id: "mediaKeys", value: false}
        ]
    },
    {
        type: "category",
        id: "addons",
        collapsible: true,
        shown: false,
        settings: [
            {type: "switch", id: "addonErrors", value: true},
            {type: "dropdown", id: "editAction", value: "detached", options: [{value: "detached"}, {value: "system"}]}
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
            {type: "dropdown", id: "openAction", value: "settings", options: [{value: "settings"}, {value: "detached"}, {value: "system"}]}
        ]
    },
    {
        type: "category",
        id: "editor",
        collapsible: true,
        shown: false,
        settings: [
            {type: "switch", id: "lineNumbers", value: true},
            {type: "switch", id: "minimap", value: true},
            {type: "switch", id: "hover", value: true},
            {type: "switch", id: "quickSuggestions", value: true},
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
            {type: "switch", id: "frame", value: false, hidden: true}
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
        ]
    },
    // {
    //     type: "category",
    //     id: "debug",
    //     name: "Debug",
    //     collapsible: true,
    //     shown: true,
    //     settings: [
    //         {name: "Text test", note: "Just testing it", type: "text", id: "texttest", value: ""},
    //         {name: "Slider test", note: "Just testing it", type: "slider", id: "slidertest", value: 30, min: 20, max: 50, step: 10},
    //         {
    //             name: "Radio test",
    //             note: "Just testing it",
    //             type: "radio",
    //             id: "radiotest",
    //             value: "test",
    //             options: [
    //                 {name: "First", value: 30, description: "little hint"},
    //                 {name: "IDK", value: "test", description: "who cares"},
    //                 {name: "Something", value: 666, description: "something else"},
    //                 {name: "Last", value: "last", description: "nothing more to add"}
    //             ]
    //         },
    //         {name: "Keybind test", note: "Just testing it", type: "keybind", id: "keybindtest", value: ["Control", "H"]},
    //         {name: "Color test", note: "Just testing it", type: "color", id: "colortest", value: "#ff0000", defaultValue: "#ffffff"},
    //     ]
    // }
];
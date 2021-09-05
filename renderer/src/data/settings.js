export default [
    {
        type: "category",
        id: "general",
        collapsible: true,
        settings: [
            {type: "switch", id: "emotes", value: true},
            {type: "switch", id: "publicServers", value: true},
            {type: "switch", id: "voiceDisconnect", value: false},
            {type: "switch", id: "showToasts", value: true},
            {type: "switch", id: "mediaKeys", value: false}
        ]
    },
    {
        type: "category",
        id: "appearance",
        collapsible: true,
        settings: [
            {type: "switch", id: "twentyFourHour", value: false},
            {type: "switch", id: "minimalMode", value: false},
            {type: "switch", id: "coloredText", value: false}
        ]
    },
    {
        type: "category",
        id: "addons",
        collapsible: true,
        shown: false,
        settings: [
            {type: "switch", id: "addonErrors", value: true},
            {type: "switch", id: "autoReload", value: true},
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
        id: "developer",
        collapsible: true,
        shown: false,
        settings: [
            {type: "switch", id: "debuggerHotkey", value: false},
            {type: "switch", id: "reactDevTools", value: false},
            {type: "switch", id: "inspectElement", value: false},
            {type: "switch", id: "devToolsWarning", value: false},
            {type: "switch", id: "debugLogs", value: false}
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
    }
];
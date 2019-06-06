export default [
    {
        type: "category",
        id: "general",
        name: "General",
        collapsible: true,
        settings: [
            {
                type: "switch",
                id: "emotes",
                name: "Emote System",
                note: "Enables BD's emote system",
                value: true
            },
            {
                type: "switch",
                id: "publicServers",
                name: "Public Servers",
                note: "Display public servers button",
                value: true
            },
            {
                type: "switch",
                id: "voiceDisconnect",
                name: "Voice Disconnect",
                note: "Disconnect from voice server when closing Discord",
                value: false
            },
            {
                type: "switch",
                id: "twentyFourHour",
                name: "24 Hour Timestamps",
                note: "Hides channels when in minimal mode",
                value: false,
            },
            {
                type: "switch",
                id: "classNormalizer",
                name: "Normalize Classes",
                note: "Adds stable classes to elements to help themes. (e.g. adds .da-channels to .channels-Ie2l6A)",
                value: true
            },
            {
                type: "switch",
                id: "showToasts",
                name: "Show Toasts",
                note: "Shows a small notification for important information",
                value: true
            }
        ]
    },
    {
        type: "category",
        id: "appearance",
        name: "Appearance",
        collapsible: true,
        settings: [
            {
                type: "switch",
                id: "voiceMode",
                name: "Voice Mode",
                note: "Hides everything that isn't voice chat",
                value: false
            },
            {
                type: "switch",
                id: "minimalMode",
                name: "Minimal Mode",
                note: "Hide elements and reduce the size of elements",
                value: false
            },
            {
                type: "switch",
                id: "hideChannels",
                name: "Hide Channels",
                note: "Hides channels when in minimal mode",
                value: false,
                enableWith: "minimalMode"
            },
            {
                type: "switch",
                id: "darkMode",
                name: "Dark Mode",
                note: "Make certain elements dark by default",
                value: true
            },
            {
                type: "switch",
                id: "coloredText",
                name: "Colored Text",
                note: "Make text colour the same as role color",
                value: false
            }
        ]
    },
    {
        type: "category",
        id: "content",
        name: "Content Manager",
        collapsible: true,
        settings: [
            {
                type: "switch",
                id: "contentErrors",
                name: "Show Content Errors",
                note: "Shows a modal with plugin/theme errors",
                value: true
            },
            {
                type: "switch",
                id: "autoScroll",
                name: "Scroll To Settings",
                note: "Auto-scrolls to a plugin's settings when the button is clicked (only if out of view)",
                value: true
            },
            {
                type: "switch",
                id: "autoReload",
                name: "Automatic Loading",
                note: "Automatically loads, reloads, and unloads plugins and themes",
                value: true
            }
        ]
    },
    {
        type: "category",
        id: "developer",
        name: "Developer Settings",
        collapsible: true,
        shown: false,
        settings: [
            {
                type: "switch",
                id: "developerMode",
                name: "Developer Mode",
                note: "Allows activating debugger when pressing F8",
                value: false
            },
            {
                type: "switch",
                id: "copySelector",
                name: "Copy Selector",
                note: "Adds a \"Copy Selector\" option to context menus when developer mode is active",
                value: false,
                enableWith: "developerMode"
            }
        ]
    },
    {
        type: "category",
        id: "window",
        name: "Window Preferences",
        collapsible: true,
        shown: false,
        settings: [
            {
                type: "switch",
                id: "transparency",
                name: "Enable Transparency",
                note: "Enables the main window to be see-through (requires restart)",
                value: false
            },
            {
                type: "switch",
                id: "frame",
                name: "Window Frame",
                note: "Adds the native os window frame to the main window",
                value: false,
                hidden: true
            }
        ]
    }
];
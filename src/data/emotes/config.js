export default [
    {
        type: "category",
        id: "general",
        name: "General",
        collapsible: true,
        settings: [
            {
                type: "switch",
                id: "download",
                name: "Download Emotes",
                note: "Download emotes once a week to stay up to date",
                value: true
            },
            {
                type: "switch",
                id: "emoteMenu",
                name: "Emote Menu",
                note: "Show Twitch/Favourite emotes in emote menu",
                value: true
            },
            {
                type: "switch",
                id: "hideEmojiMenu",
                name: "Hide Emoji Menu",
                note: "Hides Discord's emoji menu when using emote menu",
                value: true,
                enableWith: "emoteMenu"
            },
            {
                type: "switch",
                id: "autoCaps",
                name: "Emote Autocapitalization",
                note: "Autocapitalize emote commands",
                value: false
            },
            {
                type: "switch",
                id: "showNames",
                name: "Show Names",
                note: "Show emote names on hover",
                value: false
            },
            {
                type: "switch",
                id: "modifiers",
                name: "Show Emote Modifiers",
                note: "Enable emote mods (flip, spin, pulse, spin2, spin3, 1spin, 2spin, 3spin, tr, bl, br, shake, shake2, shake3, flap)",
                value: false
            },
            {
                type: "switch",
                id: "animateOnHover",
                name: "Animate On Hover",
                note: "Only animate the emote modifiers on hover",
                value: false
            }
        ]
    },
    {
        type: "category",
        id: "categories",
        name: "Categories",
        collapsible: true,
        settings: [
            {
                type: "switch",
                id: "twitch",
                name: "Twitch",
                note: "Show Twitch global & subscriber emotes",
                value: false
            },
            {
                type: "switch",
                id: "ffz",
                name: "FrankerFaceZ",
                note: "Show emotes from FFZ",
                value: true
            },
            {
                type: "switch",
                id: "bttv",
                name: "BetterTTV",
                note: "Show emotes from BTTV",
                value: true
            }
        ]
    }
];
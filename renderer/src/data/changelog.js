export default {
    description: "All of the appearance settings were removed due to the frequency of them breaking. The functionality of each one can be replicated by an existing plugin. See the section below for more information.",
    changes: [
        {
            title: "Appearance Settings Removed",
            type: "progress",
            items: [
                "24-hour timestamps were removed in favor of `CompleteTimestamps` by DevilBro https://betterdiscord.app/plugin/CompleteTimestamps",
                "ColoredText functionality was absorbed into `BetterRoleColors` by Zerebos https://betterdiscord.app/plugin/BetterRoleColors",
                "Hide GIF/Gift Buttons can be replicated by `RemoveChatButtons` by Qb https://betterdiscord.app/plugin/RemoveChatButtons",
                "MinimalMode has been redone by SmolAlli https://betterdiscord.app/theme/MinimalMode",
        ]},
        {
            title: "What's new?",
            type: "added",
            items: [
                "DevTools can be opened again after enabling it in settings! (Thanks Kyza)",
                "BD now adds a `bd-transparency` class to the document body when enabled. (Thanks Strencher)"
            ]
        },
        {
            title: "Fixes",
            type: "fixed",
            items: [
                "`DebugLogs` no longer freak out for `null`, `undefined`, or circular objects.",
                "Utility classes should appear on the guilds list once more.",
                "Toasts should now show in the right location."
            ]
        }
    ]
};
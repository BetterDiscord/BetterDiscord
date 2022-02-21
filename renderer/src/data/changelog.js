export default {
    description: "Just some minor updates to keep things running smoothly!",
    changes: [
        {
            title: "What's new?",
            type: "added",
            description: "Some basic preferences for the addon editor have been added including:",
            items: [
                "Font size adjustment",
                "Line numbers toggle",
                "Minimap toggle",
                "Whitespace preference",
                "Reference tooltips",
                "Quick suggestions"
            ]
        },
        {
            title: "Fixes",
            type: "fixed",
            items: [
                "All those `GuildComponent` errors should now be gone!",
                "Public servers button shows up again if things get reloaded.",
                "Plugin compilation errors point to console for more info.",
                "Plugins with no `@name` property will now properly error.",
            ]
        }
    ]
};
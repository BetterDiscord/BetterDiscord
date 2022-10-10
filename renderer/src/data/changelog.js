// fixed, improved, added, progress
export default {
    description: "Big improvements have been made!",
    changes: [
        {
            title: "What's New?",
            type: "improved",
            items: [
                "BetterDiscord now has a built-in update system to help update broken plugins and themes.",
                "New API options for plugin developers.",
                "`Patcher` now works with the configurable getters.",
                "A new tooltip component for use in plugins.",
                "The plugin API now includes context menu capabilties.",
                "Public servers button has found a new home on your Discord homepage above the DM list."
            ]
        },
        {
            title: "Bug Fixes",
            type: "fixed",
            items: [
                "Fixed many issues regarding memory leaks and out-of-memory errors!",
                "Fixed a major issue where webpack searches would iterate by default.",
                "Fixed an issue with `byStrings` and `combine` filters in the API.",
                "Fixed an issue where searching for multiple modules could yield the same module multiple times.",
                "Fixed an issue where misnamed addon files could prevent startup.",
                "Fixed an issue where the `request` module would not follow redirects.",
                "Fixed an issue where certain modals could crash the client.",
                "Fixed an issue where toasts would not show on the crash screen."
            ]
        }
    ]
};
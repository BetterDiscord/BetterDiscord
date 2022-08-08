// fixed, improved, added, progress
export default {
    description: "Big things are coming soon, this is just the tip of the iceberg!",
    changes: [
        {
            title: "What's New?",
            type: "added",
            items: [
                "Better handling and fallback when the editor fails to load. (Thanks Qb)",
                "Now able to sort addons by whether they're enabled. (Thanks TheGreenPig)",
                "New `Webpack` API added for plugin developers to take advantage of. Please see the docs for details!",
                "New developer docs (still work-in-progress) available at https://docs.betterdiscord.app"
            ]
        },
        {
            title: "Improvements",
            type: "improved",
            items: [
                "Addons should now load faster, use less memory, and be a bit more consistent!",
                "Addon error modal should work a little better. (Thanks Qb)",
                "Plugin and startup errors should make more sense now.",
                "The crash dialog has more information and more buttons.",
                "Minor speed and memory improvements."
            ]
        }
    ]
};
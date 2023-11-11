// fixed, improved, added, progress
export default {
    description: "This update is just a hotfix for the recent Discord update!",
    changes: [
        {
            title: "What's Fixed?",
            type: "improved",
            items: [
                "Patching webpack modules is now fixed for plugins.",
                "Themes are placed later in the DOM than Discord's CSS giving them priority.",
                "BetterDiscord's modals should all be working."
            ]
        },
        {
            title: "What's not fixed?",
            type: "fixed",
            items: [
                "Individual plugins and themes will still need to make their own updates.",
            ]
        }
    ]
};

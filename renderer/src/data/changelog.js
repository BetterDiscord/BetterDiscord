// fixed, improved, added, progress
export default {
    description: "Discord changed a lot of things internally once again! Please have patience while plugins and even themes catch up!",
    changes: [
        {
            title: "What's New?",
            type: "improved",
            items: [
                "Added support for a custom version of React DevTools. (Thanks @Zerthox)",
                "We are now using a custom header component in settings to prevent future crashes.",
                "Plugins now have a new experimental API for component access, `BdApi.Components`. Currently only `Tooltip` exists."
            ]
        },
        {
            title: "Bug Fixes",
            type: "fixed",
            items: [
                "Fixed crashing when opening settings.",
                "Fixed modals either not opening and/or crashing.",
                "Fixed context menus not working and/or crashing.",
                "Fixed coloring for `danger` context menus. (Thanks @samfundev)"
            ]
        }
    ]
};
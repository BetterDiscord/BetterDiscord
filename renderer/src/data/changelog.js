// fixed, improved, added, progress
export default {
    description: "This update has a few important bugfixes but it also contains some important QOL updates for plugin developers!",
    changes: [
        {
            title: "What's New?",
            type: "improved",
            items: [
                "Updated translations for many languages! Thank you to our many contributors!",
                "New shorthand API methods for developers available under `BdApi.Webpack`. Documentation should be updated soon!",
                "Also a new `Filter` has been added for internal stores. This includes the `getStore` shorthand!"
            ]
        },
        {
            title: "Bug Fixes",
            type: "fixed",
            items: [
                "Fixed header color in light mode. (Thanks @Fede)",
                "Fixed window size retention for users of remove minimum size option. (Thanks @Neodymium)",
                "Fixed a toast saying an addon was loaded when it was unloaded. (Thanks @benji78)",
                "Fixed context menu patching API for plugins. (Thanks @Strencher)"
            ]
        }
    ]
};

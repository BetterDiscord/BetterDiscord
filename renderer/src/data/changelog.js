import config from "./config";

// fixed, improved, added, progress
export default {
    title: "BetterDiscord",
    subtitle: `v${config.version}`,
    video: "https://www.youtube.com/embed/jDclfjPc3k0?si=YlQwrCHnoYkTfa6G&vq=hd720p&hd=1&rel=0&showinfo=0&mute=0&loop=1&autohide=1",
    // banner: "https://i.imgur.com/wuh5yMK.png",
    blurb: "This update is packed with features both for users as well as developers. Take a look at the video above for a quick showcase or read down below for details.",
    changes: [
        {
            title: "Cool New Features!",
            type: "added",
            blurb: "These are features that have been requested by the community for a long time. Huge shoutout to our contributors [@doggybootsy](https://github.com/doggybootsy) and [@zrodevkaan](https://github.com/zrodevkaan) for making this happen!",
            items: [
                "The in-app **Addon Store** is finally here! Head to your plugins or themes pages to browse through everything our site has to offer.",
                "**Slash commands** have landed! BetterDiscord now has some built-in slash commands, and it also makes it easy for plugins to add some too!",
                "You can now **recovery from crashes** in many cases. It'll also make it easier to report issue to BetterDiscord and plugin developers.",
                "Themes can make use of new attributes to **adapt to your screen**. This means themes can have fancy additions like separate message styling for yourself, or a special background in specific channels.",
                "**Frame options** have finally returned! You can now choose to use your operating system's native frame. And on macOS you can choose whether to use the in-app traffic lights with the frame.",
            ]
        },
        {
            title: "Bugs Squashed",
            type: "fixed",
            items: [
                "Fixed both Modals and Context Menus for the recent Discord update.",
                "Remove minimum size should work again but now require **two** restarts.",
                "Plugins with corrupted data will no longer fail to load.",
                "Enabling or disabling the custom css system will now update things properly.",
                "The help screen in settings will now show up properly when you have no plugins or themes.",
                "Modals for addon errors are now more accessible by using standardized elements.",
            ]
        },
        {
            title: "Developer Stuff",
            type: "improved",
            blurb: "Additional information on the new APIs and deprecations will be added to the docs as soon as possible!",
            items: [
                "`BdApi.DOM.createElement` now supports passing multiple children and a number of new properties.",
                "The `target` option for `createElement` is now deprecated and will be removed in the next couple versions.",
                "Slash commands can now be added via `BdApi.Commands.register`. You can check the BetterDiscord's source for an example until the docs are updated.",
                "Plugins can now search webpack modules via their original source strings using `BdApi.Webpack.getBySource`. This is especially useful for wrapped or limited functions.",
                "Another new search has been added for webpack modules called `getMangled`. It allows you to find a single module and map any number of its members or exports to different keys in an object. Very helpful for utility modules.",
                "The last change for webpack modules is the new `raw` option. Normally `getModule` returns the exports, but with the `raw` option it will return the entire `Module` object.",
                "Building settings with `buildSetting` can now be customized further by using the `button` type.",
                "`Utils.className` now uses the `clsx` package under the hood. This is a drop-in replacement that should also work faster.",
                "When using React DevTools, clicking to go to source of a patched component will now correclty take you to the original component.",
                "Webpack searches will have less errors spitting out into console and hopefully improve performance for those using string searches."
            ]
        },
    ]
};

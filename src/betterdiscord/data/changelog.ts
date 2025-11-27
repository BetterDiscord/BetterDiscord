import config from "@stores/config";
import type {ChangelogProps} from "@ui/modals/changelog";

// fixed, improved, added, progress
export default {
    title: "BetterDiscord",
    subtitle: `v${config.get("version")}`,
    // https://youtu.be/BZq1eb9d0HI?si=67V2eArlF4atnGnz
    video: "https://www.youtube.com/embed/BZq1eb9d0HI?si=67V2eArlF4atnGnz&vq=hd720p&hd=1&rel=0&showinfo=0&mute=0&loop=1&autohide=1",
    // banner: "https://i.imgur.com/wuh5yMK.png",
    blurb: "This update has been a *long time coming*, and we're so excited to finally release it! We've been hard at work over the past several months __improving and rewriting__ nearly every aspect of BetterDiscord to make it faster, more reliable, and easier to use. **Thank you** to everyone in our community for your continued support and feedback - we couldn't have done this without you!",
    changes: [
        {
            title: "What's actually new?!",
            type: "added",
            blurb: "Here's a quick overview of some of the biggest new features in this release!",
            items: [
                "New **InstallCSS** system that lets you install CSS snippets directly from codeblocks complete with safety fallbacks!",
                "Banners are dead, long live the new **In-App Notifications**! These notifications are less intrusive and more reliable than the old banner system.",
                "You can now __directly open a plugin's settings__ from the context menu in the Plugins list via `shift`+`click`.",
                "The code editor used for Custom CSS and plugin/theme editors has been given a massive facelift! It now supports many of the Visual Studio Code features you may be familiar with!",
                "Overall accessibility improvements including better keyboard navigation and screen reader support. Please report any issues you find so we can continue to improve this area!",
                "Revamped **i18n system** that *finally* supports __proper pluralization__ and variable insertion. If you're interested in helping with translations, check out the [Crowdin project](https://translate.betterdiscord.app/).",
            ]
        },
        {
            title: "Is that all?!",
            type: "progress",
            blurb: "There's actually many little features and improvements that didn't make the big list above. Here are some with the biggest Quality of Life improvements:",
            items: [
                "Many many little **Performance Improvements** throughout the app to make things feel snappier. Startup time should be noticeably improved and we will continue to work on this in future releases.",
                "Updated all icons we use to a __consistent style__ that matches Discord's current design while still being inverted to give us a separate identity.",
                "All of our **UI elements** have been updated to use the latest Discord styles for a more cohesive look. This includes buttons, inputs, modals, and everything you see in our settings.",
                "**Toasts** have been *toned down* on startup so they no longer clog up your screen when Discord is loading many addons.",
                "Integration with the *BetterDiscord Discord Bot* has been improved. You can search and download plugins and themes directly from the bot!",
                "Improved __error handling and recovery__ when plugins and BetterDiscord itself run into issues.",
            ]
        },
        {
            title: "Bugs Squashed",
            type: "fixed",
            blurb: "As always, we've been hard at work fixing bugs both big and small. Here's a list of the most notable fixes in this release:",
            items: [
                "Fixed some issues with plugins clashing when registering slash commands.",
                "Auto enabling new downloads through the store should now work more reliably.",
                "Keybind settings can now be cleared properly.",
                "All the various editors should now be focused when in-use.",
                "Fixed some theme compatibility issues for themes using advanced features.",
                "Many tiny tweaks and fixes to the updater system to improve reliability.",
                "Removing the minimum window size restriction that Discord enforces should work again.",
            ]
        },
        {
            title: "Developer Stuff",
            type: "improved",
            blurb: "Many of our community developers are already aware of most of these changes, but for those interested in developing for BetterDiscord, here are some of the biggest changes in this release. Documentation will be updated soon to reflect these changes!",
            items: [
                "New in-app notification api `BdApi.UI.showNotification` for showing non-intrusive notifications to users.",
                "Modal APIs now support custom sizing.",
                "`BdApi.ReactUtils.wrapInHooks` has been added as a reverse engineering utility.",
                "Another tool for use during development to load specific lazy chunks `BdApi.Utils.forceLoad` is now available.",
                "Internal stores can now be accessed via the `BdApi.Webpack.Stores` proxy for easier access.",
                "All deprecated APIs have been removed. Please refer to the migration guide in the docs (coming soon) for more information.",
                "Most of the issues when searching with `getModule` have been resolved. Please report any issues you find!",
                "And much more under-the-hood changes and improvements that should make developing for BetterDiscord a better experience overall!",
            ]
        },
    ]
} as ChangelogProps;

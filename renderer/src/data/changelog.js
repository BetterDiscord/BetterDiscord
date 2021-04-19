export default {
    description: "BetterDiscord is now accepting translations. If you'd like to contribute reach out to an admin about getting access to POEditor.",
    changes: [
        {
            title: "New Features",
            type: "added",
            items: [
                "**Media Keys** can now be optionally prevented from being hijacked by Discord in settings.",
                "The plugin **RemoveMinimumSize** was absorbed into BetterDiscord and can be enabled in settings.",
                "**Update checks** should now happen within BetterDiscord so you won't have to reinstall when BetterDiscord updates.",
                "Addon error modals got a __makeover__ thanks to Strencher (https://github.com/Strencher) and Tropical (https://github.com/Tropix126)",
                "**Translations** were added thanks to help from the community! Languages include: French, Slovak, Polish, Portuguese (BR), Chinese (Traditional), Chinese (Simplified)"
            ]
        },
        {
            title: "Power Users & Developers",
            type: "improved",
            items: [
                "There is a now a command-line option to launch Discord without BetterDiscord injecting itself. Just use `--vanilla`.",
                "`ctrl`+`shift`+`c` can now be used globally to activate inspect element, even with devtools closed.",
                "Added emote blocklist to `BdApi` via `BdApi.Emotes.blocklist`",
                "All console logs can now be logged into the BetterDiscord folder (`BetterDiscord/data/<releaseChannel>/debug.log`) by flipping the switch in settings.",
                "The repeated console warnings can be completely removed in Developer Settings."
            ]
        },
        {
            title: "Fixes",
            type: "fixed",
            items: [
                "**Colored Text**, **Hide GIF Button**, **Hide Gift Button**, and **PublicServers** should all work again",
                "Older themes should work with BetterDiscord again.",
                "Certain issues with plugins crashing should be fixed.",
                "More folders are automatically created to help for those attempting manual or 3rd-party installs.",
                "Fixed an issue with an incorrect path being used on Mac.",
                "Solved a bug that caused multiple error modals to occur on startup instead of consolidating to one.",
                "Emote system should be functional, and the styling has been updating to match Discord's.",
                "Using system editor to edit plugins/themes should work instead of causing an error.",
                "Fixed a startup issue for users that had all their servers in collapsed folders."
            ]
        }
    ]
};
import config from "@stores/config";
import type {ChangelogProps} from "@ui/modals/changelog";

// fixed, improved, added, progress
export default {
    title: "BetterDiscord",
    subtitle: `v${config.get("version")}`,
    // https://youtu.be/BZq1eb9d0HI?si=67V2eArlF4atnGnz
    video: "https://www.youtube.com/embed/BZq1eb9d0HI?si=67V2eArlF4atnGnz&vq=hd720p&hd=1&rel=0&showinfo=0&mute=0&loop=1&autohide=1",
    // banner: "https://i.imgur.com/wuh5yMK.png",
    blurb: "This patch release focuses on bug fixes and improvements.",
    changes: [
        {
            title: "Bugs Squashed",
            type: "fixed",
            blurb: "Here are the fixes included in this patch release:",
            items: [
                "Navigating to Plugins, Themes, or Settings from the context menu now correctly opens the intended page",
                "Custom CSS file is now automatically created if it doesn't exist",
                "aria-label for BetterDiscord section in settings panel now sets correctly",
                "Plugins/Themes Search bar clear button now properly resets the input field",
                "Fixed css to match Discord's latest changes",
                "BetterDiscord Settings section now appears correctly in the settings menu",
                "Fixes for theme attributes",
            ]
        },
    ]
} as ChangelogProps;

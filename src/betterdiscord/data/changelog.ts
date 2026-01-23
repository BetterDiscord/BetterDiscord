import config from "@stores/config";
import type {ChangelogProps} from "@ui/modals/changelog";

// fixed, improved, added, progress
export default {
    title: "BetterDiscord",
    subtitle: `v${config.get("version")}`,
    // https://youtu.be/BZq1eb9d0HI?si=67V2eArlF4atnGnz
    video: "https://www.youtube.com/embed/BZq1eb9d0HI?si=67V2eArlF4atnGnz&vq=hd720p&hd=1&rel=0&showinfo=0&mute=0&loop=1&autohide=1",
    // banner: "https://i.imgur.com/wuh5yMK.png",
    blurb: "Hotfix to squash some bugs.",
    changes: [
        {
            title: "Bugs Squashed",
            type: "fixed",
            items: [
                "Fixed BdApi.Net.fetch not handling relative urls properly.",
                "BetterDiscord now properly checks for addon updates periodically.",
                "BetterDiscord now loads up correctly.",
            ]
        },
        {
            title: "Improvements",
            type: "improved",
            items: [
                "Tweaked styles for InstallCSS.",
                "BetterDiscord's Dropdown Component was rewrote.",
            ]
        },
        {
            title: "Additions",
            type: "added",
            items: [
                "Added `data-speaking` attribute to VoiceUser in ThemeAttributes"
            ]
        },
    ]
} as ChangelogProps;

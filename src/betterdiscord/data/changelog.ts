import config from "@stores/config";
import type {ChangelogProps} from "@ui/modals/changelog";

// fixed, improved, added, progress
export default {
    title: "BetterDiscord",
    subtitle: `v${config.get("version")}`,
    // https://youtu.be/BZq1eb9d0HI?si=67V2eArlF4atnGnz
    // video: "https://www.youtube.com/embed/BZq1eb9d0HI?si=67V2eArlF4atnGnz&vq=hd720p&hd=1&rel=0&showinfo=0&mute=0&loop=1&autohide=1",
    // banner: "https://i.imgur.com/wuh5yMK.png",
    blurb: "Improvements for developers.",
    changes: [
        {
            title: "Small Fixes",
            type: "fixed",
            items: [
                "Themes with special characters in their names now unload properly"
            ]
        },
        {
            title: "For Developers",
            type: "added",
            items: [
                "Added a system for exposing top-level module declarations",
                "Added `@runAt` meta tag to work around issues caused by lazy loading"
            ]
        }
    ]
} as ChangelogProps;

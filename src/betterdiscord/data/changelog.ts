import config from "@stores/config";
import type {ChangelogProps} from "@ui/modals/changelog";

// fixed, improved, added, progress
export default {
    title: "BetterDiscord",
    subtitle: `v${config.get("version")}`,
    // https://youtu.be/BZq1eb9d0HI?si=67V2eArlF4atnGnz
    video: "https://www.youtube.com/embed/Qv1HUqqUgkg??si=67V2eArlF4atnGnz&vq=hd720p&hd=1&rel=0&showinfo=0&mute=0&loop=1&autohide=1",
    // banner: "https://i.imgur.com/wuh5yMK.png",
    blurb: "Bug fixes and changes",
    changes: [
        {
            type: "added",
            title: "New settings",
            items: [
                "Rounded corners – Whether a frameless window should have rounded corners",
                "Accept First Mouse Click – Whether clicking an inactive window will also click through to the web contents",
                "Vibrancy – Add a type of vibrancy effect to the window",
                "Visual Effect State – Specify how the material appearance should reflect window activity state",
                "Background Material – Set the window's system-drawn background material"
            ]
        },
        {
            type: "progress",
            title: "Removed settings",
            items: [
                "Recovery – Want it to always be on for fixing errors",
                "In App Traffic Lights – No longer possible",
                "Addon Store – Want it to be a more core feature"
            ]
        },
        {
            type: "added",
            title: "Performance Increase",
            items: ["Removed a slow Discord CSS selector"]
        },
        {
            type: "fixed",
            title: "Reinjection",
            items: [
                "Fixed BetterDiscord reinjection issue on windows and linux"
            ]
        }
    ]
} as ChangelogProps;

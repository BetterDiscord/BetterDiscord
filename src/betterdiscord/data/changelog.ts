import config from "@stores/config";
import type {ChangelogProps} from "@ui/modals/changelog";

// fixed, improved, added, progress
export default {
    title: "BetterDiscord",
    subtitle: `v${config.get("version")}`,
    // https://youtu.be/BZq1eb9d0HI?si=67V2eArlF4atnGnz
    video: "https://www.youtube.com/embed/Qv1HUqqUgkg??si=67V2eArlF4atnGnz&vq=hd720p&hd=1&rel=0&showinfo=0&mute=0&loop=1&autohide=1",
    // banner: "https://i.imgur.com/wuh5yMK.png",
    blurb: "Fix Plugin Settings",
    changes: [
        {
            type: "fixed",
            title: "Fixed Plugin Settings",
            items: [
                "Textboxes are now focusable"
            ]
        },
        {
            type: "improved",
            title: "Revamped Recovery Page",
            items: [
                "The recovery page has a brand new UI",
                "Better at detecting bad plugins"
            ]
        }
    ]
} as ChangelogProps;

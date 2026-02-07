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
            title: "New Features",
            type: "new",
            items: [
                "New Webpack cache system for faster loading times; you will see much faster loading times after the first launch with this update.",
            ]
        },
        {
            title: "Bugs Squashed",
            type: "fixed",
            items: [
                "Fixed `tags` button appearing behind other elements in the Addon Store",
                "Fixed downloading addons via the addon store",
                "Fixed dropdowns with lots of options not allowing you to scroll through all of the options",
                "Minor UI fixes",
            ]
        },
        {
            title: "Improvements",
            type: "improved",
            items: [
                "Dropdowns now automatically scroll to the selected option when opened",
            ]
        }
    ]
} as ChangelogProps;

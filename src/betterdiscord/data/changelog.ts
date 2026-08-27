import config from "@stores/config";
import type {ChangelogProps} from "@ui/modals/changelog";

// fixed, improved, added, progress
export default {
    title: "BetterDiscord",
    subtitle: `v${config.get("version")}`,
    // https://youtu.be/BZq1eb9d0HI?si=67V2eArlF4atnGnz
    video: "https://www.youtube.com/embed/Qv1HUqqUgkg??si=67V2eArlF4atnGnz&vq=hd720p&hd=1&rel=0&showinfo=0&mute=0&loop=1&autohide=1",
    // banner: "https://i.imgur.com/wuh5yMK.png",
    blurb: "New Injection Style and Bug fixes!",
    changes: [
        {
            type: "improved",
            title: "New Injection Style",
            items: [
                "Windows and Linux users should not have to ever re-inject BetterDiscord",
                "macOS users will have to re-inject BetterDiscord less frequently"
            ]
        },
        {
            type: "fixed",
            title: "Fixes",
            items: [
                "Discord Activities are fixed",
                "BetterDiscord's location in settings is now fixed"
            ]
        },
        {
            type: "improved",
            title: "QoL",
            items: [
                "The Custom CSS editor now fills the settings page",
                "The floating and popout editors have received additional features",
                "The addon store and addon updater now share the same backend"
            ]
        },
        {
            type: "improved",
            title: "Disabled Plugins Stay Disabled",
            items: [
                "Plugins never run unless enabled"
            ]
        },
        {
            type: "added",
            title: "For Developers",
            items: [
                "BetterDiscord now has official types [@betterdiscord/types](https://www.npmjs.com/package/@betterdiscord/types)"
            ]
        }
    ]
} as ChangelogProps;

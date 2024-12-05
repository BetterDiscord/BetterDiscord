import config from "./config";

// fixed, improved, added, progress
export default {
    title: "BetterDiscord",
    subtitle: `v${config.version}`,
    video: "https://www.youtube.com/embed/evyvq9eQTqA?si=opmzjGjUArT4VLrj&vq=hd720p&hd=1&rel=0&showinfo=0&mute=1&loop=1&autohide=1",
    banner: "https://i.imgur.com/wuh5yMK.png",
    blurb: "A hotfix to get things going again. Plugins and Themes will take time to update.",
    changes: [
        {
            title: "Bugs Squashed",
            type: "fixed",
            items: [
                "Fixed transition group module search that prevented startup."
            ]
        },
    ]
};

import config from "./config";

// fixed, improved, added, progress
export default {
    title: "BetterDiscord",
    subtitle: `v${config.version}`,
    video: "https://www.youtube.com/embed/jDclfjPc3k0?si=YlQwrCHnoYkTfa6G&vq=hd720p&hd=1&rel=0&showinfo=0&mute=0&loop=1&autohide=1",
    // banner: "https://i.imgur.com/wuh5yMK.png",
    blurb: "We appreciate your patience waiting for these critical bugfixes after all of these Discord changes. In the background we have some major things in the works so expect to see a _massive_ BetterDiscord update soon™!",
    changes: [
        {
            title: "Hot Hot Hotfixes 🔥",
            type: "fixed",
            items: [
                "All of BetterDiscord will actually load now after Discord's recent changes.",
                "BetterDiscord notice banners will now be banners again instead of showing up squashed in the corner.",
                "Toasts will show and be aligned properly.",
                "Plugins and themes should be loaded correctly on Discord Canary.",
                "Slash Commands from BetterDiscord should be working again for those that had problesm.",
                "Pasting into the CSS editor actually pastes instead of being ignored.",
            ]
        },
    ]
};

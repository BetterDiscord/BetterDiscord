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
                "BetterDiscord should load again.",
                "Fixed editing custom css with external editors.",
                "Certain edge cases with UI rendering has been repaired.",
            ]
        },
    ]
};

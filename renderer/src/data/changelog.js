import config from "./config";

// fixed, improved, added, progress
export default {
    title: "BetterDiscord",
    subtitle: `v${config.version}`,
    video: "https://www.youtube.com/embed/jDclfjPc3k0?si=YlQwrCHnoYkTfa6G&vq=hd720p&hd=1&rel=0&showinfo=0&mute=0&loop=1&autohide=1",
    // banner: "https://i.imgur.com/wuh5yMK.png",
    blurb: "This should hopefully be the last update before the next major release. It contains a few fixes and improvements to the current version of BetterDiscord.",
    changes: [
        {
            title: "Hot Hot Hotfixes 🔥",
            type: "fixed",
            items: [
                "Theme attributes are now correctly applied to tabs",
                "Remove minimum size setting now works correctly.",
                "General styling around the BetterDiscord settings page has been improved.",
                "Slash commands now work correctly without crashing."
            ]
        },
    ]
};

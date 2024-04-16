// fixed, improved, added, progress
export default {
    video: "https://www.youtube.com/embed/evyvq9eQTqA?si=opmzjGjUArT4VLrj&vq=hd720p&hd=1&rel=0&showinfo=0&mute=1&loop=1&autohide=1",
    description: "This is just a quick fix for those using Discord Canary & PTB, and of course a pre-emptive fix for when they move these changes to Stable.",
    changes: [
        {
            title: "Bugs Squashed",
            type: "fixed",
            items: [
                "Fixed modal transition component being grabbed incorrectly.",
                "Fixed custom modal stack not having an `ErrorBoundary` which caused any small issue to bubble up and prevent BetterDiscord startup."
            ]
        },
    ]
};

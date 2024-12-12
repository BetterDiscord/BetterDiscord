import config from "./config";

// fixed, improved, added, progress
export default {
    title: "BetterDiscord",
    subtitle: `v${config.version}`,
    // video: "https://www.youtube.com/embed/evyvq9eQTqA?si=opmzjGjUArT4VLrj&vq=hd720p&hd=1&rel=0&showinfo=0&mute=1&loop=1&autohide=1",
    banner: "https://i.imgur.com/wuh5yMK.png",
    blurb: "This update is mostly to make the lives of plugin developers easier. Users should see more plugins with fancy settings panels in the coming days!",
    changes: [
        {
            title: "New Plugin APIs",
            type: "added",
            blurb: "Documentation for these new APIs should be arriving soon. In the meantime, I recommend taking a look at [this demo plugin](https://gist.github.com/zerebos/b13adc05f22df008ee5d0411d9d18ff0) that nicely showcases some of the new APIs.",
            items: [
                "Plugins can now show a fancy changelog modal using `BdApi.UI.showChangelogModal`!",
                "New utilities were added to `Utils` as `getNestedValue` and `semverCompare`. You may know them from ZLibrary already.",
                "Settings panels are now easier to build than ever. You can build individual settings with `UI.buildSettingItem` or an entire panel at once using `UI.buildSettingsPanel`. It's very customizable including letting you use custom components!",
                "Debug data can now be easily and fancily output to console using the new `Logger` namespace.",
                "BetterDiscord's own React components (or at least some of them) are now available under `BdApi.Components`. This should make building stable UIs much easier.",
            ]
        },
        {
            title: "Bugs Squashed",
            type: "fixed",
            items: [
                "Plugin settings modal should no longer overflow your screen!",
                "The BetterDiscord version (and debug info) at the bottom left of settings should be there again.",
                "Enabling or disabling the custom css system will now update things properly.",
                "No more weird `0` showing up on screen after exiting a modal.",
                "Tooltips will now stop ignoring custom labels.",
                "Lazy `Webpack` listeners as well as `Filters.combine` are now given the right number of arguments.",
            ]
        },
    ]
};

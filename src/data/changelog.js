export default {
    video: "https://i.zackrauen.com/EEM6Nor0XW.mp4",
    poster: "https://i.imgur.com/tNGALts.jpeg",
    description: "The rewrite you didn't even know about is finally here.",
    changes: [
        {
            title: "What's New?",
            items: [
                "We added a setting to **hide the Gif Picker and the Nitro Gift Picker** in the textarea."
            ]
        },
        {
            title: "Minor Stuff",
            type: "improved",
            items: [
                "**Patcher API** was added to `BdApi` under `BdApi.Patcher`. The old `BdApi.monkeyPatch` was patched to use the Patcher as well. This allows plugins and patches to play nice with one another.",
                "**jQuery** usage was totally eliminated and is now ___deprecated___ for plugins.",
                "**General performance** improvements throughout the app, from startup to emotes to addons.",
                "**Exporting** by plugins is now highly encouraged over trying to match your meta name and class name."
            ]
        },
        {
            title: "Fixes",
            type: "fixed",
            items: [
                "There are a lot of little issues that this rewrite fixes.",
                "I forgot to write them down",
                "But I'm sure many more will be found soon"
            ]
        }
    ]
};
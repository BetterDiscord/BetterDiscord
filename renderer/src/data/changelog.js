export default {
    video: "https://cdn.discordapp.com/attachments/769669826120777739/777059779368976394/b0cs2x.mp4",
    poster: "https://i.imgur.com/P50xFON.png",
    description: "The rewrite you didn't even know about is finally here.",
    changes: [
        {
            title: "What's New?",
            items: [
                "**Everything** is entirely rewritten, for better or worse.",
                "**Emotes and Custom CSS** can be completely turned off for those not interested. It saves on memory too by not loading those components.",
                "**Floating editors** for both custom css and plugins/themes are now available.",
                "**Monaco** is now used as the main CSS editor, in place of Ace.",
                "**Settings panels** are completely new and sleek. They are also highly extensible for potential future features :eyes:",
                "**Translations** are now integrated starting with only a couple languages, but feel free to contribute your own!",
                "**Public servers** got a new makeover thanks to some design help from Tropical and Gibbu!",
                "We added settings to hide the **Gif Picker** and the **Nitro Gift** buttons in the textarea."
            ]
        },
        {
            title: "Minor Stuff",
            type: "improved",
            items: [
                "**Patcher API** was added to `BdApi` under `BdApi.Patcher`. The old `BdApi.monkeyPatch` was patched to use the Patcher as well. This allows plugins and patches to play nice with one another.",
                "**jQuery** usage was totally eliminated and is now ___deprecated___ for plugins.",
                "**General performance** improvements throughout the app, from startup to emotes to addons.",
                "**Exporting** by plugins is now highly encouraged over trying to match your meta name and class name.",
                "**Plugins and Themes** pages have more options for sorting, views and more. The entire panel got a facelift!",
                "**Blankslates** have been added all over for that added UX.",
                "**Several unused UI features** have been removed for a more performant and usable experience.",
                "**Debugger Hotkey** is now a built-in feature!"
            ]
        },
        {
            title: "Fixes",
            type: "fixed",
            items: [
                "**Minimal mode** has been redesigned from the ground up and now works as intended.",
                "**Emote menus** are fixed and now use React Patching to properly integrate into the new Emoji Picker. (Thanks Strencher#1044!)"
            ]
        }
    ]
};
// fixed, improved, added, progress
export default {
    description: "There are some small but important fixes and changes in this update to keep things running smoothly!",
    changes: [
        {
            title: "What's New?",
            type: "added",
            items: [
                "Keybinds will now show properly instead of `[object Undefined]`.",
                "Update banners will now appear consistently when there are updates.",
                "Translations should now actually load when a new locale is selected in Discord's settings."
            ]
        },
        {
            title: "Translations",
            type: "improved",
            items: [
                "Added a new Vietnamese translation thanks to Minato Isuki.",
                "Improved Italian translation thanks to TheItalianTranslator.",
                "Improved Chinese (traditional) translation thanks to Frost_koi.",
                "Removed several outdated keys and strings.",
                "Added multiple translated strings to UI where they were hardcoded."
            ]
        },
        {
            title: "Technical Changes",
            type: "fixed",
            items: [
                "The webpack hook now no longer prevents Discord modules from shadowing built-in functions. This was originally meant as a sanity check but now Discord actually does this intentionally which can lead to issues like the incorrectly displayed keybinds.",
                "`BdApi.UI.showNotice` should work again in cases where it seemed not to unless you had addons with updates. This was a race condition versus the load order of class modules.",
                "`BdApi.Net.fetch` now actually uses all the options passed to it, previously it failed to pass the options to the other process.",
                "It also now supports all HTTP request types rather than just `POST`, `GET`, `DELETE`, and `PUT`."
            ]
        }
    ]
};

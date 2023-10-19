// fixed, improved, added, progress
export default {
    description: "This update has a few important bugfixes but it also contains some important QOL updates for plugin developers!",
    changes: [
        {
            title: "What's New?",
            type: "improved",
            items: [
                "There's a new css variable themes can make use of called `--os-accent-color` which is the accent color used by the user's operating system. (Thanks @axolotl)",
                "`BdApi.Net.fetch` now has an optional `timeout` parameter to help avoid long requests."
            ]
        },
        {
            title: "Bug Fixes",
            type: "fixed",
            items: [
                "Adds a temporary `Buffer` polyfill and deprecates the usage of `Buffer`.",
                "Fixes not being able to use `http` for `BdApi.Net.fetch`.",
                "Bad URLs and other early errors in `BdApi.Net.fetch` now handled better."
            ]
        }
    ]
};

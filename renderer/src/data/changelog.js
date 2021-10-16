export default {
    description: "Temporary relief to those on MacOS.",
    changes: [
        {
            title: "Fixes",
            type: "fixed",
            items: [
                "Fixed open plugin/theme folder on Mac.",
                "Windows GPU Failure Issue Resovled thanks to (Deviousbry202) and some others..",
                "Backend API Failure fixed due to failure code `221`",
                "Fixed screensharing, audio and video on Mac.",
                "Fixed dropdowns, and custom css page not opening. Thanks, Strencher. (https://github.com/Strencher)",
                "Fixed popout editor, not working when custom css was disabled. Thanks, Qb. (https://github.com/QbDesu)",
                "Fixed crashing for some users when duplicate files were found. Thanks, Strencher. (https://github.com/Strencher)"
            ]
        },
        {
            title: "Power Users & Developers",
            type: "improved",
            items: [
                "Plugin data retrieval will now return the correct values instead of `undefined` for falsey values.",
                "Plugin data can now be set before being retrieved.",
                "The `Patcher` in `BdApi` now has a `getPatchesByCaller` function which will return all the patches corresponding to a caller string.",
                "Plugins that fail on initial load will no longer be forever in a broken state. Thanks, Strencher. (https://github.com/Strencher)",
                "React DevTools should now work on Linux! Thanks, Qb. (https://github.com/QbDesu)"
            ]
        }
    ]
};
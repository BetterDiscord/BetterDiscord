export default {
    description: "Many new crowdsourced translations added, shout-out to our contributors on POEditor!",
    changes: [
        {
            title: "New Translations",
            type: "added",
            items: [
                "Czech, Spanish, Hindi (partial), Italian, Dutch, Norwegian (partial), Portuguese (PT), Romanian, Russian, Turkish",
                "Languages also fallback to English when a translation does not exist."
            ]
        },
        {
            title: "Fixes",
            type: "fixed",
            items: [
                "Canary loading no longer blocked by changed class names.",
                "The following were all thanks to Strencher! (https://github.com/Strencher)",
                "The public servers button is back!",
                "Guild related classes are back too!",
                "Fixed webpack module search on Canary.",
                "Fixed `window.webpackJsonp` related plugin issues via polyfill. Note: This will be removed in future versions."
            ]
        }
    ]
};
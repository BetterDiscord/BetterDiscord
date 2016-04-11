var bdConfig = (function() {
    return {
        versionInfo: {
            version: 1.63,
            supportedVersion: "0.2.5"
        },
        defaults: {
                "version": 1.63,
                "bda-gs-0": false,
                "bda-gs-1": true,
                "bda-gs-2": false,
                "bda-gs-3": false,
                "bda-gs-4": false,
                "bda-gs-5": true,
                "bda-es-0": true,
                "bda-es-1": true,
                "bda-es-2": true,
                "bda-es-3": false,
                "bda-es-4": false,
                "bda-es-5": true,
                "bda-es-6": true,
                "bda-es-7": true,
                "bda-es-8": true,
                "bda-jd":   true,
                "bda-es-8": true,
                "bda-dc-0": false,
                "bda-css-0": false,
                "bda-css-1": false,
                "bda-es-9": true
        },
        options: {
                "Save logs locally":          { "id": "bda-gs-0",  "info": "Saves chat logs locally",                           "implemented": false, "hidden": false, "cat": "core"},
                "Public Servers":             { "id": "bda-gs-1",  "info": "Display public servers button",                     "implemented": true,  "hidden": false, "cat": "core"},
                "Minimal Mode":               { "id": "bda-gs-2",  "info": "Hide elements and reduce the size of elements.",    "implemented": true,  "hidden": false, "cat": "core"},
                "Voice Mode":                 { "id": "bda-gs-4",  "info": "Only show voice chat",                              "implemented": true,  "hidden": false, "cat": "core"},
                "Hide Channels":              { "id": "bda-gs-3",  "info": "Hide channels in minimal mode",                     "implemented": true,  "hidden": false, "cat": "core"},
                "Dark Mode":                  { "id": "bda-gs-5",  "info": "Make certain elements dark by default(wip)",        "implemented": true,  "hidden": false, "cat": "core"},
                "Override Default Emotes":    { "id": "bda-es-5",  "info": "Override default emotes",                           "implemented": false, "hidden": false, "cat": "core"},
                "Voice Disconnect":           { "id": "bda-dc-0",  "info": "Disconnect from voice server when closing Discord", "implemented": true,  "hidden": false, "cat": "core"},
                "Custom css live update":     { "id": "bda-css-0", "info": "",                                                  "implemented": true,  "hidden": true , "cat": "core"},
                "Custom css auto udpate":     { "id": "bda-css-1", "info": "",                                                  "implemented": true,  "hidden": true , "cat": "core"},
            
                "Show Emotes":                { "id": "bda-es-7",  "info": "Show any emotes",                                   "implemented": true,  "hidden": false, "cat": "emote"},
                "FrankerFaceZ Emotes":        { "id": "bda-es-1",  "info": "Show FrankerFaceZ Emotes",                          "implemented": true,  "hidden": false, "cat": "emote"},
                "BetterTTV Emotes":           { "id": "bda-es-2",  "info": "Show BetterTTV Emotes",                             "implemented": true,  "hidden": false, "cat": "emote"},
                "Emote Menu":                 { "id": "bda-es-0",  "info": "Show Twitch/Favourite emotes in emote menu",        "implemented": true,  "hidden": false, "cat": "emote"},
                "Emoji Menu":                 { "id": "bda-es-9",  "info": "Show Discord emoji menu",                           "implemented": true,  "hidden": false, "cat": "emote"},
                "Emote Autocomplete":         { "id": "bda-es-3",  "info": "Autocomplete emote commands",                       "implemented": false, "hidden": false, "cat": "emote"},
                "Emote Auto Capitalization":  { "id": "bda-es-4",  "info": "Autocapitalize emote commands",                     "implemented": true,  "hidden": false, "cat": "emote"},
                "Show Names":                 { "id": "bda-es-6",  "info": "Show emote names on hover",                         "implemented": true,  "hidden": false, "cat": "emote"},
                "Show emote modifiers":       { "id": "bda-es-8",  "info": "Enable emote mods",                                 "implemented": true,  "hidden": false, "cat": "emote"},
        },
        links: {
                "Jiiks.net":         { "text": "Jiiks.net",         "href": "https://jiiks.net",          "target": "_blank" },
                "twitter":           { "text": "Twitter",           "href": "https://twitter.com/jiiksi", "target": "_blank" },
                "github":            { "text": "Github",            "href": "https://github.com/jiiks",   "target": "_blank" },
                "betterdiscord.net": { "text": "BetterDiscord.net", "href": "https://betterdiscord.net",  "target": "_blank" }
        },
        changelog: {
            "changes": {
                "darkmode": {
                    "title": "v1.63 : Dark Mode",
                    "text": "Dark mode makes certain elements dark by default(currently only applies to emote menu)",
                    "img": ""
                },
                "emotemenu": {
                    "title": "v1.62 : Brand new emote menu that fits in Discord emoji menu!",
                    "text": "The emote menu has been replaced by a new one that injects itself in the Discord emoji menu!",
                    "img": ""
                },
                "cccss": {
                    "title": "v1.61 : New custom CSS editor",
                    "text": "The custom CSS editor now has options and can be detached!",
                    "img": ""
                },
                "vdc": {
                    "title": "v1.61 : Voice Disconnect",
                    "text": "Disconnect from voice server when closing Discord!",
                    "img": ""
                },
                "pslist": {
                    "title": "v1.60 : New public server list!",
                    "text": 'New and shiny public server list powered by <a href="https://www.discordservers.com/" target="_blank">DiscordServers.com</a>!',
                    "img": ""
                },
                "api": {
                    "title": "v1.59 : New plugin api callback",
                    "text": "Use the `observer(e)` callback instead of creating your own MutationObserver",
                    "img": ""
                },
                "emotemods": {
                    "title": "v1.59 : New emote mods!",
                    "text": "The following emote mods have been added: :shake2, :shake3, :flap",
                    "img": ""
                },
                "minmode": {
                    "title": "v1.59: Minimal mode",
                    "text": "Minimal mode embed fixed size has been removed",
                    "img": ""
                }
            },
            "fixes": {
                "modal": {
                    "title": "v1.62 : Fixed modals",
                    "text": "Fixed broken modal introduced by 0.0.287",
                    "imt": ""
                },
                "emotes": {
                    "title": "v1.59 : Native sub emote mods",
                    "text": "Emote mods now work with native sub emotes!",
                    "img": ""
                },
                "emotes2": {
                    "title": "v1.59 : Emote mods and custom emotes",
                    "text": "Emote mods will no longer interfere with custom emotes using :",
                    "img": ""
                }
            }
        }
    }
})();
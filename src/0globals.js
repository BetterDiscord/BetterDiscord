// var settingsPanel, emoteModule, quickEmoteMenu, voiceMode, pluginModule, themeModule, dMode, publicServersModule, mainCore, BDV2;
export const minimumDiscordVersion = "0.0.306";
export const currentDiscordVersion = (window.DiscordNative && window.DiscordNative.remoteApp && window.DiscordNative.remoteApp.getVersion && window.DiscordNative.remoteApp.getVersion()) || "0.0.306";
export const minSupportedVersion = "0.3.0";
export const bbdVersion = "0.3.5";
export const bbdChangelog = {
    description: "Big things are coming.",
    changes: [
        {
            title: "Bug Fixes",
            type: "fixed",
            items: [
                "Some fixes related to showing modals in the `BdApi`.",
                "Fixed the open folder buttons for plugins and themes"
            ]
        }
    ]
};

export const settings = {
    "Custom css live update":     {id: "bda-css-0", info: "",                                                  implemented: true,  hidden: true,  cat: "core"},
    "Custom css auto udpate":     {id: "bda-css-1", info: "",                                                  implemented: true,  hidden: true,  cat: "core"},
    "BetterDiscord Blue":         {id: "bda-gs-b",  info: "Replace Discord blue with BD Blue",                 implemented: false,  hidden: false, cat: "core"},

    /* Core */
    /* ====== */
    "Public Servers":             {id: "bda-gs-1",  info: "Display public servers button",                     implemented: true,  hidden: false, cat: "core", category: "modules"},
    "Minimal Mode":               {id: "bda-gs-2",  info: "Hide elements and reduce the size of elements.",    implemented: true,  hidden: false, cat: "core", category: "modules"},
    "Voice Mode":                 {id: "bda-gs-4",  info: "Only show voice chat",                              implemented: true,  hidden: false, cat: "core", category: "modules"},
    "Hide Channels":              {id: "bda-gs-3",  info: "Hide channels in minimal mode",                     implemented: true,  hidden: false, cat: "core", category: "modules"},
    "Dark Mode":                  {id: "bda-gs-5",  info: "Make certain elements dark by default(wip)",        implemented: true,  hidden: false, cat: "core", category: "modules"},
    "Voice Disconnect":           {id: "bda-dc-0",  info: "Disconnect from voice server when closing Discord", implemented: true,  hidden: false, cat: "core", category: "modules"},
    "24 Hour Timestamps":         {id: "bda-gs-6",  info: "Replace 12hr timestamps with proper ones",          implemented: true,  hidden: false, cat: "core", category: "modules"},
    "Colored Text":               {id: "bda-gs-7",  info: "Make text color the same as role color",            implemented: true,  hidden: false, cat: "core", category: "modules"},
    "Normalize Classes":          {id: "fork-ps-4", info: "Adds stable classes to elements to help themes. (e.g. adds .da-channels to .channels-Ie2l6A)", implemented: true,  hidden: false, cat: "core", category: "modules"},

    /* Content */
    "Content Error Modal":        {id: "fork-ps-1", info: "Shows a modal with plugin/theme errors", implemented: true,  hidden: false, cat: "core", category: "content manager"},
    "Show Toasts":                {id: "fork-ps-2", info: "Shows a small notification for important information", implemented: true,  hidden: false, cat: "core", category: "content manager"},
    "Scroll To Settings":         {id: "fork-ps-3", info: "Auto-scrolls to a plugin's settings when the button is clicked (only if out of view)", implemented: true,  hidden: false, cat: "core", category: "content manager"},
    "Automatic Loading":          {id: "fork-ps-5", info: "Automatically loads, reloads, and unloads plugins and themes", implemented: true,  hidden: false, cat: "core", category: "content manager"},

    /* Developer */
    "Developer Mode":         	  {id: "bda-gs-8",  info: "Developer Mode",                                    implemented: true,  hidden: false, cat: "core", category: "developer settings"},
    "Copy Selector":			  {id: "fork-dm-1", info: "Adds a \"Copy Selector\" option to context menus when developer mode is active", implemented: true,  hidden: false, cat: "core", category: "developer settings"},
    "React DevTools":			  {id: "reactDevTools", info: "Adds react developer tools to the devtools. Must be installed in Google Chrome on your pc.", implemented: true,  hidden: true, cat: "core", category: "developer settings"},

    /* Window Prefs */
    "Enable Transparency":        {id: "fork-wp-1", info: "Enables the main window to be see-through (requires restart)", implemented: true,  hidden: false, cat: "core", category: "window preferences"},
    "Window Frame":               {id: "fork-wp-2", info: "Adds the native os window frame to the main window", implemented: false,  hidden: true, cat: "core", category: "window preferences"},


    /* Emotes */
    /* ====== */
    "Download Emotes":            {id: "fork-es-3", info: "Download emotes when the cache is expired",         implemented: true,  hidden: false, cat: "emote"},
    "Twitch Emotes":              {id: "bda-es-7",  info: "Show Twitch emotes",                                implemented: true,  hidden: false, cat: "emote"},
    "FrankerFaceZ Emotes":        {id: "bda-es-1",  info: "Show FrankerFaceZ Emotes",                          implemented: true,  hidden: false, cat: "emote"},
    "BetterTTV Emotes":           {id: "bda-es-2",  info: "Show BetterTTV Emotes",                             implemented: true,  hidden: false, cat: "emote"},
    "Emote Menu":                 {id: "bda-es-0",  info: "Show Twitch/Favourite emotes in emote menu",        implemented: true,  hidden: false, cat: "emote"},
    "Emoji Menu":                 {id: "bda-es-9",  info: "Show Discord emoji menu",                           implemented: true,  hidden: false, cat: "emote"},
    "Emote Auto Capitalization":  {id: "bda-es-4",  info: "Autocapitalize emote commands",                     implemented: false, hidden: false, cat: "emote"},
    "Show Names":                 {id: "bda-es-6",  info: "Show emote names on hover",                         implemented: true,  hidden: false, cat: "emote"},
    "Show emote modifiers":       {id: "bda-es-8",  info: "Enable emote mods (flip, spin, pulse, spin2, spin3, 1spin, 2spin, 3spin, tr, bl, br, shake, shake2, shake3, flap)", implemented: true,  hidden: false, cat: "emote"},
    "Animate On Hover":           {id: "fork-es-2", info: "Only animate the emote modifiers on hover", implemented: true,  hidden: false, cat: "emote"}
};

export const defaultCookie = {
    "bda-gs-1": true,
    "bda-gs-2": false,
    "bda-gs-3": false,
    "bda-gs-4": false,
    "bda-gs-5": true,
    "bda-gs-6": false,
    "bda-gs-7": false,
    "bda-gs-8": false,
    "bda-es-0": true,
    "bda-es-1": true,
    "bda-es-2": true,
    "bda-es-4": false,
    "bda-es-6": true,
    "bda-es-7": true,
    "bda-gs-b": false,
    "bda-es-8": true,
    "bda-dc-0": false,
    "bda-css-0": false,
    "bda-css-1": false,
    "bda-es-9": true,
    "fork-dm-1": false,
    "fork-ps-1": true,
    "fork-ps-2": true,
    "fork-ps-3": true,
    "fork-ps-4": true,
    "fork-ps-5": true,
    "fork-es-2": false,
    "fork-es-3": true,
    "fork-wp-1": false,
    "fork-wp-2": false,
    "fork-beta": true,
    "reactDevTools": false
};


export const settingsCookie = {};

export const bdpluginErrors = [];
export const bdthemeErrors = []; // define for backwards compatibility

export const bdConfig = {};

export const bemotes = [];
export const emotesFfz = {};
export const emotesBTTV = {};
export const emotesBTTV2 = {};
export const emotesTwitch = {};
export const subEmotesTwitch = {};

export const bdEmotes = {
    TwitchGlobal: {},
    TwitchSubscriber: {},
    BTTV: {},
    FrankerFaceZ: {},
    BTTV2: {}
};

export const bdEmoteSettingIDs = {
    TwitchGlobal: "bda-es-7",
    TwitchSubscriber: "bda-es-7",
    BTTV: "bda-es-2",
    FrankerFaceZ: "bda-es-1",
    BTTV2: "bda-es-2"
};

export const bdthemes = {};
export const bdplugins = {};

export const pluginCookie = {};
export const themeCookie = {};


export default {
    description: "Most of these fixes in this update come from Strencher (https://github.com/Strencher).",
    changes: [
        {
            title: "Fixes",
            type: "fixed",
            items: [
                "Fixed several crashing issues related to voice and video chats.",
                "Fixed the incompatibility with Canary/PTB",
                "Fixed missing class names on guild elements.",
                "Fixed minimal mode for new Discovery tab. Thanks, dav1312 (https://github.com/dav1312)."
            ]
        },
        {
            title: "Power Users & Developers",
            type: "improved",
            items: [
                "Console errors from plugins should now properly map to the local file.",
                "Support for other chrome profiles added when using React DevTools. Thanks, CrizGames (https://github.com/CrizGames).",
                "Emote menu handling is improved.",
                "`openDialog` added to `BdApi`."
            ]
        }
    ]
};
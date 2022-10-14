const WEB_HOSTNAME = "betterdiscord.app";
const API_VERSION = "v2";
const API_BASE = `https://api.${WEB_HOSTNAME}/${API_VERSION}`;

export default {
    WEB_HOSTNAME,
    API_VERSION,
    API_BASE,
    TAGS: {
        theme: ["all", "flat", "transparent", "layout", "customizable", "fiction", "nature", "space", "dark", "light", "game", "anime", "red", "orange", "green", "purple", "black", "other", "yellow", "blue", "abstract"],
        plugin: ["all", "fun", "roles", "activity", "status", "game", "edit", "library", "notifications", "emotes", "channels", "shortcut", "enhancement", "servers", "chat", "security", "organization", "friends", "members", "utility", "developers", "search", "text", "voice"]
    },
    ENDPOINTS: {
        store: type => `${API_BASE}/store/${type}`,
        addon: addon => `${API_BASE}/store/${addon}`,
        download: id => `https://${WEB_HOSTNAME}/download?id=${id}`,
        githubRedirect: id => `https://${WEB_HOSTNAME}/gh-redirect?id=${id}`,
        thumbnail: thumbnailUrl => `https://${WEB_HOSTNAME}${thumbnailUrl ?? "/resources/store/missing.svg"}`,
    },
    PAGES: {
        home: `https://${WEB_HOSTNAME}/`,
        themes: `https://${WEB_HOSTNAME}/themes`,
        plugins: `https://${WEB_HOSTNAME}/plugins`,
        theme: `https://${WEB_HOSTNAME}/theme`,
        plugin: `https://${WEB_HOSTNAME}/plugin`,
        developers: `https://${WEB_HOSTNAME}/developers`,
        developer: `https://${WEB_HOSTNAME}/developer`,
        merch: `https://${WEB_HOSTNAME}/merch`,
        faq: `https://${WEB_HOSTNAME}/faq`,
        docs: `https://${WEB_HOSTNAME}/docs`
    }
};
const HOSTNAME = "betterdiscord.app";
/**
 * The current API version to use
 * @type {`v${bigint}` | "latest"}
 */
const API_VERSION = "v3";

/**
 * @param  {string[]} paths
 */
const join = (...paths) => {
    const path = paths.map(($path) => $path.match(/\/*(.+)\/*/)[1]).filter(Boolean).join("/");

    return `https://${HOSTNAME}/${path}`;
};

/**
 * @param  {string[]} paths
 */
const apiJoin = (...paths) => {
    const path = paths.map(($path) => $path.match(/\/*(.+)\/*/)[1]).filter(Boolean).join("/");

    return `https://api.${HOSTNAME}/${API_VERSION}/${path}`;
};
/**
 * @param {string} type
 * @returns {(name: string) => string}
 */
const makePage = (type) => (name) => join(`${type}/${encodeURIComponent(name)}`);

/**
 * @param {string} type
 * @returns {(id: string) => string}
 */
const makeRedirects = (type) => (id) => join(`${type}?id=${id}`);

// First id is betterdiscord and second is betterdiscord 2
const releaseChannels = {
    theme: [
        "813903993524715522",
        "781600198002081803",
    ],
    plugin: [
        "813903954991120385",
        "781600250858700870"
    ]
};

// Theres 2 empty/missing thumbnails, the one the site uses and a empty store one
const EMPTY_USE_STORE = true;

const RAW_GIT_URL_REGEX = /^https:\/\/raw\.githubusercontent\.com\/(.+?)\/(.+?)\/(.+?)\/(.+)$/;

export default class Web {
    /**
     * This will allow preloading of the addon channels
     * @param {string} channelId
     * @returns {"plugin" | "theme" | undefined}
     */
    static getReleaseChannelType(channelId) {
        if (releaseChannels.plugin.includes(channelId)) return "plugin";
        if (releaseChannels.theme.includes(channelId)) return "theme";
    }

    /** @param {string} rawGitURL  */
    static convertToPreviewURL(rawGitURL) {
        const match = rawGitURL.match(RAW_GIT_URL_REGEX);

        if (!match) {
            throw new Error("Failed to parse url!");
        }

        const [, user, repo, commit, filePath] = match;
        const jsdelivr = `https://cdn.jsdelivr.net/gh/${user}/${repo}@${commit}/${filePath}`;

        return `https://discord-preview.vercel.app/?file=${encodeURIComponent(jsdelivr)}`;
    }

    /**
     * Converts a raw github link into a normal github page
     * @example
     * https://raw.githubusercontent.com/QWERTxD/BetterDiscordPlugins/298752533fbbdab511c3a3f4ffe6afd41d0a93f1/CallTimeCounter/CallTimeCounter.plugin.js
     * https://github.com/QWERTxD/BetterDiscordPlugins/blob/298752533fbbdab511c3a3f4ffe6afd41d0a93f1/CallTimeCounter/CallTimeCounter.plugin.js
     * @param {string} rawGitURL
     */
    static convertRawToGitHubURL(rawGitURL) {
        const match = rawGitURL.match(RAW_GIT_URL_REGEX);

        if (!match) {
            throw new Error("Failed to parse url!");
        }

        const [, user, repo, commit, filePath] = match;

        return `https://github.com/${user}/${repo}/blob/${commit}/${filePath}`;
    }

    static API_VERSION = API_VERSION;

    static redirects = {
        github: makeRedirects("/gh-redirect"),
        download: makeRedirects("/download"),
        theme: makeRedirects("/theme"),
        plugin: makeRedirects("/plugin")
    };
    static pages = {
        themes: join("/themes"),
        theme: makePage("/theme"),
        plugins: join("/plugins"),
        plugin: makePage("/plugin"),
        developers: join("/developers"),
        developer: makePage("/developer")
    };
    static resources = {
        EMPTY_THUMBNAIL: EMPTY_USE_STORE ? "/resources/store/missing.svg" : "/resources/ui/content_thumbnail.svg",
        /** @param {? string} thumbnail */
        thumbnail: (thumbnail) => join(thumbnail || Web.resources.EMPTY_THUMBNAIL)
    };

    static store = {
        addons: apiJoin("/store/addons"),
        themes: apiJoin("/store/themes"),
        plugins: apiJoin("/store/plugins"),
        /** @param {number|string} idOrName Id or Name of a addon */
        addon: (idOrName) => apiJoin(`/store/${encodeURIComponent(idOrName)}`),

        tags: {
            plugin: [
                "fun",
                "roles",
                "activity",
                "status",
                "game",
                "edit",
                "library",
                "notifications",
                "emotes",
                "channels",
                "shortcut",
                "enhancement",
                "servers",
                "chat",
                "security",
                "organization",
                "friends",
                "members",
                "utility",
                "developers",
                "search",
                "text",
                "voice"
            ],
            theme: [
                "flat",
                "transparent",
                "layout",
                "customizable",
                "fiction",
                "nature",
                "space",
                "dark",
                "light",
                "game",
                "anime",
                "red",
                "orange",
                "green",
                "purple",
                "black",
                "other",
                "high-contrast",
                "white",
                "aqua",
                "animated",
                "yellow",
                "blue",
                "abstract"
            ]
        }
    };
}

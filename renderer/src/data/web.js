const HOSTNAME = "betterdiscord.app";
const API_VERSION = "latest";

/**
 * @param  {...string[]} paths 
 */
const join = (...paths) => {
    const path = paths.map(($path) => $path.match(/\/*(.+)\/*/)[1]).filter(Boolean).join("/");

    return `https://${HOSTNAME}/${path}`;
};

/**
 * @param  {...string[]} paths 
 */
const apiJoin = (...paths) => {
    const path = paths.map(($path) => $path.match(/\/*(.+)\/*/)[1]).filter(Boolean).join("/");

    return `https://api.${HOSTNAME}/${API_VERSION}/${path}`;
};
/**
 * @param {string} type 
 * @returns {(name?: string) => string}
 */
const makePage = (type) => (name) => join(`${type}/${encodeURIComponent(name)}`);

/**
 * @param {string} type 
 * @returns {(id: string) => string}
 */
const makeRedirects = (type) => (id) => join(`${type}?id=${id}`);

// First id is betterdiscord and second is betterdiscord 2
const addonReleaseChannels = [
    // Themes
    "813903993524715522",
    "781600198002081803",
    // Plugins
    "813903954991120385",
    "781600250858700870"
];

// Theres 2 empty/missing thumbnails, the one the site uses and a empty store one
const EMPTY_USE_STORE = true;

const RAW_GIT_URL = /^https:\/\/raw\.githubusercontent\.com\/(.+?)\/(.+?)\/(.+?)\/(.+)$/;

export default new class Web {
    /** @param {string} channelId  */
    isReleaseChannel(channelId) {
        return addonReleaseChannels.includes(channelId);
    }

    /** @param {string} rawGitURL  */
    previewURL(rawGitURL) {
        const match = rawGitURL.match(RAW_GIT_URL);

        if (!match) {
            throw new Error("Enable to parse url!");
        }

        const [, user, repo, commit, filePath] = match;
        const jsdelivr = `https://cdn.jsdelivr.net/gh/${user}/${repo}@${commit}/${filePath}`;
        
        return `https://discord-preview.vercel.app/?file=${encodeURIComponent(jsdelivr)}`;
    }
    
    redirects = {
        github: makeRedirects("/gh-redirect"),
        download: makeRedirects("/download"),
        theme: makeRedirects("/theme"),
        plugin: makeRedirects("/plugin")
    };
    pages = {
        themes: join("/themes"),
        theme: makePage("/theme"),
        plugins: join("/plugins"),
        plugin: makePage("/plugin"),
        developers: join("/developers"),
        developer: makePage("/developer")
    };
    resources = {
        EMPTY_THUMBNAIL: EMPTY_USE_STORE ? "/resources/store/missing.svg" : "/resources/ui/content_thumbnail.svg",
        /** @param {?string} thumbnail */
        thumbnail: (thumbnail) => join(thumbnail || this.resources.EMPTY_THUMBNAIL)
    };

    store = {
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
};
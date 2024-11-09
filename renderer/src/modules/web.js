const BETTERDISCORD_SITE = "https://betterdiscord.app";
const BETTERDISCORD_API = "https://api.betterdiscord.app";
const API_VERSION = 2;

/**
 * @param  {...string[]} paths 
 * @returns {string}
 */
const join = (...paths) => {
    const path = paths.map(($path) => $path.match(/\/*(.+)\/*/)[1]).filter(Boolean).join("/");

    return `${BETTERDISCORD_SITE}/${path}`;
};

/**
 * @param  {...string[]} paths 
 * @returns {string}
 */
const apiJoin = (...paths) => {
    const path = paths.map(($path) => $path.match(/\/*(.+)\/*/)[1]).filter(Boolean).join("/");

    return `${BETTERDISCORD_API}/v${API_VERSION}/${path}`;
};
/**
 * @param {string} type 
 * @returns {(name: string) => string}
 */
const makePage = (type) => (name) => join(`${type}${name ? `/${encodeURIComponent(name)}` : "s"}`);

/**
 * @param {string} type 
 * @returns {(id: string) => string}
 */
const makeRedirects = (type) => (id) => join(`${type}?id=${id}`);

const addonReleaseChannels = {
    theme: [
        "813903993524715522", // BetterDiscord
        "781600198002081803" // BetterDiscord2
    ],
    plugin: [
        "813903954991120385", // BetterDiscord
        "781600250858700870" // BetterDiscord2
    ]
};

export default new class Web {
    constructor() {window.Web = this;}
    join = join;
    apiJoin = apiJoin;

    isReleaseChannel(channelId) {
        return addonReleaseChannels.plugin.includes(channelId) || addonReleaseChannels.theme.includes(channelId);
    }

    base = BETTERDISCORD_SITE;

    api = {
        version: API_VERSION,
        base: apiJoin(),
        store: {
            base: apiJoin("/store/addons"),
            addons: apiJoin("/store/addons"),
            themes: apiJoin("/store/themes"),
            plugins: apiJoin("/store/plugins")
        }
    };
    redirects = {
        github: makeRedirects("/gh-redirect"),
        download: makeRedirects("/download"),
        theme: makeRedirects("/theme"),
        plugin: makeRedirects("/plugin")
    };
    pages = {
        theme: makePage("/theme"),
        plugin: makePage("/plugin"),
        developer: makePage("/developer")
    };
    resources = {
        /**
         * @param {?string} thumbnail 
         */
        thumbnail: (thumbnail) => join(thumbnail || "/resources/ui/content_thumbnail.svg")
    };
};
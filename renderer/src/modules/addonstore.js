import request from "request";

import Logger from "@common/logger";
import Toasts from "@ui/toasts";

import DataStore from "./datastore";
import Strings from "./strings";

const apiURL = "https://api.betterdiscord.app/v2/store/addons";

/**
 * @typedef {{
 *      id: number,
 *      name: string,
 *      file_name: string,
 *      type: "theme" | "plugin",
 *      description: string,
 *      author: RawAddonAuthor,
 *      likes: number,
 *      downloads: number,
 *      tags: string[],
 *      thumbnail_url: string | null,
 *      release_date: string,
 *      guild: RawAddonGuild | null,
 *      version: string
 * }} RawAddon
 */

/**
 * @typedef {{
 *      github_id: string,
 *      github_name: string,
 *      display_name: string,
 *      discord_name: string,
 *      discord_avatar_hash: string,
 *      discord_snowflake: number,
 *      guild: RawAddonGuild | null
 * }} RawAddonAuthor
 */

/**
 * @typedef {{
 *      name: string,
 *      snowflake: string,
 *      invite_link: string,
 *      avatar_hash: string
 * }} RawAddonGuild
 */

// Make it so we can detect links that have <> around them
// So we can ignore them
const ADDON_REGEX_SOURCE = "(?:https?:\\/\\/betterdiscord\\.app\\/(?:theme|plugin)|(?:betterdiscord|bd|bdapp):\\/\\/(?:theme|plugin)s?)(?:\\/|\\?id=)(\\S+)";
const ADDON_REGEX = new RegExp(`(?:<${ADDON_REGEX_SOURCE}>|${ADDON_REGEX_SOURCE})`, "gi");

export default new class AddonStore {
    constructor() {
        /**
         * @type {RawAddon[]}
         */
        this.addonList = [];

        this.ok = false;
        this.loading = false;

        /**
         * @type {Set<() => void>}
         */
        this._subscribers = new Set();
    }

    get knownAddons() {
        return DataStore.getBDData("known-addons") || null;
    }

    _emitChange() {
        for (const subscriber of this._subscribers) {
            subscriber();
        }
    }

    requestAddons() {
        Logger.debug("AddonStore", "Requesting addons");

        this.loading = true;
        this.ok = false;

        this._emitChange();

        request(apiURL, (error, _, body) => {
            try {
                this.addonList.length = 0;
    
                this.loading = false;
                this.ok = !error;
    
                if (error) {
                    Logger.stacktrace("AddonStore", "Failed to fetch addons api:", error);
    
                    Toasts.show(Strings.Addons.failedToFetch, {
                        type: "danger"
                    });
    
                    return;
                }
    
                this.addonList.push(...JSON.parse(body));
                
    
                if (this.knownAddons === null) {
                    DataStore.setBDData("known-addons", [...this.knownAddons]);
                }
            } 
            finally {
                this._emitChange();
            }
        });
    }

    #initialized = false;
    initializeIfNeeded() {
        if (this.#initialized) return;
        this.#initialized = true;

        this.requestAddons();
    }

    getAddons() {
        return this.addonList;
    }
    /**
     * Gets a addon via id or name
     * @param {number|string} id 
     * @returns {RawAddon | undefined}
     */
    getAddon(id) {
        const decoded = decodeURIComponent(id.toString()).toLowerCase();

        return this.addonList.find((addon) => addon.id.toString() === id || addon.name.toLowerCase() === decoded);
    }

    getUnknownAddons() {
        if (!this.knownAddons) return [];
        return this.addonList.filter((addon) => !this.knownAddons.includes(addon.id));
    }
    /**
     * To prompt new addons
     * @param {number} id
     * @returns {boolean} 
     */
    isUnknown(id) {
        if (!this.knownAddons) return false;
        return !this.knownAddons.includes(id);
    }
    /**
     * @param {number} id
     */
    markAsKnown(id) {
        if (this.knownAddons.includes(id)) return;

        this.knownAddons.push(id);
        DataStore.setBDData("known-addons", this.knownAddons);
    }

    /**
     * Shows if they have been updated in the last week
     * @param {number} id
     * @returns {boolean} 
     */
    isRecentlyUpdated(id) {
        const addon = this.getAddon(id);

        if (!addon) return false;

        const currentDate = new Date();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(currentDate.getDate() - 7);

        const releaseDate = new Date(addon.release_date);
      
        // Check if the release date is within the last week
        return releaseDate >= oneWeekAgo && releaseDate <= currentDate;
    }
    
    /**
     * Get current state of the store
     */
    getState() {
        return {
            ok: this.ok,
            loading: this.loading,
            addons: this.addonList
        };
    }

    /**
     * Listen for when the addon store changes
     * @param {() => void} listener 
     * @returns {() => boolean}
     */
    addChangeListener(listener) {
        this._subscribers.add(listener);

        return () => this._subscribers.delete(listener);
    }

    
    /**
     * Extract all bd addon links
     * @param {string} text
     * @param {number} max
     * @return {{ id: string, match: string, index: number }[]} 
     */
    extractAddonLinks(text, max = Infinity) {
        ADDON_REGEX.lastIndex = 0;
        
        const matches = [];

        if (max <= 0) return matches;

        /** @type {RegExpExecArray} */
        let exec;
        while ((exec = ADDON_REGEX.exec(text))) {
            // Ignore all links circled with <>
            if (exec[0][0] === "<") continue;

            matches.push({
                id: exec[2],
                match: exec[0],
                index: exec.index
            });

            if (matches.length >= max) {
                break;
            }
        }

        return matches;
    }
};
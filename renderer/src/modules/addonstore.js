import request from "request";
import path from "path";
import fs from "fs";

import Logger from "@common/logger";
import Toasts from "@ui/toasts";
import DataStore from "./datastore";
import Strings from "./strings";
import fetch from "./api/fetch";
import React from "./react";
import PluginManager from "./pluginmanager";
import ThemeManager from "./thememanager";
import Modals from "@ui/modals";
import DownloadModal from "@ui/addon-store/download-modal";
import DiscordModules from "./discordmodules";
import Settings from "@modules/settingsmanager";


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
const ADDON_REGEX_SOURCE = "(?:https?:\\/\\/betterdiscord\\.app\\/(?:theme|plugin)|betterdiscord:\\/\\/(?:theme|plugin|addon)s?)(?:\\/|\\?id=)(\\S+)";
const ADDON_REGEX = new RegExp(`(?:<${ADDON_REGEX_SOURCE}>|${ADDON_REGEX_SOURCE})`, "gi");

const ADDON_REGEX_SINGLE = /^<betterdiscord:\/\/(theme|plugin|addon)s?\/(\S+)>/;

const EXTRACT_GIT_INFO = /^https:\/\/raw\.githubusercontent\.com\/(.+?)\/(.+?)\/(.+?)\/(.+)$/;

function showConfirmDelete(addon) {
    return new Promise(resolve => {
        Modals.showConfirmationModal(Strings.Modals.confirmAction, Strings.Addons.confirmDelete.format({name: addon.name}), {
            danger: true,
            confirmText: Strings.Addons.deleteAddon,
            onConfirm: () => {resolve(true);},
            onCancel: () => {resolve(false);}
        });
    });
}

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

        window.AddonStore = this;

        /** @type {NodeJS.Timeout | null} */
        this._internvalId = null;
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

        clearInterval(this._internvalId);

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
                // else {
                //     let unknownCount = 0;
                //     for (const addon of this.addonList) {
                //         if (this.isUnknown(addon.id)) unknownCount++;
                //     }

                //     Toasts.info(`${unknownCount} new addons`);
                // }
            } 
            finally {
                this._emitChange();

                this._internvalId = setTimeout(() => {}, 60 * 60 * 1000);
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
            // if https://betterdiscord.app/type/id not <https://betterdiscord.app/type/id>
            // if <betterdiscord://addon/id> not betterdiscord://addon/id
            if (!(exec[0][0] === "h" || exec[0][1] === "b")) continue;

            matches.push({
                id: exec[1] || exec[2],
                match: exec[0],
                index: exec.index
            });

            if (matches.length >= max) {
                break;
            }
        }

        return matches;
    }

    /**
     * For markdown
     * @param {string} string 
     * @returns {RegExpExecArray}
     */
    isAddonLink(string) {
        return ADDON_REGEX_SINGLE.exec(string);
    }

    /**
     * Get the github redirect for a addon
     * @param {RawAddon | number} addonOrId 
     * @returns {string}
     */
    redirect = (addonOrId) => `https://betterdiscord.app/gh-redirect?id=${typeof addonOrId === "number" ? addonOrId : addonOrId.id}`;

    /**
     * Opens a preview for the theme
     * @param {RawAddon} addon 
     */
    async openAddonPreview(addon) {
        if (addon.type === "plugin") {
            throw new Error("Addon is a plugin!");
        }

        const response = await fetch(this.redirect(addon), {method: "HEAD"});

        if (!response.ok) {
            throw new Error("Unable to get github url!");
        }

        const match = response.url.match(EXTRACT_GIT_INFO);
      
        if (!match) {
          throw new Error("Invalid GitHub raw URL format.");
        }
      
        const [, user, repo, commit, filePath] = match;
        const jsdelivrUrl = `https://cdn.jsdelivr.net/gh/${user}/${repo}@${commit}/${filePath}`;
        
        const previewURL = `https://discord-preview.vercel.app/?file=${encodeURIComponent(jsdelivrUrl)}`;

        window.open(previewURL, "_blank", "noopener,noreferrer");
    }
    /**
     * Opens the bd's site page for the addon
     * @param {RawAddon} addon 
     */
    openAddonPage(addon) {
        window.open(`https://betterdiscord.app/${addon.type}?id=${addon.id}`, "_blank", "noopener,noreferrer");
    }
    /**
     * Opens the raw code page
     * @param {RawAddon} addon 
     */
    openRawCode(addon) {
        window.open(this.redirect(addon), "_blank", "noopener,noreferrer");
    }

    /**
     * Opens the raw code page
     * @param {RawAddon} addon 
     */
    openAuthorPage(addon) {
        window.open(`https://betterdiscord.app/developer/${encodeURIComponent(addon.author.display_name)}`, "_blank", "noopener,noreferrer");
    }

    /**
     * Attempts to join guild
     * @param {RawAddon} addon 
     */
    attemptToJoinGuild(addon) {
        const guild = addon.guild || addon.author.guild;

        if (!guild) return;

        let code = guild.invite_link;
        const tester = /\.gg\/(.*)$/;
        if (tester.test(code)) code = code.match(tester)[1];
        
        DiscordModules.Dispatcher.dispatch({
            type: "LAYER_POP"
        });

        DiscordModules.InviteActions?.acceptInviteAndTransitionToInviteChannel({inviteKey: code});
    }

    /**
     * Get the file content of a request
     * @param {number} id 
     * @returns {Promise<string>}
     */
    fetchAddonContents(id) {
        return new Promise((resolve, reject) => {
            request(this.redirect(id), (err, headers, body) => {
                if (err || headers.statusCode >= 300 || headers.statusCode < 200) {
                    reject(new Error("Fetch was not ok"));
                    return;
                }                

                resolve(body);
            });
        });
    }

    /** @type {boolean} */
    get shouldAlwaysEnable() {return Settings.get("settings", "general", "alwaysEnable");}

    /**
     * Attempt to download addon
     * @param {RawAddon} addon 
     */
    async attemptToDownload(addon, shouldSkipConfirm = false) {
        const manager = addon.type === "plugin" ? PluginManager : ThemeManager;

        if (manager.isLoaded(addon.file_name)) return;

        const install = async (shouldEnable) => {
            try {
                // If should enable, tell the manager that it is before hand
                if (shouldEnable) {
                    manager.state[path.basename(addon.name)] = true;
                }

                const body = await this.fetchAddonContents(addon.id);
        
                Toasts.show(Strings.Addons.successfullyDownload.format({type: addon.type, name: addon.name}), {
                    type: "success"
                });
        
        
                fs.writeFileSync(path.join(manager.addonFolder, addon.file_name), body);
            } 
            catch (error) {
                Logger.stacktrace("AddonStore", `Failed to fetch addon '${addon.file_name}':`, error);
    
                Toasts.show(Strings.Addons.failedToDownload.format({type: addon.type, name: addon.name}), {
                    type: "danger"
                });
            }
        };

        if (shouldSkipConfirm) return install(this.shouldAlwaysEnable);
        
        return new Promise((resolve) => {
            let fromInstall = false;

            Modals.ModalActions.openModal((props) => React.createElement(DownloadModal, {
                ...props, 
                addon, 
                install: (shouldEnable) => {
                    fromInstall = true;
                    return install(shouldEnable).then(() => {
                        props.onClose();
                        resolve();
                    });
                }
            }), {
                onCloseCallback() {                    
                    if (!fromInstall) resolve();
                }
            });
        });
    }

    /**
     * Attempt to delete addon
     * @param {RawAddon} addon 
     * @param {boolean} shouldSkipConfirm Should confirm the deletion of the addon
     */
    async attemptToDelete(addon, shouldSkipConfirm = false) {
        const manager = addon.type === "plugin" ? PluginManager : ThemeManager;

        const foundAddon = manager.addonList.find(a => a.filename == addon.file_name);

        if (!foundAddon) return;

        if (!shouldSkipConfirm) {
            const shouldDelete = await showConfirmDelete(foundAddon);
            if (!shouldDelete) return;
        }

        if (manager.deleteAddon) manager.deleteAddon(foundAddon);
    }
};
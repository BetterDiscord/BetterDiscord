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
import InstallModal from "@ui/modals/installmodal";
import DiscordModules from "./discordmodules";
import Settings from "@modules/settingsmanager";
import Web from "@data/web";

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
        /** @type {RawAddon[]} */
        this.addonList = [];

        this.ok = false;
        this.loading = false;
        /** @type {null | any} */
        this.error = null;

        /** @type {Set<() => void>} */
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
        this.error = null;

        this._emitChange();

        request(Web.store.addons, (error, _, body) => {
            try {
                this.addonList.length = 0;
    
                this.loading = false;
                this.ok = !error;
                this.error = error;
    
                if (error) {
                    Logger.stacktrace("AddonStore", "Failed to fetch addons api:", error);
    
                    Toasts.show(Strings.Addons.failedToFetch, {
                        type: "danger"
                    });

                    this.error = error;
    
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

    singleAddonCache = {};
    /**
     * @param {number} id 
     * @returns {Promise<RawAddon>}
     */
    requestAddon(id) {
        const cache = this.getAddon(id);
        if (cache) return Promise.resolve(cache);

        return this.singleAddonCache[id] ??= new Promise((resolve, reject) => {
            request(Web.store.addon(id), (error, _, body) => {
                const data = JSON.parse(body);

                if (error || data.status === 404) {
                    reject(error || data.title);
                    return;
                }

                this.singleAddonCache[data.name] = this.singleAddonCache[id];
                this.singleAddonCache[data.id] = this.singleAddonCache[id];

                resolve(data);
            });
        });
    }

    /**
     * Gets a addon via id or name
     * @param {number|string} id 
     * @returns {RawAddon | undefined}
     */
    getAddon(id) {
        const decoded = decodeURIComponent(id.toString()).toLowerCase();

        return this.addonList.find((addon) => addon.id.toString() === decoded || addon.name.toLowerCase() === decoded || addon.file_name.toLowerCase() === decoded);
    }

    /**
     * Gets a addon via the release channels embed name
     * @param {string} name 
     */
    getAddonViaEmbedName(name) {
        return this.addonList.find((addon) => name.startsWith(`${addon.name} - `));
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
    execAddonLink(string) {
        return ADDON_REGEX_SINGLE.exec(string);
    }

    /**
     * Opens a preview for the theme
     * @param {RawAddon} addon 
     */
    async openAddonPreview(addon) {
        if (addon.type === "plugin") {
            throw new Error("Addon is a plugin!");
        }

        const response = await fetch(Web.redirects.github(addon.id), {method: "HEAD"});

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
        window.open(Web.redirects[addon.type](addon.id), "_blank", "noopener,noreferrer");
    }
    /**
     * Opens the raw code page
     * @param {RawAddon} addon 
     */
    openRawCode(addon) {
        window.open(Web.redirects.github(addon.id), "_blank", "noopener,noreferrer");
    }

    /**
     * Opens the raw code page
     * @param {RawAddon} addon 
     */
    openAuthorPage(addon) {
        window.open(Web.pages.developer(addon.author.display_name), "_blank", "noopener,noreferrer");
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
     * Attempt to download addon
     * @param {RawAddon} addon 
     */
    async attemptToDownload(addon, shouldSkipConfirm = false) {
        const manager = addon.type === "plugin" ? PluginManager : ThemeManager;

        if (manager.isLoaded(addon.file_name)) return;

        const install = (shouldEnable) => new Promise((resolve) => {
            request(Web.redirects.download(addon.id), (error, headers, body) => {
                if (error || headers.statusCode >= 300 || headers.statusCode < 200) {
                    Logger.stacktrace("AddonStore", `Failed to fetch addon '${addon.file_name}':`, error);
        
                    Toasts.show(Strings.Addons.failedToDownload.format({type: addon.type, name: addon.name}), {
                        type: "danger"
                    });

                    resolve();

                    return;
                }

                // If should enable, tell the manager that it is before hand
                if (shouldEnable) {
                    manager.state[path.basename(addon.name)] = true;
                }
        
                Toasts.show(Strings.Addons.successfullyDownload.format({name: addon.name}), {
                    type: "success"
                });
        
                fs.writeFileSync(path.join(manager.addonFolder, addon.file_name), body);

                resolve();
            });
        });

        if (shouldSkipConfirm) return install(Settings.get("settings", "general", "alwaysEnable"));
        
        return new Promise((resolve) => {
            let fromInstall = false;

            Modals.ModalActions.openModal((props) => React.createElement(InstallModal, {
                ...props, 
                addon, 
                install: async (shouldEnable) => {
                    fromInstall = true;
                    await install(shouldEnable);
                    props.onClose();
                    resolve();
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
     * @param {boolean} shouldSkipConfirm Should skip the confirm to delete the addon
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
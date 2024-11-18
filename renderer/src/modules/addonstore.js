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

/** @typedef {Addon} Addon */

class Addon {
    /** @type {Record<string, Addon>} */
    static cache = {};

    /** @param {RawAddon} addon  */
    constructor(addon) {
        if (typeof Addon.cache[addon.id] === "object") {
            const cached = Addon.cache[addon.id];

            cached.downloads = Math.max(cached.downloads, addon.downloads);
            cached.likes = Math.max(cached.likes, addon.likes);

            return cached;
        }

        this.id = addon.id;
        this.name = addon.name;

        this.releaseDate = new Date(addon.release_date);
        
        this.type = addon.type;
        
        this.thumbnail = Web.resources.thumbnail(addon.thumbnail_url);
        this.avatar = `https://avatars.githubusercontent.com/u/${addon.author.github_id}?v=4`;
        this.author = addon.author.discord_name;
        
        this.guild = addon.guild || addon.author.guild || null;
        
        this.manager = addon.type === "plugin" ? PluginManager : ThemeManager;
        
        this.description = addon.description;
        
        this.tags = addon.tags;
        
        this.downloads = addon.downloads;
        this.likes = addon.likes;
        
        this.version = addon.version;

        this.filename = addon.file_name;
        
        Addon.cache[addon.id] = this;
    }

    /**
     * To prompt new addons
     * @returns {boolean} 
     */
    isUnknown() {
        const data = DataStore.getBDData(`known-${this.type}s`);

        if (!data) return false;
        return !data.includes(this.id);
    }
    /** To hide the badge */
    markAsKnown() {
        if (!DataStore.getBDData(`has-requested-${this.type}s`)) return;

        const data = DataStore.getBDData(`known-${this.type}s`) || [];

        data.push(this.id);
        DataStore.setBDData(`known-${this.type}s`, data);
    }

    /** Opens the Theme preview site */
    async openPreview() {
        if (this.type === "plugin") {
            throw new Error("Addon is a plugin!");
        }

        const response = await fetch(Web.redirects.github(this.id), {method: "HEAD"});

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

    /** Opens the bd's site page for the addon */
    openAddonPage() {
        window.open(Web.redirects[this.type](this.id), "_blank", "noopener,noreferrer");
    }

    /** Opens the raw code page */
    openRawCode() {
        window.open(Web.redirects.github(this.id), "_blank", "noopener,noreferrer");
    }

    /** Opens the raw code page */
    openAuthorPage() {
        window.open(Web.pages.developer(this.author), "_blank", "noopener,noreferrer");
    }

    /** Attempts to join guild */
    joinGuild() {
        if (!this.guild) return;

        let code = this.guild.invite_link;
        const tester = /\.gg\/(.*)$/;
        if (tester.test(code)) code = code.match(tester)[1];
        
        DiscordModules.Dispatcher.dispatch({
            type: "LAYER_POP"
        });

        DiscordModules.InviteActions?.acceptInviteAndTransitionToInviteChannel({inviteKey: code});
    }

    /**
     * Attempt to download addon
     * @param {boolean} shouldSkipConfirm Should skip the confirm to delete the addon
     * @returns {Promise<void>}
     */
    async download(shouldSkipConfirm = false) {
        if (this.isInstalled()) return;

        const install = (shouldEnable) => new Promise((resolve) => {
            request(Web.redirects.download(this.id), (error, headers, body) => {
                if (error || headers.statusCode >= 300 || headers.statusCode < 200) {
                    Logger.stacktrace("AddonStore", `Failed to fetch addon '${this.filename}':`, error);
        
                    Toasts.show(Strings.Addons.failedToDownload.format({type: this.type, name: this.name}), {
                        type: "danger"
                    });

                    resolve();

                    return;
                }

                // Update download count if downloaded
                this.downloads++;

                // If should enable, tell the manager that it is before hand
                if (shouldEnable) {
                    this.manager.state[this.name] = true;
                }
        
                Toasts.show(Strings.Addons.successfullyDownload.format({name: this.name}), {
                    type: "success"
                });
        
                fs.writeFileSync(path.join(this.manager.addonFolder, this.filename), body);

                resolve();
            });
        });
        
        return this._download ??= new Promise((resolve) => {
            if (shouldSkipConfirm) return install(Settings.get("settings", "general", "alwaysEnable")).then(() => resolve());

            let installing = false;

            const key = Modals.ModalActions.openModal((props) => React.createElement(InstallModal, {
                ...props, 
                addon: this, 
                install: async (shouldEnable) => {
                    installing = true;
                    await install(shouldEnable);
                    props.onClose();
                }
            }), {
                onCloseCallback: () => {
                    resolve();
                    this._download = null;
                },
                onCloseRequest() {
                    // If installing make it so the modal cannot close until install is finished
                    if (installing) return;
                    Modals.ModalActions.closeModal(key);
                },
                // backdropStyle: "BLUR"
            });
        });
    }

    /**
     * Attempt to delete addon
     * @param {boolean} shouldSkipConfirm Should skip the confirm to delete the addon
     */
    async delete(shouldSkipConfirm = false) {
        const foundAddon = this.manager.addonList.find(a => a.filename == this.filename);

        if (!foundAddon) return;

        if (!shouldSkipConfirm) {
            const shouldDelete = await showConfirmDelete(foundAddon);
            if (!shouldDelete) return;
        }

        if (this.manager.deleteAddon) this.manager.deleteAddon(foundAddon);
    }

    isInstalled() {
        return this.manager.isLoaded(this.filename);
    }
}

const addonStore = new class AddonStore {
    constructor() {
        /** @type {Addon[]} */
        this.plugins = [];
        /** @type {Addon[]} */
        this.themes = [];

        /** @type {Set<() => void>} */
        this._subscribers = new Set();

        window.AddonStore = this;
    }

    _emitChange() {
        for (const subscriber of this._subscribers) {
            subscriber();
        }
    }

    /**
     * @param {"theme" | "plugin"} type 
     * @returns {Addon[]}
     */
    getAddonsOfType(type) {
        return this[`${type}s`].concat();
    }

    /** @param {"plugins" | "themes"} type  */
    requestAddons(type) {
        Logger.debug("AddonStore", `Requesting all ${type}`);

        request(Web.store[type], (error, _, body) => {
            try {
                this[type].length = 0;
    
                if (error) {
                    Logger.stacktrace("AddonStore", `Failed to fetch ${type} api:`, error);
    
                    Toasts.show(Strings.Addons.failedToFetch, {
                        type: "danger"
                    });
    
                    return;
                }
    
                this[type].push(...JSON.parse(body).map((addon) => new Addon(addon)));
                
                if (!DataStore.getBDData(`has-requested-${type}`)) {
                    DataStore.setBDData(`has-requested-${type}`, true);
                    DataStore.setBDData(`known-${type}`, this[type].map(m => m.id));
                }
            } 
            finally {
                this._emitChange();
            }
        });
    }

    #initialized = {};
    /** @param {"plugins"|"themes"} type  */
    initializeIfNeeded(type) {
        if (this.#initialized[type]) return;
        this.#initialized[type] = true;

        this.requestAddons(`${type}s`);
    }

    singleAddonCache = {};
    /**
     * @param {number|string} idOrName 
     * @returns {Promise<Addon>}
     */
    requestAddon(idOrName) {
        const cache = this.getAddon(idOrName);
        if (cache) return Promise.resolve(cache);

        return this.singleAddonCache[idOrName] ??= new Promise((resolve, reject) => {
            request(Web.store.addon(idOrName), (error, _, body) => {
                const data = JSON.parse(body);

                if (error || data.status === 404) {
                    reject(error || data.title);
                    return;
                }

                this.singleAddonCache[data.name] = this.singleAddonCache[idOrName];
                this.singleAddonCache[data.id] = this.singleAddonCache[idOrName];

                resolve(new Addon(data));
            });
        });
    }

    /**
     * Gets a addon via id or name
     * @param {number|string} id 
     * @returns {Addon | null}
     */
    getAddon(id) {
        const decoded = decodeURIComponent(id.toString()).toLowerCase();

        for (const key in Addon.cache) {
            if (Object.prototype.hasOwnProperty.call(Addon.cache, key)) {
                const addon = Addon.cache[key];
                
                if (addon.id.toString() === decoded || addon.name.toLowerCase() === decoded) return addon;
            }
        }

        return null;
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
};

export default addonStore;
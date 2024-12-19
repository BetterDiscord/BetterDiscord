import path from "path";
import fs from "fs";

import Logger from "@common/logger";
import Toasts from "@ui/toasts";
import DataStore from "@modules/datastore";
import Strings from "@modules/strings";
import fetch from "@modules/api/fetch";
import React from "@modules/react";
import PluginManager from "@modules/pluginmanager";
import ThemeManager from "@modules/thememanager";
import Modals from "@ui/modals";
import InstallModal from "@ui/modals/installmodal";
import Settings from "@modules/settingsmanager";
import Web from "@data/web";
import Utilities from "./utilities";

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
 *      initial_release_date: string,
 *      latest_release_date: string,
 *      guild: RawAddonGuild | null,
 *      version: string,
 *      latest_source_url: string
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

/**
 * @param {Addon} addon 
 * @returns {Promise<boolean>}
 */
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
/** @typedef {Guild} Guild */

class Guild {
    /** 
     * @private
     * @type {Record<string, Guild>}
     */
    static cache = {};

    /**
     * @public
     * @param {RawAddonGuild} guild 
     * @returns {Guild}
     */
    static from(guild) {
        if (typeof this.cache[guild.id] === "object") {
            const cached = this.cache[guild.id];

            cached.name = guild.name;
            cached.invite = guild.invite_link;
            cached.hash = guild.avatar_hash;

            return cached;
        }

        return new this(guild);
    }

    /**
     * @private
     * @param {RawAddonGuild} guild
     */
    constructor(guild) {
        this.name = guild.name;
        this.id = guild.snowflake;

        this.invite = guild.invite_link;

        this.hash = guild.avatar_hash?.trim?.();
    }

    /** @public */
    get url() {
        let filename = `${this.hash}.webp`;
        if (filename.startsWith("a_")) filename = `${this.hash}.gif`;
        
        return `https://cdn.discordapp.com/icons/${this.id}/${filename}?size=256`;
    }
    /** @public */
    get acronym() {return this.name.replace(/'s /g," ").replace(/\w+/g, str => str[0]).replace(/\s/g,"");}
}

class Addon {
    /** 
     * @private
     * @type {Record<string, Addon>} 
     */
    static cache = {};

    /**
     * Update pre-existing addon class without create a new one
     * @public
     * @param {RawAddon} addon 
     * @returns {Addon}
     */
    static from(addon) {
        // Dont create a new one if addon already exists
        // Just sync data
        if (typeof this.cache[addon.id] === "object") {
            const cached = this.cache[addon.id];            

            cached.downloads = Math.max(cached.downloads, addon.downloads);
            cached.likes = Math.max(cached.likes, addon.likes);

            const guild = addon.guild || addon.author.guild;
            /** @type {Guild | null} */
            cached.guild = guild ? Guild.from(guild) : null;

            cached.latestSourceUrl = addon.latest_source_url;
            cached.version = addon.version;
            cached.description = addon.description;
            cached.tags = addon.tags;
            cached.thumbnail = Web.resources.thumbnail(addon.thumbnail_url);

            cached._addon = addon;

            return cached;
        }

        return new this(addon);
    }

    /**
     * Do not directly call
     * @private
     * @param {RawAddon} addon 
     */
    constructor(addon) {
        this.id = addon.id;
        this.name = addon.name;

        this.releaseDate = new Date(addon.initial_release_date);
        this.lastModified = new Date(addon.latest_release_date);
        
        this.type = addon.type;
        
        this.thumbnail = Web.resources.thumbnail(addon.thumbnail_url);
        this.avatar = `https://avatars.githubusercontent.com/u/${addon.author.github_id}?v=4`;
        this.author = addon.author.display_name;
        
        const guild = addon.guild || addon.author.guild;
        /** @type {Guild | null} */
        this.guild = guild ? Guild.from(guild) : null;
        
        this.manager = addon.type === "plugin" ? PluginManager : ThemeManager;
        
        this.description = addon.description;
        
        this.tags = addon.tags;
        
        this.downloads = addon.downloads;
        this.likes = addon.likes;
        
        this.version = addon.version;

        this.filename = addon.file_name;

        this.latestSourceUrl = addon.latest_source_url;

        /** @private */
        this._addon = addon;
        
        Addon.cache[addon.id] = this;
    }

    /**
     * To prompt new addons
     * @public
     * @returns {boolean} 
     */
    isUnknown() {
        const data = DataStore.getBDData("known-addons");

        if (!data) return false;
        return !data[this.filename];
    }

    /** 
     * To hide the badge
     * @public
     */
    markAsKnown() {
        const data = DataStore.getBDData("known-addons");

        if (!data) return;

        if (data[this.filename]) return;

        data[this.filename] = true;
        DataStore.setBDData("known-addons", data);
    }

    /** 
     * Opens the Theme preview site
     * @public
     */
    openPreview() {
        if (this.type === "plugin") {
            throw new Error("Addon is a plugin!");
        }
      
        window.open(Web.previewURL(this.latestSourceUrl), "_blank", "noopener,noreferrer");
    }

    /** 
     * Opens the bd's site page for the addon
     * @public
     */
    openAddonPage() {
        window.open(Web.redirects[this.type](this.id), "_blank", "noopener,noreferrer");
    }

    /**
     * Opens the addons github page
     * @public
     */
    openSourceCode() {
        window.open(Web.convertRawGitHubUrl(this.latestSourceUrl), "_blank", "noopener,noreferrer");
    }

    /** 
     * Opens the raw code page 
     * @public
     */
    openAuthorPage() {
        window.open(Web.pages.developer(this.author), "_blank", "noopener,noreferrer");
    }

    /**
     * Attempts to join a guild
     * @public
     */
    joinGuild() {
        if (!this.guild) return;

        Utilities.showGuildJoinModal(this.guild.invite);
    }

    /**
     * Attempt to download addon
     * Shows a confirmation modal (unless skipped) then installs the addon
     * @public
     * @param {boolean} shouldSkipConfirm Should skip the confirm to delete the addon
     * @returns {Promise<void>}
     */
    async download(shouldSkipConfirm = false) {
        if (this.isInstalled()) return;

        const install = async (shouldEnable) => {
            try {
                const request = await fetch(Web.redirects.github(this.id), {
                    headers: {
                        // Tell the site to count the download
                        "X-Store-Download": this.name
                    }
                });

                if (!request.ok) {
                    throw new Error("Addon was not found!");
                }

                const text = await request.text();

                if (shouldEnable) {
                    this.manager.state[this.name] = true;
                }
                
                fs.writeFileSync(path.join(this.manager.addonFolder, this.filename), text);

                Toasts.show(Strings.Addons.successfullyDownload.format({name: this.name}), {
                    type: "success"
                });

                this.downloads++;
            } 
            catch (error) {
                Logger.stacktrace("AddonStore", `Failed to fetch addon '${this.filename}':`, error);
    
                Toasts.show(Strings.Addons.failedToDownload.format({type: this.type, name: this.name}), {
                    type: "danger"
                });
            }
        };
        
        return this._download ??= new Promise((resolve) => {
            if (shouldSkipConfirm) return install(Settings.get("settings", "store", "alwaysEnable")).finally(() => resolve());

            let installing = false;

            const key = Modals.ModalActions.openModal((props) => React.createElement(InstallModal, {
                ...props, 
                addon: this, 
                install: (shouldEnable) => {
                    installing = true;
                    return install(shouldEnable);
                }
            }), {
                onCloseCallback: () => {
                    resolve();
                    this._download = null;
                },
                // Override the on close request to make it only close when not installing
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
     * Attempt to delete the local addon
     * @public
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

    /** @public */
    isInstalled() {
        return this.manager.isLoaded(this.filename);
    }

    /** @public */
    recentlyUpdated() {
        const now = new Date();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
      
        return this.lastModified > oneWeekAgo && this.lastModified <= now;
    }
}

class Store {
    /** @param {"plugin" | "theme"} type  */
    constructor(type) {
        this.type = type;
    }

    /** 
     * @type {Addon[]}
     * @readonly
     * @private 
     */
    addons = [];
    /** @public */
    getAddons() {return this.addons.concat();}

    /** @readonly */
    type;

    /** @type {Error | null} */
    error = null;
    loading = false;

    /**
     * Listener for when the user is offline and tries to fetch the addons 
     * @private
     */
    _onLineListener = () => {
        window.removeEventListener("online", this._onLineListener);
        this.requestAddons();
    };

    /** @public */
    async requestAddons() {
        Logger.debug("AddonStore", `Requesting all ${this.type}s`);

        this.loading = true;
        this.addons.length = 0;

        clearTimeout(this._setTimeout);
        this._setTimeout = null;

        this._emitChange();

        try {
            const request = await fetch(Web.store[this.type + "s"]);

            if (!request.ok) throw new Error("Request was not ok!");

            /** @type {RawAddon[]} */
            const json = await request.json();
            
            this.addons.push(...json.map((addon) => Addon.from(addon)));

            const data = DataStore.getBDData("known-addons");
            if (data) {
                for (const addon of this.addons) {
                    if (addon.filename in data) continue;

                    data[addon.filename] = false;
                }

                DataStore.setBDData("known-addons", data);
            }

            this.error = null;
        } 
        catch (error) {
            Logger.stacktrace("AddonStore", `Failed to fetch ${this.type}`, error);

            Toasts.show(Strings.Addons.failedToFetch, {
                type: "danger"
            });

            this.error = error instanceof Error ? error : new Error(String(error));
        }
        finally {
            this.loading = false;

            this._emitChange();

            let minutes = 60;

            if (this.error) {
                minutes = 5;

                // If the user is not online, just wait until the user is online
                if (this.error.message.startsWith("getaddrinfo ENOTFOUND") && !window.navigator.onLine) {
                    Logger.debug("AddonStore", "User is offline waiting for connection...");

                    window.removeEventListener("online", this._onLineListener);
                    window.addEventListener("online", this._onLineListener);

                    // eslint-disable-next-line no-unsafe-finally
                    return;
                }
            }

            this._setTimeout = setTimeout(() => this.requestAddons(), minutes * 60 * 1000);
        }
    }

    /** @private */
    _setTimeout = null;

    /** @private */
    _initialized = false;
    /**
     * Wrapper for {@link requestAddons} to allow it to be called only once, used in the UI 
     * @public
     */
    initialize() {
        if (this._initialized) return;
        this._initialized = true;
        
        this.requestAddons();
    }

    // Listener stuff
    /** @private */
    _subscribers = new Set();
    /** @private */
    _emitChange() {
        for (const subscriber of this._subscribers) {
            subscriber();
        }
    }

    /** 
     * get important data from the store to use in the ui
     * @private Not need anywhere except for react
     */
    getState() {
        return {
            error: this.error,
            addons: this.getAddons(),
            loading: this.loading
        };
    }
    /** 
     * A react hook for {@link getState}
     * @public
     * @returns {ReturnType<typeof this["getState"]>}
     */
    useState() {
        this.initialize();

        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [state, setState] = React.useState(() => this.getState());

        // eslint-disable-next-line react-hooks/rules-of-hooks
        React.useEffect(() => {
            setState(this.getState());

            const callback = () => setState(this.getState());

            this._subscribers.add(callback);
            return () => this._subscribers.delete(callback);
        }, []);

        return state;
    }
}

const ThemeStore = new Store("theme");
const PluginStore = new Store("plugin");

const addonStore = new class AddonStore {
    constructor() {
        if (!DataStore.getBDData("known-addons")) {
            fetch(Web.store.addons).then(async (request) => {
                const addons = await request.json();

                DataStore.setBDData("known-addons", Object.fromEntries(addons.map(m => [ m.file_name, true ])));
            });
        }
    }

    /** 
     * @public
     * @param {"plugin" | "theme"} type 
     */
    getStore(type) {
        if (type === "plugin") return PluginStore;
        return ThemeStore;
    }

    /** @private */
    _singleAddonCache = {};
    /**
     * Request a singular addon at a time
     * @public
     * @param {number|string} idOrName 
     * @returns {Promise<Addon>}
     */
    requestAddon(idOrName) {        
        const cache = this.getAddon(idOrName);
        if (typeof cache === "object") return Promise.resolve(cache);

        return this._singleAddonCache[idOrName] ??= (async () => {
            try {
                const request = await fetch(Web.store.addon(idOrName));
                /** @type {RawAddon | { title: string, status: number }} */
                const data = await request.json();
    
                if (!request.ok || data.status === 404) {
                    throw new Error(data.title);
                }
    
                this._singleAddonCache[data.name] = this._singleAddonCache[idOrName];
                this._singleAddonCache[data.id] = this._singleAddonCache[idOrName];
    
                return Addon.from(data);
            } 
            catch (error) {
                Logger.stacktrace("AddonStore", `Failed to fetch ${idOrName}`, error);
    
                Toasts.show(Strings.Addons.failedToFetch, {
                    type: "danger"
                });

                // To allow future fetches
                delete this._singleAddonCache[idOrName];

                throw error;
            }
        })();
    }

    /**
     * Gets a addon via id or name
     * @public 
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
    }

    /**
     * @public
     * @param {string} filename
     * @returns {boolean}
     */
    isOfficial(filename) {
        const data = DataStore.getBDData("known-addons");

        return Boolean(data && filename in data);
    }
};

export default addonStore;
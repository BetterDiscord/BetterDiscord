import path from "path";
import fs from "fs";

import request from "request";

import Logger from "@common/logger";
import Toasts from "@ui/toasts";
import DataStore from "@modules/datastore";
import Strings from "@modules/strings";
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

    /**
     * SHows the guild join modal (if the addon has a guild)
     * @public
     */
    join() {
        Utilities.showGuildJoinModal(this.invite);
    }
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
        return addonStore.isUnknown(this.filename);
    }

    /** 
     * To hide the badge
     * @public
     */
    markAsKnown() {
        addonStore.markAsKnown(this.filename);
    }

    /** 
     * Opens the Theme preview site
     * @public
     */
    openPreview() {
        if (this.type === "plugin") {
            throw new Error("Addon is a plugin!");
        }
      
        window.open(Web.convertToPreviewURL(this.latestSourceUrl), "_blank", "noopener,noreferrer");
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
        window.open(Web.convertRawToGitHubURL(this.latestSourceUrl), "_blank", "noopener,noreferrer");
    }

    /** 
     * Opens the raw code page 
     * @public
     */
    openAuthorPage() {
        window.open(Web.pages.developer(this.author), "_blank", "noopener,noreferrer");
    }

    /**
     * Attempt to download addon
     * Shows a confirmation modal (unless skipped) and installs the addon
     * 
     * If the addon is installed or gets installed (before the modal closes), 
     * it will close the modal and resolve
     * @public
     * @param {boolean} shouldSkipConfirm Should skip the confirm to delete the addon
     * @returns {Promise<void>}
     */
    async download(shouldSkipConfirm = false) {
        if (this.isInstalled()) {
            Toasts.show(Strings.Addons.alreadyInstalled.format({name: this.name}), {
                type: "info"
            });

            return;
        }

        const install = (shouldEnable) => new Promise((resolve, reject) => {
            request(Web.redirects.github(this.id), {
                headers: {
                    "X-Store-Download": this.name,
                    "Cache-Control": "no-cache",
                    "Pragma": "no-cache"
                }
            }, (err, req, text) => {
                try {
                    if (err || req.aborted || req.statusMessage !== "OK") {
                        throw err || req;
                    }

                    if (shouldEnable) {
                        this.manager.state[this.name] = true;

                        this.manager.saveState();
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

                    reject(error);
                }
                finally {
                    resolve();
                }
            });
        });
        
        return this._download ??= new Promise((resolve) => {
            const onFinish = () => {
                delete this._download;
                resolve();
            };

            if (shouldSkipConfirm) return install(Settings.get("settings", "store", "alwaysEnable")).finally(() => onFinish());

            let installing = false;

            const key = Modals.ModalActions.openModal((props) => React.createElement(InstallModal, {
                ...props, 
                addon: this, 
                install: (shouldEnable) => {
                    installing = true;
                    return install(shouldEnable);
                }
            }), {
                onCloseCallback: onFinish,
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

const addonStore = new class AddonStore {
    initialize() {
        this._cache = DataStore.getData("addon-store") || {};        

        if (this._cache.version !== Web.API_VERSION) {
            this._cache = {
                known: this._cache.known || [],
                addons: {},
                version: Web.API_VERSION
            };
        }        

        // window.AddonStore = this;
        
        this._useCache();
        this.requestAddons(true);
    }

    // Caching stuff
    /**
     * @type {{
     *      addons: Record<string, RawAddon>,
     *      known: string[],
     *      version: string
     * }}
     */
    _cache;
    /** @private */
    _useCache() {
        for (const key in this._cache.addons) {
            if (Object.prototype.hasOwnProperty.call(this._cache.addons, key)) {
                this.addons.push(
                    new Addon(this._cache.addons[key])
                );
            }
        }
    }
    /** @private */
    _writeCache(cache = this._cache) {
        this._cache = cache;

        DataStore.setData("addon-store", this._cache);
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

        return this._singleAddonCache[idOrName] ??= new Promise((resolve, reject) => {
            request(Web.store.addon(idOrName), {
                headers: {
                    "Cache-Control": "no-cache",
                    "Pragma": "no-cache"
                }
            }, (err, req, body) => {
                try {
                    if (err || req.aborted || req.statusMessage !== "OK") {
                        throw err || req;
                    }

                    const data = JSON.parse(body);

                    if (!request.ok || data.status === 404) {
                        throw new Error(data.title);
                    }
        
                    this._singleAddonCache[data.name] = this._singleAddonCache[idOrName];
                    this._singleAddonCache[data.id] = this._singleAddonCache[idOrName];
        
                    resolve(Addon.from(data));
                } 
                catch (error) {
                    Logger.stacktrace("AddonStore", `Failed to fetch ${idOrName}`, error);
        
                    Toasts.show(Strings.Addons.failedToFetch, {
                        type: "danger"
                    });

                    // To allow future fetches
                    delete this._singleAddonCache[idOrName];

                    reject(
                        error instanceof Error ? error : new Error(`Failed to request addons: Status ${req.statusCode}`)
                    );
                }
            });
        });
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
     * Determines whether an addon is official
     * Disabled currently
     * @public
     * @param {string} filename
     * @returns {boolean}
     */
    isOfficial(/* filename */) {
        return false;
        // return filename.toLowerCase() in this._cache.addons;
    }
    /**
     * @public
     * @param {string} filename
     * @returns {boolean}
     */
    isUnknown(filename) {
        return filename.toLowerCase() in this._cache.addons && !this._cache.known.includes(filename);
    }
    /**
     * @public
     * @param {string} filename
     */
    markAsKnown(filename) {        
        if (this.isUnknown(filename)) {
            this._cache.known.push(filename);

            this._writeCache();
        }
    }

    /** 
     * @type {Addon[]}
     * @readonly
     * @private 
     */
    addons = [];
    /** @public */
    getAddons() {return this.addons.concat();}

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

    /**
     * @param {? boolean} firstRun 
     */
    async requestAddons(firstRun = false) {
        Logger.debug("AddonStore", "Requesting all addons");

        if (!(firstRun && Object.keys(this._cache.addons).length)) {
            this.addons.length = 0;
        }

        this.loading = true;

        clearTimeout(this._setTimeout);
        this._setTimeout = null;

        this._emitChange();

        // If the user goes offline it will silent error
        // This is to go around that, so the store wont get stuck "loading" forever
        let failed = false;
        const offLineListener = () => {
            window.removeEventListener("offline", offLineListener);

            failed = true;
            
            this.loading = false;

            Logger.debug("AddonStore", "User is offline waiting for connection...");

            window.removeEventListener("online", this._onLineListener);
            window.addEventListener("online", this._onLineListener);

            Toasts.show(Strings.Addons.failedToFetch, {
                type: "danger"
            });

            this.error = new Error("Failed to request addons: User is offline!");

            this._useCache();

            this._emitChange();
        };

        if (window.navigator.onLine) {
            window.addEventListener("offline", offLineListener);
        }
        else {
            offLineListener();
            return;
        }

        request(Web.store.addons, {
            headers: {
                "Cache-Control": "no-cache",
                "Pragma": "no-cache"
            }
        }, (err, req, body) => {
            window.removeEventListener("offline", offLineListener);
            if (failed) return;

            try {
                if (err || req.aborted || req.statusMessage !== "OK") {
                    throw err || req;
                }
    
                const json = JSON.parse(body);
    
                const isFirstRun = this._cache.known.length === 0 && Object.keys(this._cache.addons).length === 0;
                
                /** @type {typeof this._cache} */
                const data = {
                    known: this._cache.known || {},
                    addons: {},
                    version: Web.API_VERSION
                };

                this.addons.length = 0;
    
                for (const addon of json) {
                    this.addons.push(Addon.from(addon));                
    
                    data.addons[addon.file_name.toLowerCase()] = addon;
                    if (isFirstRun) {
                        data.known.push(addon.file_name);
                    }
                }
    
                this._writeCache(data);
    
                this.error = null;
            } 
            catch (error) {
                Logger.stacktrace("AddonStore", "Failed to request addons", error);
    
                Toasts.show(Strings.Addons.failedToFetch, {
                    type: "danger"
                });
    
                this.error = error instanceof Error ? error : new Error(`Failed to request addons: Status ${req.statusCode}`);
    
                this._useCache();
            }

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
                    return;
                }
            }

            this._setTimeout = setTimeout(() => this.requestAddons(), minutes * 60 * 1000);
        });
    }

    /** @private */
    _setTimeout = null;

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

    /**
     * Add a listener to subscribe when the store changes
     * @public
     * @param {() => void} listener 
     * @returns {() => void}
     */
    addChangeListener(listener) {
        this._subscribers.add(listener);
        return () => this._subscribers.delete(listener);
    }
};

export default addonStore;
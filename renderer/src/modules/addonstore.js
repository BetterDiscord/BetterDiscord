import request from "request";
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
import DiscordModules from "@modules/discordmodules";
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
    /** @type {Record<string, Guild>} */
    static cache = {};

    /** @param {RawAddonGuild} guild  */
    constructor(guild) {        
        if (typeof Guild.cache[guild.id] === "object") {
            const cached = Guild.cache[guild.id];

            cached.name = guild.name;
            cached.invite = guild.invite_link;
            cached.hash = guild.avatar_hash;

            return cached;
        }

        this.name = guild.name;
        this.id = guild.snowflake;

        this.invite = guild.invite_link;

        this.hash = guild.avatar_hash?.trim?.();
    }

    get url() {
        let filename = `${this.hash}.webp`;
        if (filename.startsWith("a_")) filename = `${this.hash}.gif`;
        
        return `https://cdn.discordapp.com/icons/${this.id}/${filename}?size=96`;
    }
    get acronym() {return this.name.replace(/'s /g," ").replace(/\w+/g, str => str[0]).replace(/\s/g,"");}
}

class Addon {
    /** @type {Record<string, Addon>} */
    static cache = {};

    /** @param {RawAddon} addon  */
    constructor(addon) {
        if (typeof Addon.cache[addon.id] === "object") {
            const cached = Addon.cache[addon.id];

            cached.downloads = Math.max(cached.downloads, addon.downloads);
            cached.likes = Math.max(cached.likes, addon.likes);

            const guild = addon.guild || addon.author.guild;
            /** @type {Guild | null} */
            cached.guild = guild ? new Guild(guild) : null;

            cached._addon = addon;

            return cached;
        }

        this.id = addon.id;
        this.name = addon.name;

        this.releaseDate = new Date(addon.release_date);
        
        this.type = addon.type;
        
        this.thumbnail = Web.resources.thumbnail(addon.thumbnail_url);
        this.avatar = `https://avatars.githubusercontent.com/u/${addon.author.github_id}?v=4`;
        this.author = addon.author.display_name;
        
        const guild = addon.guild || addon.author.guild;
        /** @type {Guild | null} */
        this.guild = guild ? new Guild(guild) : null;
        
        this.manager = addon.type === "plugin" ? PluginManager : ThemeManager;
        this.updater = addon.type === "plugin" ? require("./updater").PluginUpdater : require("./updater").ThemeUpdater;
        
        this.description = addon.description;
        
        this.tags = addon.tags;
        
        this.downloads = addon.downloads;
        this.likes = addon.likes;
        
        this.version = addon.version;

        this.filename = addon.file_name;

        /** @private */
        this._addon = addon;
        
        Addon.cache[addon.id] = this;
    }

    /**
     * To prompt new addons
     * @returns {boolean} 
     */
    isUnknown() {
        const data = DataStore.getBDData("known-addons");

        if (!data) return false;
        return !data[this.filename];
    }
    /** To hide the badge */
    markAsKnown() {
        const data = DataStore.getBDData("known-addons");

        if (!data) return;

        if (data[this.filename]) return;

        data[this.filename] = true;
        DataStore.setBDData("known-addons", data);
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
      
        window.open(Web.previewURL(response.url), "_blank", "noopener,noreferrer");
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

        let code = this.guild.invite;
        const tester = /\.gg\/(.*)$/;
        if (tester.test(code)) code = code.match(tester)[1];
        
        DiscordModules.Dispatcher.dispatch({
            type: "LAYER_POP"
        });

        DiscordModules.InviteActions?.acceptInviteAndTransitionToInviteChannel({inviteKey: code});
    }

    /**
     * Attempt to download addon
     * Shows a confirmation modal (unless skipped) then installs the addon
     * @param {boolean} shouldSkipConfirm Should skip the confirm to delete the addon
     * @returns {Promise<void>}
     */
    async download(shouldSkipConfirm = false) {
        if (this.isInstalled()) return;

        const install = (shouldEnable) => new Promise((resolve, reject) => {
            // Sometimes there is a weird issue where the download endpoint returns a 302
            // But nothing indiciating a true redirect, so it will fallback to using the github redirect
            const createCallback = (isWrapper) => {
                return (error, req, body) => {
                    if (error || req.statusCode >= 300 || req.statusCode < 200) {
                        Logger.stacktrace("AddonStore", `Failed to fetch addon '${this.filename}' trying again:`, error || req);

                        if (isWrapper && req.statusCode === 302) {
                            request(Web.redirects.github(this.id), createCallback(false));
                            return;
                        }
                        
                        Logger.stacktrace("AddonStore", `Failed to fetch addon '${this.filename}':`, error || req);
            
                        Toasts.show(Strings.Addons.failedToDownload.format({type: this.type, name: this.name}), {
                            type: "danger"
                        });

                        reject(error || new Error(`Failed to fetch addon with status ${req.statusCode}!`));

                        return;
                    }
    
                    // If should enable, tell the manager that it is before hand
                    if (shouldEnable) {
                        this.manager.state[this.name] = true;
                    }
            
                    Toasts.show(Strings.Addons.successfullyDownload.format({name: this.name}), {
                        type: "success"
                    });
            
                    fs.writeFileSync(path.join(this.manager.addonFolder, this.filename), body);
    
                    resolve();
                };
            };

            request(Web.redirects.download(this.id), createCallback(true));
        });
        
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

    hasUpdate() {
        if (!this.manager.isLoaded(this.filename)) return false;

        this.updater.checkForUpdate(this.filename, this.manager.getAddon(this.filename).version);

        return this.updater.pending.includes(this.filename);
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

    requestAddons() {
        Logger.debug("AddonStore", `Requesting all ${this.type}s`);

        this.loading = true;
        this.addons.length = 0;

        clearTimeout(this._setTimeout);
        this._setTimeout = null;

        this._emitChange();

        request(Web.store[this.type + "s"], (error, _, body) => {
            try {
                this.error = null;
                this.loading = false;

                if (error) {
                    Logger.stacktrace("AddonStore", `Failed to fetch ${this.type}`, error);
    
                    Toasts.show(Strings.Addons.failedToFetch, {
                        type: "danger"
                    });

                    this.error = error instanceof Error ? error : new Error(String(error));
    
                    return;
                }
    
                this.addons.push(...JSON.parse(body).map((addon) => new Addon(addon)));

                const data = DataStore.getBDData("known-addons");
                if (data) {
                    for (const addon of this.addons) {
                        if (addon.filename in data) continue;

                        data[addon.filename] = false;
                    }

                    DataStore.setBDData("known-addons", data);
                }
            } 
            finally {
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
        });
    }

    /** @private */
    _setTimeout = null;

    /** @private */
    _initialized = false;
    /** Wrapper for {@link requestAddons} to allow it to be called only once, used in the UI */
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
            request(Web.store.addons, (err, req, body) => {
                if (err) return;

                const addons = JSON.parse(body);                

                DataStore.setBDData("known-addons", Object.fromEntries(addons.map(m => [ m.file_name, true ])));
            });
        }
    }

    /** @param {"plugin" | "theme"} type  */
    getStore(type) {
        if (type === "plugin") return PluginStore;
        return ThemeStore;
    }

    /** @private */
    _singleAddonCache = {};
    /**
     * Used for the embeds and download api
     * @param {number|string} idOrName 
     * @returns {Promise<Addon>}
     */
    requestAddon(idOrName) {        
        const cache = this.getAddon(idOrName);
        if (typeof cache === "object") return Promise.resolve(cache);

        return this._singleAddonCache[idOrName] ??= new Promise((resolve, reject) => {
            request(Web.store.addon(idOrName), (error, _, body) => {
                const data = JSON.parse(body);
                

                if (error || data.status === 404) {
                    reject(error || data.title);
                    return;
                }

                this._singleAddonCache[data.name] = this._singleAddonCache[idOrName];
                this._singleAddonCache[data.id] = this._singleAddonCache[idOrName];

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
    }

    /**
     * @param {string} filename
     */
    isOfficial(filename) {
        const data = DataStore.getBDData("known-addons");

        return data && filename in data;
    }
};

export default addonStore;
import path from "path";
import fs from "fs";

import request from "@polyfill/request";

import Logger from "@common/logger";
import Toasts from "@stores/toasts";
import JsonStore from "@stores/json";
import {t} from "@common/i18n";
import React from "@modules/react";
import PluginManager from "@modules/pluginmanager";
import ThemeManager from "@modules/thememanager";
import Modals from "@ui/modals";
import InstallModal from "@ui/modals/installmodal";
import Settings from "@stores/settings";
import Web from "@data/web";
import AddonManager from "./addonmanager";
import type {BdWebGuild, BdWebAddon} from "../types/betterdiscordweb";


function showConfirmDelete(addon: import("./addonmanager").Addon) {
    return new Promise<boolean>(resolve => {
        Modals.showConfirmationModal(t("Modals.confirmAction"), t("Addons.confirmDelete", {name: addon.name}), {
            danger: true,
            confirmText: t("Addons.deleteAddon"),
            onConfirm: () => {resolve(true);},
            onCancel: () => {resolve(false);}
        });
    });
}

export class Guild {

    name: string;
    id: string;
    invite: string;
    hash?: string;

    private static cache: Record<string, Guild> = {};

    public static from(guild: BdWebGuild) {
        if (typeof this.cache[guild.snowflake] === "object") {
            const cached = this.cache[guild.snowflake];

            cached.name = guild.name;
            cached.invite = guild.invite_link;
            cached.hash = guild.avatar_hash;

            return cached;
        }

        return new this(guild);
    }

    private constructor(guild: BdWebGuild) {
        this.name = guild.name;
        this.id = guild.snowflake;

        this.invite = guild.invite_link;

        this.hash = guild.avatar_hash?.trim?.();
    }

    public get url() {
        let filename = `${this.hash}.webp`;
        if (filename.startsWith("a_")) filename = `${this.hash}.gif`;

        return `https://cdn.discordapp.com/icons/${this.id}/${filename}?size=256`;
    }

    public get acronym() {return this.name.replace(/'s /g, " ").replace(/\w+/g, str => str[0]).replace(/\s/g, "");}

    /**
     * Shows the guild join modal (if the addon has a guild)
     */
    public join() {
        Modals.showGuildJoinModal(this.invite);
    }
}

export class Addon {

    id: number;
    name: string;
    avatar: string;
    author: string;
    manager: AddonManager;
    filename: string;
    type: "theme" | "plugin";
    description: string;
    likes: number;
    downloads: number;
    tags: string[];
    thumbnail: string | null;
    releaseDate: Date;
    lastModified: Date;
    guild: Guild | null;
    version: string;
    latestSourceUrl: string;

    // unused but good for debug
    public _addon: BdWebAddon;

    public static cache: Record<string, Addon> = {};

    /**
     * Update pre-existing addon class without create a new one
     */
    public static from(addon: BdWebAddon) {
        // Dont create a new one if addon already exists
        // Just sync data
        if (typeof this.cache[addon.id] === "object") {
            const cached = this.cache[addon.id];

            cached.downloads = Math.max(cached.downloads, addon.downloads);
            cached.likes = Math.max(cached.likes, addon.likes);

            const guild = addon.guild || addon.author.guild;
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
     */
    private constructor(addon: BdWebAddon) {
        this.id = addon.id;
        this.name = addon.name;

        this.releaseDate = new Date(addon.initial_release_date);
        this.lastModified = new Date(addon.latest_release_date);

        this.type = addon.type;

        this.thumbnail = Web.resources.thumbnail(addon.thumbnail_url);
        this.avatar = `https://avatars.githubusercontent.com/u/${addon.author.github_id}?v=4`;
        this.author = addon.author.display_name;

        const guild = addon.guild || addon.author.guild;
        this.guild = guild ? Guild.from(guild) : null;

        this.manager = addon.type === "plugin" ? PluginManager : ThemeManager;

        this.description = addon.description;

        this.tags = addon.tags;

        this.downloads = addon.downloads;
        this.likes = addon.likes;

        this.version = addon.version;

        this.filename = addon.file_name;

        this.latestSourceUrl = addon.latest_source_url;

        this._addon = addon;

        Addon.cache[addon.id] = this;
    }

    /**
     * To prompt new addons
     */
    public isUnknown() {
        return addonStore.isUnknown(this.filename);
    }

    /**
     * To hide the badge
     */
    public markAsKnown() {
        addonStore.markAsKnown(this.filename);
    }

    /**
     * Opens the Theme preview site
     */
    public openPreview() {
        if (this.type === "plugin") {
            throw new Error("Addon is a plugin!");
        }

        window.open(Web.convertToPreviewURL(this.latestSourceUrl), "_blank", "noopener,noreferrer");
    }

    /**
     * Opens the bd's site page for the addon
     */
    public openAddonPage() {
        window.open(Web.redirects[this.type](this.id.toString()), "_blank", "noopener,noreferrer");
    }

    /**
     * Opens the addons github page
     */
    public openSourceCode() {
        window.open(Web.convertRawToGitHubURL(this.latestSourceUrl), "_blank", "noopener,noreferrer");
    }

    /**
     * Opens the raw code page
     */
    public openAuthorPage() {
        window.open(Web.pages.developer(this.author), "_blank", "noopener,noreferrer");
    }

    /**
     * Attempt to download addon
     * Shows a confirmation modal (unless skipped) and installs the addon
     *
     * If the addon is installed or gets installed (before the modal closes),
     * it will close the modal and resolve
     * @param shouldSkipConfirm Should skip the confirm to delete the addon
     */
    public async download(shouldSkipConfirm = false) {
        if (this.isInstalled()) {
            Toasts.show(t("Addons.alreadyInstalled", {name: this.name}), {
                type: "info"
            });

            return;
        }

        const install = (shouldEnable: boolean) => new Promise<void>((resolve, reject) => {
            request(Web.redirects.github(this.id.toString()), {
                headers: {
                    "X-Store-Download": this.name,
                    "Cache-Control": "no-cache",
                    "Pragma": "no-cache"
                }
                // TODO: fix types when translating the request polyfill
            }, (err: Error, req: {aborted: boolean, statusMessage: string;}, text: string) => {
                try {
                    if (err || req.aborted || req.statusMessage !== "OK") {
                        throw err || req;
                    }

                    if (shouldEnable) {
                        // Shouldn't need a try..catch but better safe than sorry
                        try {
                            const meta = AddonManager.prototype.extractMeta(text, this.filename);
                            this.manager.state[meta.name as string || this.name] = true;
                        }
                        catch {
                            this.manager.state[this.name] = true;
                        }

                        this.manager.saveState();
                    }

                    fs.writeFileSync(path.join(this.manager.addonFolder, this.filename), text);

                    Toasts.show(t("Addons.successfullyDownload", {name: this.name}), {
                        type: "success"
                    });

                    this.downloads++;
                }
                catch (error) {
                    Logger.stacktrace("AddonStore", `Failed to fetch addon '${this.filename}':`, error as Error);

                    Toasts.show(t("Addons.failedToDownload", {context: this.type, name: this.name}), {
                        type: "error"
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
                install: (shouldEnable: boolean) => {
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

    _download?: Promise<void>;

    /**
     * Attempt to delete the local addon
     * @param shouldSkipConfirm Should skip the confirm to delete the addon
     */
    public async delete(shouldSkipConfirm = false) {
        const foundAddon = this.manager.addonList.find(a => a.filename == this.filename);

        if (!foundAddon) return;

        if (!shouldSkipConfirm) {
            const shouldDelete = await showConfirmDelete(foundAddon);
            if (!shouldDelete) return;
        }

        if (this.manager.deleteAddon) this.manager.deleteAddon(foundAddon);
    }

    public isInstalled() {
        return this.manager.isLoaded(this.filename);
    }

    public recentlyUpdated() {
        const now = new Date();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);

        return this.lastModified > oneWeekAgo && this.lastModified <= now;
    }
}

const addonStore = new class AddonStore {
    initialize() {
        this._cache = (JsonStore.get("addon-store") as {addons: Record<string, BdWebAddon>; known: string[]; version: string;}) || {addons: {}, known: [], version: ""};

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
    _cache: {addons: Record<string, BdWebAddon>; known: string[]; version: string;} = {addons: {}, known: [], version: ""};
    private _useCache() {
        for (const key in this._cache.addons) {
            if (Object.prototype.hasOwnProperty.call(this._cache.addons, key)) {
                this.addons.push(
                    Addon.from(this._cache.addons[key])
                );
            }
        }
    }

    private _writeCache(cache = this._cache) {
        this._cache = cache;

        JsonStore.set("addon-store", this._cache);
    }

    private _singleAddonCache: Record<string, Promise<Addon>> = {};
    /**
     * Request a singular addon at a time
     */
    public requestAddon(idOrName: string) {
        const cache = this.getAddon(idOrName);
        if (typeof cache === "object") return Promise.resolve(cache);

        return this._singleAddonCache[idOrName] ??= new Promise<Addon>((resolve, reject) => {
            request(Web.store.addon(idOrName), {
                headers: {
                    "Cache-Control": "no-cache",
                    "Pragma": "no-cache"
                }
                // TODO: fix typing when converting request polyfill
            }, (err: Error, req: {aborted: boolean, statusMessage: string; ok: boolean; statusCode: number;}, body: string) => {
                try {
                    if (err || req.aborted || req.statusMessage !== "OK") {
                        throw err || req;
                    }

                    const data = JSON.parse(body);

                    if (!req.ok || data.status === 404) {
                        throw new Error(data.title);
                    }

                    this._singleAddonCache[data.name] = this._singleAddonCache[idOrName];
                    this._singleAddonCache[data.id] = this._singleAddonCache[idOrName];

                    resolve(Addon.from(data as BdWebAddon));
                }
                catch (error) {
                    Logger.stacktrace("AddonStore", `Failed to fetch ${idOrName}`, error as Error);

                    Toasts.show(t("Addons.failedToFetch"), {
                        type: "error"
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
     */
    public getAddon(id: string) {
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
     */
    public isOfficial(/* filename */) {
        return false;
        // return filename.toLowerCase() in this._cache.addons;
    }

    public isUnknown(filename: string) {
        return filename.toLowerCase() in this._cache.addons && !this._cache.known.includes(filename);
    }

    public markAsKnown(filename: string) {
        if (this.isUnknown(filename)) {
            this._cache.known.push(filename);

            this._writeCache();
        }
    }

    private readonly addons: Addon[] = [];
    getAddons() {return this.addons.concat();}

    error: Error | null = null;
    loading = false;

    /**
     * Listener for when the user is offline and tries to fetch the addons
     */
    private _onLineListener = () => {
        window.removeEventListener("online", this._onLineListener);
        this.requestAddons();
    };

    async requestAddons(firstRun = false) {
        Logger.debug("AddonStore", "Requesting all addons");

        if (!(firstRun && Object.keys(this._cache.addons).length)) {
            this.addons.length = 0;
        }

        this.loading = true;

        if (this._setTimeout) window.clearTimeout(this._setTimeout);
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

            Toasts.show(t("Addons.failedToFetch"), {
                type: "error"
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
            // TODO: fix typing when converting request polyfill
        }, (err: Error, req: {aborted: boolean, statusMessage: string; ok: boolean; statusCode: number;}, body: string) => {
            window.removeEventListener("offline", offLineListener);
            if (failed) return;

            try {
                if (err || req.aborted || req.statusMessage !== "OK") {
                    throw err || req;
                }

                const json = JSON.parse(body) as BdWebAddon[];

                const isFirstRun = this._cache.known.length === 0 && Object.keys(this._cache.addons).length === 0;

                const data: {addons: Record<string, BdWebAddon>, version: string, known: string[];} = {
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
                Logger.stacktrace("AddonStore", "Failed to request addons", error as Error);

                Toasts.show(t("Addons.failedToFetch"), {
                    type: "error"
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

            this._setTimeout = window.setTimeout(() => this.requestAddons(), minutes * 60 * 1000);
        });
    }


    private _setTimeout: number | null = null;

    // Listener stuff
    private _subscribers = new Set<() => void>();
    private _emitChange() {
        for (const subscriber of this._subscribers) {
            subscriber();
        }
    }

    /**
     * get important data from the store to use in the ui
     */
    private getState() {
        return {
            error: this.error,
            addons: this.getAddons(),
            loading: this.loading
        };
    }
    /**
     * A react hook for {@link getState}
     */
    public useState() {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [state, setState] = React.useState(() => this.getState());

        // eslint-disable-next-line react-hooks/rules-of-hooks
        React.useEffect(() => {
            setState(this.getState());

            const callback = () => setState(this.getState());

            this._subscribers.add(callback);
            return () => void this._subscribers.delete(callback);
        }, []);

        return state;
    }

    /**
     * Add a listener to subscribe when the store changes
     */
    public addChangeListener(listener: () => void) {
        this._subscribers.add(listener);
        return () => void this._subscribers.delete(listener);
    }
};

export default addonStore;
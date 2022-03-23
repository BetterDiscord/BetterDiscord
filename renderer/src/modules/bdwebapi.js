import Utilities from "./utilities";
import Settings from "./settingsmanager";
import ThemeManager from "./thememanager";
import PluginManager from "./pluginmanager";
import Strings from "./strings";
import Logger from "common/logger";

import Toasts from "../ui/toasts";
import FormattableString from "../structs/string";

import https from "https";
import path from "path";
import fs from "fs";

const API_CACHE = {plugins: [], themes: [], addon: []};
const README_CACHE = {plugins: {}, themes: {}};

const WEB_HOSTNAME = "betterdiscord.app";
const API_VERSION = "latest";
const API_BASE = `https://api.${WEB_HOSTNAME}/${API_VERSION}`;
const ENDPOINTS = {
    store: new FormattableString(`${API_BASE}/store/{{type}}`),
    addon: new FormattableString(`${API_BASE}/store/{{name}}`),
    download: new FormattableString(`https://${WEB_HOSTNAME}/download?id={{id}}`)
}
const TAGS = {
    theme: ["all", "flat", "transparent", "layout", "customizable", "fiction", "nature", "space", "dark", "light", "game", "anime", "red", "orange", "green", "purple", "black", "other", "yellow", "blue", "abstract"],
    plugin: ["all", "fun", "roles", "activity", "status", "game", "edit", "library", "notifications", "emotes", "channels", "shortcut", "enhancement", "servers", "chat", "security", "organization", "friends", "members", "utility", "developers", "search", "text", "voice"]
}

export default new class BdWebApi {
    get apiVersion() {return API_VERSION;}
    get webHostname() {return WEB_HOSTNAME;}
    get apiBase() {return API_BASE;}
    get endpoints() {return ENDPOINTS;}
    get tags() {return TAGS;}
    
    /**
     * Fetches an addon by ID and adds writes it to it's respective folder.
     * @param {number} id - The ID of the addon to fetch.
     * @param {string} filename - The name of the file that the addon will be written to.
     * @param {"theme" | "plugin"} type - The type of the addon (theme or plugin).
     * @returns {Promise<Object>}
     */
    installAddon(id, filename, type) {
        const addonFolder = (type === "theme" ? ThemeManager : PluginManager).addonFolder;

        return new Promise(resolve => {
            https.get(ENDPOINTS.download.format({id}), response => {
                const chunks = [];
                response.on("data", chunk => chunks.push(chunk));
                response.on("end", () => {
                    const data = chunks.join("");
                    fs.writeFileSync(path.resolve(addonFolder, filename), data, error => {
                        if (error) Toasts.show(Strings.Addons.writeError.format({type, error}), {type: "error"});
                    });
                    if (!Settings.get("settings", "addons", "autoReload")) type === "theme" ? ThemeManager.reloadTheme(filename) : PluginManager.reloadPlugin(filename);
                    resolve(data);
                });
                response.on("error", error => {
                    Toasts.show(Strings.Addons.downloadError.format({type, error}), {type: "error"});
                })
            });
        })
    }

    /**
     * Fetches a list of all addons from the site.
     * @param {"theme" | "plugin"} type - The type of the addon (theme or plugin).
     * @returns {Promise<Array<Object>>}
     */
    getAddons(type) {
        return new Promise((resolve) => {
            if (API_CACHE[type].length) resolve(API_CACHE[type]);
            https.get(ENDPOINTS.store.format({type}), res => {
                const chunks = [];
                res.on("data", chunk => chunks.push(chunk));
    
                res.on("end", () => {
                    const json = Utilities.testJSON(chunks.join(""));
    
                    if (!Array.isArray(json)) return res.emit("error");
    
                    API_CACHE[type] = Utilities.splitArray(json, 30);
    
                    resolve(Utilities.splitArray(json, 30));
                });
    
                res.on("error", (error) => {
                    Logger.error(`Addon Store", "Failed to get addons: ${error}`);
                });
            });
        });
    }

    /**
     * Fetches a single addon by name from the site.
     * @param {string} name - The name of the addon to fetch.
     * @returns {Promise<Object>}
     */
    getAddon(name) {
        return new Promise(resolve => {
            const cacheMatch = API_CACHE.addon.find(a => a[typeof name === "string" ? "name" : "id"] === name);
            if (cacheMatch) resolve(cacheMatch);

            https.get(ENDPOINTS.addon.format({name}), res => {
                
                const chunks = [];
                res.on("data", chunk => chunks.push(chunk));
                
                res.on("end", () => {
                    const json = Utilities.testJSON(chunks.join(""));

                    if (!json) return res.emit("error");

                    API_CACHE.addon.push(json);

                    resolve(json);
                });

                res.on("error", (error) => {
                    Logger.error(`Addon Store", "Failed to get addon: ${error}`);
                });
            });
        });
    }

    getReadme(id, type) {
        return new Promise(resolve => {
            if (README_CACHE[type][id]) resolve(README_CACHE[type][id]);

            https.get(`https://${WEB_HOSTNAME}/${type}?id=${id}`, res => {
                try {
                    const chunks = [];
                    res.on("data", chunk => chunks.push(chunk));
                    res.on("end", () => {
                        try {
                            const rawHTML = chunks.join("");
                            const parsed = Object.assign(document.createElement("div"), {
                                innerHTML: rawHTML
                            });
                            const [readme] = parsed.getElementsByClassName("markdown-body");
                            README_CACHE[id] = readme.innerHTML;
                            resolve(readme.innerHTML);
                        }
                        catch (error) {
                            Logger.err("Addon Store", `Failed to parse README: ${error}`);
                        }
                    });
                    res.on("error", (error) => {
                        Logger.err("Addon Store", `Failed to get README: ${error}`);
                    });
                }
                catch (error) {
                    Logger.err("Addon Store", `Failed to get README: ${error}`);
                }
            });
        });
    }
}
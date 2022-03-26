import {Web} from "data";

import Utilities from "./utilities";
import Settings from "./settingsmanager";
import ThemeManager from "./thememanager";
import PluginManager from "./pluginmanager";
import Strings from "./strings";
import Logger from "common/logger";

import Toasts from "../ui/toasts";

import https from "https";
import path from "path";
import fs from "fs";

const API_CACHE = {plugins: [], themes: [], addon: []};
const README_CACHE = {plugins: {}, themes: {}};

export default new class BdWebApi {
    get apiVersion() {return Web.API_VERSION;}
    get webHostname() {return Web.WEB_HOSTNAME;}
    get apiBase() {return Web.API_BASE;}
    get endpoints() {return Web.ENDPOINTS;}
    get pages() {return Web.PAGES;}
    get tags() {return Web.TAGS;}
    
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
            https.get(Web.ENDPOINTS.download(id), response => {
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
                });
            });
        });
    }

    /**
     * Fetches a list of all addons from the site.
     * @param {"theme" | "plugin"} type - The type of the addon (theme or plugin).
     * @returns {Promise<Array<Object>>}
     */
    getAddons(type) {
        return new Promise((resolve) => {
            if (API_CACHE[type].length) resolve(API_CACHE[type]);
            https.get(Web.ENDPOINTS.store(type), res => {
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

            https.get(Web.ENDPOINTS.addon(name), res => {
                
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

    // Currently this is mainly here as a test and just scrapes HTML from the site.
    // In the future, it will fetch from a README endpoint.
    getReadme(id, type) {
        return new Promise(resolve => {
            if (README_CACHE[type][id]) resolve(README_CACHE[type][id]);

            https.get(`https://${Web.WEB_HOSTNAME}/${type}?id=${id}`, res => {
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
};
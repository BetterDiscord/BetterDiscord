import {Web} from "data";

import Logger from "common/logger";
import Utilities from "./utilities";
import Strings from "./strings";

import https from "https";

const API_CACHE = {plugins: [], themes: [], addon: []};
// const README_CACHE = {plugins: {}, themes: {}};

export default new class BdWebApi {
    get apiVersion() {return Web.API_VERSION;}
    get webHostname() {return Web.WEB_HOSTNAME;}
    get apiBase() {return Web.API_BASE;}
    get endpoints() {return Web.ENDPOINTS;}
    get pages() {return Web.PAGES;}
    get tags() {return Web.TAGS;}

    /**
     * Fetches a list of all addons from the site.
     * @param {"themes" | "plugins"} type - The type of the addon (theme or plugin).
     * @returns {Promise<Array<Object>>}
     */
    getAddons(type) {
        return new Promise((resolve, reject) => {
            if (API_CACHE[type].length) resolve(API_CACHE[type]);
            https.get(Web.ENDPOINTS.store(type), (res) => {
                const chunks = [];
                res.on("data", chunk => chunks.push(chunk));
    
                res.on("end", () => {
                    const json = Utilities.testJSON(chunks.join(""));
    
                    if (!Array.isArray(json)) return res.emit("error");
    
                    API_CACHE[type] = Utilities.splitArray(json, 30);
    
                    resolve(Utilities.splitArray(json, 30));
                });
    
                res.on("error", (error) => {
                    Logger.stacktrace("BdWebApi", Strings.Store.connectionError, error);
                    reject(error);
                });
            });
        });
    }

    /**
     * Fetches a single addon by name from the site.
     * @param {string|number} addon - The name or ID of the addon to fetch.
     * @returns {Promise<Object>}
     */ 
    getAddon(addon) {
        return new Promise((resolve, reject) => {
            const cacheMatch = API_CACHE.addon.find(a => a[typeof addon === "number" ? "id" : "name"] === addon);
            if (cacheMatch) resolve(cacheMatch);

            https.get(Web.ENDPOINTS.addon(addon), (res) => {
                const chunks = [];
                res.on("data", chunk => chunks.push(chunk));
                
                res.on("end", () => {
                    const json = Utilities.testJSON(chunks.join(""));

                    if (!json) return res.emit("error");

                    API_CACHE.addon.push(json);

                    resolve(json);
                });

                res.on("error", (error) => {
                    Logger.stacktrace("BdWebApi", Strings.Store.connectionError, error);
                    reject(error);
                });
            });
        });
    }

    /**
     * Fetches and return's an addon's raw text content.
     * @param {number} id - The ID of the addon to fetch.
     * @returns {Promise<Object>}
     */
    getAddonContents(id) {
        return new Promise((resolve, reject) => {
            https.get(Web.ENDPOINTS.download(id), (res) => {
                const chunks = [];
                res.on("data", chunk => chunks.push(chunk));
                
                res.on("end", () => {
                    const data = chunks.join("");
                    resolve(data);
                });

                res.on("error", (error) => {
                    Logger.stacktrace("BdWebApi", Strings.Store.connectionError, error);
                    reject(error);
                });
            });
        });
    }
};

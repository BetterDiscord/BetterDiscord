import {Web} from "data";

import Logger from "common/logger";
import Utilities from "./utilities";
import Strings from "./strings";

import request from "request";

const API_CACHE = {plugins: [], themes: [], addon: []};
// const README_CACHE = {plugins: {}, themes: {}};

export default new class WebAPI {
    get apiVersion() {return Web.API_VERSION;}
    get webHostname() {return Web.WEB_HOSTNAME;}
    get apiBase() {return Web.API_BASE;}
    get endpoints() {return Web.ENDPOINTS;}
    get pages() {return Web.PAGES;}
    get tags() {return Web.TAGS;}

    testJSON(data) {
        try {
            return JSON.parse(data);
        }
        catch (err) {
            return false;
        }
    }

    /**
     * Fetches a list of all addons from the site.
     * @param {"themes" | "plugins"} type - The type of the addon (theme or plugin).
     * @returns {Promise<Array<Object>>}
     */
    getAddons(type) {
        return new Promise((resolve, reject) => {
            if (API_CACHE[type].length) resolve(API_CACHE[type]);
            request(Web.ENDPOINTS.store(type), (error, _, body) => {
                if (error) {
                    Logger.stacktrace("WebAPI", Strings.Store.connectionError, error);
                    reject(error);
                }

                const json = this.testJSON(body);

                API_CACHE[type] = Utilities.splitArray(json, 30);

                resolve(Utilities.splitArray(json, 30));
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

            request(Web.ENDPOINTS.addon(addon), (error, _, body) => {
                if (error) {
                    Logger.stacktrace("WebAPI", Strings.Store.connectionError, error);
                    reject(error);
                }

                const json = this.testJSON(body);

                API_CACHE.addon.push(json);

                resolve(json);
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
            const cacheMatch = API_CACHE.addon.find(addon => addon.id === id);
            if (cacheMatch) resolve(cacheMatch);

            request(Web.ENDPOINTS.download(id), (error, _, body) => {
                if (error) {
                    Logger.stacktrace("WebAPI", Strings.Store.connectionError, error);
                    reject(error);
                }

                resolve(body);
            });
        });
    }
};

import {Web} from "data";

import Utilities from "./utilities";
import Settings from "./settingsmanager";
import ThemeManager from "./thememanager";
import PluginManager from "./pluginmanager";
import Strings from "./strings";
import Events from "./emitter";
import Logger from "common/logger";

import Toasts from "../ui/toasts";

import https from "https";
import path from "path";
import fs from "fs";

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
     * Fetches an addon by ID and adds writes it to it's respective folder. Enables the addon if the setting is on.
     * @param {number} id - The ID of the addon to fetch.
     * @param {string} filename - The name of the file that the addon will be written to.
     * @param {"theme" | "plugin"} type - The type of the addon (theme or plugin).
     * @returns {Promise<Object>}
     */
    installAddon(id, filename, type) {
        const manager = type === "theme" ? ThemeManager : PluginManager;
        const enable = installationId => {
            const installation = manager.getAddon(installationId);

            if (manager.enableAddon && installation.filename === filename) manager.enableAddon(installation);
            Events.off(`${type}-loaded`, enable);
        };

        return new Promise(resolve => {
            https.get(Web.ENDPOINTS.download(id), response => {
                const chunks = [];
                response.on("data", chunk => chunks.push(chunk));
                response.on("end", () => {
                    const data = chunks.join("");
                    fs.writeFileSync(path.resolve(manager.addonFolder, filename), data, error => {
                        if (error) Toasts.show(Strings.Addons.writeError.format({type, error}), {type: "error"});
                    });
                    if (!Settings.get("settings", "addons", "autoReload")) type === "theme" ? ThemeManager.reloadTheme(filename) : PluginManager.reloadPlugin(filename);
                    if (Settings.get("settings", "addons", "autoEnable")) Events.on(`${type}-loaded`, enable);
                    resolve(data);
                });
                response.on("error", (error) => {
                    Logger.error("Addon Store", Strings.Addons.downloadError.format({type, error}));
                    Toasts.show(Strings.Addons.downloadError.format({type, error}), {type: "error"});
                });
            });
        });
    }

    /**
     * Fetches a list of all addons from the site.
     * @param {"themes" | "plugins"} type - The type of the addon (theme or plugin).
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
                    Logger.error("Addon Store", Strings.Addons.connectError.format({error}));
                    Toasts.show(Strings.Addons.connectError.format({error}), {type: "error"});
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
        return new Promise(resolve => {
            const cacheMatch = API_CACHE.addon.find(a => a[typeof addon === "number" ? "id" : "name"] === addon);
            if (cacheMatch) resolve(cacheMatch);

            https.get(Web.ENDPOINTS.addon(addon), res => {
                const chunks = [];
                res.on("data", chunk => chunks.push(chunk));
                
                res.on("end", () => {
                    const json = Utilities.testJSON(chunks.join(""));

                    if (!json) return res.emit("error");

                    API_CACHE.addon.push(json);

                    resolve(json);
                });

                res.on("error", (error) => {
                    Logger.error("Addon Store", Strings.Addons.connectError.format({error}));
                    Toasts.show(Strings.Addons.connectError.format({error}), {type: "error"});
                });
            });
        });
    }
};

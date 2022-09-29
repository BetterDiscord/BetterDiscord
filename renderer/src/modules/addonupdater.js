import {Config} from "data";
import fileSystem from "fs";
import path from "path";
import request from "request";

import PluginManager from "./pluginmanager";
import ThemeManager from "./thememanager";

import Toasts from "../ui/toasts";
import Notices from "../ui/notices";
import Logger from "../../../common/logger";


const base = "https://api.betterdiscord.app/v2/store/";
const route = r => `${base}${r}`;
const redirect = addonId => `https://betterdiscord.app/gh-redirect?id=${addonId}`;

// const raceTimeout = (delay, reason) => new Promise((_, rej) => setTimeout(() => rej(reason), delay));
// const timeout = (promise, delay, reason) => Promise.race([promise, raceTimeout(delay, reason)]);

const getJSON = url => {
    return new Promise(resolve => {
        request(url, (error, response, body) => {
            if (error) return resolve([]);
            resolve(JSON.parse(body));
        });
    });
};

const reducer = (acc, addon) => {
    if (addon.version === "Unknown") return acc;
    acc[addon.file_name] = {name: addon.name, version: addon.version, id: addon.id, type: addon.type};
    return acc;
};
 
export default class AddonUpdater {

    static async initialize() {
        this.cache = {};
        this.shown = false;
        this.pending = [];

        Logger.info("AddonUpdater", "Before get api");
        const pluginData = await getJSON(route("plugins"));
        const themeData = await getJSON(route("themes"));
        Logger.info("AddonUpdater", "After get api");

        this.temp = {pluginData, themeData};

        pluginData.reduce(reducer, this.cache);
        themeData.reduce(reducer, this.cache);

        Logger.info("AddonUpdater", "going to check lists");
        for (const addon of PluginManager.addonList) this.checkForUpdate(addon.filename, addon.version);
        for (const addon of ThemeManager.addonList) this.checkForUpdate(addon.filename, addon.version);
        this.showUpdateNotice();
    }

    static clearPending() {
        this.pending.splice(0, this.pending.length);
    }
 
    static async checkForUpdate(filename, currentVersion) {
        Logger.info("AddonUpdater", "checkForUpdate", filename, currentVersion);
        const info = this.cache[path.basename(filename)];
        if (!info) return;
        const hasUpdate = info.version > currentVersion;
        if (!hasUpdate) return;
        this.pending.push(filename);
    }
 
    static async updatePlugin(filename) {
        const info = this.cache[filename];
        request(redirect(info.id), (err, response) => {
            if (err) return;
            if (!response.headers.location) return; // expected redirect
            request(response.headers.location, (error, _, body) => {
                if (error) return;
                const file = path.join(path.resolve(Config.dataPath, info.type + "s"), filename);
                fileSystem.writeFile(file, body.toString(), () => {
                    Toasts.success(`${info.name} has been updated to version ${info.version}!`);
                });
            });

        });
    }

    static showUpdateNotice() {
        Logger.info("AddonUpdater", "showUpdateNotice", this.shown, this.pending);
        if (this.shown || !this.pending.length) return;
        this.shown = true;
        const close = Notices.info(`BetterDiscord has found updates for ${this.pending.length} of your plugins and themes!`, {
            timeout: 0,
            buttons: [{
                label: "Update Now",
                onClick: async () => {
                    for (const name of this.pending) await this.updatePlugin(name);
                    close();
                }
            }],
            onClose: () => {
                this.shown = false;
                this.clearPending();
            }
        });
    }
}

window.updater = AddonUpdater;
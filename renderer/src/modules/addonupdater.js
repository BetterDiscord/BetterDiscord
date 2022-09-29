import request from "request";
import fileSystem from "fs";
import {Config} from "data";
import path from "path";

import PluginManager from "./pluginmanager";
import ThemeManager from "./thememanager";

import Toasts from "../ui/toasts";
import Notices from "../ui/notices";
import Logger from "common/logger";

const base = "https://api.betterdiscord.app/v2/store/";
const route = r => `${base}${r}`;
const redirect = addonId => `https://betterdiscord.app/gh-redirect?id=${addonId}`;

const getJSON = url => {
    return new Promise(resolve => {
        request(url, (error, _, body) => {
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

        const pluginData = await getJSON(route("plugins"));
        const themeData = await getJSON(route("themes"));

        pluginData.reduce(reducer, this.cache);
        themeData.reduce(reducer, this.cache);

        for (const addon of PluginManager.addonList) this.checkForUpdate(addon.filename, addon.version);
        for (const addon of ThemeManager.addonList) this.checkForUpdate(addon.filename, addon.version);

        this.showUpdateNotice();
    }

    static clearPending() {
        this.pending.splice(0, this.pending.length);
    }
 
    static async checkForUpdate(filename, currentVersion) {
        const info = this.cache[path.basename(filename)];
        if (!info) return;
        const hasUpdate = info.version > currentVersion;
        if (!hasUpdate) return;
        this.pending.push(filename);
    }
 
    static async updatePlugin(filename) {
        const info = this.cache[filename];
        request(redirect(info.id), (error, _, body) => {
            if (error) {
                Logger.stacktrace("AddonUpdater", `Failed to download body for ${info.id}:`, error);
                return;
            }

            const file = path.join(path.resolve(Config.dataPath, info.type + "s"), filename);
            fileSystem.writeFile(file, body.toString(), () => {
                Toasts.success(`${info.name} has been updated to version ${info.version}!`);
            });
        });
    }

    static showUpdateNotice() {
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

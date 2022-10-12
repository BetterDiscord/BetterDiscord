import request from "request";
import fileSystem from "fs";
import {Config, Web} from "data";
import path from "path";

import Logger from "common/logger";

import Events from "./emitter";
import IPC from "./ipc";
import Strings from "./strings";
import DataStore from "./datastore";
import Settings from "./settingsmanager";
import PluginManager from "./pluginmanager";
import ThemeManager from "./thememanager";
import WebpackModules from "./webpackmodules";

import Toasts from "../ui/toasts";
import Notices from "../ui/notices";
import Modals from "../ui/modals";
import UpdaterPanel from "../ui/updater";
import DiscordModules from "./discordmodules";

const React = DiscordModules.React;
const UserSettingsWindow = WebpackModules.getByProps("updateAccount");

const route = r => `${Web.API_BASE}/${r}s`;

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
    acc[addon.file_name] = {name: addon.name, version: addon.version, id: addon.id};
    return acc;
};

export default class Updater {
    static initialize() {
        Settings.registerPanel("updates", "Updates", {
            order: 1,
            element: () => {
                return React.createElement(UpdaterPanel, {
                    coreUpdater: CoreUpdater,
                    pluginUpdater: PluginUpdater,
                    themeUpdater: ThemeUpdater
                });
            }
        });

        CoreUpdater.initialize();
        PluginUpdater.initialize();
        ThemeUpdater.initialize();
    }
}

export class CoreUpdater {

    static hasUpdate = false;
    static apiData = {};
    static remoteVersion = "";

    static async initialize() {
        this.checkForUpdate();
    }

    static async checkForUpdate(showNotice = true) {
        const resp = await fetch(`https://api.github.com/repos/BetterDiscord/BetterDiscord/releases/latest`,{
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "User-Agent": "BetterDiscord Updater"
            }
        });

        const data = await resp.json();
        this.apiData = data;
        const remoteVersion = data.tag_name.startsWith("v") ? data.tag_name.slice(1) : data.tag_name;
        this.hasUpdate = remoteVersion > Config.version;
        this.remoteVersion = remoteVersion;
        if (!this.hasUpdate || !showNotice) return;

        const close = Notices.info(`BetterDiscord has a new update (v${remoteVersion})`, {
            buttons: [{
                label: "More Info",
                onClick: () => {
                    close();
                    UserSettingsWindow?.open?.("updates");
                }
            }]
        });
    }

    static async update() {
        try {
            const asar = this.apiData.assets.find(a => a.name === "betterdiscord.asar");

            const buff = await new Promise((resolve, reject) =>
                request(asar.url, {encoding: null, headers: {"User-Agent": "BetterDiscord Updater", "Accept": "application/octet-stream"}}, (err, resp, body) => {
                if (err || resp.statusCode != 200) return reject(err || `${resp.statusCode} ${resp.statusMessage}`);
                return resolve(body);
            }));

            const asarPath = path.join(DataStore.baseFolder, "betterdiscord.asar");
            const fs = require("original-fs");
            fs.writeFileSync(asarPath, buff);

            this.hasUpdate = false;
            Config.version = this.remoteVersion;

            Modals.showConfirmationModal("Update Successful!", "BetterDiscord updated successfully. Discord needs to restart in order for it to take effect. Do you want to do this now?", {
                confirmText: Strings.Modals.restartNow,
                cancelText: Strings.Modals.restartLater,
                danger: true,
                onConfirm: () => IPC.relaunch()
            });
        }
        catch (err) {
            Logger.stacktrace("Updater", "Failed to update", err);
            Modals.showConfirmationModal("Update Failed", "BetterDiscord failed to update. Please download the latest version of the installer from GitHub (https://github.com/BetterDiscord/Installer/releases/latest) and reinstall.", {
                cancelText: null
            });
        }
    }
}


class AddonUpdater {

    constructor(type) {
        this.manager = type === "plugin" ? PluginManager : ThemeManager;
        this.type = type;
        this.cache = {};
        this.pending = [];
    }

    async initialize() {
        await this.updateCache();
        this.checkAll();
        Events.on(`${this.type}-loaded`, addon => {
            this.checkForUpdate(addon.filename, addon.version);
        });

        Events.on(`${this.type}-unloaded`, addon => {
            const index = this.pending.indexOf(addon.filename);
            if (index >= 0) this.pending.splice(index, 1);
        });
    }

    async updateCache() {
        this.cache = {};
        const addonData = await getJSON(route(this.type));
        addonData.reduce(reducer, this.cache);
    }

    clearPending() {
        this.pending.splice(0, this.pending.length);
    }

    checkAll(showNotice = true) {
        for (const addon of this.manager.addonList) this.checkForUpdate(addon.filename, addon.version);
        if (showNotice) this.showUpdateNotice();
    }
 
    checkForUpdate(filename, currentVersion) {
        if (this.pending.includes(filename)) return;
        const info = this.cache[path.basename(filename)];
        if (!info) return;
        const hasUpdate = info.version > currentVersion;
        if (!hasUpdate) return;
        this.pending.push(filename);
    }
 
    async updateAddon(filename) {
        const info = this.cache[filename];
        request(Web.ENDPOINTS.githubRedirect(info.id), (error, _, body) => {
            if (error) {
                Logger.stacktrace("AddonUpdater", `Failed to download body for ${info.id}:`, error);
                return;
            }

            const file = path.join(path.resolve(this.manager.addonFolder), filename);
            fileSystem.writeFile(file, body.toString(), () => {
                Toasts.success(`${info.name} has been updated to version ${info.version}!`);
                this.pending.splice(this.pending.indexOf(filename), 1);
            });
        });
    }

    showUpdateNotice() {
        if (!this.pending.length) return;
        const close = Notices.info(`BetterDiscord has found updates for ${this.pending.length} of your ${this.type}s!`, {
            buttons: [{
                label: "More Info",
                onClick: () => {
                    close();
                    UserSettingsWindow?.open?.("updates");
                }
            }]
        });
    }
}

export const PluginUpdater = new AddonUpdater("plugin");
export const ThemeUpdater = new AddonUpdater("theme");
import request from "request";
import fileSystem from "fs";
import path from "path";

import Logger from "@common/logger";

import Config from "@data/config";

import {comparator as semverComparator, regex as semverRegex} from "@structs/semver";

import Events from "./emitter";
import IPC from "./ipc";
import Strings from "./strings";
import DataStore from "./datastore";
import React from "./react";
import Settings from "./settingsmanager";
import PluginManager from "./pluginmanager";
import ThemeManager from "./thememanager";
import WebpackModules from "./webpackmodules";

import Toasts from "@ui/toasts";
import Notices from "@ui/notices";
import Modals from "@ui/modals";
import UpdaterPanel from "@ui/updater";
import Web from "@data/web";
import GlobeIcon from "@ui/icons/globe";

const UserSettingsWindow = WebpackModules.getByProps("updateAccount");

const getJSON = url => {
    return new Promise(resolve => {
        request({
            url: url,
            headers: {
                "Cache-Control": "no-cache",
                "Pragma": "no-cache"
            }
        }, (error, _, body) => {
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
    static updateCheckInterval = null;

    static initialize() {
        Settings.registerPanel("updates", Strings.Panels.updates, {
            order: 1,
            icon: GlobeIcon,
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

        Events.on("setting-updated", (collection, category, id) => {
            if (collection !== "settings" || category !== "addons") return;
            if (id !== "updateInterval" && id !== "checkForUpdates") return;
            this.startUpdateInterval();
        });

        // This function will already check the setting
        this.startUpdateInterval();
    }

    static startUpdateInterval() {
        if (this.updateCheckInterval) {
            clearInterval(this.updateCheckInterval);
            this.updateCheckInterval = null;
        }

        if (!Settings.get("addons", "checkForUpdates")) return;

        const hours = Settings.get("addons", "updateInterval");
        this.updateCheckInterval = setInterval(() => {
            CoreUpdater.checkForUpdate();
            PluginUpdater.checkAll();
            ThemeUpdater.checkAll();
        }, hours * 60 * 60 * 1000);
    }
}

export class CoreUpdater {

    static hasUpdate = false;
    static apiData = {};
    static remoteVersion = "";

    static async initialize() {
        if (!Settings.get("addons", "checkForUpdates")) return;
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
        this.hasUpdate = semverComparator(Config.version, remoteVersion) > 0;
        this.remoteVersion = remoteVersion;
        if (!this.hasUpdate || !showNotice) return;

        const close = Notices.info(Strings.Updater.updateAvailable.format({version: remoteVersion}), {
            buttons: [{
                label: Strings.Notices.moreInfo,
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
                request(asar.url, {headers: {"Content-Type": "application/octet-stream", "User-Agent": "BetterDiscord Updater", "Accept": "application/octet-stream"}}, (err, resp, body) => {
                if (err || resp.statusCode != 200) return reject(err || `${resp.statusCode} ${resp.statusMessage}`);
                return resolve(body);
            }));

            const asarPath = path.join(DataStore.baseFolder, "betterdiscord.asar");
            const fs = require("original-fs");
            fs.writeFileSync(asarPath, buff);

            this.hasUpdate = false;
            Config.version = this.remoteVersion;

            Modals.showConfirmationModal(Strings.Updater.updateSuccessful, Strings.Modals.restartPrompt, {
                confirmText: Strings.Modals.restartNow,
                cancelText: Strings.Modals.restartLater,
                danger: true,
                onConfirm: () => IPC.relaunch()
            });
        }
        catch (err) {
            Logger.stacktrace("Updater", "Failed to update", err);
            Modals.showConfirmationModal(Strings.Updater.updateFailed, Strings.Updater.updateFailedMessage, {
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
        if (Settings.get("addons", "checkForUpdates")) this.checkAll();

        Events.on(`${this.type}-loaded`, addon => {
            if (!Settings.get("addons", "checkForUpdates")) return;
            this.checkForUpdate(addon.filename, addon.version);
        });

        Events.on(`${this.type}-unloaded`, addon => {
            const index = this.pending.indexOf(addon.filename);
            if (index >= 0) this.pending.splice(index, 1);
        });
    }

    async updateCache() {
        this.cache = {};
        const addonData = await getJSON(Web.store[this.type + "s"]);        
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
        let hasUpdate = info.version > currentVersion;
        if (semverRegex.test(info.version) && semverRegex.test(currentVersion)) {
            hasUpdate = semverComparator(currentVersion, info.version) > 0;
        }
        if (!hasUpdate) return;
        this.pending.push(filename);
    }
 
    async updateAddon(filename) {
        const info = this.cache[filename];
        request({
            url: Web.redirects.github(info.id),
            headers: {
                "Cache-Control": "no-cache",
                "Pragma": "no-cache"
            }
        }, (error, response, body) => {
            if (error || response.statusCode !== 200) {
                Logger.stacktrace("AddonUpdater", `Failed to download body for ${info.id}:`, error);
                Toasts.error(Strings.Updater.addonUpdateFailed.format({name: info.name, version: info.version}));
                return;
            }

            const file = path.join(path.resolve(this.manager.addonFolder), filename);
            fileSystem.writeFile(file, body.toString(), () => {
                Toasts.success(Strings.Updater.addonUpdated.format({name: info.name, version: info.version}));
                this.pending.splice(this.pending.indexOf(filename), 1);
            });
        });
    }

    showUpdateNotice() {
        if (!this.pending.length) return;
        const close = Notices.info(Strings.Updater.addonUpdatesAvailable.format({count: this.pending.length, type: this.type}), {
            buttons: [{
                label: Strings.Notices.moreInfo,
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
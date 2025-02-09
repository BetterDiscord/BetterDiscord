// @ts-expect-error this is an internal package not yet converted to TS
import request from "request";
import fileSystem from "fs";
import path from "path";

import Logger from "@common/logger";

import Config from "@stores/config";

import {comparator as semverComparator, regex as semverRegex} from "@structs/semver";

import Events from "./emitter";
import IPC from "./ipc";
import Strings from "./strings";
import DataStore from "./datastore";
import React from "./react";
import Settings from "@stores/settings";
import PluginManager from "./pluginmanager";
import ThemeManager from "./thememanager";

import Toasts from "@ui/toasts";
import Notices from "@ui/notices";
import Modals from "@ui/modals";
import UpdaterPanel from "@ui/updater";
import Web from "@data/web";
import type AddonManager from "./addonmanager";
import type FormattableString from "@structs/string";
import type {Release} from "github";
import type {Addon} from "betterdiscordweb";
import {getByKeys} from "@webpack";


const UserSettingsWindow = getByKeys<{open?(id: string): void;}>(["updateAccount"]);

const getJSON = (url: string) => {
    return new Promise(resolve => {
        request({
            url: url,
            headers: {
                "Cache-Control": "no-cache",
                "Pragma": "no-cache"
            }
        }, (error: Error, _: Response, body: string) => {
            if (error) return resolve([]);
            resolve(JSON.parse(body));
        });
    });
};

const reducer = (acc: Record<string, {name: string; version: string; id: number;}> | Record<string, never>, addon: Addon) => {
    if (addon.version === "Unknown") return acc;
    acc[addon.file_name] = {name: addon.name, version: addon.version, id: addon.id};
    return acc;
};

export default class Updater {
    static updateCheckInterval: ReturnType<typeof setInterval> | null = null;

    static initialize() {
        // TODO: get rid of element creation
        Settings.registerPanel("updates", Strings.Panels.updates, {
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
    static apiData: Release;
    static remoteVersion = "";

    static async initialize() {
        if (!Settings.get("addons", "checkForUpdates")) return;
        this.checkForUpdate();
    }

    static async checkForStable(ignoreVersion = false) {
        const resp = await fetch(`https://api.github.com/repos/BetterDiscord/BetterDiscord/releases/latest`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "User-Agent": "BetterDiscord Updater"
            }
        });

        const data: Release = await resp.json();
        const remoteVersion = data.tag_name.startsWith("v") ? data.tag_name.slice(1) : data.tag_name;
        this.hasUpdate = ignoreVersion || semverComparator(Config.get("version"), remoteVersion) > 0;
        this.remoteVersion = remoteVersion;
        this.apiData = data;
    }

    static async checkForCanary(ignoreVersion = false) {
        const resp = await fetch(`https://api.github.com/repos/BetterDiscord/BetterDiscord/releases`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "User-Agent": "BetterDiscord Updater"
            }
        });

        const releases: Release[] = await resp.json();
        const data = releases.find(r => r.prerelease && r.tag_name === "canary");
        const asset = data?.assets.find(a => a.name === "betterdiscord.asar");
        if (!data || !asset) {
            this.hasUpdate = false;
            this.remoteVersion = "";
            return;
        }

        let canaryUpdated: string | Date = DataStore.getBDData("canaryUpdated") as string;
        let remoteVersion = asset.updated_at;
        try {
            if (canaryUpdated) canaryUpdated = new Date(canaryUpdated);
            else canaryUpdated = new Date(0);
            remoteVersion = new Date(remoteVersion);
        }
        catch {
            return;
        }
        this.hasUpdate = ignoreVersion || (remoteVersion > canaryUpdated);
        this.remoteVersion = remoteVersion.toISOString();
        this.apiData = data;
    }

    static async checkForUpdate(showNotice = true) {
        if (Config.isDevelopment) return; // Don't run updater on development build
        const isOnCanary = Config.isCanary;
        const isCanaryEnabled = Settings.get("developer", "canary");

        /**
         * If canary is enabled, then check for canary update.
         * But if the user is not already on canary, then pass
         * a flag to ignore the remote version.
         *
         * Otherwise canary is disabled, check for stable update.
         * But if the user is already on canary, then pass a
         * flag to ignore remove version.
         */
        if (isCanaryEnabled) await this.checkForCanary(!isOnCanary);
        else await this.checkForStable(isOnCanary);

        if (!this.hasUpdate || !showNotice) return;

        const close = Notices.info((Strings.Updater.updateAvailable as unknown as FormattableString).format({version: this.remoteVersion}), {
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
            if (!asar) return;

            const buff = await new Promise((resolve, reject) =>
                request(asar.url, {
                    headers: {
                        "Content-Type": "application/octet-stream",
                        "User-Agent": "BetterDiscord Updater",
                        "Accept": "application/octet-stream"
                    }
                }, (err: Error, resp: {statusCode: number; statusMessage: string;}, body: string) => {
                    if (err || resp.statusCode != 200) return reject(err || `${resp.statusCode} ${resp.statusMessage}`);
                    return resolve(body);
                }));

            const asarPath = path.join(DataStore.baseFolder, "betterdiscord.asar");
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const fs = require("original-fs");
            fs.writeFileSync(asarPath, buff);

            this.hasUpdate = false;

            // For canary, save the last updated data. For stable, overwrite the current version to prevent further updates
            if (Settings.get("developer", "canary")) DataStore.setBDData("canaryUpdated", this.remoteVersion);
            else Config.set("version", this.remoteVersion);

            Modals.showConfirmationModal(Strings.Updater.updateSuccessful, Strings.Modals.restartPrompt, {
                confirmText: Strings.Modals.restartNow,
                cancelText: Strings.Modals.restartLater,
                danger: true,
                onConfirm: () => IPC.relaunch()
            });
        }
        catch (err) {
            Logger.stacktrace("Updater", "Failed to update", err as Error);
            Modals.showConfirmationModal(Strings.Updater.updateFailed, Strings.Updater.updateFailedMessage, {
                cancelText: null
            });
        }
    }
}



class AddonUpdater {
    manager: AddonManager;
    type: "plugin" | "theme";
    cache: Record<string, {name: string; version: string; id: number;}> | Record<string, never>;
    pending: string[];

    constructor(type: "plugin" | "theme") {
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
        const addonData = (await getJSON(Web.store[(this.type + "s") as keyof typeof Web.store] as string)) as Addon[];
        addonData.reduce(reducer, this.cache as Record<string, never>);
    }

    clearPending() {
        this.pending.splice(0, this.pending.length);
    }

    checkAll(showNotice = true) {
        for (const addon of this.manager.addonList) this.checkForUpdate(addon.filename, addon.version);
        if (showNotice) this.showUpdateNotice();
    }

    checkForUpdate(filename: string, currentVersion: string) {
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

    async updateAddon(filename: string) {
        const info = this.cache[filename];
        request({
            url: Web.redirects.github(info.id.toString()),
            headers: {
                "Cache-Control": "no-cache",
                "Pragma": "no-cache"
            }
        }, (error: Error, response: {statusCode: number;}, body: string) => {
            if (error || response.statusCode !== 200) {
                Logger.stacktrace("AddonUpdater", `Failed to download body for ${info.id}:`, error);
                Toasts.error((Strings.Updater.addonUpdateFailed as unknown as FormattableString).format({name: info.name, version: info.version}));
                return;
            }

            const file = path.join(path.resolve(this.manager.addonFolder), filename);
            fileSystem.writeFile(file, body.toString(), () => {
                Toasts.success((Strings.Updater.addonUpdated as unknown as FormattableString).format({name: info.name, version: info.version}));
                this.pending.splice(this.pending.indexOf(filename), 1);
            });
        });
    }

    showUpdateNotice() {
        if (!this.pending.length) return;
        const close = Notices.info((Strings.Updater.addonUpdatesAvailable as unknown as FormattableString).format({count: this.pending.length, type: this.type}), {
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
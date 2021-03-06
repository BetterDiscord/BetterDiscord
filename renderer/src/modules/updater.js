/**
 * Functions that check for and update existing plugins.
 * @module PluginUpdater
 * @version 0.1.2
 */

import PluginUtilities from "./pluginutilities";
import DOMTools from "./domtools";
import Logger from "common/logger";
import DiscordClasses from "./discordclasses";
import {EmulatedTooltip, Toasts} from "ui";

/**
 * Function that gets the remote version from the file contents. 
 * @param {string} fileContent - the content of the remote file 
 * @returns {string} - remote version
 * @callback module:PluginUpdater~versioner
 */

/**
 * Comparator that takes the current version and the remote version,
 * then compares them returning `true` if there is an update and `false` otherwise.
 * @param {string} currentVersion - the current version of the plugin
 * @param {string} remoteVersion - the remote version of the plugin
 * @returns {boolean} - whether the plugin has an update or not
 * @callback module:PluginUpdater~comparator
 */

export default class PluginUpdater {

    static get CSS() {return require("../styles/updates.css");}

    /**
     * Checks for updates for the specified plugin at the specified link. The final
     * parameter should link to the raw text of the plugin and will compare semantic
     * versions.
     * @param {string} pluginName - name of the plugin
     * @param {string} currentVersion - current version (semantic versioning only)
     * @param {string} updateURL - url to check for update
     * @param {module:PluginUpdater~versioner} [versioner] - versioner that finds the remote version. If not provided uses {@link module:PluginUpdater.defaultVersioner}.
     * @param {module:PluginUpdater~comparator} [comparator] - comparator that determines if there is an update. If not provided uses {@link module:PluginUpdater.defaultComparator}.
     */
    static checkForUpdate(pluginName, currentVersion, updateURL, versioner, comparator) {
        let updateLink = "https://raw.githubusercontent.com/rauenzi/BetterDiscordAddons/master/Plugins/" + pluginName + "/" + pluginName + ".plugin.js";
        if (updateURL) updateLink = updateURL;
        if (typeof(versioner) != "function") versioner = this.defaultVersioner;
        if (typeof(comparator) != "function") comparator = this.defaultComparator;
        
        if (typeof window.PluginUpdates === "undefined") {
            window.PluginUpdates = {
                plugins: {},
                checkAll: function() {
                    for (const key in this.plugins) {
                        const plugin = this.plugins[key];
                        if (!plugin.versioner) plugin.versioner = PluginUpdater.defaultVersioner;
                        if (!plugin.comparator) plugin.comparator = PluginUpdater.defaultComparator;
                        PluginUpdater.processUpdateCheck(plugin.name, plugin.raw);
                    }
                },
                interval: setInterval(() => {
                    window.PluginUpdates.checkAll();
                }, 7200000)
            };
            this.patchPluginList();
        }

        window.PluginUpdates.plugins[updateLink] = {name: pluginName, raw: updateLink, version: currentVersion, versioner: versioner, comparator: comparator};
        PluginUpdater.processUpdateCheck(pluginName, updateLink);
    }

    /**
     * Will check for updates and automatically show or remove the update notice
     * bar based on the internal result. Better not to call this directly and to
     * instead use {@link module:PluginUpdater.checkForUpdate}.
     * @param {string} pluginName - name of the plugin to check
     * @param {string} updateLink - link to the raw text version of the plugin
     */
    static processUpdateCheck(pluginName, updateLink) {
        const request = require("request");
        request(updateLink, (error, response, result) => {
            if (error) return;
            const remoteVersion = window.PluginUpdates.plugins[updateLink].versioner(result);
            const hasUpdate = window.PluginUpdates.plugins[updateLink].comparator(window.PluginUpdates.plugins[updateLink].version, remoteVersion);
            if (hasUpdate) this.showUpdateNotice(pluginName, updateLink);
            else this.removeUpdateNotice(pluginName);
        });
    }

    /**
     * The default versioner used as {@link module:PluginUpdater~versioner} for {@link module:PluginUpdater.checkForUpdate}.
     * This works on basic semantic versioning e.g. "1.0.0". You do not need to provide this as a versioner if your plugin adheres
     * to this style as this will be used as default.
     * @param {string} currentVersion 
     * @param {string} content 
     */
    static defaultVersioner(content) {
        const remoteVersion = content.match(/['"][0-9]+\.[0-9]+\.[0-9]+['"]/i);
        if (!remoteVersion) return "0.0.0";
        return remoteVersion.toString().replace(/['"]/g, "");
    }

    /**
     * The default comparator used as {@link module:PluginUpdater~comparator} for {@link module:PluginUpdater.checkForUpdate}.
     * This works on basic semantic versioning e.g. "1.0.0". You do not need to provide this as a comparator if your plugin adheres
     * to this style as this will be used as default.
     * @param {string} currentVersion 
     * @param {string} content 
     */
    static defaultComparator(currentVersion, remoteVersion) {
        currentVersion = currentVersion.split(".").map((e) => {return parseInt(e);});
        remoteVersion = remoteVersion.split(".").map((e) => {return parseInt(e);});
        
        if (remoteVersion[0] > currentVersion[0]) return true;
        else if (remoteVersion[0] == currentVersion[0] && remoteVersion[1] > currentVersion[1]) return true;
        else if (remoteVersion[0] == currentVersion[0] && remoteVersion[1] == currentVersion[1] && remoteVersion[2] > currentVersion[2]) return true;
        return false;
    }

    static patchPluginList() {
        // Patcher.after("ZeresLibrary", V2C_ContentColumn.prototype, "componentDidMount", (self) => {
        //     if (self._reactInternalFiber.key != "pcolumn") return;
        //     const column = DiscordModules.ReactDOM.findDOMNode(self);
        //     if (!column) return;
        //     const button = column.getElementsByClassName("bd-pfbtn")[0];
        //     if (!button || button.nextElementSibling.classList.contains("bd-updatebtn")) return;
        //     button.after(PluginUpdater.createUpdateButton());
        // });
        // const button = document.getElementsByClassName("bd-pfbtn")[0];
        // if (!button || !button.textContent.toLowerCase().includes("plugin") || button.nextElementSibling.classList.contains("bd-updatebtn")) return;
        // button.after(PluginUpdater.createUpdateButton());
    }

    /**
     * Creates the update button found in the plugins page of BetterDiscord
     * settings. Returned button will already have listeners to create the tooltip.
     * @returns {HTMLElement} check for update button
     */
    static createUpdateButton() {
        const updateButton = DOMTools.createElement(`<button class="bd-pfbtn bd-updatebtn" style="left: 220px;">Check for Updates</button>`);
        updateButton.onclick = function () {
            window.PluginUpdates.checkAll();
        };
        const tooltip = new EmulatedTooltip(updateButton, "Checks for updates of plugins that support this feature. Right-click for a list.");
        updateButton.oncontextmenu = function () {
            if (!window.PluginUpdates || !window.PluginUpdates.plugins) return;
            tooltip.label = Object.values(window.PluginUpdates.plugins).map(p => p.name).join(", ");
            tooltip.side = "bottom";
            tooltip.show();
            updateButton.onmouseout = function() {
                tooltip.label = "Checks for updates of plugins that support this feature. Right-click for a list.";
                tooltip.side = "top";
            };
        };
        return updateButton;
    }

    /**
     * Will download the latest version and replace the the old plugin version.
     * Will also update the button in the update bar depending on if the user
     * is using RestartNoMore plugin by square {@link https://github.com/Inve1951/BetterDiscordStuff/blob/master/plugins/restartNoMore.plugin.js}
     * @param {string} pluginName - name of the plugin to download
     * @param {string} updateLink - link to the raw text version of the plugin
     */
    static downloadPlugin(pluginName, updateLink) {
        const request = require("request");
        const fileSystem = require("fs");
        const path = require("path");
        request(updateLink, async (error, response, body) => {
            if (error) return Logger.warn("PluginUpdates", "Unable to get update for " + pluginName);
            const remoteVersion = window.PluginUpdates.plugins[updateLink].versioner(body);
            let filename = updateLink.split("/");
            filename = filename[filename.length - 1];
            const file = path.join(PluginUtilities.getPluginsFolder(), filename);
            await new Promise(r => fileSystem.writeFile(file, body, r));
            Toasts.success(`${pluginName} ${window.PluginUpdates.plugins[updateLink].version} has been replaced by ${pluginName} ${remoteVersion}`);
            this.removeUpdateNotice(pluginName);

            const oldRNM = window.bdplugins["Restart-No-More"] && window.pluginCookie["Restart-No-More"];
            const newRNM = window.bdplugins["Restart No More"] && window.pluginCookie["Restart No More"];
            const BBDLoader = window.settingsCookie["fork-ps-5"];
            if (oldRNM || newRNM || BBDLoader) return;
            if (!window.PluginUpdates.downloaded) {
                window.PluginUpdates.downloaded = [];
                const button = DOMTools.createElement(`<button class="btn btn-reload ${DiscordClasses.Notices.btn} ${DiscordClasses.Notices.button}">Reload</button>`);
                const tooltip = new EmulatedTooltip(button, window.PluginUpdates.downloaded.join(", "), {side: "top"});
                button.addEventListener("click", (e) => {
                    e.preventDefault();
                    window.location.reload(false);
                });
                button.addEventListener("mouseenter", () => {
                    tooltip.label = window.PluginUpdates.downloaded.join(", ");
                });
                document.getElementById("pluginNotice").append(button);
            }
            window.PluginUpdates.plugins[updateLink].version = remoteVersion;
            window.PluginUpdates.downloaded.push(pluginName);
        });
    }

    /**
     * Will show the update notice top bar seen in Discord. Better not to call
     * this directly and to instead use {@link module:PluginUpdater.checkForUpdate}.
     * @param {string} pluginName - name of the plugin
     * @param {string} updateLink - link to the raw text version of the plugin
     */
    static showUpdateNotice(pluginName, updateLink) {
        if (!document.getElementById("pluginNotice")) {
            const noticeElement = DOMTools.createElement(`<div class="${DiscordClasses.Notices.notice} ${DiscordClasses.Notices.noticeInfo}" id="pluginNotice">
                                                        <div class="${DiscordClasses.Notices.dismiss}" id="pluginNoticeDismiss"></div>
                                                        <span class="notice-message">The following plugins have updates:</span>&nbsp;&nbsp;<strong id="outdatedPlugins"></strong>
                                                    </div>`);
            DOMTools.query("[class*='app-'] > [class*='app-']").prepend(noticeElement);
            noticeElement.querySelector("#pluginNoticeDismiss").addEventListener("click", async () => {
                noticeElement.classList.add("closing");
                await new Promise(resolve => setTimeout(resolve, 400));
                noticeElement.remove();
            });
        }
        const pluginNoticeID = pluginName + "-notice";
        if (document.getElementById(pluginNoticeID)) return;
        const pluginNoticeElement = DOMTools.createElement(`<span id="${pluginNoticeID}">${pluginName}</span>`);
        pluginNoticeElement.addEventListener("click", () => {
            this.downloadPlugin(pluginName, updateLink);
        });
        if (document.getElementById("outdatedPlugins").querySelectorAll("span").length) document.getElementById("outdatedPlugins").append(DOMTools.createElement("<span class='separator'>, </span>"));
        document.getElementById("outdatedPlugins").append(pluginNoticeElement);
    }

    /**
     * Will remove the plugin from the update notice top bar seen in Discord.
     * Better not to call this directly and to instead use {@link module:PluginUpdater.checkForUpdate}.
     * @param {string} pluginName - name of the plugin
     */
    static removeUpdateNotice(pluginName) {
        if (!document.getElementById("outdatedPlugins")) return;
        const notice = document.getElementById(pluginName + "-notice");
        if (notice) {
            if (notice.nextElementSibling && notice.nextElementSibling.matches(".separator")) notice.nextElementSibling.remove();
            else if (notice.previousElementSibling && notice.previousElementSibling.matches(".separator")) notice.previousElementSibling.remove();
            notice.remove();
        }

        if (!document.getElementById("outdatedPlugins").querySelectorAll("span").length) {
            if (document.querySelector("#pluginNotice .btn-reload")) document.querySelector("#pluginNotice .notice-message").textContent = "To finish updating you need to reload.";
            else document.getElementById("pluginNoticeDismiss").click();
        }
    }
}
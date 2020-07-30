import {bdConfig, minSupportedVersion, bbdVersion, settingsCookie, bdpluginErrors, bdthemeErrors, bbdChangelog, defaultCookie, currentDiscordVersion} from "../0globals";
import Utils from "./utils";
import emoteModule from "./emoteModule";
import quickEmoteMenu from "./quickEmoteMenu";

import BDV2 from "./v2";
import settingsPanel from "./settingsPanel";
import pluginModule from "./pluginModule";
import themeModule from "./themeModule";
import DataStore from "./dataStore";
import WebpackModules from "./webpackModules";
import DOM from "./domtools";

import BDLogo from "../ui/bdLogo";
import TooltipWrap from "../ui/tooltipWrap";

const dependencies = [
    {
        name: "jquery",
        type: "script",
        url: "//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js",
        backup: "//cdn.jsdelivr.net/gh/jquery/jquery@2.0.0/jquery.min.js"
    },
    {
        name: "bd-stylesheet",
        type: "style",
        url: "//rauenzi.github.io/BetterDiscordApp/dist/style.min.css",
        backup: "//gitcdn.xyz/repo/rauenzi/BetterDiscordApp/gh-pages/dist/style.min.css"
    }
];

const {ipcRenderer} = require("electron");
function Core() {
    ipcRenderer.invoke("bd-config").then(injectorConfig => {
        if (this.hasStarted) return;
        Object.assign(bdConfig, injectorConfig);
        this.init();
    });
    ipcRenderer.invoke("bd-injector-info").then(injectorInfo => {
        bdConfig.version = injectorInfo.version;

        const request = require("request");
        request.get({url: `https://gitcdn.xyz/repo/rauenzi/BetterDiscordApp/injector/package.json`, json: true}, (err, resp, body) => {
            let remoteVersion = "0.6.1";
            if (!err && resp.statusCode == 200) remoteVersion = body.version || remoteVersion;
            bdConfig.latestVersion = remoteVersion;
            this.checkInjectorUpdate();
        });
    });
    
}

Core.prototype.setConfig = function(config) {
    if (this.hasStarted) return;
    Object.assign(bdConfig, config);
};

Core.prototype.init = async function() {
    if (this.hasStarted) return;
    this.hasStarted = true;
    
    if (!Array.prototype.flat) {
        Utils.alert("Not Supported", "BetterDiscord v" + bbdVersion + " does not support this old version (" + currentDiscordVersion + ") of Discord. Please update your Discord installation before proceeding.");
        return;
    }

    if (bdConfig.version < minSupportedVersion) {
        Utils.alert("Not Supported", "BetterDiscord v" + bdConfig.version + " (your version)" + " is not supported by the latest js (" + bbdVersion + ").<br><br> Please download the latest version from <a href='https://github.com/rauenzi/BetterDiscordApp/releases/latest' target='_blank'>GitHub</a>");
        return;
    }

    if (window.ED) {
        Utils.alert("Not Supported", "BandagedBD does not work with EnhancedDiscord. Please uninstall one of them.");
        return;
    }

    if (window.WebSocket && window.WebSocket.name && window.WebSocket.name.includes("Patched")) {
        Utils.alert("Not Supported", "BandagedBD does not work with Powercord. Please uninstall one of them.");
        return;
    }

    Utils.log("Startup", "Initializing Settings");
    this.initSettings();
    Utils.log("Startup", "Initializing EmoteModule");
    window.emotePromise = emoteModule.init().then(() => {
        emoteModule.initialized = true;
        Utils.log("Startup", "Initializing QuickEmoteMenu");
        quickEmoteMenu.init();
    });


    await this.injectExternals();

    await this.checkForGuilds();
    BDV2.initialize();
    Utils.log("Startup", "Updating Settings");
    settingsPanel.initializeSettings();

    Utils.log("Startup", "Loading Plugins");
    pluginModule.loadPlugins();

    Utils.log("Startup", "Loading Themes");
    themeModule.loadThemes();

    DOM.addStyle("customcss", atob(DataStore.getBDData("bdcustomcss")));

    window.addEventListener("beforeunload", function() {
        if (settingsCookie["bda-dc-0"]) document.querySelector(".btn.btn-disconnect").click();
    });

    Utils.log("Startup", "Removing Loading Icon");
    if (document.getElementsByClassName("bd-loaderv2").length) document.getElementsByClassName("bd-loaderv2")[0].remove();
    Utils.log("Startup", "Initializing Main Observer");
    this.initObserver();

    // Show loading errors
    if (settingsCookie["fork-ps-1"]) {
        Utils.log("Startup", "Collecting Startup Errors");
        Utils.showContentErrors({plugins: bdpluginErrors, themes: bdthemeErrors});
    }

    const previousVersion = DataStore.getBDData("version");
    if (bbdVersion > previousVersion) {
        if (bbdChangelog) this.showChangelogModal(bbdChangelog);
        DataStore.setBDData("version", bbdVersion);
    }

    Utils.suppressErrors(this.patchSocial.bind(this), "BD Social Patch")();
    Utils.suppressErrors(this.patchGuildPills.bind(this), "BD Guild Pills Patch")();
    Utils.suppressErrors(this.patchGuildListItems.bind(this), "BD Guild List Items Patch")();
    Utils.suppressErrors(this.patchGuildSeparator.bind(this), "BD Guild Separator Patch")();
    Utils.suppressErrors(this.patchMessageHeader.bind(this), "BD Badge Chat Patch")();
    Utils.suppressErrors(this.patchMemberList.bind(this), "BD Badge Member List Patch")();
};

Core.prototype.checkForGuilds = function() {
    let timesChecked = 0;
    return new Promise(resolve => {
        const checkForGuilds = function() {
            const wrapper = BDV2.guildClasses.wrapper.split(" ")[0];
            if (document.querySelectorAll(`.${wrapper}`).length > 0) timesChecked++;
            const guild = BDV2.guildClasses.listItem.split(" ")[0];
            const blob = BDV2.guildClasses.blobContainer.split(" ")[0];
            if (document.querySelectorAll(`.${wrapper} .${guild} .${blob}`).length > 0) return resolve(bdConfig.deferLoaded = true);
            else if (timesChecked >= 50) return resolve(bdConfig.deferLoaded = true);
            setTimeout(checkForGuilds, 100);
        };
        if (document.readyState != "loading") setTimeout(checkForGuilds, 100);
        document.addEventListener("DOMContentLoaded", () => {setTimeout(checkForGuilds, 100);});
    });
};

Core.prototype.injectExternals = async function() {
    await DOM.addScript("ace-script", "https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.9/ace.js");
    if (window.require.original) window.require = window.require.original;
    if (window.$ && window.jQuery) return; // Dependencies already loaded
    const jqueryUrl = Utils.formatString(dependencies[0].url, {repo: bdConfig.repo, hash: bdConfig.hash, minified: bdConfig.minified ? ".min" : "", localServer: bdConfig.localServer});
    try {await DOM.addScript("jquery", jqueryUrl);}
    catch (_) {
        try {
            const backup = Utils.formatString(dependencies[0].backup, {minified: bdConfig.minified ? ".min" : ""});
            await DOM.addScript("jquery", backup);
        }
        catch (__) {
            Utils.alert("jQuery Not Loaded", "Unable to load jQuery, some plugins may fail to work. Proceed at your own risk.");
        }
    }
    document.head.append(DOM.createElement(`<link rel="stylesheet" href=${Utils.formatString(dependencies[1].url, {repo: bdConfig.repo, hash: bdConfig.hash, minified: bdConfig.minified ? ".min" : "", localServer: bdConfig.localServer})}>`));
};

Core.prototype.initSettings = function () {
    DataStore.initialize();
    if (!DataStore.getSettingGroup("settings")) {
        Object.assign(settingsCookie, defaultCookie);
        settingsPanel.saveSettings();
    }
    else {
        settingsPanel.loadSettings();
        for (const setting in defaultCookie) {
            if (settingsCookie[setting] == undefined) {
                settingsCookie[setting] = defaultCookie[setting];
                settingsPanel.saveSettings();
            }
        }
    }
};

Core.prototype.initObserver = function () {
    const mainObserver = new MutationObserver((mutations) => {

        for (let i = 0, mlen = mutations.length; i < mlen; i++) {
            const mutation = mutations[i];
            if (typeof pluginModule !== "undefined") pluginModule.rawObserver(mutation);

            // if there was nothing added, skip
            if (!mutation.addedNodes.length || !(mutation.addedNodes[0] instanceof Element)) continue;

            const node = mutation.addedNodes[0];

            if (node.classList.contains("layer-3QrUeG")) {
                if (node.getElementsByClassName("guild-settings-base-section").length) node.setAttribute("layer-id", "server-settings");

                if (node.getElementsByClassName("socialLinks-3jqNFy").length) {
                    node.setAttribute("layer-id", "user-settings");
                    node.setAttribute("id", "user-settings");
                    if (!document.getElementById("bd-settings-sidebar")) settingsPanel.renderSidebar();
                }
            }

            if (node.parentElement == document.body && node.querySelector("#ace_settingsmenu")) node.id = "ace_settingsmenu_container";

            // Emoji Picker
            //node.getElementsByClassName("emojiPicker-3m1S-j").length && !node.querySelector(".emojiPicker-3m1S-j").parentElement.classList.contains("animatorLeft-1EQxU0")
            if (node.classList.contains("layer-v9HyYc") && node.getElementsByClassName("emojiPicker-3m1S-j").length  && !node.querySelector(".emojiPicker-3m1S-j").parentElement.classList.contains("animatorLeft-1EQxU0")) quickEmoteMenu.obsCallback(node);

        }
    });

    mainObserver.observe(document, {
        childList: true,
        subtree: true
    });
};

Core.prototype.showChangelogModal = function(options = {}) {
    return Utils.showChangelogModal(options);
};

Core.prototype.alert = function(title, content) {
    return Utils.alert(title, content);
};

Core.prototype.patchSocial = function() {
    if (this.socialPatch) return;
    const TabBar = WebpackModules.find(m => m.displayName == "TabBar");
    const Anchor = WebpackModules.find(m => m.displayName == "Anchor");
    if (!TabBar) return;
    this.socialPatch = Utils.monkeyPatch(TabBar.prototype, "render", {after: (data) => {
        const children = data.returnValue.props.children;
        if (!children || !children.length || children.length < 3) return;
        if (children[children.length - 3].type.displayName !== "Separator") return;
        if (!children[children.length - 2].type.toString().includes("socialLinks")) return;
        if (Anchor) {
            const original = children[children.length - 2].type;
            const newOne = function() {
                const returnVal = original(...arguments);
                returnVal.props.children.push(
                    BDV2.React.createElement(TooltipWrap, {color: "black", side: "top", text: "BandagedBD"},
                        BDV2.React.createElement(Anchor, {className: "bd-social-link", href: "https://github.com/rauenzi/BetterDiscordApp", title: "BandagedBD", target: "_blank"},
                            BDV2.React.createElement(BDLogo, {size: "16px", className: "bd-social-logo"})
                        )
                    )
                );
                return returnVal;
            };
            children[children.length - 2].type = newOne;
        }

        const injector = BDV2.react.createElement("div", {className: "colorMuted-HdFt4q size12-3cLvbJ"}, `Injector ${bdConfig.version}`);
        const additional = BDV2.react.createElement("div", {className: "colorMuted-HdFt4q size12-3cLvbJ"}, `BBD ${bbdVersion} `);

        const originalVersions = children[children.length - 1].type;
        children[children.length - 1].type = function() {
            const returnVal = originalVersions(...arguments);
            returnVal.props.children.splice(returnVal.props.children.length - 1, 0, injector);
            returnVal.props.children.splice(1, 0, additional);
            return returnVal;
        };
    }});
};

const getGuildClasses = function() {
    const guildsWrapper = WebpackModules.findByProps("wrapper", "unreadMentionsBar");
    const guilds = WebpackModules.findByProps("guildsError", "selected");
    const pill = WebpackModules.findByProps("blobContainer");
    return Object.assign({}, guildsWrapper, guilds, pill);
};

Core.prototype.patchGuildListItems = function() {
    if (this.guildListItemsPatch) return;
    const GuildClasses = getGuildClasses();
    const listItemClass = GuildClasses.listItem.split(" ")[0];
    const blobClass = GuildClasses.blobContainer.split(" ")[0];
    const reactInstance = BDV2.getInternalInstance(document.querySelector(`.${listItemClass} .${blobClass}`).parentElement);
    const GuildComponent = reactInstance.return.type;
    if (!GuildComponent) return;
    this.guildListItemsPatch = Utils.monkeyPatch(GuildComponent.prototype, "render", {after: (data) => {
        if (data.returnValue && data.thisObject) {
            const returnValue = data.returnValue;
            const guildData = data.thisObject.props;
            returnValue.props.className += " bd-guild";
            if (guildData.unread) returnValue.props.className += " bd-unread";
            if (guildData.selected) returnValue.props.className += " bd-selected";
            if (guildData.audio) returnValue.props.className += " bd-audio";
            if (guildData.video) returnValue.props.className += " bd-video";
            if (guildData.badge) returnValue.props.className += " bd-badge";
            if (guildData.animatable) returnValue.props.className += " bd-animatable";
            return returnValue;
        }
    }});
};

Core.prototype.patchGuildPills = function() {
    if (this.guildPillPatch) return;
    const guildPill = WebpackModules.find(m => m.default && !m.default.displayName && m.default.toString && m.default.toString().includes("translate3d"));
    if (!guildPill) return;
    this.guildPillPatch = Utils.monkeyPatch(guildPill, "default", {after: (data) => {
        const props = data.methodArguments[0];
        if (props.unread) data.returnValue.props.className += " bd-unread";
        if (props.selected) data.returnValue.props.className += " bd-selected";
        if (props.hovered) data.returnValue.props.className += " bd-hovered";
        return data.returnValue;
    }});
};

Core.prototype.patchGuildSeparator = function() {
    if (this.guildSeparatorPatch) return;
    const Guilds = WebpackModules.findByDisplayName("Guilds");
    const guildComponents = WebpackModules.findByProps("renderListItem");
    if (!guildComponents || !Guilds) return;
    const GuildSeparator = function() {
        const returnValue = guildComponents.Separator(...arguments);
        returnValue.props.className += " bd-guild-separator";
        return returnValue;
    };
    this.guildSeparatorPatch = Utils.monkeyPatch(Guilds.prototype, "render", {after: (data) => {
        data.returnValue.props.children[1].props.children[3].type = GuildSeparator;
    }});
};

Core.prototype.patchMessageHeader = function() {
    if (this.messageHeaderPatch) return;
    const MessageHeader = WebpackModules.findByProps("MessageTimestamp");
    const Anchor = WebpackModules.find(m => m.displayName == "Anchor");
    if (!Anchor || !MessageHeader || !MessageHeader.default) return;
    this.messageHeaderPatch = Utils.monkeyPatch(MessageHeader, "default", {after: (data) => {
        const author = Utils.getNestedProp(data.methodArguments[0], "message.author");
        // const header = Utils.getNestedProp(data.returnValue, "props.children.1.props");
        const children = Utils.getNestedProp(data.returnValue, "props.children.1.props.children.1.props.children");
        if (!children || !author || !author.id || author.id !== "249746236008169473") return;
        // if (header && header.className) header.className += " "
        if (!Array.isArray(children)) return;
        children.push(
            BDV2.React.createElement(TooltipWrap, {color: "black", side: "top", text: "BandagedBD Developer"},
                BDV2.React.createElement(Anchor, {className: "bd-chat-badge", href: "https://github.com/rauenzi/BetterDiscordApp", title: "BandagedBD", target: "_blank"},
                    BDV2.React.createElement(BDLogo, {size: "16px", className: "bd-logo"})
                )
            )
        );
    }});
};

Core.prototype.patchMemberList = function() {
    if (this.memberListPatch) return;
    const MemberListItem = WebpackModules.findByDisplayName("MemberListItem");
    const Anchor = WebpackModules.find(m => m.displayName == "Anchor");
    if (!Anchor || !MemberListItem || !MemberListItem.prototype || !MemberListItem.prototype.renderDecorators) return;
    this.memberListPatch = Utils.monkeyPatch(MemberListItem.prototype, "renderDecorators", {after: (data) => {
        const user = Utils.getNestedProp(data.thisObject, "props.user");
        const children = Utils.getNestedProp(data.returnValue, "props.children");
        if (!children || !user || !user.id || user.id !== "249746236008169473") return;
        if (!Array.isArray(children)) return;
        children.push(
            BDV2.React.createElement(TooltipWrap, {color: "black", side: "top", text: "BandagedBD Developer"},
                BDV2.React.createElement(Anchor, {className: "bd-member-badge", href: "https://github.com/rauenzi/BetterDiscordApp", title: "BandagedBD", target: "_blank"},
                    BDV2.React.createElement(BDLogo, {size: "16px", className: "bd-logo"})
                )
            )
        );
    }});
};

Core.prototype.checkInjectorUpdate = function() {
    const latestLocalVersion = bdConfig.updater ? bdConfig.updater.LatestVersion : bdConfig.latestVersion;
    if (latestLocalVersion > bdConfig.version) {
        Utils.showConfirmationModal("Update Available", [`There is an update available for BandagedBD's Injector (${latestLocalVersion}).`, "You can either update and restart now, or later."], {
            confirmText: "Update Now",
            cancelText: "Maybe Later",
            onConfirm: async () => {
                const onUpdateFailed = () => {Utils.alert("Could Not Update", `Unable to update automatically, please download the installer and reinstall normally.<br /><br /><a href='https://github.com/rauenzi/BetterDiscordApp/releases/latest' target='_blank'>Download Installer</a>`);};
                try {
                    const didUpdate = await this.updateInjector();
                    if (!didUpdate) return onUpdateFailed();
                    const app = require("electron").remote.app;
                    app.relaunch();
                    app.exit();
                }
                catch (err) {
                    onUpdateFailed();
                }
            }
        });
    }
};

Core.prototype.updateInjector = async function() {
    const injectionPath = DataStore.injectionPath;
    if (!injectionPath) return false;

    const fs = require("fs");
    const path = require("path");
    const rmrf = require("rimraf");
    const yauzl = require("yauzl");
    const mkdirp = require("mkdirp");
    const request = require("request");

    const parentPath = path.resolve(injectionPath, "..");
    const folderName = path.basename(injectionPath);
    const zipLink = "https://github.com/rauenzi/BetterDiscordApp/archive/injector.zip";
    const savedZip = path.resolve(parentPath, "injector.zip");
    const extractedFolder = path.resolve(parentPath, "BetterDiscordApp-injector");

    // Download the injector zip file
    Utils.log("InjectorUpdate", "Downloading " + zipLink);
    let success = await new Promise(resolve => {
        request.get({url: zipLink, encoding: null}, async (error, response, body) => {
            if (error || response.statusCode !== 200) return resolve(false);
            // Save a backup in case someone has their own copy
            const alreadyExists = await new Promise(res => fs.exists(savedZip, res));
            if (alreadyExists) await new Promise(res => fs.rename(savedZip, `${savedZip}.bak${Math.round(performance.now())}`, res));

            Utils.log("InjectorUpdate", "Writing " + savedZip);
            fs.writeFile(savedZip, body, err => resolve(!err));
        });
    });
    if (!success) return success;

    // Check and delete rename extraction
    const alreadyExists = await new Promise(res => fs.exists(extractedFolder, res));
    if (alreadyExists) await new Promise(res => fs.rename(extractedFolder, `${extractedFolder}.bak${Math.round(performance.now())}`, res));
    
    // Unzip the downloaded zip file
    const zipfile = await new Promise(r => yauzl.open(savedZip, {lazyEntries: true}, (err, zip) =>  r(zip)));
    zipfile.on("entry", function(entry) {
        // Skip directories, they are handled with mkdirp
        if (entry.fileName.endsWith("/")) return zipfile.readEntry();

        Utils.log("InjectorUpdate", "Extracting " + entry.fileName);
        // Make any needed parent directories
        const fullPath = path.resolve(parentPath, entry.fileName);
        mkdirp.sync(path.dirname(fullPath));
        zipfile.openReadStream(entry, function(err, readStream) {
            if (err) return success = false;
            readStream.on("end", function() {zipfile.readEntry();}); // Go to next file after this
            readStream.pipe(fs.createWriteStream(fullPath));
        });
    });
    zipfile.readEntry(); // Start reading

    // Wait for the final file to finish
    await new Promise(resolve => zipfile.once("end", resolve));

    // Save a backup in case something goes wrong during final step
    const backupFolder = path.resolve(parentPath, `${folderName}.bak${Math.round(performance.now())}`);
    await new Promise(resolve => fs.rename(injectionPath, backupFolder, resolve));

    // Rename the extracted folder to what it should be
    Utils.log("InjectorUpdate", `Renaming ${path.basename(extractedFolder)} to ${folderName}`);
    success = await new Promise(resolve => fs.rename(extractedFolder, injectionPath, err => resolve(!err)));
    if (!success) {
        Utils.err("InjectorUpdate", "Failed to rename the final directory");
        return success;
    }

    // If rename had issues, delete what we tried to rename and restore backup
    if (!success) {
        Utils.err("InjectorUpdate", "Something went wrong... restoring backups.");
        await new Promise(resolve => rmrf(extractedFolder, resolve));
        await new Promise(resolve => fs.rename(backupFolder, injectionPath, resolve));
        return success;
    }

    // If we've gotten to this point, everything should have gone smoothly.
    // Cleanup the backup folder then remove the zip
    await new Promise(resolve => rmrf(backupFolder, resolve));
    await new Promise(resolve => fs.unlink(savedZip, resolve));

    Utils.log("InjectorUpdate", "Injector Updated!");
    return success;
};

export default new Core();
/* BetterDiscordApp Core JavaScript
 * Version: 1.78
 * Author: Jiiks | http://jiiks.net
 * Date: 27/08/2015 - 16:36
 * Last Update: 01/05/2016
 * https://github.com/Jiiks/BetterDiscordApp
 */

/* Localstorage fix */
(function() {

    let __fs = window.require("fs");
    let __process = window.require("process");
    let __platform = __process.platform;
    let __dataPath = (__platform === "win32" ? __process.env.APPDATA : __platform === "darwin" ? __process.env.HOME + "/Library/Preferences" : process.env.HOME + "/.config") + "/BetterDiscord/";
    let localStorageFile = "localStorage.json";

    let __data = {};
    if (__fs.existsSync(`${__dataPath}${localStorageFile}`)) {
        try {
            __data = JSON.parse(__fs.readFileSync(`${__dataPath}${localStorageFile}`));
        }
        catch (err) {
            console.log(err);
        }
    }
    else if (__fs.existsSync(localStorageFile)) {
        try {
            __data = JSON.parse(__fs.readFileSync(localStorageFile));
        }
        catch (err) {
            console.log(err);
        }
    }

    var __ls = __data;
    __ls.setItem = function(i, v) {
        __ls[i] = v;
        this.save();
    };
    __ls.getItem = function(i) {
        return __ls[i] || null;
    };
    __ls.save = function() {
        __fs.writeFileSync(`${__dataPath}${localStorageFile}`, JSON.stringify(this), null, 4);
    };

    var __proxy = new Proxy(__ls, {
        set: function(target, name, val) {
            __ls[name] = val;
            __ls.save();
        },
        get: function(target, name) {
            return __ls[name] || null;
        }
    });

    window.localStorage = __proxy;

})();

(() => {
    let v2Loader = document.createElement("div");
    v2Loader.className = "bd-loaderv2";
    v2Loader.title = "BandagedBD is loading...";
    document.body.appendChild(v2Loader);
})();

/* global DiscordNative:false */

var DataStore = (() => {
    const fs = require("fs");
    const path = require("path");
    const releaseChannel = DiscordNative.globals.releaseChannel;

    return new class DataStore {
        constructor() {
            this.data = {settings: {stable: {}, canary: {}, ptb: {}}};
            this.pluginData = {};
        }

        initialize() {
            try {
                if (!fs.existsSync(this.BDFile)) fs.writeFileSync(this.BDFile, JSON.stringify(this.data, null, 4));
                const data = require(this.BDFile);
                if (data.hasOwnProperty("settings")) this.data = data;
                if (!fs.existsSync(this.settingsFile)) return;
                let settings = require(this.settingsFile);
                fs.unlinkSync(this.settingsFile);
                if (settings.hasOwnProperty("settings")) settings = Object.assign({stable: {}, canary: {}, ptb: {}}, {[releaseChannel]: settings});
                else settings = Object.assign({stable: {}, canary: {}, ptb: {}}, settings);
                this.setBDData("settings", settings);
            }
            catch (err) {
                BdApi.alert("Corrupt Storage", "The bd storage has somehow become corrupt. You may either try to salvage the file or delete it then reload.");
            }
        }

        get BDFile() {return this._BDFile || (this._BDFile = path.resolve(bdConfig.dataPath, "bdstorage.json"));}
        get settingsFile() {return this._settingsFile || (this._settingsFile = path.resolve(bdConfig.dataPath, "bdsettings.json"));}
        getPluginFile(pluginName) {return path.resolve(ContentManager.pluginsFolder, pluginName + ".config.json");}

        getSettingGroup(key) {
            return this.data.settings[releaseChannel][key] || null;
        }

        setSettingGroup(key, data) {
            this.data.settings[releaseChannel][key] = data;
            fs.writeFileSync(this.BDFile, JSON.stringify(this.data, null, 4));
        }

        getBDData(key) {
            return this.data[key] || "";
        }

        setBDData(key, value) {
            this.data[key] = value;
            fs.writeFileSync(this.BDFile, JSON.stringify(this.data, null, 4));
        }

        getPluginData(pluginName, key) {
            if (this.pluginData[pluginName] !== undefined) return this.pluginData[pluginName][key] || undefined;
            if (!fs.existsSync(this.getPluginFile(pluginName))) return undefined;
            this.pluginData[pluginName] = JSON.parse(fs.readFileSync(this.getPluginFile(pluginName)));
            return this.pluginData[pluginName][key] || undefined;
        }

        setPluginData(pluginName, key, value) {
            if (value === undefined) return;
            if (this.pluginData[pluginName] === undefined) this.pluginData[pluginName] = {};
            this.pluginData[pluginName][key] = value;
            fs.writeFileSync(this.getPluginFile(pluginName), JSON.stringify(this.pluginData[pluginName], null, 4));
        }

        deletePluginData(pluginName, key) {
            if (this.pluginData[pluginName] === undefined) this.pluginData[pluginName] = {};
            delete this.pluginData[pluginName][key];
            fs.writeFileSync(this.getPluginFile(pluginName), JSON.stringify(this.pluginData[pluginName], null, 4));
        }
    };
})();

var BDEvents = (() => {
    const EventEmitter = require("events");
    return new class BDEvents extends EventEmitter {
        dispatch(eventName, ...args) {this.emit(eventName, ...args);}
        off(eventName, eventAction) {this.removeListener(eventName, eventAction);}
    };
})();



window.bdStorage = class bdPluginStorage {
    static get(key) {
        Utils.warn("Deprecation Notice", "Please use BdApi.getBDData(). bdStorage may be removed in future versions.");
        return DataStore.getBDData(key);
    }

    static set(key, data) {
        Utils.warn("Deprecation Notice", "Please use BdApi.setBDData(). bdStorage may be removed in future versions.");
        DataStore.setBDData(key, data);
    }
};

window.bdPluginStorage = class bdPluginStorage {
    static get(pluginName, key) {
        Utils.warn("Deprecation Notice", `${pluginName}, please use BdApi.loadData() or BdApi.getData(). bdPluginStorage may be removed in future versions.`);
        return DataStore.getPluginData(pluginName, key) || null;
    }

    static set(pluginName, key, data) {
        Utils.warn("Deprecation Notice", `${pluginName}, please use BdApi.saveData() or BdApi.setData(). bdPluginStorage may be removed in future versions.`);
        if (typeof(data) === "undefined") return Utils.warn("Deprecation Notice", "Trying to set undefined value in plugin " + pluginName);
        DataStore.setPluginData(pluginName, key, data);
    }

    static delete(pluginName, key) {
        Utils.warn("Deprecation Notice", `${pluginName}, please use BdApi.deleteData(). bdPluginStorage may be removed in future versions.`);
        DataStore.deletePluginData(pluginName, key);
    }
};

var settingsPanel, emoteModule, quickEmoteMenu, voiceMode, pluginModule, themeModule, dMode, publicServersModule;
var minSupportedVersion = "0.3.0";
var bbdVersion = "0.2.17";


var mainCore;

var settings = {
    "Custom css live update":     {id: "bda-css-0", info: "",                                                  implemented: true,  hidden: true,  cat: "core"},
    "Custom css auto udpate":     {id: "bda-css-1", info: "",                                                  implemented: true,  hidden: true,  cat: "core"},
    "BetterDiscord Blue":         {id: "bda-gs-b",  info: "Replace Discord blue with BD Blue",                 implemented: false,  hidden: false, cat: "core"},

    /* Core */
    /* ====== */
    "Public Servers":             {id: "bda-gs-1",  info: "Display public servers button",                     implemented: true,  hidden: false, cat: "core", category: "modules"},
    "Minimal Mode":               {id: "bda-gs-2",  info: "Hide elements and reduce the size of elements.",    implemented: true,  hidden: false, cat: "core", category: "modules"},
    "Voice Mode":                 {id: "bda-gs-4",  info: "Only show voice chat",                              implemented: true,  hidden: false, cat: "core", category: "modules"},
    "Hide Channels":              {id: "bda-gs-3",  info: "Hide channels in minimal mode",                     implemented: true,  hidden: false, cat: "core", category: "modules"},
    "Dark Mode":                  {id: "bda-gs-5",  info: "Make certain elements dark by default(wip)",        implemented: true,  hidden: false, cat: "core", category: "modules"},
    "Voice Disconnect":           {id: "bda-dc-0",  info: "Disconnect from voice server when closing Discord", implemented: true,  hidden: false, cat: "core", category: "modules"},
    "24 Hour Timestamps":         {id: "bda-gs-6",  info: "Replace 12hr timestamps with proper ones",          implemented: true,  hidden: false, cat: "core", category: "modules"},
    "Coloured Text":              {id: "bda-gs-7",  info: "Make text colour the same as role colour",          implemented: true,  hidden: false, cat: "core", category: "modules"},
    "Normalize Classes":          {id: "fork-ps-4", info: "Adds stable classes to elements to help themes. (e.g. adds .da-channels to .channels-Ie2l6A)", implemented: true,  hidden: false, cat: "core", category: "modules"},

    /* Content */
    "Content Error Modal":        {id: "fork-ps-1", info: "Shows a modal with plugin/theme errors", implemented: true,  hidden: false, cat: "core", category: "content manager"},
    "Show Toasts":                {id: "fork-ps-2", info: "Shows a small notification for important information", implemented: true,  hidden: false, cat: "core", category: "content manager"},
    "Scroll To Settings":         {id: "fork-ps-3", info: "Auto-scrolls to a plugin's settings when the button is clicked (only if out of view)", implemented: true,  hidden: false, cat: "core", category: "content manager"},
    "Automatic Loading":          {id: "fork-ps-5", info: "Automatically loads, reloads, and unloads plugins and themes", implemented: true,  hidden: false, cat: "core", category: "content manager"},

    /* Developer */
    "Developer Mode":         	  {id: "bda-gs-8",  info: "Developer Mode",                                    implemented: true,  hidden: false, cat: "core", category: "developer settings"},
    "Copy Selector":			  {id: "fork-dm-1", info: "Adds a \"Copy Selector\" option to context menus when developer mode is active", implemented: true,  hidden: false, cat: "core", category: "developer settings"},

    /* Window Prefs */
    "Enable Transparency":        {id: "fork-wp-1", info: "Enables the main window to be see-through (requires restart)", implemented: true,  hidden: false, cat: "core", category: "window preferences"},
    "Window Frame":               {id: "fork-wp-2", info: "Adds the native os window frame to the main window", implemented: false,  hidden: true, cat: "core", category: "window preferences"},


    /* Emotes */
    /* ====== */
    "Download Emotes":            {id: "fork-es-3", info: "Download emotes when the cache is expired", implemented: true,  hidden: false, cat: "emote"},
    "Twitch Emotes":              {id: "bda-es-7",  info: "Show Twitch emotes",                                implemented: true,  hidden: false, cat: "emote"},
    "FrankerFaceZ Emotes":        {id: "bda-es-1",  info: "Show FrankerFaceZ Emotes",                          implemented: true,  hidden: false, cat: "emote"},
    "BetterTTV Emotes":           {id: "bda-es-2",  info: "Show BetterTTV Emotes",                             implemented: true,  hidden: false, cat: "emote"},
    "Emote Menu":                 {id: "bda-es-0",  info: "Show Twitch/Favourite emotes in emote menu",        implemented: true,  hidden: false, cat: "emote"},
    "Emoji Menu":                 {id: "bda-es-9",  info: "Show Discord emoji menu",                           implemented: true,  hidden: false, cat: "emote"},
    "Emote Auto Capitalization":  {id: "bda-es-4",  info: "Autocapitalize emote commands",                     implemented: true,  hidden: false, cat: "emote"},
    "Show Names":                 {id: "bda-es-6",  info: "Show emote names on hover",                         implemented: true,  hidden: false, cat: "emote"},
    "Show emote modifiers":       {id: "bda-es-8",  info: "Enable emote mods (flip, spin, pulse, spin2, spin3, 1spin, 2spin, 3spin, tr, bl, br, shake, shake2, shake3, flap)", implemented: true,  hidden: false, cat: "emote"},
    "Animate On Hover":           {id: "fork-es-2", info: "Only animate the emote modifiers on hover", implemented: true,  hidden: false, cat: "emote"}
};

var defaultCookie = {
    "bda-gs-1": true,
    "bda-gs-2": false,
    "bda-gs-3": false,
    "bda-gs-4": false,
    "bda-gs-5": true,
    "bda-gs-6": false,
    "bda-gs-7": false,
    "bda-gs-8": false,
    "bda-es-0": true,
    "bda-es-1": true,
    "bda-es-2": true,
    "bda-es-4": false,
    "bda-es-6": true,
    "bda-es-7": true,
    "bda-gs-b": false,
    "bda-es-8": true,
    "bda-dc-0": false,
    "bda-css-0": false,
    "bda-css-1": false,
    "bda-es-9": true,
    "fork-dm-1": false,
    "fork-ps-1": true,
    "fork-ps-2": true,
    "fork-ps-3": true,
    "fork-ps-4": true,
    "fork-ps-5": true,
    "fork-es-2": false,
    "fork-es-3": true,
    "fork-wp-1": false,
    "fork-wp-2": false
};


var settingsCookie = {};

var bdpluginErrors = [], bdthemeErrors = []; // define for backwards compatibility

var bdConfig = null;

function Core(config) {
    window.bdConfig = config;
}

Core.prototype.init = async function() {
    if (bdConfig.version < minSupportedVersion) {
        this.alert("Not Supported", "BetterDiscord v" + bdConfig.version + " (your version)" + " is not supported by the latest js (" + bbdVersion + ").<br><br> Please download the latest version from <a href='https://github.com/rauenzi/BetterDiscordApp/releases/latest' target='_blank'>GitHub</a>");
        return;
    }

    const latestLocalVersion = bdConfig.updater ? bdConfig.updater.LatestVersion : bdConfig.latestVersion;
    if (latestLocalVersion > bdConfig.version) {
        this.alert("Update Available", `
            An update for BandagedBD is available (${latestLocalVersion})! Please Reinstall!<br /><br />
            <a href='https://github.com/rauenzi/BetterDiscordApp/releases/latest' target='_blank'>Download Installer</a>
        `);
    }

    Utils.log("Startup", "Initializing Settings");
    this.initSettings();
    emoteModule = new EmoteModule();
    quickEmoteMenu = new QuickEmoteMenu();
    Utils.log("Startup", "Initializing EmoteModule");
    window.emotePromise = emoteModule.init().then(() => {
        emoteModule.initialized = true;
        Utils.log("Startup", "Initializing QuickEmoteMenu");
        quickEmoteMenu.init();
    });
    publicServersModule = new V2_PublicServers();

    voiceMode = new VoiceMode();
    dMode = new devMode();

    this.injectExternals();

    await this.checkForGuilds();
    BDV2.initialize();
    Utils.log("Startup", "Updating Settings");
    settingsPanel = new V2_SettingsPanel();
    settingsPanel.initializeSettings();

    Utils.log("Startup", "Loading Plugins");
    pluginModule = new PluginModule();
    pluginModule.loadPlugins();

    Utils.log("Startup", "Loading Themes");
    themeModule = new ThemeModule();
    themeModule.loadThemes();

    $("#customcss").detach().appendTo(document.head);

    window.addEventListener("beforeunload", function() {
        if (settingsCookie["bda-dc-0"]) document.querySelector(".btn.btn-disconnect").click();
    });

    publicServersModule.initialize();

    emoteModule.autoCapitalize();

    Utils.log("Startup", "Removing Loading Icon");
    document.getElementsByClassName("bd-loaderv2")[0].remove();
    Utils.log("Startup", "Initializing Main Observer");
    this.initObserver();

    // Show loading errors
    if (settingsCookie["fork-ps-1"]) {
        Utils.log("Startup", "Collecting Startup Errors");
        this.showContentErrors({plugins: bdpluginErrors, themes: bdthemeErrors});
    }

    // if (!DataStore.getBDData(bbdVersion)) {
    //     BdApi.alert("BBD Updated!", ["Lots of things were fixed in this update like Public Servers, Minimal Mode, Dark Mode and 24 Hour Timestamps.", BdApi.React.createElement("br"), BdApi.React.createElement("br"), "Feel free to test them all out!"]);
    //     DataStore.setBDData(bbdVersion, true);
    // }
};

Core.prototype.checkForGuilds = function() {
    return new Promise(resolve => {
        const checkForGuilds = function() {
            const wrapper = BDV2.guildClasses.wrapper.split(" ")[0];
            const guild = BDV2.guildClasses.listItem.split(" ")[0];
            const blob = BDV2.guildClasses.blobContainer.split(" ")[0];
            if (document.querySelectorAll(`.${wrapper} .${guild} .${blob}`).length > 0) return resolve(bdConfig.deferLoaded = true);
            setTimeout(checkForGuilds, 100);
        };
        $(document).ready(function () {
            setTimeout(checkForGuilds, 100);
        });
    });
};

Core.prototype.injectExternals = async function() {
    await Utils.injectJs("https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.9/ace.js");
    if (require.original) window.require = require.original;
};

Core.prototype.initSettings = function () {
    DataStore.initialize();
    if (!DataStore.getSettingGroup("settings")) {
        settingsCookie = defaultCookie;
        this.saveSettings();
    }
    else {
        this.loadSettings();
        $("<style id=\"customcss\">").text(atob(DataStore.getBDData("bdcustomcss"))).appendTo(document.head);
        for (var setting in defaultCookie) {
            if (settingsCookie[setting] == undefined) {
                settingsCookie[setting] = defaultCookie[setting];
                this.saveSettings();
            }
        }
    }
};

Core.prototype.saveSettings = function () {
    DataStore.setSettingGroup("settings", settingsCookie);
};

Core.prototype.loadSettings = function () {
    settingsCookie = DataStore.getSettingGroup("settings");
};

Core.prototype.initObserver = function () {
    const mainObserver = new MutationObserver((mutations) => {

        for (let i = 0, mlen = mutations.length; i < mlen; i++) {
            let mutation = mutations[i];
            if (typeof pluginModule !== "undefined") pluginModule.rawObserver(mutation);

            // if there was nothing added, skip
            if (!mutation.addedNodes.length || !(mutation.addedNodes[0] instanceof Element)) continue;

            let node = mutation.addedNodes[0];

            if (node.classList.contains("layer-3QrUeG")) {
                if (node.getElementsByClassName("guild-settings-base-section").length) node.setAttribute("layer-id", "server-settings");

                if (node.getElementsByClassName("socialLinks-3jqNFy").length) {
                    node.setAttribute("layer-id", "user-settings");
                    node.setAttribute("id", "user-settings");
                    if (!document.getElementById("bd-settings-sidebar")) settingsPanel.renderSidebar();
                }
            }

            // Emoji Picker
            if (node.classList.contains("popout-3sVMXz") && !node.classList.contains("popoutLeft-30WmrD") && node.getElementsByClassName("emojiPicker-3m1S-j").length) quickEmoteMenu.obsCallback(node);

        }
    });

    mainObserver.observe(document, {
        childList: true,
        subtree: true
    });
};

Core.prototype.inject24Hour = function() {
    if (this.cancel24Hour) return;

    const twelveHour = new RegExp(`([0-9]{1,2}):([0-9]{1,2})\\s(AM|PM)`);
    const convert = (data) => {
        if (!settingsCookie["bda-gs-6"]) return;
        const matched = data.returnValue.match(twelveHour);
        if (!matched || matched.length !== 4) return;
        if (matched[3] === "AM") return data.returnValue = data.returnValue.replace(matched[0], `${matched[1] === "12" ? "00" : matched[1].padStart(2, "0")}:${matched[2]}`);
        return data.returnValue = data.returnValue.replace(matched[0], `${matched[1] === "12" ? "12" : parseInt(matched[1]) + 12}:${matched[2]}`);
    };


    const cancelCozy = Utils.monkeyPatch(BDV2.TimeFormatter, "calendarFormat", {after: convert}); // Called in Cozy mode
    const cancelCompact = Utils.monkeyPatch(BDV2.TimeFormatter, "dateFormat", {after: convert}); // Called in Compact mode
    this.cancel24Hour = () => {cancelCozy(); cancelCompact();}; // Cancel both
};

Core.prototype.injectColoredText = function() {
    if (this.cancelColoredText) return;

    this.cancelColoredText = Utils.monkeyPatch(BDV2.MessageContentComponent.prototype, "render", {after: (data) => {
        if (!settingsCookie["bda-gs-7"]) return;
		Utils.monkeyPatch(data.returnValue.props, "children", {silent: true, after: ({returnValue}) => {
			const markup = returnValue.props.children[1];
			const roleColor = data.thisObject.props.message.colorString;
			if (markup && roleColor) markup.props.style = {color: roleColor};
			return returnValue;
		}});
    }});
};

Core.prototype.removeColoredText = function() {
    document.querySelectorAll(".markup-2BOw-j").forEach(elem => {
        elem.style.setProperty("color", "");
    });
};

Core.prototype.alert = function(title, content) {
    let modal = $(`<div class="bd-modal-wrapper theme-dark">
                    <div class="bd-backdrop backdrop-1wrmKB"></div>
                    <div class="bd-modal modal-1UGdnR">
                        <div class="bd-modal-inner inner-1JeGVc">
                            <div class="header header-1R_AjF">
                                <div class="title">${title}</div>
                            </div>
                            <div class="bd-modal-body">
                                <div class="scroller-wrap fade">
                                    <div class="scroller">
                                        ${content}
                                    </div>
                                </div>
                            </div>
                            <div class="footer footer-2yfCgX">
                                <button type="button">Okay</button>
                            </div>
                        </div>
                    </div>
                </div>`);
    modal.find(".footer button").on("click", () => {
        modal.addClass("closing");
        setTimeout(() => { modal.remove(); }, 300);
    });
    modal.find(".bd-backdrop").on("click", () => {
        modal.addClass("closing");
        setTimeout(() => { modal.remove(); }, 300);
    });
    modal.appendTo("#app-mount");
};

Core.prototype.showContentErrors = function({plugins: pluginErrors = [], themes: themeErrors = []}) {
    if (!pluginErrors || !themeErrors) return;
    if (!pluginErrors.length && !themeErrors.length) return;
    let modal = $(`<div class="bd-modal-wrapper theme-dark">
                    <div class="bd-backdrop backdrop-1wrmKB"></div>
                    <div class="bd-modal bd-content-modal modal-1UGdnR">
                        <div class="bd-modal-inner inner-1JeGVc">
                            <div class="header header-1R_AjF"><div class="title">Content Errors</div></div>
                            <div class="bd-modal-body">
                                <div class="tab-bar-container">
                                    <div class="tab-bar TOP">
                                        <div class="tab-bar-item">Plugins</div>
                                        <div class="tab-bar-item">Themes</div>
                                    </div>
                                </div>
                                <div class="table-header">
                                    <div class="table-column column-name">Name</div>
                                    <div class="table-column column-message">Message</div>
                                    <div class="table-column column-error">Error</div>
                                </div>
                                <div class="scroller-wrap fade">
                                    <div class="scroller">

                                    </div>
                                </div>
                            </div>
                            <div class="footer footer-2yfCgX">
                                <button type="button">Okay</button>
                            </div>
                        </div>
                    </div>
                </div>`);

    function generateTab(errors) {
        let container = $(`<div class="errors">`);
        for (let err of errors) {
            let error = $(`<div class="error">
                                <div class="table-column column-name">${err.name ? err.name : err.file}</div>
                                <div class="table-column column-message">${err.message}</div>
                                <div class="table-column column-error"><a class="error-link" href="">${err.error ? err.error.message : ""}</a></div>
                            </div>`);
            container.append(error);
            if (err.error) {
                error.find("a").on("click", (e) => {
                    e.preventDefault();
                    Utils.err("ContentManager", `Error details for ${err.name ? err.name : err.file}.`, err.error);
                });
            }
        }
        return container;
    }

    let tabs = [generateTab(pluginErrors), generateTab(themeErrors)];

    modal.find(".tab-bar-item").on("click", (e) => {
        e.preventDefault();
        modal.find(".tab-bar-item").removeClass("selected");
        $(e.target).addClass("selected");
        modal.find(".scroller").empty().append(tabs[$(e.target).index()]);
    });

    modal.find(".footer button").on("click", () => {
        modal.addClass("closing");
        setTimeout(() => { modal.remove(); }, 300);
    });
    modal.find(".bd-backdrop").on("click", () => {
        modal.addClass("closing");
        setTimeout(() => { modal.remove(); }, 300);
    });
    modal.appendTo("#app-mount");
    if (pluginErrors.length) modal.find(".tab-bar-item")[0].click();
    else modal.find(".tab-bar-item")[1].click();
};

/**
 * This shows a toast similar to android towards the bottom of the screen.
 *
 * @param {string} content The string to show in the toast.
 * @param {object} options Options object. Optional parameter.
 * @param {string} options.type Changes the type of the toast stylistically and semantically. Choices: "", "info", "success", "danger"/"error", "warning"/"warn". Default: ""
 * @param {boolean} options.icon Determines whether the icon should show corresponding to the type. A toast without type will always have no icon. Default: true
 * @param {number} options.timeout Adjusts the time (in ms) the toast should be shown for before disappearing automatically. Default: 3000
 */
Core.prototype.showToast = function(content, options = {}) {
    if (!bdConfig.deferLoaded) return;
    if (!document.querySelector(".bd-toasts")) {
        let toastWrapper = document.createElement("div");
        toastWrapper.classList.add("bd-toasts");
        let boundingElement = document.querySelector(".chat-3bRxxu form, #friends, .noChannel-Z1DQK7, .activityFeed-28jde9");
        toastWrapper.style.setProperty("left", boundingElement ? boundingElement.getBoundingClientRect().left + "px" : "0px");
        toastWrapper.style.setProperty("width", boundingElement ? boundingElement.offsetWidth + "px" : "100%");
        toastWrapper.style.setProperty("bottom", (document.querySelector(".chat-3bRxxu form") ? document.querySelector(".chat-3bRxxu form").offsetHeight : 80) + "px");
        document.querySelector(".app, .app-2rEoOp").appendChild(toastWrapper);
    }
    const {type = "", icon = true, timeout = 3000} = options;
    let toastElem = document.createElement("div");
    toastElem.classList.add("bd-toast");
    if (type) toastElem.classList.add("toast-" + type);
    if (type && icon) toastElem.classList.add("icon");
    toastElem.innerText = content;
    document.querySelector(".bd-toasts").appendChild(toastElem);
    setTimeout(() => {
        toastElem.classList.add("closing");
        setTimeout(() => {
            toastElem.remove();
            if (!document.querySelectorAll(".bd-toasts .bd-toast").length) document.querySelector(".bd-toasts").remove();
        }, 300);
    }, timeout);
};


/* BetterDiscordApp EmoteModule JavaScript
 * Version: 1.5
 * Author: Jiiks | http://jiiks.net
 * Date: 26/08/2015 - 15:29
 * Last Update: 14/10/2015 - 09:48
 * https://github.com/Jiiks/BetterDiscordApp
 * Note: Due to conflicts autocapitalize only supports global emotes
 */

/*
 * =Changelog=
 * -v1.5
 * --Twitchemotes.com api
 */

window.emotesFfz = {};
window.emotesBTTV = {};
window.emotesBTTV2 = {};
window.emotesTwitch = {};
window.subEmotesTwitch = {};

window.bdEmotes = {
    TwitchGlobal: {},
    TwitchSubscriber: {},
    BTTV: {},
    FrankerFaceZ: {},
    BTTV2: {}
};

window.bdEmoteSettingIDs = {
    TwitchGlobal: "bda-es-7",
    TwitchSubscriber: "bda-es-7",
    BTTV: "bda-es-2",
    FrankerFaceZ: "bda-es-1",
    BTTV2: "bda-es-2"
};

function EmoteModule() {
    Object.defineProperty(this, "categories", {
        get: function() {
            const cats = [];
            for (const current in window.bdEmoteSettingIDs) {
                if (settingsCookie[window.bdEmoteSettingIDs[current]]) cats.push(current);
            }
            return cats;
        }
    });
}

EmoteModule.prototype.init = async function () {
    this.modifiers = ["flip", "spin", "pulse", "spin2", "spin3", "1spin", "2spin", "3spin", "tr", "bl", "br", "shake", "shake2", "shake3", "flap"];
    this.overrides = ["twitch", "bttv", "ffz"];

    let emoteInfo = {
        TwitchGlobal: {
            url: "https://twitchemotes.com/api_cache/v3/global.json",
            backup: `https://rauenzi.github.io/BetterDiscordApp/data/emotedata_twitch_global.json`,
            variable: "TwitchGlobal",
            oldVariable: "emotesTwitch",
            getEmoteURL: (e) => `https://static-cdn.jtvnw.net/emoticons/v1/${e.id}/1.0`,
            getOldData: (url, name) => { return {id: url.match(/\/([0-9]+)\//)[1], code: name, emoticon_set: 0, description: null}; }
        },
        TwitchSubscriber: {
            url: `https://rauenzi.github.io/BetterDiscordApp/data/emotedata_twitch_subscriber.json`,
            variable: "TwitchSubscriber",
            oldVariable: "subEmotesTwitch",
            getEmoteURL: (e) => `https://static-cdn.jtvnw.net/emoticons/v1/${e}/1.0`,
            getOldData: (url) => url.match(/\/([0-9]+)\//)[1]
        },
        FrankerFaceZ: {
            url: `https://rauenzi.github.io/BetterDiscordApp/data/emotedata_ffz.json`,
            variable: "FrankerFaceZ",
            oldVariable: "emotesFfz",
            getEmoteURL: (e) => `https://cdn.frankerfacez.com/emoticon/${e}/1`,
            getOldData: (url) => url.match(/\/([0-9]+)\//)[1]
        },
        BTTV: {
            url: "https://api.betterttv.net/emotes",
            variable: "BTTV",
            oldVariable: "emotesBTTV",
            parser: (data) => {
                let emotes = {};
                for (let e = 0, len = data.emotes.length; e < len; e++) {
                    let emote = data.emotes[e];
                    emotes[emote.regex] = emote.url;
                }
                return emotes;
            },
            getEmoteURL: (e) => `${e}`,
            getOldData: (url) => url
        },
        BTTV2: {
            url: `https://rauenzi.github.io/BetterDiscordApp/data/emotedata_bttv.json`,
            variable: "BTTV2",
            oldVariable: "emotesBTTV2",
            getEmoteURL: (e) => `https://cdn.betterttv.net/emote/${e}/1x`,
            getOldData: (url) => url.match(/emote\/(.+)\//)[1]
        }
    };

    await this.getBlacklist();
    await this.loadEmoteData(emoteInfo);

    while (!BDV2.MessageContentComponent) await new Promise(resolve => setTimeout(resolve, 100));

    if (this.cancelEmoteRender) return;
    this.cancelEmoteRender = Utils.monkeyPatch(BDV2.MessageContentComponent.prototype, "render", {after: ({returnValue}) => {
		Utils.monkeyPatch(returnValue.props, "children", {silent: true, after: ({returnValue}) => {
            if (this.categories.length == 0) return;
			const markup = returnValue.props.children[1];
			if (!markup.props.children) return;
			const nodes = markup.props.children[1];
			if (!nodes || !nodes.length) return;
			for (let n = 0; n < nodes.length; n++) {
				const node = nodes[n];
				if (typeof(node) !== "string") continue;
                const words = node.split(/([^\s]+)([\s]|$)/g);
				for (let c = 0, clen = this.categories.length; c < clen; c++) {
					for (let w = 0, wlen = words.length; w < wlen; w++) {
                        let emote = words[w];
						let emoteSplit = emote.split(":");
						let emoteName = emoteSplit[0];
						let emoteModifier = emoteSplit[1] ? emoteSplit[1] : "";
						let emoteOverride = emoteModifier.slice(0);

						if (emoteName.length < 4 || bemotes.includes(emoteName)) continue;
						if (!this.modifiers.includes(emoteModifier) || !settingsCookie["bda-es-8"]) emoteModifier = "";
						if (!this.overrides.includes(emoteOverride)) emoteOverride = "";
						else emoteModifier = emoteOverride;

						let current = this.categories[c];
						if (emoteOverride === "twitch") {
							if (window.bdEmotes.TwitchGlobal[emoteName]) current = "TwitchGlobal";
							else if (window.bdEmotes.TwitchSubscriber[emoteName]) current = "TwitchSubscriber";
						}
						else if (emoteOverride === "bttv") {
							if (window.bdEmotes.BTTV[emoteName]) current = "BTTV";
							else if (window.bdEmotes.BTTV2[emoteName]) current = "BTTV2";
						}
						else if (emoteOverride === "ffz") {
							if (window.bdEmotes.FrankerFaceZ[emoteName]) current = "FrankerFaceZ";
						}

						if (!window.bdEmotes[current][emoteName] || !settingsCookie[window.bdEmoteSettingIDs[current]]) continue;
						const results = nodes[n].match(new RegExp(`([\\s]|^)${Utils.escape(emoteModifier ? emoteName + ":" + emoteModifier : emoteName)}([\\s]|$)`));
                        if (!results) continue;
						const pre = nodes[n].substring(0, results.index + results[1].length);
						const post = nodes[n].substring(results.index + results[0].length - results[2].length);
						nodes[n] = pre;
						const emoteComponent = BDV2.react.createElement(BDEmote, {name: emoteName, url: window.bdEmotes[current][emoteName], modifier: emoteModifier});
						nodes.splice(n + 1, 0, post);
						nodes.splice(n + 1, 0, emoteComponent);
					}
				}
			}
			const onlyEmotes = nodes.every(r => {
				if (typeof(r) == "string" && r.replace(/\s*/, "") == "") return true;
				else if (r.type && r.type.name == "BDEmote") return true;
				else if (r.props && r.props.children && r.props.children.props && r.props.children.props.emojiName) return true;
				return false;
			});
			if (!onlyEmotes) return;

			for (let node of nodes) {
				if (typeof(node) != "object") continue;
				if (node.type.name == "BDEmote") node.props.jumboable = true;
				else if (node.props && node.props.children && node.props.children.props && node.props.children.props.emojiName) node.props.children.props.jumboable = true;
			}
		}});
    }});
};

EmoteModule.prototype.disable = function() {
    this.disableAutoCapitalize();
    if (this.cancelEmoteRender) return;
    this.cancelEmoteRender();
    this.cancelEmoteRender = null;
};

EmoteModule.prototype.clearEmoteData = async function() {
    let _fs = require("fs");
    let emoteFile = "emote_data.json";
    let file = bdConfig.dataPath + emoteFile;
    let exists = _fs.existsSync(file);
    if (exists) _fs.unlinkSync(file);
    DataStore.setBDData("emoteCacheDate", (new Date()).toJSON());

    window.bdEmotes = {
        TwitchGlobal: {},
        TwitchSubscriber: {},
        BTTV: {},
        FrankerFaceZ: {},
        BTTV2: {}
    };
};

EmoteModule.prototype.goBack = async function(emoteInfo) {
    for (let e in emoteInfo) {
        for (let emote in window.bdEmotes[emoteInfo[e].variable]) {
            window[emoteInfo[e].oldVariable][emote] = emoteInfo[e].getOldData(window.bdEmotes[emoteInfo[e].variable][emote], emote);
        }
    }
};

EmoteModule.prototype.isCacheValid = function() {
    const cacheLength = DataStore.getBDData("emoteCacheDays") || DataStore.setBDData("emoteCacheDays", 7) || 7;
    const cacheDate = new Date(DataStore.getBDData("emoteCacheDate") || null);
    const currentDate = new Date();
    const daysBetween = Math.round(Math.abs((currentDate.getTime() - cacheDate.getTime()) / (24 * 60 * 60 * 1000)));
    if (daysBetween > cacheLength) {
        DataStore.setBDData("emoteCacheDate", currentDate.toJSON());
        return false;
    }
    return true;
};

EmoteModule.prototype.loadEmoteData = async function(emoteInfo) {
    const _fs = require("fs");
    const emoteFile = "emote_data.json";
    const file = bdConfig.dataPath + emoteFile;
    const exists = _fs.existsSync(file);

    if (exists && this.isCacheValid()) {
        if (settingsCookie["fork-ps-2"]) mainCore.showToast("Loading emotes from cache.", {type: "info"});
        Utils.log("Emotes", "Loading emotes from local cache.");

        const data = await new Promise(resolve => {
            _fs.readFile(file, "utf8", (err, data) => {
                Utils.log("Emotes", "Emotes loaded from cache.");
                if (err) data = {};
                resolve(data);
            });
        });

        let isValid = Utils.testJSON(data);
        if (isValid) window.bdEmotes = JSON.parse(data);

        for (const e in emoteInfo) {
            isValid = Object.keys(window.bdEmotes[emoteInfo[e].variable]).length > 0;
        }

        if (isValid) {
            if (settingsCookie["fork-ps-2"]) mainCore.showToast("Emotes successfully loaded.", {type: "success"});
            return;
        }

        Utils.log("Emotes", "Cache was corrupt, downloading...");
        _fs.unlinkSync(file);
    }

    if (!settingsCookie["fork-es-3"]) return;
    if (settingsCookie["fork-ps-2"]) mainCore.showToast("Downloading emotes in the background do not reload.", {type: "info"});

    for (let e in emoteInfo) {
        await new Promise(r => setTimeout(r, 1000));
        let data = await this.downloadEmotes(emoteInfo[e]);
        window.bdEmotes[emoteInfo[e].variable] = data;
    }

    if (settingsCookie["fork-ps-2"]) mainCore.showToast("All emotes successfully downloaded.", {type: "success"});

    try { _fs.writeFileSync(file, JSON.stringify(window.bdEmotes), "utf8"); }
    catch (err) { Utils.err("Emotes", "Could not save emote data.", err); }
};

EmoteModule.prototype.downloadEmotes = function(emoteMeta) {
    let request = require("request");
    let options = {
        url: emoteMeta.url,
        timeout: emoteMeta.timeout ? emoteMeta.timeout : 5000
    };

    Utils.log("Emotes", `Downloading: ${emoteMeta.variable} (${emoteMeta.url})`);

    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (error) {
                Utils.err("Emotes", "Could not download " + emoteMeta.variable, error);
                if (emoteMeta.backup) {
                    emoteMeta.url = emoteMeta.backup;
                    emoteMeta.backup = null;
                    if (emoteMeta.backupParser) emoteMeta.parser = emoteMeta.backupParser;
                    return resolve(this.downloadEmotes(emoteMeta));
                }
                return reject({});
            }

            let parsedData = {};
            try {
                parsedData = JSON.parse(body);
            }
            catch (err) {
                Utils.err("Emotes", "Could not download " + emoteMeta.variable, err);
                if (emoteMeta.backup) {
                    emoteMeta.url = emoteMeta.backup;
                    emoteMeta.backup = null;
                    if (emoteMeta.backupParser) emoteMeta.parser = emoteMeta.backupParser;
                    return resolve(this.downloadEmotes(emoteMeta));
                }
                return reject({});
            }
            if (typeof(emoteMeta.parser) === "function") parsedData = emoteMeta.parser(parsedData);

            for (let emote in parsedData) {
                if (emote.length < 4 || bemotes.includes(emote)) {
                    delete parsedData[emote];
                    continue;
                }
                parsedData[emote] = emoteMeta.getEmoteURL(parsedData[emote]);
            }
            resolve(parsedData);
            Utils.log("Emotes", "Downloaded: " + emoteMeta.variable);
        });
    });
};

EmoteModule.prototype.getBlacklist = function () {
    return new Promise(resolve => {
        $.getJSON(`https://rauenzi.github.io/BetterDiscordApp/data/emotefilter.json`, function (data) {
            resolve(bemotes = data.blacklist);
        });
    });
};

var bemotes = [];

EmoteModule.prototype.autoCapitalize = function () {
    if (!settingsCookie["bda-es-4"] || this.autoCapitalizeActive) return;
    $("body").on("keyup.bdac change.bdac paste.bdac", $(".channelTextArea-1LDbYG textarea:first"), () => {
        var text = $(".channelTextArea-1LDbYG textarea:first").val();
        if (text == undefined) return;

        var lastWord = text.split(" ").pop();
        if (lastWord.length > 3) {
            if (lastWord == "danSgame") return;
            var ret = this.capitalize(lastWord.toLowerCase());
            if (ret !== null && ret !== undefined) {
                Utils.insertText(Utils.getTextArea()[0], text.replace(lastWord, ret));
            }
        }
    });
    this.autoCapitalizeActive = true;
};

EmoteModule.prototype.capitalize = function (value) {
    var res = window.bdEmotes.TwitchGlobal;
    for (var p in res) {
        if (res.hasOwnProperty(p) && value == (p + "").toLowerCase()) {
            return p;
        }
    }
};

EmoteModule.prototype.disableAutoCapitalize = function() {
    this.autoCapitalizeActive = false;
    $("body").off(".bdac");
};

/* BetterDiscordApp QuickEmoteMenu JavaScript
 * Version: 1.3
 * Author: Jiiks | http://jiiks.net
 * Date: 26/08/2015 - 11:49
 * Last Update: 29/08/2015 - 11:46
 * https://github.com/Jiiks/BetterDiscordApp
 */

function QuickEmoteMenu() {

}

QuickEmoteMenu.prototype.init = function() {
    this.initialized = true;
    $(document).on("mousedown", function(e) {
        if (e.target.id != "rmenu") $("#rmenu").remove();
    });
    this.favoriteEmotes = {};
    var fe = DataStore.getBDData("bdfavemotes");
    if (fe !== "" && fe !== null) {
        this.favoriteEmotes = JSON.parse(atob(fe));
    }

    var qmeHeader = "";
    qmeHeader += "<div id=\"bda-qem\">";
    qmeHeader += "    <button class=\"active\" id=\"bda-qem-twitch\" onclick='quickEmoteMenu.switchHandler(this); return false;'>Twitch</button>";
    qmeHeader += "    <button id=\"bda-qem-favourite\" onclick='quickEmoteMenu.switchHandler(this); return false;'>Favourite</button>";
    qmeHeader += "    <button id=\"bda-qem-emojis\" onclick='quickEmoteMenu.switchHandler(this); return false;'>Emojis</buttond>";
    qmeHeader += "</div>";
    this.qmeHeader = qmeHeader;

    var teContainer = "";
    teContainer += "<div id=\"bda-qem-twitch-container\">";
    teContainer += "    <div class=\"scroller-wrap scrollerWrap-2lJEkd fade\">";
    teContainer += "        <div class=\"scroller scroller-2FKFPG\">";
    teContainer += "            <div class=\"emote-menu-inner\">";
    var url = "";
    for (let emote in window.bdEmotes.TwitchGlobal) {
        if (window.bdEmotes.TwitchGlobal.hasOwnProperty(emote)) {
            url = window.bdEmotes.TwitchGlobal[emote];
            teContainer += "<div class=\"emote-container\">";
            teContainer += "    <img class=\"emote-icon\" alt=\"\" src=\"" + url + "\" title=\"" + emote + "\">";
            teContainer += "    </img>";
            teContainer += "</div>";
        }
    }
    teContainer += "            </div>";
    teContainer += "        </div>";
    teContainer += "    </div>";
    teContainer += "</div>";
    this.teContainer = teContainer;

    var faContainer = "";
    faContainer += "<div id=\"bda-qem-favourite-container\">";
    faContainer += "    <div class=\"scroller-wrap scrollerWrap-2lJEkd fade\">";
    faContainer += "        <div class=\"scroller scroller-2FKFPG\">";
    faContainer += "            <div class=\"emote-menu-inner\">";
    for (let emote in this.favoriteEmotes) {
        url = this.favoriteEmotes[emote];
        faContainer += "<div class=\"emote-container\">";
        faContainer += "    <img class=\"emote-icon\" alt=\"\" src=\"" + url + "\" title=\"" + emote + "\" oncontextmenu='quickEmoteMenu.favContext(event, this);'>";
        faContainer += "    </img>";
        faContainer += "</div>";
    }
    faContainer += "            </div>";
    faContainer += "        </div>";
    faContainer += "    </div>";
    faContainer += "</div>";
    this.faContainer = faContainer;
};

QuickEmoteMenu.prototype.favContext = function(e, em) {
    e.stopPropagation();
    var menu = $("<div>", {"id": "removemenu", "data-emoteid": $(em).prop("title"), "text": "Remove", "class": "bd-context-menu context-menu theme-dark"});
    menu.css({
        top: e.pageY - $("#bda-qem-favourite-container").offset().top,
        left: e.pageX - $("#bda-qem-favourite-container").offset().left
    });
    $(em).parent().append(menu);
    menu.on("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).remove();

        delete quickEmoteMenu.favoriteEmotes[$(this).data("emoteid")];
        quickEmoteMenu.updateFavorites();
        return false;
    });
    return false;
};

QuickEmoteMenu.prototype.switchHandler = function(e) {
    this.switchQem($(e).attr("id"));
};

QuickEmoteMenu.prototype.switchQem = function(id) {
    var twitch = $("#bda-qem-twitch");
    var fav = $("#bda-qem-favourite");
    var emojis = $("#bda-qem-emojis");
    twitch.removeClass("active");
    fav.removeClass("active");
    emojis.removeClass("active");

    $(".emojiPicker-3m1S-j").hide();
    $("#bda-qem-favourite-container").hide();
    $("#bda-qem-twitch-container").hide();

    switch (id) {
        case "bda-qem-twitch":
            twitch.addClass("active");
            $("#bda-qem-twitch-container").show();
        break;
        case "bda-qem-favourite":
            fav.addClass("active");
            $("#bda-qem-favourite-container").show();
        break;
        case "bda-qem-emojis":
            emojis.addClass("active");
            $(".emojiPicker-3m1S-j").show();
            $(".emojiPicker-3m1S-j .search-bar-inner input, .emojiPicker-3m1S-j .search-bar-inner input").focus();
        break;
    }
    this.lastTab = id;

    var emoteIcon = $(".emote-icon");
    emoteIcon.off();
    emoteIcon.on("click", function () {
        var emote = $(this).attr("title");
        var ta = Utils.getTextArea();
        Utils.insertText(ta[0], ta.val().slice(-1) == " " ? ta.val() + emote : ta.val() + " " + emote);
    });
};

QuickEmoteMenu.prototype.obsCallback = function (elem) {
    if (!this.initialized) return;
    var e = $(elem);
    if (!settingsCookie["bda-es-9"]) {
        e.addClass("bda-qme-hidden");
    }
    else {
        e.removeClass("bda-qme-hidden");
    }

    if (!settingsCookie["bda-es-0"]) return;

    e.prepend(this.qmeHeader);
    e.append(this.teContainer);
    e.append(this.faContainer);

    if (this.lastTab == undefined) {
        this.lastTab = "bda-qem-emojis";
    }
    this.switchQem(this.lastTab);
};

QuickEmoteMenu.prototype.favorite = function (name, url) {

    if (!this.favoriteEmotes.hasOwnProperty(name)) {
        this.favoriteEmotes[name] = url;
    }

    this.updateFavorites();
};

QuickEmoteMenu.prototype.updateFavorites = function () {

    var faContainer = "";
    faContainer += "<div id=\"bda-qem-favourite-container\">";
    faContainer += "    <div class=\"scroller-wrap scrollerWrap-2lJEkd fade\">";
    faContainer += "        <div class=\"scroller scroller-2FKFPG\">";
    faContainer += "            <div class=\"emote-menu-inner\">";
    for (var emote in this.favoriteEmotes) {
        var url = this.favoriteEmotes[emote];
        faContainer += "<div class=\"emote-container\">";
        faContainer += "    <img class=\"emote-icon\" alt=\"\" src=\"" + url + "\" title=\"" + emote + "\" oncontextmenu=\"quickEmoteMenu.favContext(event, this);\">";
        faContainer += "    </img>";
        faContainer += "</div>";
    }
    faContainer += "            </div>";
    faContainer += "        </div>";
    faContainer += "    </div>";
    faContainer += "</div>";
    this.faContainer = faContainer;

    $("#bda-qem-favourite-container").replaceWith(faContainer);
    DataStore.setBDData("bdfavemotes", btoa(JSON.stringify(this.favoriteEmotes)));
};



/* BetterDiscordApp Utilities JavaScript
 * Version:2.0.0
 * Author: Jiiks | http://jiiks.net
 * Date: 26/08/2015 - 15:54
 * https://github.com/Jiiks/BetterDiscordApp
 */
var Utils = class {
    /** Document/window width */
    static get screenWidth() { return Math.max(document.documentElement.clientWidth, window.innerWidth || 0); }
    /** Document/window height */
    static get screenHeight() { return Math.max(document.documentElement.clientHeight, window.innerHeight || 0); }

    static stripBOM(content) {
        if (content.charCodeAt(0) === 0xFEFF) {
            content = content.slice(1);
        }
        return content;
    }

    static getTextArea() {
        return $(".channelTextArea-1LDbYG textarea");
    }

    static insertText(textarea, text) {
        textarea.focus();
        textarea.selectionStart = 0;
        textarea.selectionEnd = textarea.value.length;
        document.execCommand("insertText", false, text);
    }

    static injectCss(uri) {
        $("<link/>", {
            type: "text/css",
            rel: "stylesheet",
            href: uri
        }).appendTo($("head"));
    }

    static injectJs(uri) {
        return new Promise(resolve => {
            $("<script/>", {
                type: "text/javascript",
                src: uri,
                onload: resolve
            }).appendTo($("body"));
        });
    }

    static escapeID(id) {
        return id.replace(/^[^a-z]+|[^\w-]+/gi, "");
    }

    static log(moduleName, message) {
        console.log(`%c[BandagedBD]%c [${moduleName}]%c ${message}`, "color: #3a71c1; font-weight: 700;", "color: #3a71c1;", "");
    }

    static warn(moduleName, message) {
        console.warn(`%c[BandagedBD]%c [${moduleName}]%c ${message}`, "color: #E8A400; font-weight: 700;", "color: #E8A400;", "");
    }

    static err(moduleName, message, error) {
        console.log(`%c[BandagedBD]%c [${moduleName}]%c ${message}`, "color: red; font-weight: 700;", "color: red;", "");
        if (error) {
            console.groupCollapsed("%cError: " + error.message, "color: red;");
            console.error(error.stack);
            console.groupEnd();
        }
    }

    static escape(s) {
        return s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    }

    static testJSON(data) {
        try {
            JSON.parse(data);
            return true;
        }
        catch (err) {
            return false;
        }
    }

    static suppressErrors(method, message) {
        return (...params) => {
            try { return method(...params);	}
            catch (e) { this.err("SuppressedError", "Error occurred in " + message, e); }
        };
    }

    static monkeyPatch(what, methodName, options) {
        const {before, after, instead, once = false, silent = false, force = false} = options;
        const displayName = options.displayName || what.displayName || what.name || what.constructor.displayName || what.constructor.name;
        if (!silent) console.log("patch", methodName, "of", displayName); // eslint-disable-line no-console
        if (!what[methodName]) {
            if (force) what[methodName] = function() {};
            else return console.error(methodName, "does not exist for", displayName); // eslint-disable-line no-console
        }
        const origMethod = what[methodName];
        const cancel = () => {
            if (!silent) console.log("unpatch", methodName, "of", displayName); // eslint-disable-line no-console
            what[methodName] = origMethod;
        };
        what[methodName] = function() {
            const data = {
                thisObject: this,
                methodArguments: arguments,
                cancelPatch: cancel,
                originalMethod: origMethod,
                callOriginalMethod: () => data.returnValue = data.originalMethod.apply(data.thisObject, data.methodArguments)
            };
            if (instead) {
                const tempRet = Utils.suppressErrors(instead, "`instead` callback of " + what[methodName].displayName)(data);
                if (tempRet !== undefined) data.returnValue = tempRet;
            }
            else {
                if (before) Utils.suppressErrors(before, "`before` callback of " + what[methodName].displayName)(data);
                data.callOriginalMethod();
                if (after) Utils.suppressErrors(after, "`after` callback of " + what[methodName].displayName)(data);
            }
            if (once) cancel();
            return data.returnValue;
        };
        what[methodName].__monkeyPatched = true;
        if (!what[methodName].__originalMethod) what[methodName].__originalMethod = origMethod;
        what[methodName].displayName = "patched " + (what[methodName].displayName || methodName);
        return cancel;
    }

    static onRemoved(node, callback) {
        const observer = new MutationObserver((mutations) => {
            for (let m = 0; m < mutations.length; m++) {
                const mutation = mutations[m];
                const nodes = Array.from(mutation.removedNodes);
                const directMatch = nodes.indexOf(node) > -1;
                const parentMatch = nodes.some(parent => parent.contains(node));
                if (directMatch || parentMatch) {
                    observer.disconnect();
                    callback();
                }
            }
        });

        observer.observe(document.body, {subtree: true, childList: true});
    }
};



/* BetterDiscordApp VoiceMode JavaScript
 * Version: 1.0
 * Author: Jiiks | http://jiiks.net
 * Date: 25/10/2015 - 19:10
 * https://github.com/Jiiks/BetterDiscordApp
 */

function VoiceMode() {

}

VoiceMode.prototype.enable = function () {
    $(".scroller.guild-channels ul").first().css("display", "none");
    $(".scroller.guild-channels header").first().css("display", "none");
    $(".app.flex-vertical, .app-2rEoOp").first().css("overflow", "hidden");
    $(".chat-3bRxxu").first().css("visibility", "hidden").css("min-width", "0px");
    $(".flex-vertical.channels-wrap").first().css("flex-grow", "100000");
    $(".guild-header .btn.btn-hamburger").first().css("visibility", "hidden");
};

VoiceMode.prototype.disable = function () {
    $(".scroller.guild-channels ul").first().css("display", "");
    $(".scroller.guild-channels header").first().css("display", "");
    $(".app.flex-vertical, .app-2rEoOp").first().css("overflow", "");
    $(".chat-3bRxxu").first().css("visibility", "").css("min-width", "");
    $(".flex-vertical.channels-wrap").first().css("flex-grow", "");
    $(".guild-header .btn.btn-hamburger").first().css("visibility", "");
};




// e.remote.app.getAppPath()
// path = require("path")
// require("path").resolve(require("electron").remote.app.getAppPath(), "node_modules", "request", "index.js");
window.bdthemes = {};
window.bdplugins = {};
var ContentManager = (() => {
    const path = require("path");
    const fs = require("fs");
    const Module = require("module").Module;
    Module.globalPaths.push(path.resolve(require("electron").remote.app.getAppPath(), "node_modules"));
    class MetaError extends Error {
        constructor(message) {
            super(message);
            this.name = "MetaError";
        }
    }
    const originalJSRequire = Module._extensions[".js"];
    const originalCSSRequire = Module._extensions[".css"] ? Module._extensions[".css"] : () => {return null;};



    return new class ContentManager {

        constructor() {
            this.timeCache = {};
            this.watchers = {};
            Module._extensions[".js"] = this.getContentRequire("plugin");
            Module._extensions[".css"] = this.getContentRequire("theme");
        }

        get pluginsFolder() {return this._pluginsFolder || (this._pluginsFolder = fs.realpathSync(path.resolve(bdConfig.dataPath + "plugins/")));}
        get themesFolder() {return this._themesFolder || (this._themesFolder = fs.realpathSync(path.resolve(bdConfig.dataPath + "themes/")));}

        watchContent(contentType) {
            if (this.watchers[contentType]) return;
            const isPlugin = contentType === "plugin";
            const baseFolder = isPlugin ? this.pluginsFolder : this.themesFolder;
            const fileEnding = isPlugin ? ".plugin.js" : ".theme.css";
            this.watchers[contentType] = fs.watch(baseFolder, {persistent: false}, async (eventType, filename) => {
                if (!eventType || !filename || !filename.endsWith(fileEnding)) return;
                await new Promise(r => setTimeout(r, 50));
                try {fs.statSync(path.resolve(baseFolder, filename));}
                catch (err) {
                    if (err.code !== "ENOENT") return;
                    delete this.timeCache[filename];
                    if (isPlugin) return pluginModule.unloadPlugin(filename);
                    return themeModule.unloadTheme(filename);
                }
                if (!fs.statSync(path.resolve(baseFolder, filename)).isFile()) return;
                const stats = fs.statSync(path.resolve(baseFolder, filename));
                if (!stats || !stats.mtime || !stats.mtime.getTime()) return;
                if (typeof(stats.mtime.getTime()) !== "number") return;
                if (this.timeCache[filename] == stats.mtime.getTime()) return;
                this.timeCache[filename] = stats.mtime.getTime();
                if (eventType == "rename") {
                    if (isPlugin) pluginModule.loadPlugin(filename);
                    else themeModule.loadTheme(filename);
                }
                if (eventType == "change") {
                    if (isPlugin) pluginModule.reloadPlugin(filename);
                    else themeModule.reloadTheme(filename);
                }
            });
        }

        unwatchContent(contentType) {
            if (!this.watchers[contentType]) return;
            this.watchers[contentType].close();
            delete this.watchers[contentType];
        }

        extractMeta(content) {
            const meta = content.split("\n")[0];
            const rawMeta = meta.substring(meta.lastIndexOf("//META") + 6, meta.lastIndexOf("*//"));
            if (meta.indexOf("META") < 0) throw new MetaError("META was not found.");
            if (!Utils.testJSON(rawMeta)) throw new MetaError("META could not be parsed.");

            const parsed = JSON.parse(rawMeta);
            if (!parsed.name) throw new MetaError("META missing name data.");
            return parsed;
        }

        getContentRequire(type) {
            const isPlugin = type === "plugin";
            const self = this;
            const originalRequire = isPlugin ? originalJSRequire : originalCSSRequire;
            return function(module, filename) {
                const baseFolder = isPlugin ? self.pluginsFolder : self.themesFolder;
                const possiblePath = path.resolve(baseFolder, path.basename(filename));
                if (!fs.existsSync(possiblePath) || filename !== fs.realpathSync(possiblePath)) return Reflect.apply(originalRequire, this, arguments);
                let content = fs.readFileSync(filename, "utf8");
                content = Utils.stripBOM(content);

                const meta = self.extractMeta(content);
                meta.filename = path.basename(filename);
                if (!isPlugin) {
                    meta.css = content.split("\n").slice(1).join("\n");
                    content = `module.exports = ${JSON.stringify(meta)};`;
                }
                if (isPlugin) {
                    content += `\nmodule.exports = ${JSON.stringify(meta)};\nmodule.exports.type = ${meta.name};`;
                }
                module._compile(content, filename);
            };
        }

        makePlaceholderPlugin(data) {
            return {plugin: {
                    start: () => {},
                    getName: () => {return data.name || data.filename;},
                    getAuthor: () => {return "???";},
                    getDescription: () => {return data.message ? data.message : "This plugin was unable to be loaded. Check the author's page for updates.";},
                    getVersion: () => {return "???";}
                },
                name: data.name || data.filename,
                filename: data.filename,
                source: data.source ? data.source : "",
                website: data.website ? data.website : ""
            };
        }

        loadContent(filename, type) {
            if (typeof(filename) === "undefined" || typeof(type) === "undefined") return;
            const isPlugin = type === "plugin";
            const baseFolder = isPlugin ? this.pluginsFolder : this.themesFolder;
            try {require(path.resolve(baseFolder, filename));}
            catch (error) {return {name: filename, file: filename, message: "Could not be compiled.", error: {message: error.message, stack: error.stack}};}
            const content = require(path.resolve(baseFolder, filename));
            if (isPlugin) {
                if (!content.type) return;
                try {
                    content.plugin = new content.type();
                    delete bdplugins[content.plugin.getName()];
                    bdplugins[content.plugin.getName()] = content;
                }
                catch (error) {return {name: filename, file: filename, message: "Could not be constructed.", error: {message: error.message, stack: error.stack}};}
            }
            else {
                delete bdthemes[content.name];
                bdthemes[content.name] = content;
            }
        }

        unloadContent(filename, type) {
            if (typeof(filename) === "undefined" || typeof(type) === "undefined") return;
            const isPlugin = type === "plugin";
            const baseFolder = isPlugin ? this.pluginsFolder : this.themesFolder;
            try {
                delete require.cache[require.resolve(path.resolve(baseFolder, filename))];
            }
            catch (err) {return {name: filename, file: filename, message: "Could not be unloaded.", error: {message: err.message, stack: err.stack}};}
        }

        isLoaded(filename, type) {
            const isPlugin = type === "plugin";
            const baseFolder = isPlugin ? this.pluginsFolder : this.themesFolder;
            try {require.cache[require.resolve(path.resolve(baseFolder, filename))];}
            catch (err) {return false;}
            return true;
        }

        reloadContent(filename, type) {
            const cantUnload = this.unloadContent(filename, type);
            if (cantUnload) return cantUnload;
            return this.loadContent(filename, type);
        }

        loadNewContent(type) {
            const isPlugin = type === "plugin";
            const fileEnding = isPlugin ? ".plugin.js" : ".theme.css";
            const basedir = isPlugin ? this.pluginsFolder : this.themesFolder;
            const files = fs.readdirSync(basedir);
            const contentList = Object.values(isPlugin ? bdplugins : bdthemes);
            const removed = contentList.filter(t => !files.includes(t.filename)).map(c => isPlugin ? c.plugin.getName() : c.name);
            const added = files.filter(f => !contentList.find(t => t.filename == f) && f.endsWith(fileEnding) && fs.statSync(path.resolve(basedir, f)).isFile());
            return {added, removed};
        }

        loadAllContent(type) {
            const isPlugin = type === "plugin";
            const fileEnding = isPlugin ? ".plugin.js" : ".theme.css";
            const basedir = isPlugin ? this.pluginsFolder : this.themesFolder;
            const errors = [];
            const files = fs.readdirSync(basedir);

            for (const filename of files) {
                if (!fs.statSync(path.resolve(basedir, filename)).isFile() || !filename.endsWith(fileEnding)) continue;
                const error = this.loadContent(filename, type);
                if (error) errors.push(error);
            }

            return errors;
        }

        loadPlugins() {return this.loadAllContent("plugin");}
        loadThemes() {return this.loadAllContent("theme");}
    };
})();
/* BetterDiscordApp PluginModule JavaScript
 * Version: 1.0
 * Author: Jiiks | http://jiiks.net
 * Date: 16/12/2015
 * https://github.com/Jiiks/BetterDiscordApp
 */

var pluginCookie = {};

function PluginModule() {

}

PluginModule.prototype.loadPlugins = function () {
    this.loadPluginData();
    bdpluginErrors = ContentManager.loadPlugins();
    var plugins = Object.keys(bdplugins);
    for (var i = 0; i < plugins.length; i++) {
        var plugin, name;

        try {
            plugin = bdplugins[plugins[i]].plugin;
            name = plugin.getName();
            if (plugin.load && typeof(plugin.load) == "function") plugin.load();
        }
        catch (err) {
            pluginCookie[name] = false;
            Utils.err("Plugins", name + " could not be loaded.", err);
            bdpluginErrors.push({name: name, file: bdplugins[plugins[i]].filename, message: "load() could not be fired.", error: {message: err.message, stack: err.stack}});
            continue;
        }

        if (!pluginCookie[name]) pluginCookie[name] = false;

        if (pluginCookie[name]) {
            try {
                plugin.start();
                if (settingsCookie["fork-ps-2"]) mainCore.showToast(`${plugin.getName()} v${plugin.getVersion()} has started.`);
            }
            catch (err) {
                pluginCookie[name] = false;
                Utils.err("Plugins", name + " could not be started.", err);
                bdpluginErrors.push({name: name, file: bdplugins[plugins[i]].filename, message: "start() could not be fired.", error: {message: err.message, stack: err.stack}});
            }
        }
    }
    this.savePluginData();

    require("electron").remote.getCurrentWebContents().on("did-navigate-in-page", this.channelSwitch.bind(this));
    // if (settingsCookie["fork-ps-5"]) ContentManager.watchContent("plugin");
};

PluginModule.prototype.startPlugin = function(plugin, reload = false) {
    try {
        bdplugins[plugin].plugin.start();
        if (settingsCookie["fork-ps-2"] && !reload) mainCore.showToast(`${bdplugins[plugin].plugin.getName()} v${bdplugins[plugin].plugin.getVersion()} has started.`);
    }
    catch (err) {
        if (settingsCookie["fork-ps-2"] && !reload) mainCore.showToast(`${bdplugins[plugin].plugin.getName()} v${bdplugins[plugin].plugin.getVersion()} could not be started.`, {type: "error"});
        pluginCookie[plugin] = false;
        this.savePluginData();
        Utils.err("Plugins", name + " could not be started.", err);
    }
};

PluginModule.prototype.stopPlugin = function(plugin, reload = false) {
    try {
        bdplugins[plugin].plugin.stop();
        if (settingsCookie["fork-ps-2"] && !reload) mainCore.showToast(`${bdplugins[plugin].plugin.getName()} v${bdplugins[plugin].plugin.getVersion()} has stopped.`);
    }
    catch (err) {
        if (settingsCookie["fork-ps-2"] && !reload) mainCore.showToast(`${bdplugins[plugin].plugin.getName()} v${bdplugins[plugin].plugin.getVersion()} could not be stopped.`, {type: "error"});
        Utils.err("Plugins", bdplugins[plugin].plugin.getName() + " could not be stopped.", err);
    }
};

PluginModule.prototype.enablePlugin = function (plugin, reload = false) {
    if (pluginCookie[plugin]) return;
    pluginCookie[plugin] = true;
    this.savePluginData();
    this.startPlugin(plugin, reload);
};

PluginModule.prototype.disablePlugin = function (plugin, reload = false) {
    if (!pluginCookie[plugin]) return;
    pluginCookie[plugin] = false;
    this.savePluginData();
    this.stopPlugin(plugin, reload);
};

PluginModule.prototype.togglePlugin = function (plugin) {
    if (pluginCookie[plugin]) this.disablePlugin(plugin);
    else this.enablePlugin(plugin);
};

PluginModule.prototype.loadPlugin = function(filename) {
    const error = ContentManager.loadContent(filename, "plugin");
    if (error) {
        if (settingsCookie["fork-ps-1"]) mainCore.showContentErrors({plugins: [error]});
        if (settingsCookie["fork-ps-2"]) BdApi.showToast(`${filename} could not be loaded.`, {type: "error"});
        return Utils.err("ContentManager", `${filename} could not be loaded.`, error);
    }
    const plugin = Object.values(bdplugins).find(p => p.filename == filename).plugin;
    try { if (plugin.load && typeof(plugin.load) == "function") plugin.load();}
    catch (err) {if (settingsCookie["fork-ps-1"]) mainCore.showContentErrors({plugins: [err]});}
    Utils.log("ContentManager", `${plugin.getName()} v${plugin.getVersion()} was loaded.`);
    if (settingsCookie["fork-ps-2"]) BdApi.showToast(`${plugin.getName()} v${plugin.getVersion()} was loaded.`, {type: "success"});
    BDEvents.dispatch("plugin-loaded", plugin.getName());
};

PluginModule.prototype.unloadPlugin = function(filenameOrName) {
    const bdplugin = Object.values(bdplugins).find(p => p.filename == filenameOrName) || bdplugins[filenameOrName];
    if (!bdplugin) return;
    const plugin = bdplugin.plugin.getName();
    if (pluginCookie[plugin]) this.disablePlugin(plugin, true);
    const error = ContentManager.unloadContent(bdplugins[plugin].filename, "plugin");
    delete bdplugins[plugin];
    if (error) {
        if (settingsCookie["fork-ps-1"]) mainCore.showContentErrors({plugins: [error]});
        if (settingsCookie["fork-ps-2"]) BdApi.showToast(`${plugin} could not be unloaded. It may have not been loaded yet.`, {type: "error"});
        return Utils.err("ContentManager", `${plugin} could not be unloaded. It may have not been loaded yet.`, error);
    }
    Utils.log("ContentManager", `${plugin} was unloaded.`);
    if (settingsCookie["fork-ps-2"]) BdApi.showToast(`${plugin} was unloaded.`, {type: "success"});
    BDEvents.dispatch("plugin-unloaded", plugin);
};

PluginModule.prototype.reloadPlugin = function(filenameOrName) {
    const bdplugin = Object.values(bdplugins).find(p => p.filename == filenameOrName) || bdplugins[filenameOrName];
    if (!bdplugin) return this.loadPlugin(filenameOrName);
    const plugin = bdplugin.plugin.getName();
    const enabled = pluginCookie[plugin];
    if (enabled) this.stopPlugin(plugin, true);
    const error = ContentManager.reloadContent(bdplugins[plugin].filename, "plugin");
    if (error) {
        if (settingsCookie["fork-ps-1"]) mainCore.showContentErrors({plugins: [error]});
        if (settingsCookie["fork-ps-2"]) BdApi.showToast(`${plugin} could not be reloaded.`, {type: "error"});
        return Utils.err("ContentManager", `${plugin} could not be reloaded.`, error);
    }
    if (bdplugins[plugin].plugin.load && typeof(bdplugins[plugin].plugin.load) == "function") bdplugins[plugin].plugin.load();
    if (enabled) this.startPlugin(plugin, true);
    Utils.log("ContentManager", `${plugin} v${bdplugins[plugin].plugin.getVersion()} was reloaded.`);
    if (settingsCookie["fork-ps-2"]) BdApi.showToast(`${plugin} v${bdplugins[plugin].plugin.getVersion()} was reloaded.`, {type: "success"});
    BDEvents.dispatch("plugin-reloaded", plugin);
};

PluginModule.prototype.updatePluginList = function() {
    const results = ContentManager.loadNewContent("plugin");
    for (const filename of results.added) this.loadPlugin(filename);
    for (const name of results.removed) this.unloadPlugin(name);
};

PluginModule.prototype.loadPluginData = function () {
    let saved = DataStore.getSettingGroup("plugins");
    if (saved) {
        pluginCookie = saved;
    }
};

PluginModule.prototype.savePluginData = function () {
    DataStore.setSettingGroup("plugins", pluginCookie);
};

PluginModule.prototype.newMessage = function () {
    var plugins = Object.keys(bdplugins);
    for (var i = 0; i < plugins.length; i++) {
        var plugin = bdplugins[plugins[i]].plugin;
        if (!pluginCookie[plugin.getName()]) continue;
        if (typeof plugin.onMessage === "function") {
            try { plugin.onMessage(); }
            catch (err) { Utils.err("Plugins", "Unable to fire onMessage for " + plugin.getName() + ".", err); }
        }
    }
};

PluginModule.prototype.channelSwitch = function () {
    var plugins = Object.keys(bdplugins);
    for (var i = 0; i < plugins.length; i++) {
        var plugin = bdplugins[plugins[i]].plugin;
        if (!pluginCookie[plugin.getName()]) continue;
        if (typeof plugin.onSwitch === "function") {
            try { plugin.onSwitch(); }
            catch (err) { Utils.err("Plugins", "Unable to fire onSwitch for " + plugin.getName() + ".", err); }
        }
    }
};

PluginModule.prototype.rawObserver = function(e) {
    var plugins = Object.keys(bdplugins);
    for (var i = 0; i < plugins.length; i++) {
        var plugin = bdplugins[plugins[i]].plugin;
        if (!pluginCookie[plugin.getName()]) continue;
        if (typeof plugin.observer === "function") {
            try { plugin.observer(e); }
            catch (err) { Utils.err("Plugins", "Unable to fire observer for " + plugin.getName() + ".", err); }
        }
    }
};


/* BetterDiscordApp ThemeModule JavaScript
 * Version: 1.0
 * Author: Jiiks | http://jiiks.net
 * Date: 16/12/2015
 * https://github.com/Jiiks/BetterDiscordApp
 */

var themeCookie = {};

function ThemeModule() {

}

ThemeModule.prototype.loadThemes = function () {
    this.loadThemeData();
    bdthemeErrors = ContentManager.loadThemes();
    var themes = Object.keys(bdthemes);

    for (var i = 0; i < themes.length; i++) {
        var name = bdthemes[themes[i]].name;
        if (!themeCookie[name]) themeCookie[name] = false;
        if (themeCookie[name]) $("head").append($("<style>", {id: Utils.escapeID(name), text: unescape(bdthemes[name].css)}));
    }
    for (let theme in themeCookie) {
        if (!bdthemes[theme]) delete themeCookie[theme];
    }
    this.saveThemeData();
    // if (settingsCookie["fork-ps-5"]) ContentManager.watchContent("theme");
};

ThemeModule.prototype.enableTheme = function(theme, reload = false) {
    themeCookie[theme] = true;
    this.saveThemeData();
    $("head").append($("<style>", {id: Utils.escapeID(theme), text: unescape(bdthemes[theme].css)}));
    if (settingsCookie["fork-ps-2"] && !reload) mainCore.showToast(`${bdthemes[theme].name} v${bdthemes[theme].version} has been applied.`);
};

ThemeModule.prototype.disableTheme = function(theme, reload = false) {
    themeCookie[theme] = false;
    this.saveThemeData();
    $(`#${Utils.escapeID(bdthemes[theme].name)}`).remove();
    if (settingsCookie["fork-ps-2"] && !reload) mainCore.showToast(`${bdthemes[theme].name} v${bdthemes[theme].version} has been disabled.`);
};

ThemeModule.prototype.toggleTheme = function(theme) {
    if (themeCookie[theme]) this.disableTheme(theme);
    else this.enableTheme(theme);
};

ThemeModule.prototype.loadTheme = function(filename) {
    const error = ContentManager.loadContent(filename, "theme");
    if (error) {
        if (settingsCookie["fork-ps-1"]) mainCore.showContentErrors({themes: [error]});
        if (settingsCookie["fork-ps-2"]) BdApi.showToast(`${filename} could not be loaded. It may not have been loaded.`, {type: "error"});
        return Utils.err("ContentManager", `${filename} could not be loaded.`, error);
    }
    const theme = Object.values(bdthemes).find(p => p.filename == filename);
    Utils.log("ContentManager", `${theme.name} v${theme.version} was loaded.`);
    if (settingsCookie["fork-ps-2"]) BdApi.showToast(`${theme.name} v${theme.version} was loaded.`, {type: "success"});
    BDEvents.dispatch("theme-loaded", theme.name);
};

ThemeModule.prototype.unloadTheme = function(filenameOrName) {
    const bdtheme = Object.values(bdthemes).find(p => p.filename == filenameOrName) || bdthemes[filenameOrName];
    if (!bdtheme) return;
    const theme = bdtheme.name;
    if (themeCookie[theme]) this.disableTheme(theme, true);
    const error = ContentManager.unloadContent(bdthemes[theme].filename, "theme");
    delete bdthemes[theme];
    if (error) {
        if (settingsCookie["fork-ps-1"]) mainCore.showContentErrors({themes: [error]});
        if (settingsCookie["fork-ps-2"]) BdApi.showToast(`${theme} could not be unloaded. It may have not been loaded yet.`, {type: "error"});
        return Utils.err("ContentManager", `${theme} could not be unloaded. It may have not been loaded yet.`, error);
    }
    Utils.log("ContentManager", `${theme} was unloaded.`);
    if (settingsCookie["fork-ps-2"]) BdApi.showToast(`${theme} was unloaded.`, {type: "success"});
    BDEvents.dispatch("theme-unloaded", theme);
};

ThemeModule.prototype.reloadTheme = function(filenameOrName) {
    const bdtheme = Object.values(bdthemes).find(p => p.filename == filenameOrName) || bdthemes[filenameOrName];
    if (!bdtheme) return this.loadTheme(filenameOrName);
    const theme = bdtheme.name;
    const error = ContentManager.reloadContent(bdthemes[theme].filename, "theme");
    if (themeCookie[theme]) this.disableTheme(theme, true), this.enableTheme(theme, true);
    if (error) {
        if (settingsCookie["fork-ps-1"]) mainCore.showContentErrors({themes: [error]});
        if (settingsCookie["fork-ps-2"]) BdApi.showToast(`${theme} could not be reloaded.`, {type: "error"});
        return Utils.err("ContentManager", `${theme} could not be reloaded.`, error);
    }
    Utils.log("ContentManager", `${theme} v${bdthemes[theme].version} was reloaded.`);
    if (settingsCookie["fork-ps-2"]) BdApi.showToast(`${theme} v${bdthemes[theme].version} was reloaded.`, {type: "success"});
    BDEvents.dispatch("theme-reloaded", theme);
};

ThemeModule.prototype.updateThemeList = function() {
    const results = ContentManager.loadNewContent("theme");
    for (const filename of results.added) this.loadTheme(filename);
    for (const name of results.removed) this.unloadTheme(name);
};

ThemeModule.prototype.loadThemeData = function() {
    let saved = DataStore.getSettingGroup("themes");
    if (saved) {
        themeCookie = saved;
    }
};

ThemeModule.prototype.saveThemeData = function () {
    DataStore.setSettingGroup("themes", themeCookie);
};


/* BetterDiscordApp API for Plugins
 * Version: 1.0
 * Author: Jiiks | http://jiiks.net
 * Date: 11/12/2015
 * Last Update: 11/12/2015
 * https://github.com/Jiiks/BetterDiscordApp
 *
 * Plugin Template: https://gist.github.com/Jiiks/71edd5af0beafcd08956
 */

var BdApi = {
    get React() { return BDV2.react; },
    get ReactDOM() { return BDV2.reactDom; },
    get WindowConfigFile() {
        if (this._windowConfigFile) return this._windowConfigFile;
        const electron = require("electron").remote.app;
        const path = require("path");
        const base = electron.getAppPath();
        const roamingBase = electron.getPath("userData");
        const roamingLocation = path.resolve(roamingBase, electron.getVersion(), "modules", "discord_desktop_core", "injector", "config.json")
        const location = path.resolve(base, "..", "app", "config.json");
        const fs = require("fs");
        const realLocation = fs.existsSync(location) ? location : fs.existsSync(roamingLocation) ? roamingLocation : null;
        if (!realLocation) return this._windowConfigFile = null;
        return this._windowConfigFile = realLocation;
    }
};

BdApi.getAllWindowPreferences = function() {
    if (!this.WindowConfigFile) return {}; // Tempfix until new injection on other platforms
    return require(this.WindowConfigFile);
};

BdApi.getWindowPreference = function(key) {
    if (!this.WindowConfigFile) return undefined; // Tempfix until new injection on other platforms
    return this.getAllWindowPreferences()[key];
};

BdApi.setWindowPreference = function(key, value) {
    if (!this.WindowConfigFile) return; // Tempfix until new injection on other platforms
    const fs = require("fs");
    const prefs = this.getAllWindowPreferences();
    prefs[key] = value;
    delete require.cache[this.WindowConfigFile];
    fs.writeFileSync(this.WindowConfigFile, JSON.stringify(prefs, null, 4));
};

//Inject CSS to document head
//id = id of element
//css = custom css
BdApi.injectCSS = function (id, css) {
    $("head").append($("<style>", {id: Utils.escapeID(id), text: css}));
};

//Clear css/remove any element
//id = id of element
BdApi.clearCSS = function (id) {
    $("#" + Utils.escapeID(id)).remove();
};

//Inject CSS to document head
//id = id of element
//css = custom css
BdApi.linkJS = function (id, url) {
    $("head").append($("<script>", {id: Utils.escapeID(id), src: url, type: "text/javascript"}));
};

//Clear css/remove any element
//id = id of element
BdApi.unlinkJS = function (id) {
    $("#" + Utils.escapeID(id)).remove();
};

//Get another plugin
//name = name of plugin
BdApi.getPlugin = function (name) {
    if (bdplugins.hasOwnProperty(name)) {
        return bdplugins[name].plugin;
    }
    return null;
};

var betterDiscordIPC = require("electron").ipcRenderer;
//Get ipc for reason
BdApi.getIpc = function () {
    Utils.warn("Deprecation Notice", "BetterDiscord's IPC has been deprecated and may be removed in future versions.");
    return betterDiscordIPC;
};

//Get BetterDiscord Core
BdApi.getCore = function () {
    return mainCore;
};

/**
 * Shows a generic but very customizable modal.
 * @param {string} title - title of the modal
 * @param {string} content - a string of text to display in the modal
 */
BdApi.alert = function (title, content) {
    const ModalStack = BdApi.findModuleByProps("push", "update", "pop", "popWithKey");
    const AlertModal = BdApi.findModuleByPrototypes("handleCancel", "handleSubmit", "handleMinorConfirm");
    if (!ModalStack || !AlertModal) return mainCore.alert(title, content);

    ModalStack.push(function(props) {
        return BdApi.React.createElement(AlertModal, Object.assign({
            title: title,
            body: content,
        }, props));
    });
};

/**
 * Shows a generic but very customizable confirmation modal with optional confirm and cancel callbacks.
 * @param {string} title - title of the modal
 * @param {(string|ReactElement|Array<string|ReactElement>)} children - a single or mixed array of react elements and strings. Everything is wrapped in Discord's `TextElement` component so strings will show and render properly.
 * @param {object} [options] - options to modify the modal
 * @param {boolean} [options.danger=false] - whether the main button should be red or not
 * @param {string} [options.confirmText=Okay] - text for the confirmation/submit button
 * @param {string} [options.cancelText=Cancel] - text for the cancel button
 * @param {callable} [options.onConfirm=NOOP] - callback to occur when clicking the submit button
 * @param {callable} [options.onCancel=NOOP] - callback to occur when clicking the cancel button
 */
BdApi.showConfirmationModal = function (title, content, options = {}) {
    const ModalStack = BdApi.findModuleByProps("push", "update", "pop", "popWithKey");
    const TextElement = BdApi.findModuleByProps("Sizes", "Weights");
    const ConfirmationModal = BdApi.findModule(m => m.defaultProps && m.key && m.key() == "confirm-modal");
    if (!ModalStack || !ConfirmationModal || !TextElement) return mainCore.alert(title, content);

    const {onConfirm, onCancel, confirmText, cancelText, danger = false} = options;
    if (typeof(content) == "string") content = TextElement({color: TextElement.Colors.PRIMARY, children: [content]});
    else if (Array.isArray(content)) content = TextElement({color: TextElement.Colors.PRIMARY, children: content});
    content = [content];

    const emptyFunction = () => {};
    ModalStack.push(function(props) {
        return BdApi.React.createElement(ConfirmationModal, Object.assign({
            header: title,
            children: content,
            red: danger,
            confirmText: confirmText ? confirmText : "Okay",
            cancelText: cancelText ? cancelText : "Cancel",
            onConfirm: onConfirm ? onConfirm : emptyFunction,
            onCancel: onCancel ? onCancel : emptyFunction
        }, props));
    });
};

//Show toast alert
BdApi.showToast = function(content, options = {}) {
    mainCore.showToast(content, options);
};

// Finds module
BdApi.findModule = function(filter) {
    return BDV2.WebpackModules.find(filter);
};

// Finds module
BdApi.findAllModules = function(filter) {
    return BDV2.WebpackModules.findAll(filter);
};

// Finds module
BdApi.findModuleByProps = function(...props) {
    return BDV2.WebpackModules.findByUniqueProperties(props);
};

BdApi.findModuleByPrototypes = function(...protos) {
    return BDV2.WebpackModules.findByPrototypes(protos);
};

BdApi.findModuleByDisplayName = function(name) {
    return BDV2.WebpackModules.findByDisplayName(name);
};

// Gets react instance
BdApi.getInternalInstance = function(node) {
    if (!(node instanceof window.jQuery) && !(node instanceof Element)) return undefined;
    if (node instanceof jQuery) node = node[0];
    return BDV2.getInternalInstance(node);
};

// Gets data
BdApi.loadData = function(pluginName, key) {
    return DataStore.getPluginData(pluginName, key);
};

BdApi.getData = BdApi.loadData;

// Sets data
BdApi.saveData = function(pluginName, key, data) {
    return DataStore.setPluginData(pluginName, key, data);
};

BdApi.setData = BdApi.saveData;

// Deletes data
BdApi.deleteData = function(pluginName, key) {
    return DataStore.deletePluginData(pluginName, key);
};

// Patches other functions
BdApi.monkeyPatch = function(what, methodName, options) {
    return Utils.monkeyPatch(what, methodName, options);
};

// Event when element is removed
BdApi.onRemoved = function(node, callback) {
    return Utils.onRemoved(node, callback);
};

// Wraps function in try..catch
BdApi.suppressErrors = function(method, message) {
    return Utils.suppressErrors(method, message);
};

// Tests for valid JSON
BdApi.testJSON = function(data) {
    return Utils.testJSON(data);
};

BdApi.isPluginEnabled = function(name) {
    return !!pluginCookie[name];
};

BdApi.isThemeEnabled = function(name) {
    return !!themeCookie[name];
};

BdApi.isSettingEnabled = function(id) {
    return !!settingsCookie[id];
};

// Gets data
BdApi.getBDData = function(key) {
    return DataStore.getBDData(key);
};

// Sets data
BdApi.setBDData = function(key, data) {
    return DataStore.setBDData(key, data);
};







/* BetterDiscordApp DevMode JavaScript
 * Version: 1.0
 * Author: Jiiks | http://jiiks.net
 * Date: 22/05/2016
 * Last Update: 22/05/2016
 * https://github.com/Jiiks/BetterDiscordApp
 */

 function devMode() {}

 devMode.prototype.enable = function(selectorMode) {
     var self = this;
     this.disable();
     $(window).on("keydown.bdDevmode", function(e) {
         if (e.which === 119 || e.which == 118) {//F8
            console.log("%c[%cDevMode%c] %cBreak/Resume", "color: red;", "color: #303030; font-weight:700;", "color:red;", "");
            debugger; // eslint-disable-line no-debugger
         }
     });

    if (!selectorMode) return;
     $(document).on("contextmenu.bdDevmode", function(e) {
         self.lastSelector = self.getSelector(e.toElement);

         function attach() {
            var cm = $(".contextMenu-HLZMGh");
            if (cm.length <= 0) {
                cm = $("<div class=\"contextMenu-HLZMGh bd-context-menu\"></div>");
                cm.addClass($(".app, .app-2rEoOp").hasClass("theme-dark") ? "theme-dark" : "theme-light");
                cm.appendTo(".app, .app-2rEoOp");
                cm.css("top", e.clientY);
                cm.css("left", e.clientX);
                $(document).on("click.bdDevModeCtx", () => {
                    cm.remove();
                    $(document).off(".bdDevModeCtx");
                });
                $(document).on("contextmenu.bdDevModeCtx", () => {
                    cm.remove();
                    $(document).off(".bdDevModeCtx");
                });
                $(document).on("keyup.bdDevModeCtx", (e) => {
                    if (e.keyCode === 27) {
                        cm.remove();
                        $(document).off(".bdDevModeCtx");
                    }
                });
            }

            var cmo = $("<div/>", {
                "class": "itemGroup-1tL0uz"
            });
            var cmi = $("<div/>", {
                "class": "item-1Yvehc",
                "click": function() {
                    BDV2.NativeModule.copy(self.lastSelector);
                    cm.hide();
                }
            }).append($("<span/>", {text: "Copy Selector"}));
            cmo.append(cmi);
            cm.append(cmo);
            if (cm.hasClass("undefined")) cm.css("top",  "-=" + cmo.outerHeight());
         }

         setImmediate(attach);

         e.stopPropagation();
     });
 };

devMode.prototype.getRules = function(element, css = element.ownerDocument.styleSheets) {
    //if (window.getMatchedCSSRules) return window.getMatchedCSSRules(element);
    return [].concat(...[...css].map(s => [...s.cssRules || []])).filter(r => r && r.selectorText && element.matches(r.selectorText) && r.style.length && r.selectorText.split(", ").length < 8);
};

devMode.prototype.getSelector = function(element) {
    if (element.id) return `#${element.id}`;
    const rules = this.getRules(element);
    const latestRule = rules[rules.length - 1];
    if (latestRule) return latestRule.selectorText;
    else if (element.classList.length) return `.${Array.from(element.classList).join(".")}`;
    return `.${Array.from(element.parentElement.classList).join(".")}`;
};

 devMode.prototype.disable = function() {
     $(window).off("keydown.bdDevmode");
     $(document).off("contextmenu.bdDevmode");
     $(document).off("contextmenu.bdDevModeCtx");
 };


var ClassNormalizer = (() => {
    const normalizedPrefix = "da";
    const randClass = new RegExp(`^(?!${normalizedPrefix}-)((?:[A-Za-z]|[0-9]|-)+)-(?:[A-Za-z]|[0-9]|-|_){6}$`);

    return new class ClassNormalizer {

        stop() {
            if (!this.hasPatched) return;
            this.unpatchClassModules(BdApi.findAllModules(this.moduleFilter.bind(this)));
            this.revertElement(document.querySelector("#app-mount"));
            this.hasPatched = false;
        }

        start() {
            if (this.hasPatched) return;
            this.patchClassModules(BdApi.findAllModules(this.moduleFilter.bind(this)));
            this.normalizeElement(document.querySelector("#app-mount"));
            this.hasPatched = true;
        }

        patchClassModules(modules) {
            for (const module of modules) {
                this.patchClassModule(normalizedPrefix, module);
            }
        }

        unpatchClassModules(modules) {
            for (const module of modules) {
                this.unpatchClassModule(normalizedPrefix, module);
            }
        }

        shouldIgnore(value) {
            if (!isNaN(value)) return true;
            if (value.endsWith("px") || value.endsWith("ch") || value.endsWith("em") || value.endsWith("ms")) return true;
            if (value.startsWith("layerContainer-")) return true;
            if (value.startsWith("#") && (value.length == 7 || value.length == 4)) return true;
            if (value.includes("calc(") || value.includes("rgba")) return true;
            return false;
        }

        moduleFilter(module) {
            if (typeof module !== "object" || Array.isArray(module)) return false;
            if (module.__esModule) return false;
            if (!Object.keys(module).length) return false;
            for (const baseClassName in module) {
                const value = module[baseClassName];
                if (typeof value !== "string") return false;
                if (this.shouldIgnore(value)) continue;
                if (value.split("-").length === 1) return false;
                if (!randClass.test(value.split(" ")[0])) return false;
            }

            return true;
        }

        patchClassModule(componentName, classNames) {
            for (const baseClassName in classNames) {
                const value = classNames[baseClassName];
                if (this.shouldIgnore(value)) continue;
                const classList = value.split(" ");
                for (const normalClass of classList) {
                    const match = normalClass.match(randClass)[1];
                    if (!match) continue; // Shouldn't ever happen since they passed the moduleFilter, but you never know
                    const camelCase = match.split("-").map((s, i) => i ? s[0].toUpperCase() + s.slice(1) : s).join("");
                    classNames[baseClassName] += ` ${componentName}-${camelCase}`;
                }
            }
        }

        unpatchClassModule(componentName, classNames) {
            for (const baseClassName in classNames) {
                const value = classNames[baseClassName];
                if (this.shouldIgnore(value)) continue;
                let newString = "";
                const classList = value.split(" ");
                for (const normalClass of classList) {
                    if (normalClass.startsWith(`${componentName}-`)) continue;
                    newString += ` ${normalClass}`;
                }
                classNames[baseClassName] = newString.trim();
            }
        }

        normalizeElement(element) {
            if (!(element instanceof Element)) return;
            const classes = element.classList;
            for (let c = 0, clen = classes.length; c < clen; c++) {
                if (!randClass.test(classes[c])) continue;
                const match = classes[c].match(randClass)[1];
                const newClass = match.split("-").map((s, i) => i ? s[0].toUpperCase() + s.slice(1) : s).join("");
                element.classList.add(`${normalizedPrefix}-${newClass}`);
            }
            for (const child of element.children) this.normalizeElement(child);
        }

        revertElement(element) {
            if (!(element instanceof Element)) return;
            if (element.children && element.children.length) this.revertElement(element.children[0]);
            if (element.nextElementSibling) this.revertElement(element.nextElementSibling);
            const classes = element.classList;
            const toRemove = [];
            for (let c = 0; c < classes.length; c++) {
                if (classes[c].startsWith(`${normalizedPrefix}-`)) toRemove.push(classes[c]);
            }
            element.classList.remove(...toRemove);
        }

    };
})();





























































































































































/*V2 Premature*/

class V2 {

    constructor() {
        this.editorDetached = false;
        this.WebpackModules = (() => {
            const req = webpackJsonp.push([[], {__extra_id__: (module, exports, req) => module.exports = req}, [["__extra_id__"]]]);
            delete req.m.__extra_id__;
            delete req.c.__extra_id__;
            const find = (filter) => {
                for (let i in req.c) {
                    if (req.c.hasOwnProperty(i)) {
                        let m = req.c[i].exports;
                        if (m && m.__esModule && m.default && filter(m.default)) return m.default;
                        if (m && filter(m))	return m;
                    }
                }
                console.warn("Cannot find loaded module in cache");
                return null;
            };

            const findAll = (filter) => {
                const modules = [];
                for (let i in req.c) {
                    if (req.c.hasOwnProperty(i)) {
                        let m = req.c[i].exports;
                        if (m && m.__esModule && m.default && filter(m.default)) modules.push(m.default);
                        else if (m && filter(m)) modules.push(m);
                    }
                }
                return modules;
            };

            const findByUniqueProperties = (propNames) => find(module => propNames.every(prop => module[prop] !== undefined));
            const findByPrototypes = (protoNames) => find(module => module.prototype && protoNames.every(protoProp => module.prototype[protoProp] !== undefined));
            const findByDisplayName = (displayName) => find(module => module.displayName === displayName);

            return {find, findAll, findByUniqueProperties, findByPrototypes, findByDisplayName};
        })();

        this.internal = {
            react: this.WebpackModules.findByUniqueProperties(["Component", "PureComponent", "Children", "createElement", "cloneElement"]),
            reactDom: this.WebpackModules.findByUniqueProperties(["findDOMNode"])
        };
        this.getInternalInstance = e => e[Object.keys(e).find(k => k.startsWith("__reactInternalInstance"))];
    }

    initialize() {
        BdApi.suppressErrors(this.patchSocial.bind(this), "BD Social Patch")();
        BdApi.suppressErrors(this.patchGuildPills.bind(this), "BD Guild Pills Patch")();
        BdApi.suppressErrors(this.patchGuildListItems.bind(this), "BD Guild List Items Patch")();
        BdApi.suppressErrors(this.patchGuildSeparator.bind(this), "BD Guild Separator Patch")();
    }

    get react() {return this.internal.react;}
    get reactDom() {return this.internal.reactDom;}
    get reactComponent() {return this.internal.react.Component;}

    get messageClasses() {return this.WebpackModules.findByUniqueProperties(["message", "containerCozy"]);}
    get guildClasses() {
		const guildsWrapper = this.WebpackModules.findByUniqueProperties(["wrapper", "unreadMentionsBar"]);
        const guilds = this.WebpackModules.findByUniqueProperties(["guildsError", "selected"]);
        const pill = this.WebpackModules.findByUniqueProperties(["blobContainer"]);
        return Object.assign({}, guildsWrapper, guilds, pill);
	}

    get MessageContentComponent() {return this.WebpackModules.find(m => m.defaultProps && m.defaultProps.hasOwnProperty("disableButtons"));}
    get TimeFormatter() {return this.WebpackModules.findByUniqueProperties(["dateFormat"]);}
    get TooltipWrapper() {return this.WebpackModules.findByDisplayName("TooltipDeprecated");}
    get NativeModule() {return this.WebpackModules.findByUniqueProperties(["setBadge"]);}
    get Tooltips() {return this.WebpackModules.find(m => m.hide && m.show && !m.search && !m.submit && !m.search && !m.activateRagingDemon && !m.dismiss);}
    get KeyGenerator() {return this.WebpackModules.find(m => m.toString && /"binary"/.test(m.toString()));}

    parseSettings(cat) {
        return Object.keys(settings).reduce((arr, key) => {
            let setting = settings[key];
            if (setting.cat === cat && setting.implemented && !setting.hidden) {
                setting.text = key;
                arr.push(setting);
            } return arr;
        }, []);
    }

    patchSocial() {
        if (this.socialPatch) return;
        const TabBar = BdApi.findModule(m => m.displayName == "TabBar");
        const Anchor = BdApi.findModule(m => m.displayName == "Anchor");
        if (!TabBar || !Anchor) return;
        this.socialPatch = BdApi.monkeyPatch(TabBar.prototype, "render", {after: (data) => {
            const children = data.returnValue.props.children;
            if (!children || !children.length) return;
            if (children[children.length - 2].type.displayName !== "Separator") return;
            if (!children[children.length - 1].type.toString().includes("socialLinks")) return;
            const original = children[children.length - 1].type;
            const newOne = function() {
                const returnVal = original(...arguments);
                returnVal.props.children.push(BdApi.React.createElement(Anchor, {className: "bd-social-link", href: "https://github.com/rauenzi/BetterDiscordApp", rel: "author", title: "BandagedBD", target: "_blank"},
                    BdApi.React.createElement(BDLogo, {size: "16px", className: "bd-social-logo"})
                ));
                return returnVal;
            };
            children[children.length - 1].type = newOne;
        }});
    }

    patchGuildListItems() {
        if (this.guildListItemsPatch) return;
        const listItemClass = this.guildClasses.listItem.split(" ")[0];
        const blobClass = this.guildClasses.blobContainer.split(" ")[0];
        const reactInstance = BdApi.getInternalInstance(document.querySelector(`.${listItemClass} .${blobClass}`).parentElement);
        const GuildComponent = reactInstance.return.type;
        if (!GuildComponent) return;
        this.guildListItemsPatch = BdApi.monkeyPatch(GuildComponent.prototype, "render", {after: (data) => {
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
        }});
    }

    patchGuildPills() {
        if (this.guildPillPatch) return;
        const guildPill = BdApi.findModule(m => m.default && m.default.toString && m.default.toString().includes("translate3d"));
        if (!guildPill) return;
        this.guildPillPatch = BdApi.monkeyPatch(guildPill, "default", {after: (data) => {
            const props = data.methodArguments[0];
            if (props.unread) data.returnValue.props.className += " bd-unread";
            if (props.selected) data.returnValue.props.className += " bd-selected";
            if (props.hovered) data.returnValue.props.className += " bd-hovered";
            return data.returnValue;
        }});
    }

    patchGuildSeparator() {
        if (this.guildSeparatorPatch) return;
        const Guilds = BdApi.findModuleByDisplayName("Guilds");
        const guildComponents = BdApi.findModuleByProps("renderListItem");
        if (!guildComponents || !Guilds) return;
        const GuildSeparator = function() {
            const returnValue = guildComponents.Separator(...arguments);
            returnValue.props.className += " bd-guild-separator";
            return returnValue;
        };
        this.guildSeparatorPatch = BdApi.monkeyPatch(Guilds.prototype, "render", {after: (data) => {
            data.returnValue.props.children[1].props.children[3].type = GuildSeparator;
        }});
    }

}

var BDV2 = new V2();

class BDLogo extends BDV2.reactComponent {
    render() {
        return BDV2.react.createElement(
            "svg",
            {height: "100%", width: this.props.size || "16px", className: "bd-logo " + this.props.className, style: {fillRule: "evenodd", clipRule: "evenodd", strokeLinecap: "round", strokeLinejoin: "round"}, viewBox: "0 0 2000 2000"},
            BDV2.react.createElement("metadata", null),
            BDV2.react.createElement("defs", null,
                BDV2.react.createElement("filter", {id: "shadow1"}, BDV2.react.createElement("feDropShadow", {"dx": "20", "dy": "0", "stdDeviation": "20", "flood-color": "rgba(0,0,0,0.35)"})),
                BDV2.react.createElement("filter", {id: "shadow2"}, BDV2.react.createElement("feDropShadow", {"dx": "15", "dy": "0", "stdDeviation": "20", "flood-color": "rgba(255,255,255,0.15)"})),
                BDV2.react.createElement("filter", {id: "shadow3"}, BDV2.react.createElement("feDropShadow", {"dx": "10", "dy": "0", "stdDeviation": "20", "flood-color": "rgba(0,0,0,0.35)"}))
            ),
            BDV2.react.createElement("g", null,
                BDV2.react.createElement("path", {style: {filter: "url(#shadow3)"}, d: "M1195.44+135.442L1195.44+135.442L997.6+136.442C1024.2+149.742+1170.34+163.542+1193.64+179.742C1264.34+228.842+1319.74+291.242+1358.24+365.042C1398.14+441.642+1419.74+530.642+1422.54+629.642L1422.54+630.842L1422.54+632.042C1422.54+773.142+1422.54+1228.14+1422.54+1369.14L1422.54+1370.34L1422.54+1371.54C1419.84+1470.54+1398.24+1559.54+1358.24+1636.14C1319.74+1709.94+1264.44+1772.34+1193.64+1821.44C1171.04+1837.14+1025.7+1850.54+1000+1863.54L1193.54+1864.54C1539.74+1866.44+1864.54+1693.34+1864.54+1296.64L1864.54+716.942C1866.44+312.442+1541.64+135.442+1195.44+135.442Z", fill: "#171717", opacity: "1"}),
                BDV2.react.createElement("path", {style: {filter: "url(#shadow2)"}, d: "M1695.54+631.442C1685.84+278.042+1409.34+135.442+1052.94+135.442L361.74+136.442L803.74+490.442L1060.74+490.442C1335.24+490.442+1335.24+835.342+1060.74+835.342L1060.74+1164.84C1150.22+1164.84+1210.53+1201.48+1241.68+1250.87C1306.07+1353+1245.76+1509.64+1060.74+1509.64L361.74+1863.54L1052.94+1864.54C1409.24+1864.54+1685.74+1721.94+1695.54+1368.54C1695.54+1205.94+1651.04+1084.44+1572.64+999.942C1651.04+915.542+1695.54+794.042+1695.54+631.442Z", fill: "#3E82E5", opacity: "1"}),
                BDV2.react.createElement("path", {style: {filter: "url(#shadow1)"}, d: "M1469.25+631.442C1459.55+278.042+1183.05+135.442+826.65+135.442L135.45+135.442L135.45+1004C135.45+1004+135.427+1255.21+355.626+1255.21C575.825+1255.21+575.848+1004+575.848+1004L577.45+490.442L834.45+490.442C1108.95+490.442+1108.95+835.342+834.45+835.342L664.65+835.342L664.65+1164.84L834.45+1164.84C923.932+1164.84+984.244+1201.48+1015.39+1250.87C1079.78+1353+1019.47+1509.64+834.45+1509.64L135.45+1509.64L135.45+1864.54L826.65+1864.54C1182.95+1864.54+1459.45+1721.94+1469.25+1368.54C1469.25+1205.94+1424.75+1084.44+1346.35+999.942C1424.75+915.542+1469.25+794.042+1469.25+631.442Z", fill: "#FFFFFF", opacity: "1"})
            )
        );
    }
}

class BDEmote extends BDV2.reactComponent {
    constructor(props) {
        super(props);

        const isFav = quickEmoteMenu && quickEmoteMenu.favoriteEmotes && quickEmoteMenu.favoriteEmotes[this.label] ? true : false;
        this.state = {
            shouldAnimate: !this.animateOnHover,
            isFavorite: isFav
        };

        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.onClick = this.onClick.bind(this);
    }

    get animateOnHover() {
        return settingsCookie["fork-es-2"];
    }

    get label() {
        return this.props.modifier ? `${this.props.name}:${this.props.modifier}` : this.props.name;
    }

    get modifierClass() {
        return this.props.modifier ? ` emote${this.props.modifier}` : "";
    }

    onMouseEnter() {
        if (!this.state.shouldAnimate && this.animateOnHover) this.setState({shouldAnimate: true});
        if (!this.state.isFavorite && quickEmoteMenu.favoriteEmotes[this.label]) this.setState({isFavorite: true});
        else if (this.state.isFavorite && !quickEmoteMenu.favoriteEmotes[this.label]) this.setState({isFavorite: false});
    }

    onMouseLeave() {
        if (this.state.shouldAnimate && this.animateOnHover) this.setState({shouldAnimate: false});
    }

    onClick(e) {
        if (this.props.onClick) this.props.onClick(e);
    }

    render() {
        return BDV2.react.createElement(BDV2.TooltipWrapper, {
                color: "black",
                position: "top",
                text: this.label,
                delay: 750
            },
                BDV2.react.createElement("div", {
                    className: "emotewrapper" + (this.props.jumboable ? " jumboable" : ""),
                    onMouseEnter: this.onMouseEnter,
                    onMouseLeave: this.onMouseLeave,
                    onClick: this.onClick
                },
                    BDV2.react.createElement("img", {
                        draggable: false,
                        className: "emote" + this.modifierClass + (this.props.jumboable ? " jumboable" : "") + (!this.state.shouldAnimate ? " stop-animation" : ""),
                        dataModifier: this.props.modifier,
                        alt: this.label,
                        src: this.props.url
                    }),
                    BDV2.react.createElement("input", {
                        className: "fav" + (this.state.isFavorite ? " active" : ""),
                        title: "Favorite!",
                        type: "button",
                        onClick: (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (this.state.isFavorite) {
                                delete quickEmoteMenu.favoriteEmotes[this.label];
                                quickEmoteMenu.updateFavorites();
                            }
                            else {
                                quickEmoteMenu.favorite(this.label, this.props.url);
                            }
                            this.setState({isFavorite: !this.state.isFavorite});
                        }
                    })
                )
            );
    }
}

class V2C_SettingsPanel extends BDV2.reactComponent {

    constructor(props) {
        super(props);
    }

    render() {
        let {settings} = this.props;
        return BDV2.react.createElement(
            "div",
            {className: "contentColumn-2hrIYH contentColumnDefault-1VQkGM content-column default"},
            BDV2.react.createElement(V2Components.SettingsTitle, {text: this.props.title}),
            this.props.button && BDV2.react.createElement("button", {key: "title-button", className: "bd-pfbtn", onClick: this.props.button.onClick}, this.props.button.title),
            settings.map(setting => {
                return BDV2.react.createElement(V2Components.Switch, {id: setting.id, key: setting.id, data: setting, checked: settingsCookie[setting.id], onChange: (id, checked) => {
                        this.props.onChange(id, checked);
                    }});
            })
        );
    }
}

class V2C_SettingsGroup extends BDV2.reactComponent {

    constructor(props) {
        super(props);
    }

    render() {
        const {title, settings, button} = this.props;
        const buttonComponent = button ? BDV2.react.createElement("button", {key: "title-button", className: "bd-pfbtn", onClick: button.onClick}, button.title) : null;
        return [BDV2.react.createElement(V2Components.SettingsTitle, {text: title}),
                buttonComponent,
                settings.map(setting => {
                    return BDV2.react.createElement(V2Components.Switch, {id: setting.id, key: setting.id, data: setting, checked: settingsCookie[setting.id], onChange: (id, checked) => {
                        this.props.onChange(id, checked);
                    }});
                })];
    }
}

class V2C_SectionedSettingsPanel extends BDV2.reactComponent {

    constructor(props) {
        super(props);
    }

    render() {
        return BDV2.react.createElement(
            "div", {className: "contentColumn-2hrIYH contentColumnDefault-1VQkGM content-column default"},
            this.props.sections.map(section => {
                return BDV2.react.createElement(V2Components.SettingsGroup, Object.assign({}, section, {onChange: this.props.onChange}));
            })
        );
    }
}

class V2C_Switch extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        this.setInitialState();
        this.onChange = this.onChange.bind(this);
    }

    setInitialState() {
        this.state = {
            checked: this.props.checked
        };
    }

    render() {
        let {text, info} = this.props.data;
        let {checked} = this.state;
        return BDV2.react.createElement(
            "div",
            {className: "ui-flex flex-vertical flex-justify-start flex-align-stretch flex-nowrap ui-switch-item"},
            BDV2.react.createElement(
                "div",
                {className: "ui-flex flex-horizontal flex-justify-start flex-align-stretch flex-nowrap"},
                BDV2.react.createElement(
                    "h3",
                    {className: "ui-form-title h3 margin-reset margin-reset ui-flex-child"},
                    text
                ),
                BDV2.react.createElement(
                    "label",
                    {className: "ui-switch-wrapper ui-flex-child", style: {flex: "0 0 auto"}},
                    BDV2.react.createElement("input", {className: "ui-switch-checkbox", type: "checkbox", checked: checked, onChange: e => this.onChange(e)}),
                    BDV2.react.createElement("div", {className: `ui-switch ${checked ? "checked" : ""}`})
                )
            ),
            BDV2.react.createElement(
                "div",
                {className: "ui-form-text style-description margin-top-4", style: {flex: "1 1 auto"}},
                info
            )
        );
    }

    onChange() {
        this.props.onChange(this.props.id, !this.state.checked);
        this.setState({
            checked: !this.state.checked
        });
    }
}

class V2C_Scroller extends BDV2.reactComponent {

    constructor(props) {
        super(props);
    }

    render() {
        //scrollerWrap-2lJEkd scrollerThemed-2oenus themeGhostHairline-DBD-2d scrollerFade-1Ijw5y
        let wrapperClass = `scrollerWrap-2lJEkd scrollerThemed-2oenus themeGhostHairline-DBD-2d${this.props.fade ? " scrollerFade-1Ijw5y" : ""}`;
        let scrollerClass = "scroller-2FKFPG scroller";                                          /* fuck */
        if (this.props.sidebar) scrollerClass = "scroller-2FKFPG firefoxFixScrollFlex-cnI2ix sidebarRegionScroller-3MXcoP sidebar-region-scroller scroller";
        if (this.props.contentColumn) {
            scrollerClass = "scroller-2FKFPG firefoxFixScrollFlex-cnI2ix contentRegionScroller-26nc1e content-region-scroller scroller";                                         /* fuck */
            wrapperClass = "scrollerWrap-2lJEkd firefoxFixScrollFlex-cnI2ix contentRegionScrollerWrap-3YZXdm content-region-scroller-wrap scrollerThemed-2oenus themeGhost-28MSn0 scrollerTrack-1ZIpsv";
        }
        let {children} = this.props;
        return BDV2.react.createElement(
            "div",
            {key: "scrollerwrap", className: wrapperClass},
            BDV2.react.createElement(
                "div",
                {key: "scroller", ref: "scroller", className: scrollerClass},
                children
            )
        );
    }
}

class V2C_TabBarItem extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        this.setInitialState();
        this.onClick = this.onClick.bind(this);
    }

    setInitialState() {
        this.state = {
            selected: this.props.selected || false
        };
    }

    render() {
        return BDV2.react.createElement(
            "div",
            {className: `ui-tab-bar-item${this.props.selected ? " selected" : ""}`, onClick: this.onClick},
            this.props.text
        );
    }

    onClick() {
        if (this.props.onClick) {
            this.props.onClick(this.props.id);
        }
    }
}

class V2C_TabBarSeparator extends BDV2.reactComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return BDV2.react.createElement("div", {className: "ui-tab-bar-separator margin-top-8 margin-bottom-8"});
    }
}

class V2C_TabBarHeader extends BDV2.reactComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return BDV2.react.createElement(
            "div",
            {className: "ui-tab-bar-header"},
            this.props.text
        );
    }
}

class V2C_SideBar extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        let self = this;
        const si = $("[class*=side-] > [class*=selected]");
        if (si.length) self.scn = si.attr("class");
        const ns = $("[class*=side-] > [class*='item-']:not([class*=selected])");
        if (ns.length) self.nscn = ns.attr("class");
        $("[class*='side-'] > [class*='item-']").on("click", () => {
            self.setState({
                selected: null
            });
        });
        self.setInitialState();
        self.onClick = self.onClick.bind(self);
    }

    setInitialState() {
        let self = this;
        self.state = {
            selected: null,
            items: self.props.items
        };

        let initialSelection = self.props.items.find(item => {
            return item.selected;
        });
        if (initialSelection) {
            self.state.selected = initialSelection.id;
        }
    }

    render() {
        let self = this;
        let {headerText} = self.props;
        let {items, selected} = self.state;
        return BDV2.react.createElement(
            "div",
            null,
            BDV2.react.createElement(V2Components.TabBar.Separator, null),
            BDV2.react.createElement(V2Components.TabBar.Header, {text: headerText}),
            items.map(item => {
                let {id, text} = item;
                return BDV2.react.createElement(V2Components.TabBar.Item, {key: id, selected: selected === id, text: text, id: id, onClick: self.onClick});
            })
        );
    }

    onClick(id) {
        let self = this;
        const si = $("[class*=side] > [class*=selected]");
        if (si.length) {
            si.off("click.bdsb").on("click.bsb", e => {
                $(e.target).attr("class", self.scn);
            });
            si.attr("class", self.nscn);
        }

        self.setState({selected: null});
        self.setState({selected: id});

        if (self.props.onClick) self.props.onClick(id);
    }
}

class V2C_ReloadIcon extends BDV2.reactComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return BDV2.react.createElement("svg", {
                xmlns: "http://www.w3.org/2000/svg",
                viewBox: "0 0 24 24",
                fill: "#dcddde",
                className: "bd-reload " + this.props.className,
                onClick: this.props.onClick,
                style: {width: this.props.size || "24px", height: this.props.size || "24px"}
            },
            BDV2.react.createElement("path", {d: "M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"}),
            BDV2.react.createElement("path", {fill: "none", d: "M0 0h24v24H0z"})
        );
    }
}

class V2C_XSvg extends BDV2.reactComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return BDV2.react.createElement(
            "svg",
            {xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 12 12", style: {width: "18px", height: "18px"}},
            BDV2.react.createElement(
                "g",
                {className: "background", fill: "none", fillRule: "evenodd"},
                BDV2.react.createElement("path", {d: "M0 0h12v12H0"}),
                BDV2.react.createElement("path", {className: "fill", fill: "#dcddde", d: "M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"})
            )
        );
    }
}

class V2C_Tools extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    render() {
        return BDV2.react.createElement("div", {className: "tools-container toolsContainer-1edPuj"},
            BDV2.react.createElement("div", {className: "tools tools-3-3s-N"},
                BDV2.react.createElement("div", {className: "container-1sFeqf"},
                    BDV2.react.createElement("div",
                        {className: "btn-close closeButton-1tv5uR", onClick: this.onClick},
                        BDV2.react.createElement(V2Components.XSvg, null)
                    ),
                    BDV2.react.createElement(
                        "div",
                        {className: "esc-text keybind-KpFkfr"},
                        "ESC"
                    )
                )
            )
        );
    }

    onClick() {
        if (this.props.onClick) {
            this.props.onClick();
        }
        $(".closeButton-1tv5uR").first().click();
    }
}

class V2C_SettingsTitle extends BDV2.reactComponent {
    constructor(props) {
        super(props);
    }
//h2-2gWE-o title-3sZWYQ size16-14cGz5 height20-mO2eIN weightSemiBold-NJexzi da-h2 da-title da-size16 da-height20 da-weightSemiBold defaultColor-1_ajX0 da-defaultColor marginTop60-3PGbtK da-marginTop60 marginBottom20-32qID7 da-marginBottom20
    render() {
        return BDV2.react.createElement(
            "h2",
            {className: "ui-form-title h2 margin-reset margin-bottom-20 marginTop60-3PGbtK da-marginTop6"},
            this.props.text
        );
    }
}

class V2C_Checkbox extends BDV2.reactComponent {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.setInitialState();
    }

    setInitialState() {
        this.state = {
            checked: this.props.checked || false
        };
    }

    render() {
        return BDV2.react.createElement(
            "li",
            null,
            BDV2.react.createElement(
                "div",
                {className: "checkbox checkbox-3kaeSU da-checkbox checkbox-3EVISJ da-checkbox", onClick: this.onClick},
                BDV2.react.createElement(
                    "div",
                    {className: "checkbox-inner checkboxInner-3yjcPe da-checkboxInner"},
                    BDV2.react.createElement("input", {className: "checkboxElement-1qV33p da-checkboxElement", checked: this.state.checked, onChange: () => {}, type: "checkbox"}),
                    BDV2.react.createElement("span", null)
                ),
                BDV2.react.createElement(
                    "span",
                    null,
                    this.props.text
                )
            )
        );
    }

    onClick() {
        this.props.onChange(this.props.id, !this.state.checked);
        this.setState({
            checked: !this.state.checked
        });
    }
}

class V2C_CssEditorDetached extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        let self = this;
        self.onClick = self.onClick.bind(self);
        self.updateCss = self.updateCss.bind(self);
        self.saveCss = self.saveCss.bind(self);
        self.onChange = self.onChange.bind(self);
    }

    componentDidMount() {
        $("#app-mount").addClass("bd-detached-editor");
        BDV2.editorDetached = true;
        // this.updateLineCount();
        this.editor = ace.edit("bd-customcss-editor-detached");
        this.editor.setTheme("ace/theme/monokai");
        this.editor.session.setMode("ace/mode/css");
        this.editor.setShowPrintMargin(false);
        this.editor.setFontSize(14);
        this.editor.on("change", () => {
            if (!settingsCookie["bda-css-0"]) return;
            this.saveCss();
            this.updateCss();
        });

    }

    componentWillUnmount() {
        $("#app-mount").removeClass("bd-detached-editor");
        BDV2.editorDetached = false;
        this.editor.destroy();
    }

    updateLineCount() {
        let lineCount = this.refs.editor.value.split("\n").length;
        if (lineCount == this.props.lines) return;
        this.refs.lines.textContent = Array.from(new Array(lineCount), (_, i) => i + 1).join(".\n") + ".";
        this.props.lines = lineCount;
    }

    get options() {
        return {
            lineNumbers: true,
            mode: "css",
            indentUnit: 4,
            theme: "material",
            scrollbarStyle: "simple"
        };
    }

    get css() {
        let _ccss = DataStore.getBDData("bdcustomcss");
        let ccss = "";
        if (_ccss && _ccss !== "") {
            ccss = atob(_ccss);
        }
        return ccss;
    }

    get root() {
        let _root = $("#bd-customcss-detach-container");
        if (!_root.length) {
            if (!this.injectRoot()) return null;
            return this.detachedRoot;
        }
        return _root[0];
    }

    injectRoot() {
        if (!$(".app, .app-2rEoOp").length) return false;
        $("<div/>", {
            id: "bd-customcss-detach-container"
        }).insertAfter($(".app, .app-2rEoOp"));
        return true;
    }

    render() {
        let self = this;
        return BDV2.react.createElement(
            "div",
            {className: "bd-detached-css-editor", id: "bd-customcss-detach-editor"},
            BDV2.react.createElement(
                "div",
                {id: "bd-customcss-innerpane"},
                BDV2.react.createElement("div", {className: "editor-wrapper"},
                    BDV2.react.createElement("div", {id: "bd-customcss-editor-detached", className: "editor", ref: "editor"}, self.css)
                ),
                BDV2.react.createElement(
                    "div",
                    {id: "bd-customcss-attach-controls"},
                    BDV2.react.createElement(
                        "ul",
                        {className: "checkbox-group"},
                        BDV2.react.createElement(V2Components.Checkbox, {id: "live-update", text: "Live Update", onChange: self.onChange, checked: settingsCookie["bda-css-0"]})
                    ),
                    BDV2.react.createElement(
                        "div",
                        {id: "bd-customcss-detach-controls-button"},
                        BDV2.react.createElement(
                            "button",
                            {style: {borderRadius: "3px 0 0 3px", borderRight: "1px solid #3f4146"}, className: "btn btn-primary", onClick: () => {
                                    self.onClick("update");
                                }},
                            "Update"
                        ),
                        BDV2.react.createElement(
                            "button",
                            {style: {borderRadius: "0", borderLeft: "1px solid #2d2d2d", borderRight: "1px solid #2d2d2d"}, className: "btn btn-primary", onClick: () => {
                                    self.onClick("save");
                                }},
                            "Save"
                        ),
                        BDV2.react.createElement(
                            "button",
                            {style: {borderRadius: "0 3px 3px 0", borderLeft: "1px solid #3f4146"}, className: "btn btn-primary", onClick: () => {
                                    self.onClick("attach");
                                }},
                            "Attach"
                        ),
                        BDV2.react.createElement(
                            "span",
                            {style: {fontSize: "10px", marginLeft: "5px"}},
                            "Unsaved changes are lost on attach"
                        )
                    )
                )
            )
        );
    }

    onChange(id, checked) {
        switch (id) {
            case "live-update":
                settingsCookie["bda-css-0"] = checked;
                mainCore.saveSettings();
                break;
        }
    }

    onClick(id) {
        let self = this;
        switch (id) {
            case "attach":
                if ($("#editor-detached").length) self.props.attach();
                BDV2.reactDom.unmountComponentAtNode(self.root);
                self.root.remove();
                break;
            case "update":
                self.updateCss();
                break;
            case "save":
                self.saveCss();
                break;
        }
    }

    updateCss() {
        if ($("#customcss").length == 0) {
            $("head").append("<style id=\"customcss\"></style>");
        }
        $("#customcss").text(this.editor.session.getValue()).detach().appendTo(document.head);
    }

    saveCss() {
        DataStore.setBDData("bdcustomcss", btoa(this.editor.session.getValue()));
    }
}

class V2C_CssEditor extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        let self = this;
        self.props.lines = 0;
        self.setInitialState();
        self.attach = self.attach.bind(self);
        self.detachedEditor = BDV2.react.createElement(V2C_CssEditorDetached, {attach: self.attach});
        self.onClick = self.onClick.bind(self);
        self.updateCss = self.updateCss.bind(self);
        self.saveCss = self.saveCss.bind(self);
        self.detach = self.detach.bind(self);
    }

    setInitialState() {
        this.state = {
            detached: this.props.detached || BDV2.editorDetached
        };
    }

    componentDidMount() {
        // this.updateLineCount();
        this.editor = ace.edit("bd-customcss-editor");
        this.editor.setTheme("ace/theme/monokai");
        this.editor.session.setMode("ace/mode/css");
        this.editor.setShowPrintMargin(false);
        this.editor.setFontSize(14);
        this.editor.on("change", () => {
            if (!settingsCookie["bda-css-0"]) return;
            this.saveCss();
            this.updateCss();
        });
    }

    componentWillUnmount() {
        this.editor.destroy();
    }

    componentDidUpdate(prevProps, prevState) {
        let self = this;
        if (prevState.detached && !self.state.detached) {
            BDV2.reactDom.unmountComponentAtNode(self.detachedRoot);
        }
    }

    codeMirror() {
    }

    get options() {
        return {
            lineNumbers: true,
            mode: "css",
            indentUnit: 4,
            theme: "material",
            scrollbarStyle: "simple"
        };
    }

    get css() {
        let _ccss = DataStore.getBDData("bdcustomcss");
        let ccss = "";
        if (_ccss && _ccss !== "") {
            ccss = atob(_ccss);
        }
        return ccss;
    }

    updateLineCount() {
        let lineCount = this.refs.editor.value.split("\n").length;
        if (lineCount == this.props.lines) return;
        this.refs.lines.textContent = Array.from(new Array(lineCount), (_, i) => i + 1).join(".\n") + ".";
        this.props.lines = lineCount;
    }

    render() {
        let self = this;

        let {detached} = self.state;
        return BDV2.react.createElement(
            "div",
            {className: "contentColumn-2hrIYH contentColumnDefault-1VQkGM content-column default", style: {padding: "60px 40px 0px"}},
            detached && BDV2.react.createElement(
                "div",
                {id: "editor-detached"},
                BDV2.react.createElement(V2Components.SettingsTitle, {text: "Custom CSS Editor"}),
                BDV2.react.createElement(
                    "h3",
                    null,
                    "Editor Detached"
                ),
                BDV2.react.createElement(
                    "button",
                    {className: "btn btn-primary", onClick: () => {
                            self.attach();
                        }},
                    "Attach"
                )
            ),
            !detached && BDV2.react.createElement(
                "div",
                null,
                BDV2.react.createElement(V2Components.SettingsTitle, {text: "Custom CSS Editor"}),
                BDV2.react.createElement("div", {className: "editor-wrapper"},
                    BDV2.react.createElement("div", {id: "bd-customcss-editor", className: "editor", ref: "editor"}, self.css)
                ),
                BDV2.react.createElement(
                    "div",
                    {id: "bd-customcss-attach-controls"},
                    BDV2.react.createElement(
                        "ul",
                        {className: "checkbox-group"},
                        BDV2.react.createElement(V2Components.Checkbox, {id: "live-update", text: "Live Update", onChange: this.onChange, checked: settingsCookie["bda-css-0"]})
                    ),
                    BDV2.react.createElement(
                        "div",
                        {id: "bd-customcss-detach-controls-button"},
                        BDV2.react.createElement(
                            "button",
                            {style: {borderRadius: "3px 0 0 3px", borderRight: "1px solid #3f4146"}, className: "btn btn-primary", onClick: () => {
                                    self.onClick("update");
                                }},
                            "Update"
                        ),
                        BDV2.react.createElement(
                            "button",
                            {style: {borderRadius: "0", borderLeft: "1px solid #2d2d2d", borderRight: "1px solid #2d2d2d"}, className: "btn btn-primary", onClick: () => {
                                    self.onClick("save");
                                }},
                            "Save"
                        ),
                        BDV2.react.createElement(
                            "button",
                            {style: {borderRadius: "0 3px 3px 0", borderLeft: "1px solid #3f4146"}, className: "btn btn-primary", onClick: () => {
                                    self.onClick("detach");
                                }},
                            "Detach"
                        ),
                        BDV2.react.createElement(
                            "span",
                            {style: {fontSize: "10px", marginLeft: "5px"}},
                            "Unsaved changes are lost on detach"
                        ),
                        BDV2.react.createElement("div", {className: "help-text"},
                            "Press ",
                            BDV2.react.createElement("code", {className: "inline"}, "ctrl"),
                            "+",
                            BDV2.react.createElement("span", {className: "inline"}, ","),
                            " with the editor focused to access the editor's settings."
                        )
                    )
                )
            )
        );
    }

    onClick(arg) {
        let self = this;
        switch (arg) {
            case "update":
                self.updateCss();
                break;
            case "save":
                self.saveCss();
                break;
            case "detach":
                self.detach();
                break;
        }
    }

    onChange(id, checked) {
        switch (id) {
            case "live-update":
                settingsCookie["bda-css-0"] = checked;
                mainCore.saveSettings();
                break;
        }
    }

    updateCss() {
        if ($("#customcss").length == 0) {
            $("head").append("<style id=\"customcss\"></style>");
        }
        $("#customcss").text(this.editor.session.getValue()).detach().appendTo(document.head);
    }

    saveCss() {
        DataStore.setBDData("bdcustomcss", btoa(this.editor.session.getValue()));
    }

    detach() {
        let self = this;
        self.setState({
            detached: true
        });
        let droot = self.detachedRoot;
        if (!droot) {
            console.log("FAILED TO INJECT ROOT: .app");
            return;
        }
        BDV2.reactDom.render(self.detachedEditor, droot);
    }

    get detachedRoot() {
        let _root = $("#bd-customcss-detach-container");
        if (!_root.length) {
            if (!this.injectDetachedRoot()) return null;
            return this.detachedRoot;
        }
        return _root[0];
    }

    injectDetachedRoot() {
        if (!$(".app, .app-2rEoOp").length) return false;
        $("<div/>", {
            id: "bd-customcss-detach-container"
        }).insertAfter($(".app, .app-2rEoOp"));
        return true;
    }

    attach() {
        let self = this;
        self.setState({
            detached: false
        });
    }
}

class V2C_List extends BDV2.reactComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return BDV2.react.createElement(
            "ul",
            {className: this.props.className},
            this.props.children
        );
    }
}

class V2C_ContentColumn extends BDV2.reactComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return BDV2.react.createElement(
            "div",
            {className: "contentColumn-2hrIYH contentColumnDefault-1VQkGM content-column default"},
            BDV2.react.createElement(
                "h2",
                {className: "ui-form-title h2 margin-reset margin-bottom-20"},
                this.props.title
            ),
            this.props.children
        );
    }
}

class V2C_PluginCard extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        let self = this;
        self.onChange = self.onChange.bind(self);
        self.showSettings = self.showSettings.bind(self);
        self.setInitialState();
        self.hasSettings = typeof self.props.plugin.getSettingsPanel === "function";
        self.settingsPanel = "";

        this.reload = this.reload.bind(this);
        this.onReload = this.onReload.bind(this);
    }

    setInitialState() {
        this.state = {
            checked: pluginCookie[this.props.plugin.getName()],
            settings: false,
            reloads: 0
        };
    }

    // componentDidMount() {
    //     BDEvents.on("plugin-reloaded", this.onReload);
    // }

    // componentWillUnmount() {
    //     BDEvents.off("plugin-reloaded", this.onReload);
    // }

    onReload(pluginName) {
        if (pluginName !== this.props.plugin.getName()) return;
        this.setState({reloads: this.state.reloads + 1});
    }

    componentDidUpdate() {
        if (this.state.settings) {
            if (typeof this.settingsPanel === "object") {
                this.refs.settingspanel.appendChild(this.settingsPanel);
            }

            if (!settingsCookie["fork-ps-3"]) return;
            var isHidden = (container, element) => {

                let cTop = container.scrollTop;
                let cBottom = cTop + container.clientHeight;

                let eTop = element.offsetTop;
                let eBottom = eTop + element.clientHeight;

                return  (eTop < cTop || eBottom > cBottom);
            };

            let self = $(BDV2.reactDom.findDOMNode(this));
            let container = self.parents(".scroller");
            if (!isHidden(container[0], self[0])) return;
            container.animate({
                scrollTop: self.offset().top - container.offset().top + container.scrollTop() - 30
            }, 300);
        }
    }

    reload() {
        const plugin = this.props.plugin.getName();
        pluginModule.reloadPlugin(plugin);
        this.props.plugin = bdplugins[plugin].plugin;
        this.onReload(this.props.plugin.getName());
    }

    getString(value) {
        return typeof value == "string" ? value : value.toString();
    }

    render() {
        let self = this;
        let {plugin} = this.props;
        let name = this.getString(plugin.getName());
        let author = this.getString(plugin.getAuthor());
        let description = this.getString(plugin.getDescription());
        let version = this.getString(plugin.getVersion());
        let website = bdplugins[name].website;
        let source = bdplugins[name].source;

        if (this.state.settings) {
            try { self.settingsPanel = plugin.getSettingsPanel(); }
            catch (err) { Utils.err("Plugins", "Unable to get settings panel for " + plugin.getName() + ".", err); }

            return BDV2.react.createElement("li", {className: "settings-open ui-switch-item"},
                    BDV2.react.createElement("div", {style: {"float": "right", "cursor": "pointer"}, onClick: () => {
                            this.refs.settingspanel.innerHTML = "";
                            self.setState({settings: false});
                        }},
                    BDV2.react.createElement(V2Components.XSvg, null)
                ),
                typeof self.settingsPanel === "object" && BDV2.react.createElement("div", {id: `plugin-settings-${name}`, className: "plugin-settings", ref: "settingspanel"}),
                typeof self.settingsPanel !== "object" && BDV2.react.createElement("div", {id: `plugin-settings-${name}`, className: "plugin-settings", ref: "settingspanel", dangerouslySetInnerHTML: {__html: self.settingsPanel}})
            );
        }

        return BDV2.react.createElement("li", {"data-name": name, "data-version": version, "className": "settings-closed ui-switch-item"},
            BDV2.react.createElement("div", {className: "bda-header"},
                    BDV2.react.createElement("span", {className: "bda-header-title"},
                        BDV2.react.createElement("span", {className: "bda-name"}, name),
                        " v",
                        BDV2.react.createElement("span", {className: "bda-version"}, version),
                        " by ",
                        BDV2.react.createElement("span", {className: "bda-author"}, author)
                    ),
                    BDV2.react.createElement("div", {className: "bda-controls"},
                        !settingsCookie["fork-ps-5"] && BDV2.react.createElement(V2Components.TooltipWrap(V2Components.ReloadIcon, {color: "black", side: "top", text: "Reload"}), {className: "bd-reload-card", onClick: this.reload}),
                        BDV2.react.createElement("label", {className: "ui-switch-wrapper ui-flex-child", style: {flex: "0 0 auto"}},
                            BDV2.react.createElement("input", {checked: this.state.checked, onChange: this.onChange, className: "ui-switch-checkbox", type: "checkbox"}),
                            BDV2.react.createElement("div", {className: this.state.checked ? "ui-switch checked" : "ui-switch"})
                        )
                    )
            ),
            BDV2.react.createElement("div", {className: "bda-description-wrap scroller-wrap fade"},
                BDV2.react.createElement("div", {className: "bda-description scroller"}, description)
            ),
            (website || source || this.hasSettings) && BDV2.react.createElement("div", {className: "bda-footer"},
                BDV2.react.createElement("span", {className: "bda-links"},
                    website && BDV2.react.createElement("a", {className: "bda-link bda-link-website", href: website, target: "_blank"}, "Website"),
                    website && source && " | ",
                    source && BDV2.react.createElement("a", {className: "bda-link bda-link-source", href: source, target: "_blank"}, "Source")
                ),
                this.hasSettings && BDV2.react.createElement("button", {onClick: this.showSettings, className: "bda-settings-button", disabled: !this.state.checked}, "Settings")
            )
        );
    }

    onChange() {
        this.setState({checked: !this.state.checked});
        pluginModule.togglePlugin(this.props.plugin.getName());
    }

    showSettings() {
        if (!this.hasSettings) return;
        this.setState({settings: true});
    }
}

class V2C_ThemeCard extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        this.setInitialState();
        this.onChange = this.onChange.bind(this);
        this.reload = this.reload.bind(this);
    }

    setInitialState() {
        this.state = {
            checked: themeCookie[this.props.theme.name],
            reloads: 0
        };
    }

    // componentDidMount() {
    //     BDEvents.on("theme-reloaded", this.onReload);
    // }

    // componentWillUnmount() {
    //     BDEvents.off("theme-reloaded", this.onReload);
    // }

    onReload(themeName) {
        if (themeName !== this.props.theme.name) return;
        this.setState({reloads: this.state.reloads + 1});
    }

    reload() {
        const theme = this.props.theme.name;
        const error = themeModule.reloadTheme(theme);
        if (error) mainCore.showToast(`Could not reload ${bdthemes[theme].name}. Check console for details.`, {type: "error"});
        else mainCore.showToast(`${bdthemes[theme].name} v${bdthemes[theme].version} has been reloaded.`, {type: "success"});
        // this.setState(this.state);
        this.props.theme = bdthemes[theme];
        this.onReload(this.props.theme.name);
    }

    render() {
        let {theme} = this.props;
        let name = theme.name;
        let description = theme.description;
        let version = theme.version;
        let author = theme.author;
        let website = bdthemes[name].website;
        let source = bdthemes[name].source;

        return BDV2.react.createElement("li", {"data-name": name, "data-version": version, "className": "settings-closed ui-switch-item"},
            BDV2.react.createElement("div", {className: "bda-header"},
                    BDV2.react.createElement("span", {className: "bda-header-title"},
                        BDV2.react.createElement("span", {className: "bda-name"}, name),
                        " v",
                        BDV2.react.createElement("span", {className: "bda-version"}, version),
                        " by ",
                        BDV2.react.createElement("span", {className: "bda-author"}, author)
                    ),
                    BDV2.react.createElement("div", {className: "bda-controls"},
                        !settingsCookie["fork-ps-5"] && BDV2.react.createElement(V2Components.TooltipWrap(V2Components.ReloadIcon, {color: "black", side: "top", text: "Reload"}), {className: "bd-reload-card", onClick: this.reload}),
                        BDV2.react.createElement("label", {className: "ui-switch-wrapper ui-flex-child", style: {flex: "0 0 auto"}},
                            BDV2.react.createElement("input", {checked: this.state.checked, onChange: this.onChange, className: "ui-switch-checkbox", type: "checkbox"}),
                            BDV2.react.createElement("div", {className: this.state.checked ? "ui-switch checked" : "ui-switch"})
                        )
                    )
            ),
            BDV2.react.createElement("div", {className: "bda-description-wrap scroller-wrap fade"},
                BDV2.react.createElement("div", {className: "bda-description scroller"}, description)
            ),
            (website || source) && BDV2.react.createElement("div", {className: "bda-footer"},
                BDV2.react.createElement("span", {className: "bda-links"},
                    website && BDV2.react.createElement("a", {className: "bda-link", href: website, target: "_blank"}, "Website"),
                    website && source && " | ",
                    source && BDV2.react.createElement("a", {className: "bda-link", href: source, target: "_blank"}, "Source")
                )
            )
        );
    }

    onChange() {
        this.setState({checked: !this.state.checked});
        themeModule.toggleTheme(this.props.theme.name);
    }
}

class V2Cs_TabBar {
    static get Item() {
        return V2C_TabBarItem;
    }
    static get Header() {
        return V2C_TabBarHeader;
    }
    static get Separator() {
        return V2C_TabBarSeparator;
    }
}


class V2Components {
    static get SettingsGroup() {
        return V2C_SettingsGroup;
    }
    static get SectionedSettingsPanel() {
        return V2C_SectionedSettingsPanel;
    }
    static get SettingsPanel() {
        return V2C_SettingsPanel;
    }
    static get Switch() {
        return V2C_Switch;
    }
    static get Scroller() {
        return V2C_Scroller;
    }
    static get TabBar() {
        return V2Cs_TabBar;
    }
    static get SideBar() {
        return V2C_SideBar;
    }
    static get Tools() {
        return V2C_Tools;
    }
    static get SettingsTitle() {
        return V2C_SettingsTitle;
    }
    static get CssEditor() {
        return V2C_CssEditor;
    }
    static get Checkbox() {
        return V2C_Checkbox;
    }
    static get List() {
        return V2C_List;
    }
    static get PluginCard() {
        return V2C_PluginCard;
    }
    static get ThemeCard() {
        return V2C_ThemeCard;
    }
    static get ContentColumn() {
        return V2C_ContentColumn;
    }
    static get ReloadIcon() {
        return V2C_ReloadIcon;
    }
    static get XSvg() {
        return V2C_XSvg;
    }
    static get Layer() {
        return V2C_Layer;
    }
    static get SidebarView() {
        return V2C_SidebarView;
    }
    static get ServerCard() {
        return V2C_ServerCard;
    }

    static TooltipWrap(Component, options) {

        const {style = "black", side = "top", text = ""} = options;
        const id = BDV2.KeyGenerator();

        return class extends BDV2.reactComponent {
            constructor(props) {
                super(props);
                this.onMouseEnter = this.onMouseEnter.bind(this);
                this.onMouseLeave = this.onMouseLeave.bind(this);
            }

            componentDidMount() {
                this.node = BDV2.reactDom.findDOMNode(this);
                this.node.addEventListener("mouseenter", this.onMouseEnter);
                this.node.addEventListener("mouseleave", this.onMouseLeave);
            }

            componentWillUnmount() {
                this.node.removeEventListener("mouseenter", this.onMouseEnter);
                this.node.removeEventListener("mouseleave", this.onMouseLeave);
            }

            onMouseEnter() {
		if (!BDV2.Tooltips) return;
                const {left, top, width, height} = this.node.getBoundingClientRect();
                BDV2.Tooltips.show(id, {
                    position: side,
                    text: text,
                    color: style,
                    targetWidth: width,
                    targetHeight: height,
                    windowWidth: Utils.screenWidth,
                    windowHeight: Utils.screenHeight,
                    x: left,
                    y: top
                });

                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        const nodes = Array.from(mutation.removedNodes);
                        const directMatch = nodes.indexOf(this.node) > -1;
                        const parentMatch = nodes.some(parent => parent.contains(this.node));
                        if (directMatch || parentMatch) {
                            this.onMouseLeave();
                            observer.disconnect();
                        }
                    });
                });

                observer.observe(document.body, {subtree: true, childList: true});
            }

            onMouseLeave() {
		if (!BDV2.Tooltips) return;
                BDV2.Tooltips.hide(id);
            }

            render() {
                return BDV2.react.createElement(Component, this.props);
            }
        };
    }
}

class V2_SettingsPanel_Sidebar {

    constructor(onClick) {
        this.onClick = onClick;
    }

    get items() {
        return [{text: "Settings", id: "core"}, {text: "Emotes", id: "emotes"}, {text: "Plugins", id: "plugins"}, {text: "Themes", id: "themes"}, {text: "Custom CSS", id: "customcss"}];
    }

    get component() {
        return BDV2.react.createElement(
            "span",
            null,
            BDV2.react.createElement(V2Components.SideBar, {onClick: this.onClick, headerText: "Bandaged BD", items: this.items}),
            BDV2.react.createElement(
                "div",
                {style: {fontSize: "12px", fontWeight: "600", color: "#72767d", padding: "2px 10px"}},
                `BD v${bdConfig.version} by `,
                BDV2.react.createElement(
                    "a",
                    {href: "https://github.com/Jiiks/", target: "_blank"},
                    "Jiiks"
                )
            ),
            BDV2.react.createElement(
                "div",
                {style: {fontSize: "12px", fontWeight: "600", color: "#72767d", padding: "2px 10px"}},
                `BBD v${bbdVersion} by `,
                BDV2.react.createElement(
                    "a",
                    {href: "https://github.com/rauenzi/", target: "_blank"},
                    "Zerebos"
                )
            )
        );
    }

    get root() {
        let _root = $("#bd-settings-sidebar");
        if (!_root.length) {
            if (!this.injectRoot()) return null;
            return this.root;
        }
        return _root[0];
    }

    injectRoot() {
        let changeLog = $("[class*='side-'] > [class*='item-']:not([class*=Danger])").last();
        if (!changeLog.length) return false;
        $("<span/>", {id: "bd-settings-sidebar"}).insertBefore(changeLog.prev());
        return true;
    }

    render() {
        let root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: [class*='side-'] > [class*='item-']:not([class*=Danger])");
            return;
        }
        BDV2.reactDom.render(this.component, root);
        Utils.onRemoved(root, () => {
            BDV2.reactDom.unmountComponentAtNode(root);
        });
    }
}

class V2_SettingsPanel {

    constructor() {
        let self = this;
        self.sideBarOnClick = self.sideBarOnClick.bind(self);
        self.onChange = self.onChange.bind(self);
        self.updateSettings = this.updateSettings.bind(self);
        self.sidebar = new V2_SettingsPanel_Sidebar(self.sideBarOnClick);
    }

    get root() {
        let _root = $("#bd-settingspane-container");
        if (!_root.length) {
            if (!this.injectRoot()) return null;
            return this.root;
        }
        return _root[0];
    }

    injectRoot() {
        if (!$(".layer-3QrUeG .standardSidebarView-3F1I7i, .layer-3QrUeG .ui-standard-sidebar-view").length) return false;
        const root = $("<div/>", {
            "class": "contentRegion-3nDuYy content-region",
            "id": "bd-settingspane-container"
        });
        $(".layer-3QrUeG .standardSidebarView-3F1I7i, .layer-3QrUeG .ui-standard-sidebar-view").append(root);

        Utils.onRemoved(root[0], () => {
            BDV2.reactDom.unmountComponentAtNode(root[0]);
        });
        return true;
    }

    get coreSettings() {
        const settings = this.getSettings("core");
        const categories = [...new Set(settings.map(s => s.category))];
        const sections = categories.map(c => {return {title: c, settings: settings.filter(s => s.category == c)};});
        return sections;
    }

    get emoteSettings() {
        return this.getSettings("emote");
    }
    getSettings(category) {
        return Object.keys(settings).reduce((arr, key) => {
            let setting = settings[key];
            if (setting.cat === category && setting.implemented && !setting.hidden) {
                setting.text = key;
                arr.push(setting);
            }
            return arr;
        }, []);
    }

    sideBarOnClick(id) {
        let self = this;
        $(".contentRegion-3nDuYy, .content-region").first().hide();
        $(self.root).show();
        switch (id) {
            case "core":
                self.renderCoreSettings();
                break;
            case "emotes":
                self.renderEmoteSettings();
                break;
            case "customcss":
                self.renderCustomCssEditor();
                break;
            case "plugins":
                self.renderPluginPane();
                break;
            case "themes":
                self.renderThemePane();
                break;
        }
    }

    onClick() {}

    onChange(id, checked) {
        this.updateSettings(id, checked);
    }

    updateSettings(id, enabled) {
        settingsCookie[id] = enabled;

        if (id == "bda-es-0") {
            if (enabled) $("#twitchcord-button-container").show();
            else $("#twitchcord-button-container").hide();
        }

        // if (id == "bda-gs-b") {
        //     if (enabled) $("body").addClass("bd-blue");
        //     else $("body").removeClass("bd-blue");
        // }

        if (id == "bda-gs-2") {
            if (enabled) $("body").addClass("bd-minimal");
            else $("body").removeClass("bd-minimal");
        }

        if (id == "bda-gs-3") {
            if (enabled) $("body").addClass("bd-minimal-chan");
            else $("body").removeClass("bd-minimal-chan");
        }

        if (id == "bda-gs-1") {
            if (enabled) $("#bd-pub-li").show();
            else $("#bd-pub-li").hide();
        }

        if (id == "bda-gs-4") {
            if (enabled) voiceMode.enable();
            else voiceMode.disable();
        }

        if (id == "bda-gs-5") {
            if (enabled) $("#app-mount").addClass("bda-dark");
            else $("#app-mount").removeClass("bda-dark");
        }

        if (enabled && id == "bda-gs-6") mainCore.inject24Hour();

        if (id == "bda-gs-7") {
            if (enabled) mainCore.injectColoredText();
            else mainCore.removeColoredText();
        }

        if (id == "bda-es-4") {
            if (enabled) emoteModule.autoCapitalize();
            else emoteModule.disableAutoCapitalize();
        }

        if (id == "fork-ps-4") {
            if (enabled) ClassNormalizer.start();
            else ClassNormalizer.stop();
        }

        if (id == "fork-ps-5") {
            if (enabled) {
                ContentManager.watchContent("plugin");
                ContentManager.watchContent("theme");
            }
            else {
                ContentManager.unwatchContent("plugin");
                ContentManager.unwatchContent("theme");
            }
        }

        if (id == "fork-wp-1") {
            BdApi.setWindowPreference("transparent", enabled);
            if (enabled) BdApi.setWindowPreference("backgroundColor", null);
            else BdApi.setWindowPreference("backgroundColor", "#2f3136");
        }

        /*if (_c["fork-wp-2"]) {
            const current = BdApi.getWindowPreference("frame");
            if (current != _c["fork-wp-2"]) BdApi.setWindowPreference("frame", _c["fork-wp-2"]);
        }*/


        if (id == "bda-gs-8") {
            if (enabled) dMode.enable(settingsCookie["fork-dm-1"]);
            else dMode.disable();
        }

        mainCore.saveSettings();
    }

    initializeSettings() {
        if (settingsCookie["bda-es-0"]) $("#twitchcord-button-container").show();
        // if (settingsCookie["bda-gs-b"]) $("body").addClass("bd-blue");
        if (settingsCookie["bda-gs-2"]) $("body").addClass("bd-minimal");
        if (settingsCookie["bda-gs-3"]) $("body").addClass("bd-minimal-chan");
        if (settingsCookie["bda-gs-1"]) $("#bd-pub-li").show();
        if (settingsCookie["bda-gs-4"]) voiceMode.enable();
        if (settingsCookie["bda-gs-5"]) $("#app-mount").addClass("bda-dark");
        if (settingsCookie["bda-gs-6"]) mainCore.inject24Hour();
        if (settingsCookie["bda-gs-7"]) mainCore.injectColoredText();
        if (settingsCookie["bda-es-4"]) emoteModule.autoCapitalize();
        if (settingsCookie["fork-ps-4"]) ClassNormalizer.start();

        if (settingsCookie["fork-ps-5"]) {
            ContentManager.watchContent("plugin");
            ContentManager.watchContent("theme");
        }

        if (settingsCookie["bda-gs-8"]) dMode.enable(settingsCookie["fork-dm-1"]);

        mainCore.saveSettings();
    }

    renderSidebar() {
        let self = this;
        $("[class*='side-'] > [class*='item-']").off("click.v2settingspanel").on("click.v2settingspanel", () => {
            BDV2.reactDom.unmountComponentAtNode(self.root);
            $(self.root).hide();
            $(".contentRegion-3nDuYy, .content-region").first().show();
        });
        self.sidebar.render();
    }

    get coreComponent() {
        return BDV2.react.createElement(V2Components.Scroller, {contentColumn: true, fade: true, dark: true, children: [
            BDV2.react.createElement(V2Components.SectionedSettingsPanel, {key: "cspanel", onChange: this.onChange, sections: this.coreSettings}),
            BDV2.react.createElement(V2Components.Tools, {key: "tools"})
        ]});
    }

    get emoteComponent() {
        return BDV2.react.createElement(V2Components.Scroller, {
            contentColumn: true, fade: true, dark: true, children: [
                BDV2.react.createElement(V2Components.SettingsPanel, {key: "espanel", title: "Emote Settings", onChange: this.onChange, settings: this.emoteSettings, button: {
                    title: "Clear Emote Cache",
                    onClick: () => { emoteModule.clearEmoteData(); emoteModule.init(); quickEmoteMenu.init(); }
                }}),
                BDV2.react.createElement(V2Components.Tools, {key: "tools"})
        ]});
    }

    get customCssComponent() {
        return BDV2.react.createElement(V2Components.Scroller, {contentColumn: true, fade: true, dark: true, children: [BDV2.react.createElement(V2Components.CssEditor, {key: "csseditor"}), BDV2.react.createElement(V2Components.Tools, {key: "tools"})]});
    }

    contentComponent(type) {
        const componentElement = type == "plugins" ? this.pluginsComponent : this.themesComponent;
        const prefix = type.replace("s", "");
        const settingsList = this;
        class ContentList extends BDV2.react.Component {
            constructor(props) {
                super(props);
                this.onChange = this.onChange.bind(this);
            }

            componentDidMount() {
                BDEvents.on(`${prefix}-reloaded`, this.onChange);
                BDEvents.on(`${prefix}-loaded`, this.onChange);
                BDEvents.on(`${prefix}-unloaded`, this.onChange);
            }

            componentWillUnmount() {
                BDEvents.off(`${prefix}-reloaded`, this.onChange);
                BDEvents.off(`${prefix}-loaded`, this.onChange);
                BDEvents.off(`${prefix}-unloaded`, this.onChange);
            }

            onChange() {
                settingsList.sideBarOnClick(type);
            }

            render() {return componentElement;}
        }
        return BDV2.react.createElement(ContentList);
    }

    get pluginsComponent() {
        let plugins = Object.keys(bdplugins).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).reduce((arr, key) => {
            arr.push(BDV2.react.createElement(V2Components.PluginCard, {key: key, plugin: bdplugins[key].plugin}));return arr;
        }, []);
        let list = BDV2.react.createElement(V2Components.List, {key: "plugin-list", className: "bda-slist", children: plugins});
        let refreshIcon = !settingsCookie["fork-ps-5"] && BDV2.react.createElement(V2Components.TooltipWrap(V2Components.ReloadIcon, {color: "black", side: "top", text: "Reload Plugin List"}), {className: "bd-reload-header", size: "18px", onClick: async () => {
            pluginModule.updatePluginList();
            this.sideBarOnClick("plugins");
        }});
        let pfBtn = BDV2.react.createElement("button", {key: "folder-button", className: "bd-pfbtn", onClick: () => { require("electron").shell.openItem(ContentManager.pluginsFolder); }}, "Open Plugin Folder");
        let contentColumn = BDV2.react.createElement(V2Components.ContentColumn, {key: "pcolumn", title: "Plugins", children: [refreshIcon, pfBtn, list]});
        return BDV2.react.createElement(V2Components.Scroller, {contentColumn: true, fade: true, dark: true, children: [contentColumn, BDV2.react.createElement(V2Components.Tools, {key: "tools"})]});
    }

    get themesComponent() {
        let themes = Object.keys(bdthemes).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).reduce((arr, key) => {
            arr.push(BDV2.react.createElement(V2Components.ThemeCard, {key: key, theme: bdthemes[key]}));return arr;
        }, []);
        let list = BDV2.react.createElement(V2Components.List, {key: "theme-list", className: "bda-slist", children: themes});
        let refreshIcon = !settingsCookie["fork-ps-5"] && BDV2.react.createElement(V2Components.TooltipWrap(V2Components.ReloadIcon, {color: "black", side: "top", text: "Reload Theme List"}), {className: "bd-reload-header", size: "18px", onClick: async () => {
            themeModule.updateThemeList();
            this.sideBarOnClick("themes");
        }});
        let tfBtn = BDV2.react.createElement("button", {key: "folder-button", className: "bd-pfbtn", onClick: () => { require("electron").shell.openItem(ContentManager.themesFolder); }}, "Open Theme Folder");
        let contentColumn = BDV2.react.createElement(V2Components.ContentColumn, {key: "tcolumn", title: "Themes", children: [refreshIcon, tfBtn, list]});
        return BDV2.react.createElement(V2Components.Scroller, {contentColumn: true, fade: true, dark: true, children: [contentColumn, BDV2.react.createElement(V2Components.Tools, {key: "tools"})]});
    }

    renderCoreSettings() {
        let root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layer-3QrUeG .standardSidebarView-3F1I7i");
            return;
        }
        BDV2.reactDom.render(this.coreComponent, root);
    }

    renderEmoteSettings() {
        let root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layer-3QrUeG .standardSidebarView-3F1I7i");
            return;
        }
        BDV2.reactDom.render(this.emoteComponent, root);
    }

    renderCustomCssEditor() {
        let root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layer-3QrUeG .standardSidebarView-3F1I7i");
            return;
        }
        BDV2.reactDom.render(this.customCssComponent, root);
    }

    renderPluginPane() {
        let root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layer-3QrUeG .standardSidebarView-3F1I7i");
            return;
        }
        BDV2.reactDom.render(this.contentComponent("plugins"), root);
    }

    renderThemePane() {
        let root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layer-3QrUeG .standardSidebarView-3F1I7i");
            return;
        }
        BDV2.reactDom.render(this.contentComponent("themes"), root);
    }
}








































class V2C_Layer extends BDV2.reactComponent {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        $(window).on(`keyup.${this.props.id}`, e => {
            if (e.which === 27) {
                BDV2.reactDom.unmountComponentAtNode(this.refs.root.parentNode);
            }
        });

        $(`#${this.props.id}`).animate({opacity: 1}, {
            step: function(now) {
              $(this).css("transform", `scale(${1.1 - 0.1 * now}) translateZ(0px)`);
            },
            duration: 200,
            done: () => {$(`#${this.props.id}`).css("opacity", "").css("transform", "");}
        });
    }

    componentWillUnmount() {
        $(window).off(`keyup.${this.props.id}`);
        $(`#${this.props.id}`).animate({opacity: 0}, {
            step: function(now) {
              $(this).css("transform", `scale(${1.1 - 0.1 * now}) translateZ(0px)`);
            },
            duration: 200,
            done: () => {$(`#${this.props.rootId}`).remove();}
        });

        $("[class*=\"layer-\"]").removeClass("publicServersOpen").animate({opacity: 1}, {
            step: function(now) {
              $(this).css("transform", `scale(${0.07 * now + 0.93}) translateZ(0px)`);
            },
            duration: 200,
            done: () => {$("[class*=\"layer-\"]").css("opacity", "").css("transform", "");}
        });

    }

    componentWillMount() {
        $("[class*=\"layer-\"]").addClass("publicServersOpen").animate({opacity: 0}, {
            step: function(now) {
              $(this).css("transform", `scale(${0.07 * now + 0.93}) translateZ(0px)`);
            },
            duration: 200
        });
    }

    render() {
        return BDV2.react.createElement(
            "div",
            {className: "layer bd-layer layer-3QrUeG", id: this.props.id, ref: "root", style: {opacity: 0, transform: "scale(1.1) translateZ(0px)"}},
            this.props.children
        );
    }
}

class V2C_SidebarView extends BDV2.reactComponent {

    constructor(props) {
        super(props);
    }

    render() {
        let {sidebar, content, tools} = this.props.children;
        return BDV2.react.createElement(
            "div",
            {className: "standardSidebarView-3F1I7i ui-standard-sidebar-view"},
            BDV2.react.createElement(
                "div",
                {className: "sidebarRegion-VFTUkN sidebar-region"},
                BDV2.react.createElement(V2Components.Scroller, {key: "sidebarScroller", ref: "sidebarScroller", sidebar: true, fade: sidebar.fade || true, dark: sidebar.dark || true, children: sidebar.component})
            ),
            BDV2.react.createElement("div", {className: "contentRegion-3nDuYy content-region"},
                BDV2.react.createElement("div", {className: "contentTransitionWrap-3hqOEW content-transition-wrap"},
                    BDV2.react.createElement("div", {className: "scrollerWrap-2lJEkd firefoxFixScrollFlex-cnI2ix contentRegionScrollerWrap-3YZXdm content-region-scroller-wrap scrollerThemed-2oenus themeGhost-28MSn0 scrollerTrack-1ZIpsv"},
                        BDV2.react.createElement("div", {className: "scroller-2FKFPG firefoxFixScrollFlex-cnI2ix contentRegionScroller-26nc1e content-region-scroller scroller", ref: "contentScroller"},
                            BDV2.react.createElement("div", {className: "contentColumn-2hrIYH contentColumnDefault-1VQkGM content-column default"}, content.component),
                            tools.component
                        )
                    )
                )
            )
        );
    }
}


class V2_PublicServers {

    constructor() {}

    get component() {
        return BDV2.react.createElement(V2Components.Layer, {rootId: "pubslayerroot", id: "pubslayer", children: BDV2.react.createElement(V2C_PublicServers, {rootId: "pubslayerroot"})});
    }

    get root() {
        let _root = document.getElementById("pubslayerroot");
        if (!_root) {
            if (!this.injectRoot()) return null;
            return this.root;
        }
        return _root;
    }

    injectRoot() {
        if (!$(".layers, .layers-3iHuyZ").length) return false;
        $(".layers, .layers-3iHuyZ").append($("<div/>", {
            id: "pubslayerroot"
        }));
        return true;
    }

    render() {
        // BdApi.alert("Broken", "Sorry but the Public Servers modules is currently broken, I recommend disabling this feature for now.");
        let root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layers");
            return;
        }
        BDV2.reactDom.render(this.component, root);
    }

    get button() {
        let btn = $("<div/>", {
            "class": BDV2.guildClasses.listItem,
            "id": "bd-pub-li",
            "style": settingsCookie["bda-gs-1"] ? "" : "display: none;"
        }).append($("<div/>", {
            "class": "wrapper-25eVIn " + BDV2.guildClasses.circleButtonMask,
            "text": "public",
            "id": "bd-pub-button",
            "click": () => { this.render(); }
        }));

        return btn;
    }

    initialize() {
        const wrapper = BDV2.guildClasses.wrapper.split(" ")[0];
        const guilds = $(`.${wrapper} .scroller-2FKFPG >:first-child`);
        guilds.after(this.button);
    }
}


class V2C_ServerCard extends BDV2.reactComponent {
    constructor(props) {
        super(props);
        if (!this.props.server.iconUrl) this.props.server.iconUrl = this.props.fallback;
        this.state = {
            imageError: false,
            joined: this.props.guildList.includes(this.props.server.identifier)
        };
    }

    render() {
        let {server} = this.props;
        return BDV2.react.createElement(
            "div", // cardPrimary-1Hv-to
            {className: `card-3Qj_Yx cardPrimary-1Hv-to marginBottom8-AtZOdT bd-server-card${server.pinned ? " bd-server-card-pinned" : ""}`},
            // BDV2.react.createElement(
                // "div",
                // { className: "flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-3jynv6" },
                BDV2.react.createElement("img", {ref: "img", className: "bd-server-image", src: server.iconUrl, onError: this.handleError.bind(this)}),
                BDV2.react.createElement(
                    "div",
                    {className: "flexChild-faoVW3 bd-server-content"},
                    BDV2.react.createElement(
                        "div",
                        {className: "flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY directionRow-3v3tfG noWrap-3jynv6 bd-server-header"},
                        BDV2.react.createElement(
                            "h5",
                            {className: "h5-18_1nd defaultColor-1_ajX0 margin-reset bd-server-name"},
                            server.name
                        ),
                        BDV2.react.createElement(
                            "h5",
                            {className: "h5-18_1nd defaultColor-1_ajX0 margin-reset bd-server-member-count"},
                            server.members,
                            " Members"
                        )
                    ),
                    BDV2.react.createElement(
                        "div",
                        {className: "flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY directionRow-3v3tfG noWrap-3jynv6"},
                        BDV2.react.createElement(
                            "div",
                            {className: "scrollerWrap-2lJEkd scrollerThemed-2oenus themeGhostHairline-DBD-2d scrollerFade-1Ijw5y bd-server-description-container"},
                            BDV2.react.createElement(
                                "div",
                                {className: "scroller-2FKFPG scroller bd-server-description"},
                                    server.description
                            )
                        )
                    ),
                    BDV2.react.createElement(
                        "div",
                        {className: "flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY directionRow-3v3tfG noWrap-3jynv6 bd-server-footer"},
                        BDV2.react.createElement(
                            "div",
                            {className: "flexChild-faoVW3 bd-server-tags", style: {flex: "1 1 auto"}},
                            server.categories.join(", ")
                        ),
                        this.state.joined && BDV2.react.createElement(
                            "button",
                            {type: "button", className: "button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeMin-1mJd1x grow-q77ONN colorGreen-29iAKY", style: {minHeight: "12px", marginTop: "4px", backgroundColor: "#3ac15c"}},
                            BDV2.react.createElement(
                                "div",
                                {className: "ui-button-contents"},
                                "Joined"
                            )
                        ),
                        server.error && BDV2.react.createElement(
                            "button",
                            {type: "button", className: "button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeMin-1mJd1x grow-q77ONN disabled-9aF2ug", style: {minHeight: "12px", marginTop: "4px", backgroundColor: "#c13a3a"}},
                            BDV2.react.createElement(
                                "div",
                                {className: "ui-button-contents"},
                                "Error"
                            )
                        ),
                        !server.error && !this.state.joined && BDV2.react.createElement(
                            "button",
                            {type: "button", className: "button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeMin-1mJd1x grow-q77ONN", style: {minHeight: "12px", marginTop: "4px"}, onClick: () => {this.join();}},
                            BDV2.react.createElement(
                                "div",
                                {className: "ui-button-contents"},
                                "Join"
                            )
                        )
                    )
                )
            // )
        );
    }

    handleError() {
        this.props.server.iconUrl = this.props.fallback;
        this.setState({imageError: true});
    }

    join() {
        this.props.join(this);
        //this.setState({joined: true});
    }
}

class V2C_PublicServers extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        this.setInitialState();
        this.close = this.close.bind(this);
        this.changeCategory = this.changeCategory.bind(this);
        this.search = this.search.bind(this);
        this.searchKeyDown = this.searchKeyDown.bind(this);
        this.checkConnection = this.checkConnection.bind(this);
        this.join = this.join.bind(this);
        this.connect = this.connect.bind(this);

        this.GuildStore = BDV2.WebpackModules.findByUniqueProperties(["getGuilds"]);
        this.AvatarDefaults = BDV2.WebpackModules.findByUniqueProperties(["getUserAvatarURL", "DEFAULT_AVATARS"]);
        this.InviteActions = BDV2.WebpackModules.findByUniqueProperties(["acceptInvite"]);
        this.SortedGuildStore = BDV2.WebpackModules.findByUniqueProperties(["getSortedGuilds"]);
    }

    componentDidMount() {
        this.checkConnection();
     }

    setInitialState() {
        this.state = {
            selectedCategory: -1,
            title: "Loading...",
            loading: true,
            servers: [],
            next: null,
            connection: {
                state: 0,
                user: null
            }
        };
    }

    close() {
        BDV2.reactDom.unmountComponentAtNode(document.getElementById(this.props.rootId));
    }

    search(query, clear) {
        let self = this;

        $.ajax({
            method: "GET",
            url: `${self.endPoint}${query}${query ? "&schema=new" : "?schema=new"}`,
            success: data => {
                let servers = data.results.reduce((arr, server) => {
                    server.joined = false;
                    arr.push(server);
                    // arr.push(<V2Components.ServerCard server={server} join={self.join}/>);
                    return arr;
                }, []);

                if (!clear) {
                    servers = self.state.servers.concat(servers);
                }
                else {
                    //servers.unshift(self.bdServer);
                }

                let end = data.size + data.from;
                data.next = `?from=${end}`;
                if (self.state.term) data.next += `&term=${self.state.term}`;
                if (self.state.selectedCategory) data.next += `&category=${self.categoryButtons[self.state.selectedCategory]}`;
                if (end >= data.total) {
                    end = data.total;
                    data.next = null;
                }

                let title = `Showing 1-${end} of ${data.total} results in ${self.categoryButtons[self.state.selectedCategory]}`;
                if (self.state.term) title += ` for ${self.state.term}`;

                self.setState({
                    loading: false,
                    title: title,
                    servers: servers,
                    next: data.next
                });

                if (clear) {
                    //console.log(self);
                    self.refs.sbv.refs.contentScroller.scrollTop = 0;
                }
            },
            error: () => {
                self.setState({
                    loading: false,
                    title: "Failed to load servers. Check console for details"
                });
            }
        });
    }

    join(serverCard) {
        if (serverCard.props.pinned) return this.InviteActions.acceptInvite(serverCard.props.invite_code);
        $.ajax({
            method: "GET",
            url: `${this.joinEndPoint}/${serverCard.props.server.identifier}`,
            headers: {
                "Accept": "application/json;",
                "Content-Type": "application/json;" ,
                "x-discord-token": this.state.connection.user.accessToken
            },
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            success: () => {
                serverCard.setState({joined: true});
            }
        });
    }

    connect() {
        let self = this;
        let options = self.windowOptions;
        options.x = Math.round(window.screenX + window.innerWidth / 2 - options.width / 2);
        options.y = Math.round(window.screenY + window.innerHeight / 2 - options.height / 2);

        self.joinWindow = new (window.require("electron").remote.BrowserWindow)(options);
        const url = "https://auth.discordservers.com/connect?scopes=guilds.join&previousUrl=https://auth.discordservers.com/info";
        self.joinWindow.webContents.on("did-navigate", (event, url) => {
            if (url != "https://auth.discordservers.com/info") return;
            self.joinWindow.close();
            self.checkConnection();
        });
        self.joinWindow.loadURL(url);
    }

    get windowOptions() {
        return {
            width: 500,
            height: 550,
            backgroundColor: "#282b30",
            show: true,
            resizable: false,
            maximizable: false,
            minimizable: false,
            alwaysOnTop: true,
            frame: false,
            center: false,
            webPreferences: {
                nodeIntegration: false
            }
        };
    }

    get bdServer() {
        let server = {
            name: "BetterDiscord",
            online: "7500+",
            members: "20000+",
            categories: ["community", "programming", "support"],
            description: "Official BetterDiscord server for support etc",
            identifier: "86004744966914048",
            iconUrl: "https://cdn.discordapp.com/icons/86004744966914048/292e7f6bfff2b71dfd13e508a859aedd.webp",
            nativejoin: true,
            invite_code: "0Tmfo5ZbORCRqbAd",
            pinned: true
        };
        let guildList = this.SortedGuildStore.guildPositions;
        let defaultList = this.AvatarDefaults.DEFAULT_AVATARS;
        return BDV2.react.createElement(V2Components.ServerCard, {server: server, pinned: true, join: this.join, guildList: guildList, fallback: defaultList[Math.floor(Math.random() * 5)]});
    }

    get endPoint() {
        return "https://search.discordservers.com";
    }

    get joinEndPoint() {
        return "https://j.discordservers.com";
    }

    get connectEndPoint() {
        return "https://join.discordservers.com/connect";
    }

    checkConnection() {
        let self = this;
        try {
            $.ajax({
                method: "GET",
                url: `https://auth.discordservers.com/info`,
                headers: {
                    "Accept": "application/json;",
                    "Content-Type": "application/json;"
                },
                crossDomain: true,
                xhrFields: {
                    withCredentials: true
                },
                success: data => {
                    // Utils.log("PublicServer", "Got data: " + JSON.stringify(data));
                    self.setState({
                        selectedCategory: 0,
                        connection: {
                            state: 2,
                            user: data
                        }
                    });
                    self.search("", true);

                },
                error: () => {
                    self.setState({
                        title: "Not connected to discordservers.com!",
                        loading: true,
                        selectedCategory: -1,
                        connection: {
                            state: 1,
                            user: null
                        }
                    });
                }
            });
        }
        catch (error) {
            self.setState({
                title: "Not connected to discordservers.com!",
                loading: true,
                selectedCategory: -1,
                connection: {
                    state: 1,
                    user: null
                }
            });
        }
    }

    render() {
        return BDV2.react.createElement(V2Components.SidebarView, {ref: "sbv", children: this.component});
    }

    get component() {
        return {
            sidebar: {
                component: this.sidebar
            },
            content: {
                component: this.content
            },
            tools: {
                component: BDV2.react.createElement(V2Components.Tools, {key: "pt", ref: "tools", onClick: this.close})
            }
        };
    }

    get sidebar() {
        return BDV2.react.createElement(
            "div",
            {className: "sidebar", key: "ps"},
            BDV2.react.createElement(
                "div",
                {className: "ui-tab-bar SIDE"},
                BDV2.react.createElement(
                    "div",
                    {className: "ui-tab-bar-header", style: {fontSize: "16px"}},
                    "Public Servers"
                ),
                BDV2.react.createElement(V2Components.TabBar.Separator, null),
                this.searchInput,
                BDV2.react.createElement(V2Components.TabBar.Separator, null),
                BDV2.react.createElement(V2Components.TabBar.Header, {text: "Categories"}),
                this.categoryButtons.map((value, index) => {
                    return BDV2.react.createElement(V2Components.TabBar.Item, {id: index, onClick: this.changeCategory, key: index, text: value, selected: this.state.selectedCategory === index});
                }),
                BDV2.react.createElement(V2Components.TabBar.Separator, null),
                this.footer,
                this.connection
            )
        );
    }

    get searchInput() {
        return BDV2.react.createElement(
            "div",
            {className: "ui-form-item"},
            BDV2.react.createElement(
                "div",
                {className: "ui-text-input flex-vertical", style: {width: "172px", marginLeft: "10px"}},
                BDV2.react.createElement("input", {ref: "searchinput", onKeyDown: this.searchKeyDown, onChange: () => {}, type: "text", className: "input default", placeholder: "Search...", maxLength: "50"})
            )
        );
    }

    searchKeyDown(e) {
        let self = this;
        if (self.state.loading || e.which !== 13) return;
        self.setState({
            loading: true,
            title: "Loading...",
            term: e.target.value
        });
        let query = `?term=${e.target.value}`;
        if (self.state.selectedCategory !== 0) {
            query += `&category=${self.categoryButtons[self.state.selectedCategory]}`;
        }
        self.search(query, true);
    }

    get categoryButtons() {
        return ["All", "FPS Games", "MMO Games", "Strategy Games", "MOBA Games", "RPG Games", "Tabletop Games", "Sandbox Games", "Simulation Games", "Music", "Community", "Language", "Programming", "Other"];
    }

    changeCategory(id) {
        let self = this;
        if (self.state.loading) return;
        self.refs.searchinput.value = "";
        self.setState({
            loading: true,
            selectedCategory: id,
            title: "Loading...",
            term: null
        });
        if (id === 0) {
            self.search("", true);
            return;
        }
        self.search(`?category=${self.categoryButtons[id]}`, true);
    }

    get content() {
        let self = this;
        let guildList = this.SortedGuildStore.guildPositions;
        let defaultList = this.AvatarDefaults.DEFAULT_AVATARS;
        if (self.state.connection.state === 1) return self.notConnected;
        return [BDV2.react.createElement(
            "div",
            {ref: "content", key: "pc", className: "contentColumn-2hrIYH contentColumnDefault-1VQkGM content-column default"},
            BDV2.react.createElement(V2Components.SettingsTitle, {text: self.state.title}),
            self.bdServer,
            self.state.servers.map((server) => {
                return BDV2.react.createElement(V2Components.ServerCard, {key: server.identifier, server: server, join: self.join, guildList: guildList, fallback: defaultList[Math.floor(Math.random() * 5)]});
            }),
            self.state.next && BDV2.react.createElement(
                "button",
                {type: "button", onClick: () => {
                        if (self.state.loading) return;self.setState({loading: true}); self.search(self.state.next, false);
                    }, className: "ui-button filled brand small grow", style: {width: "100%", marginTop: "10px", marginBottom: "10px"}},
                BDV2.react.createElement(
                    "div",
                    {className: "ui-button-contents"},
                    self.state.loading ? "Loading" : "Load More"
                )
            ),
            self.state.servers.length > 0 && BDV2.react.createElement(V2Components.SettingsTitle, {text: self.state.title})
        )];
    }

    get notConnected() {
        let self = this;
        //return BDV2.react.createElement(V2Components.SettingsTitle, { text: self.state.title });
        return [BDV2.react.createElement(
            "div",
            {key: "ncc", ref: "content", className: "contentColumn-2hrIYH contentColumnDefault-1VQkGM content-column default"},
            BDV2.react.createElement(
                "h2",
                {className: "ui-form-title h2 margin-reset margin-bottom-20"},
                "Not connected to discordservers.com!",
                BDV2.react.createElement(
                    "button",
                    {
                        onClick: self.connect,
                        type: "button",
                        className: "ui-button filled brand small grow",
                        style: {
                            display: "inline-block",
                            minHeight: "18px",
                            marginLeft: "10px",
                            lineHeight: "14px"
                        }
                    },
                    BDV2.react.createElement(
                        "div",
                        {className: "ui-button-contents"},
                        "Connect"
                    )
                )
            ), self.bdServer
        )];
    }

    get footer() {
        return BDV2.react.createElement(
            "div",
            {className: "ui-tab-bar-header"},
            BDV2.react.createElement(
                "a",
                {href: "https://discordservers.com", target: "_blank"},
                "Discordservers.com"
            )
        );
    }

    get connection() {
        let self = this;
        let {connection} = self.state;
        if (connection.state !== 2) return BDV2.react.createElement("span", null);

        return BDV2.react.createElement(
            "span",
            null,
            BDV2.react.createElement(V2Components.TabBar.Separator, null),
            BDV2.react.createElement(
                "span",
                {style: {color: "#b9bbbe", fontSize: "10px", marginLeft: "10px"}},
                "Connected as: ",
                `${connection.user.username}#${connection.user.discriminator}`
            ),
            BDV2.react.createElement(
                "div",
                {style: {padding: "5px 10px 0 10px"}},
                BDV2.react.createElement(
                    "button",
                    {style: {width: "100%", minHeight: "20px"}, type: "button", className: "ui-button filled brand small grow"},
                    BDV2.react.createElement(
                        "div",
                        {className: "ui-button-contents", onClick: self.connect},
                        "Reconnect"
                    )
                )
            )
        );
}
}

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
    v2Loader.title = "BetterDiscord is loading...";
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
            if (!fs.existsSync(this.BDFile)) fs.writeFileSync(this.BDFile, JSON.stringify(this.data, null, 4));
            else this.data = require(this.BDFile);
            if (!fs.existsSync(this.settingsFile)) return;
            let settings = require(this.settingsFile);
            fs.unlinkSync(this.settingsFile);
            if (settings.hasOwnProperty("settings")) settings = Object.assign({stable: {}, canary: {}, ptb: {}}, {[releaseChannel]: settings});
            else settings = Object.assign({stable: {}, canary: {}, ptb: {}}, settings);
            this.setBDData("settings", settings);
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



window.bdStorage = class bdPluginStorage {
    static get(key) {
        Utils.warn("[Deprecation Notice] Please use BdApi.getBDData(). bdStorage may be removed in future versions.");
        return DataStore.getBDData(key);
    }

    static set(key, data) {
        Utils.warn("[Deprecation Notice] Please use BdApi.setBDData(). bdStorage may be removed in future versions.");
        DataStore.setBDData(key, data);
    }
};

window.bdPluginStorage = class bdPluginStorage {
    static get(pluginName, key) {
        Utils.warn(`[Deprecation Notice] Please use BdApi.loadData() or BdApi.getData(). bdPluginStorage may be removed in future versions.`);
        return DataStore.getPluginData(pluginName, key) || null;
    }

    static set(pluginName, key, data) {
        Utils.warn("[Deprecation Notice] Please use BdApi.saveData() or BdApi.setData(). bdPluginStorage may be removed in future versions.");
        if (typeof(value) === "undefined") return Utils.warn("Trying to set undefined value in plugin " + pluginName);
        DataStore.setPluginData(pluginName, key, data);
    }

    static delete(pluginName, key) {
        Utils.warn("[Deprecation Notice] Please use BdApi.deleteData(). bdPluginStorage may be removed in future versions.");
        DataStore.deletePluginData(pluginName, key);
    }
};

var settingsPanel, emoteModule, quickEmoteMenu, voiceMode, pluginModule, themeModule, dMode, publicServersModule;
var minSupportedVersion = "0.3.0";
var bbdVersion = "0.2.2";


var mainCore;

var settings = {
    "Save logs locally":          {id: "bda-gs-0",  info: "Saves chat logs locally",                           implemented: false, hidden: false, cat: "core"},
    "Public Servers":             {id: "bda-gs-1",  info: "Display public servers button",                     implemented: true,  hidden: false, cat: "core"},
    "Minimal Mode":               {id: "bda-gs-2",  info: "Hide elements and reduce the size of elements.",    implemented: true,  hidden: false, cat: "core"},
    "Voice Mode":                 {id: "bda-gs-4",  info: "Only show voice chat",                              implemented: true,  hidden: false, cat: "core"},
    "Hide Channels":              {id: "bda-gs-3",  info: "Hide channels in minimal mode",                     implemented: true,  hidden: false, cat: "core"},
    "Dark Mode":                  {id: "bda-gs-5",  info: "Make certain elements dark by default(wip)",        implemented: true,  hidden: false, cat: "core"},
    "Override Default Emotes":    {id: "bda-es-5",  info: "Override default emotes",                           implemented: false, hidden: false, cat: "core"},
    "Voice Disconnect":           {id: "bda-dc-0",  info: "Disconnect from voice server when closing Discord", implemented: true,  hidden: false, cat: "core"},
    "Custom css live update":     {id: "bda-css-0", info: "",                                                  implemented: true,  hidden: true,  cat: "core"},
    "Custom css auto udpate":     {id: "bda-css-1", info: "",                                                  implemented: true,  hidden: true,  cat: "core"},
    "24 Hour Timestamps":         {id: "bda-gs-6",  info: "Replace 12hr timestamps with proper ones",          implemented: true,  hidden: false, cat: "core"},
    "Coloured Text":              {id: "bda-gs-7",  info: "Make text colour the same as role colour",          implemented: true,  hidden: false, cat: "core"},
    "BetterDiscord Blue":         {id: "bda-gs-b",  info: "Replace Discord blue with BD Blue",                 implemented: true,  hidden: false, cat: "core"},
    "Developer Mode":         	  {id: "bda-gs-8",  info: "Developer Mode",                                    implemented: true,  hidden: false, cat: "core"},
    
    
    "Startup Error Modal":        {id: "fork-ps-1", info: "Show a modal with plugin/theme errors on startup", implemented: true,  hidden: false, cat: "fork"},
    "Show Toasts":                {id: "fork-ps-2", info: "Shows a small notification for important information", implemented: true,  hidden: false, cat: "fork"},
    "Scroll To Settings":         {id: "fork-ps-3", info: "Auto-scrolls to a plugin's settings when the button is clicked (only if out of view)", implemented: true,  hidden: false, cat: "fork"},
    "Animate On Hover":           {id: "fork-es-2", info: "Only animate the emote modifiers on hover", implemented: true,  hidden: false, cat: "fork"},
    "Copy Selector":			  {id: "fork-dm-1", info: "Adds a \"Copy Selector\" option to context menus when developer mode is active", implemented: true,  hidden: false, cat: "fork"},
    "Download Emotes":            {id: "fork-es-3", info: "Download emotes when the cache is expired", implemented: true,  hidden: false, cat: "fork"},
    "Normalize Classes":          {id: "fork-ps-4", info: "Adds stable classes to elements to help themes. (e.g. adds .da-channels to .channels-Ie2l6A)", implemented: true,  hidden: false, cat: "fork"},
    "Automatic Loading":          {id: "fork-ps-5", info: "Automatically loads, reloads, and unloads plugins and themes", implemented: true,  hidden: false, cat: "fork"},
    "Enable Transparency":        {id: "fork-wp-1", info: "Enables the main window to be see-through (requires restart)", implemented: true,  hidden: false, cat: "fork"},
    "Window Frame":               {id: "fork-wp-2", info: "Adds the native os window frame to the main window", implemented: false,  hidden: true, cat: "fork"},


    "Twitch Emotes":              {id: "bda-es-7",  info: "Show Twitch emotes",                                implemented: true,  hidden: false, cat: "emote"},
    "FrankerFaceZ Emotes":        {id: "bda-es-1",  info: "Show FrankerFaceZ Emotes",                          implemented: true,  hidden: false, cat: "emote"},
    "BetterTTV Emotes":           {id: "bda-es-2",  info: "Show BetterTTV Emotes",                             implemented: true,  hidden: false, cat: "emote"},
    "Emote Menu":                 {id: "bda-es-0",  info: "Show Twitch/Favourite emotes in emote menu",        implemented: true,  hidden: false, cat: "emote"},
    "Emoji Menu":                 {id: "bda-es-9",  info: "Show Discord emoji menu",                           implemented: true,  hidden: false, cat: "emote"},
    "Emote Autocomplete":         {id: "bda-es-3",  info: "Autocomplete emote commands",                       implemented: false, hidden: false, cat: "emote"},
    "Emote Auto Capitalization":  {id: "bda-es-4",  info: "Autocapitalize emote commands",                     implemented: true,  hidden: false, cat: "emote"},
    "Show Names":                 {id: "bda-es-6",  info: "Show emote names on hover",                         implemented: true,  hidden: false, cat: "emote"},
    "Show emote modifiers":       {id: "bda-es-8",  info: "Enable emote mods (flip, spin, pulse, spin2, spin3, 1spin, 2spin, 3spin, tr, bl, br, shake, shake2, shake3, flap)", implemented: true,  hidden: false, cat: "emote"},
};

var defaultCookie = {
    "bda-gs-0": false,
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
    "bda-es-3": false,
    "bda-es-4": false,
    "bda-es-5": true,
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

var classNormalizer;

Core.prototype.init = async function() {
    if (bdConfig.version < minSupportedVersion) {
        this.alert("Not Supported", "BetterDiscord v" + bdConfig.version + " (your version)" + " is not supported by the latest js (" + bbdVersion + ").<br><br> Please download the latest version from <a href='https://github.com/rauenzi/BetterDiscordApp/releases/latest' target='_blank'>GitHub</a>");
        return;
    }

    if (bdConfig.updater.LatestVersion > bdConfig.version) {
        this.alert("Update Available", `
            An update for BandagedBD is available (${bdConfig.updater.LatestVersion})! Please Reinstall!<br /><br />
            <a href='https://github.com/rauenzi/BetterDiscordApp/releases/latest' target='_blank'>Download Installer</a>
        `);
    }

    Utils.log("Initializing Settings");
    this.initSettings();
    classNormalizer = new ClassNormalizer();
    emoteModule = new EmoteModule();
    quickEmoteMenu = new QuickEmoteMenu();
    Utils.log("Initializing EmoteModule");
    window.emotePromise = emoteModule.init().then(() => {
        emoteModule.initialized = true;
        Utils.log("Initializing QuickEmoteMenu");
        quickEmoteMenu.init();
    });
    publicServersModule = new V2_PublicServers();
    
    voiceMode = new VoiceMode();
    dMode = new devMode();
    
    this.injectExternals();

    await this.checkForGuilds();
    Utils.log("Updating Settings");
    settingsPanel = new V2_SettingsPanel();
    settingsPanel.updateSettings();

    Utils.log("Loading Plugins");
    pluginModule = new PluginModule();
    pluginModule.loadPlugins();
    
    Utils.log("Loading Themes");
    themeModule = new ThemeModule();
    themeModule.loadThemes();

    $("#customcss").detach().appendTo(document.head);
    
    window.addEventListener("beforeunload", function() {
        if (settingsCookie["bda-dc-0"]) document.querySelector(".btn.btn-disconnect").click();
    });
    
    publicServersModule.initialize();

    emoteModule.autoCapitalize();

    Utils.log("Removing Loading Icon");
    document.getElementsByClassName("bd-loaderv2")[0].remove();
    Utils.log("Initializing Main Observer");
    this.initObserver();
    
    // Show loading errors
    if (settingsCookie["fork-ps-1"]) {
        Utils.log("Collecting Startup Errors");
        this.showStartupErrors({plugins: bdpluginErrors, themes: bdthemeErrors});
    }

    if (!DataStore.getBDData("RNMAnnouncement")) {
        DataStore.setBDData("RNMAnnouncement", true);
        this.alert("Significant Changes", `
            The lastest release of BBD has made a lot of improvements including being able to automatically load, unload, and reload plugins and themes.<br /><br />
            If you had the RestartNoMore plugin, I suggest removing it (or turning off BBD's loader in settings) so things aren't being loaded multiple times.
        `);
    }
};

Core.prototype.checkForGuilds = function() {
    return new Promise(resolve => {
        const checkForGuilds = function() {
            if (document.querySelectorAll(`.${BDV2.guildClasses.guilds} .${BDV2.guildClasses.guild}`).length > 0) return resolve(bdConfig.deferLoaded = true);
            setTimeout(checkForGuilds, 100);
        };
        $(document).ready(function () {
            setTimeout(checkForGuilds, 100);
        });
    });
};

Core.prototype.injectExternals = function() {
    Utils.injectJs("https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.9/ace.js");
};

Core.prototype.initSettings = function () {
    DataStore.initialize();
    if (!DataStore.getSettingGroup("settings")) {
        settingsCookie = defaultCookie;
        this.saveSettings();
    }
    else {
        this.loadSettings();
        $("<style id=\"customcss\">").html(atob(DataStore.getBDData("bdcustomcss"))).appendTo(document.head);
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

    this.cancel24Hour = Utils.monkeyPatch(BDV2.TimeFormatter, "calendarFormat", {after: (data) => {
        if (!settingsCookie["bda-gs-6"]) return;
        const matched = data.returnValue.match(twelveHour);
        if (!matched || matched.length !== 4) return;
        if (matched[3] === "AM") return data.returnValue = data.returnValue.replace(matched[0], `${matched[1] === "12" ? "00" : matched[1].padStart(2, "0")}:${matched[2]}`);
        return data.returnValue = data.returnValue.replace(matched[0], `${matched[1] === "12" ? "12" : parseInt(matched[1]) + 12}:${matched[2]}`);
    }});
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

Core.prototype.showStartupErrors = function({plugins: pluginErrors, themes: themeErrors}) {
    if (!pluginErrors || !themeErrors) return;
    if (!pluginErrors.length && !themeErrors.length) return;
    let modal = $(`<div class="bd-modal-wrapper theme-dark">
                    <div class="bd-backdrop backdrop-1wrmKB"></div>
                    <div class="bd-modal bd-startup-modal modal-1UGdnR">
                        <div class="bd-modal-inner inner-1JeGVc">
                            <div class="header header-1R_AjF"><div class="title">Startup Errors</div></div>
                            <div class="bd-modal-body">
                                <div class="tab-bar-container">
                                    <div class="tab-bar TOP">
                                        <div class="tab-bar-item">Plugins</div>
                                        <div class="tab-bar-item">Themes</div>
                                    </div>
                                </div>
                                <div class="table-header">
                                    <div class="table-column column-name">Name</div>
                                    <div class="table-column column-reason">Reason</div>
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
                                <div class="table-column column-reason">${err.reason}</div>
                                <div class="table-column column-error"><a class="error-link" href="">${err.error ? err.error.message : ""}</a></div>
                            </div>`);
            container.append(error);
            if (err.error) {
                error.find("a").on("click", (e) => {
                    e.preventDefault();
                    Utils.err(`Error details for ${err.name ? err.name : err.file}.`, err.error);
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
        document.querySelector(".app").appendChild(toastWrapper);
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

function EmoteModule() {}

EmoteModule.prototype.init = async function () {
    this.modifiers = ["flip", "spin", "pulse", "spin2", "spin3", "1spin", "2spin", "3spin", "tr", "bl", "br", "shake", "shake2", "shake3", "flap"];
    this.overrides = ["twitch", "bttv", "ffz"];
    this.categories = ["TwitchGlobal", "TwitchSubscriber", "BTTV", "BTTV2", "FrankerFaceZ"];

    let emoteInfo = {
        TwitchGlobal: {
            url: "https://twitchemotes.com/api_cache/v3/global.json",
            backup: "https://cdn.staticaly.com/gh/rauenzi/BetterDiscordApp/master/data/emotedata_twitch_global.json",
            variable: "TwitchGlobal",
            oldVariable: "emotesTwitch",
            getEmoteURL: (e) => `https://static-cdn.jtvnw.net/emoticons/v1/${e.id}/1.0`,
            getOldData: (url, name) => { return {id: url.match(/\/([0-9]+)\//)[1], code: name, emoticon_set: 0, description: null}; }
        },
        TwitchSubscriber: {
            url: "https://twitchemotes.com/api_cache/v3/subscriber.json",
            backup: "https://cdn.staticaly.com/gh/rauenzi/BetterDiscordApp/master/data/emotedata_twitch_subscriber.json",
            variable: "TwitchSubscriber",
            oldVariable: "subEmotesTwitch",
            parser: (data) => {
                let emotes = {};
                for (let c in data) {
                    let channel = data[c];
                    for (let e = 0, elen = channel.emotes.length; e < elen; e++) {
                        let emote = channel.emotes[e];
                        emotes[emote.code] = emote.id;
                    }
                }
                return emotes;
            },
            backupParser: (data) => {
                return data;
            },
            getEmoteURL: (e) => `https://static-cdn.jtvnw.net/emoticons/v1/${e}/1.0`,
            getOldData: (url) => url.match(/\/([0-9]+)\//)[1]
        },
        FrankerFaceZ: {
            url: "https://cdn.staticaly.com/gh/rauenzi/BetterDiscordApp/master/data/emotedata_ffz.json",
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
            url: "https://cdn.staticaly.com/gh/rauenzi/BetterDiscordApp/master/data/emotedata_bttv.json",
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
			
						if (bemotes.includes(emoteName) || emoteName.length < 4) continue;
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
    const cacheDate = new Date(DataStore.getBDData("emoteCacheDate") || null);
    const currentDate = new Date();
    const daysBetween = Math.round(Math.abs((currentDate.getTime() - cacheDate.getTime()) / (24 * 60 * 60 * 1000)));
    if (daysBetween > bdConfig.cache.days) {
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
        Utils.log("[Emotes] Loading emotes from local cache.");
        
        const data = await new Promise(resolve => {
            _fs.readFile(file, "utf8", (err, data) => {
                Utils.log("[Emotes] Emotes loaded from cache.");
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

        Utils.log("[Emotes] Cache was corrupt, downloading...");
        _fs.unlinkSync(file);
    }

    if (!settingsCookie["fork-es-3"]) return quickEmoteMenu.init();
    if (settingsCookie["fork-ps-2"]) mainCore.showToast("Downloading emotes in the background do not reload.", {type: "info"});

    for (let e in emoteInfo) {
        await new Promise(r => setTimeout(r, 1000));
        let data = await this.downloadEmotes(emoteInfo[e]);
        window.bdEmotes[emoteInfo[e].variable] = data;
    }

    if (settingsCookie["fork-ps-2"]) mainCore.showToast("All emotes successfully downloaded.", {type: "success"});

    try { _fs.writeFileSync(file, JSON.stringify(window.bdEmotes), "utf8"); }
    catch (err) { Utils.err("[Emotes] Could not save emote data.", err); }

    quickEmoteMenu.init();
};

EmoteModule.prototype.downloadEmotes = function(emoteMeta) {
    let request = require("request");
    let options = {
        url: emoteMeta.url,
        timeout: emoteMeta.timeout ? emoteMeta.timeout : 5000
    };

    Utils.log("[Emotes] Downloading: " + emoteMeta.variable);

    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (error) {
                Utils.err("[Emotes] Could not download " + emoteMeta.variable, error);
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
                Utils.err("[Emotes] Could not download " + emoteMeta.variable, error);
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
                parsedData[emote] = emoteMeta.getEmoteURL(parsedData[emote]);
            }
            resolve(parsedData);
            Utils.log("[Emotes] Downloaded: " + emoteMeta.variable);
        });
    });
};

EmoteModule.prototype.getBlacklist = function () {
    return new Promise(resolve => {
        $.getJSON("https://cdn.staticaly.com/gh/rauenzi/BetterDiscordApp/master/data/emotefilter.json", function (data) {
            resolve(bemotes = data.blacklist);
        });
    });
};

var bemotes = [];

EmoteModule.prototype.autoCapitalize = function () {
    $("body").delegate($(".channelTextArea-1LDbYG textarea:first"), "keyup change paste", () => {
        if (!settingsCookie["bda-es-4"]) return;

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
};

EmoteModule.prototype.capitalize = function (value) {
    var res = window.bdEmotes.TwitchGlobal;
    for (var p in res) {
        if (res.hasOwnProperty(p) && value == (p + "").toLowerCase()) {
            return p;
        }
    }
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
    teContainer += "    <div class=\"scroller-wrap fade\">";
    teContainer += "        <div class=\"scroller\">";
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
    faContainer += "    <div class=\"scroller-wrap fade\">";
    faContainer += "        <div class=\"scroller\">";
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
    var menu = $("<div>", {"id": "rmenu", "data-emoteid": $(em).prop("title"), "text": "Remove", "class": "context-menu theme-dark"});
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
        this.lastTab = "bda-qem-favourite";
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
    faContainer += "    <div class=\"scroller-wrap fade\">";
    faContainer += "        <div class=\"scroller\">";
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
        $("<script/>", {
            type: "text/javascript",
            src: uri
        }).appendTo($("body"));
    }

    static escapeID(id) {
        return id.replace(/^[^a-z]+|[^\w-]+/gi, "");
    }

    static log(message) {
        console.log("%c[BetterDiscord] %c" + message + "", "color: #3a71c1; font-weight: 700;", "");
    }

    static warn(message) {
        console.warn("%c[BetterDiscord] %c" + message + "", "color: #E8A400; font-weight: 700;", "");
    }

    static err(message, error) {
        console.log("%c[BetterDiscord] %c" + message + "", "color: red; font-weight: 700;", "");
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
            catch (e) { console.error("Error occurred in " + message, e); }
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
    $(".app.flex-vertical").first().css("overflow", "hidden");
    $(".chat-3bRxxu").first().css("visibility", "hidden").css("min-width", "0px");
    $(".flex-vertical.channels-wrap").first().css("flex-grow", "100000");
    $(".guild-header .btn.btn-hamburger").first().css("visibility", "hidden");
};

VoiceMode.prototype.disable = function () {
    $(".scroller.guild-channels ul").first().css("display", "");
    $(".scroller.guild-channels header").first().css("display", "");
    $(".app.flex-vertical").first().css("overflow", "");
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
    const originalJSRequire = require("module").Module._extensions[".js"];
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
                try {fs.lstatSync(path.resolve(baseFolder, filename));}
                catch (err) {
                    if (err.code !== "ENOENT") return;
                    delete this.timeCache[filename];
                    if (isPlugin) return pluginModule.unloadPlugin(Object.values(bdplugins).find(p => p.filename == filename).plugin.getName());
                    return themeModule.unloadTheme(Object.values(bdthemes).find(p => p.filename == filename).name);
                }
                if (!fs.lstatSync(path.resolve(baseFolder, filename)).isFile()) return;
                const stats = fs.lstatSync(path.resolve(baseFolder, filename));
                if (!stats || !stats.mtime || !stats.mtime.getTime()) return;
                if (typeof(stats.mtime.getTime()) !== "number") return;
                if (this.timeCache[filename] == stats.mtime.getTime()) return;
                this.timeCache[filename] = stats.mtime.getTime();
                if (eventType == "rename") {
                    if (isPlugin) pluginModule.loadPlugin(filename);
                    else themeModule.loadTheme(filename);
                }
                if (eventType == "change") {
                    if (isPlugin) pluginModule.reloadPlugin(Object.values(bdplugins).find(p => p.filename == filename).plugin.getName());
                    else themeModule.reloadTheme(Object.values(bdthemes).find(p => p.filename == filename).name);
                }
            });
        }

        unwatchContent(contentType) {
            if (!this.watchers[contentType]) return;
            this.watchers[contentType].close();
            delete this.watcher[contentType];
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
                // console.log("Trying " + path.dirname(filename));
                // console.log("Trying with " + (isPlugin ? self.pluginsFolder : self.themesFolder));
                // console.log(path.dirname(filename) !== isPlugin ? self.pluginsFolder : self.themesFolder);
                if (path.dirname(filename) !== (isPlugin ? self.pluginsFolder : self.themesFolder)) return Reflect.apply(originalRequire, this, arguments);
                // if (path.dirname(filename) !== fs.realpathSync(path.resolve(isPlugin ? self.pluginsFolder : self.themesFolder))) return Reflect.apply(originalRequire, this, arguments);
                // if (!path.relative(isPlugin ? self.pluginsFolder : self.themesFolder, filename)) return Reflect.apply(isPlugin ? originalJSRequire : originalCSSRequire, this, arguments);
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
            catch (error) {return {name: filename, file: filename, reason: "Could not be compiled.", error: {message: error.message, stack: error.stack}};}
            const content = require(path.resolve(baseFolder, filename));
            if (isPlugin) {
                if (!content.type) return;
                try {
                    content.plugin = new content.type();
                    delete bdplugins[content.plugin.getName()];
                    bdplugins[content.plugin.getName()] = content;
                }
                catch (error) {return {name: filename, file: filename, reason: "Could not be constructed.", error: {message: error.message, stack: error.stack}};}
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
                delete require.original.cache[require.original.resolve(path.resolve(baseFolder, filename))];
            }
            catch (err) {return err;}
        }

        isLoaded(filename, type) {
            const isPlugin = type === "plugin";
            const baseFolder = isPlugin ? this.pluginsFolder : this.themesFolder;
            try {require.original.cache[require.original.resolve(path.resolve(baseFolder, filename))];}
            catch (err) {return false;}
            return true;
        }

        reloadContent(filename, type) {
            if (this.unloadContent(filename, type)) return;
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
            Utils.err("Plugin " + name + " could not be loaded.", err);
            bdpluginErrors.push({name: name, file: bdplugins[plugins[i]].filename, reason: "load() could not be fired.", error: {message: err.message, stack: err.stack}});
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
                Utils.err("Plugin " + name + " could not be started.", err);
                bdpluginErrors.push({name: name, file: bdplugins[plugins[i]].filename, reason: "start() could not be fired.", error: {message: err.message, stack: err.stack}});
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
        pluginCookie[plugin] = false;
        this.savePluginData();
        Utils.err("Plugin " + name + " could not be started.", err);
    }
};

PluginModule.prototype.stopPlugin = function(plugin, reload = false) {
    try {
        bdplugins[plugin].plugin.stop();
        if (settingsCookie["fork-ps-2"] && !reload) mainCore.showToast(`${bdplugins[plugin].plugin.getName()} v${bdplugins[plugin].plugin.getVersion()} has stopped.`);
    }
    catch (err) {
        Utils.err("Plugin " + name + " could not be stopped.", err);
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
    if (error && settingsCookie["fork-ps-2"]) {
        Utils.err(`${filename} could not be loaded.`, error);
        return BdApi.showToast(`${filename} could not be loaded.`, {type: "error"});
    }

    const plugin = Object.values(bdplugins).find(p => p.filename == filename).plugin;
    if (settingsCookie["fork-ps-2"]) BdApi.showToast(`${plugin.getName()} v${plugin.getVersion()} was loaded.`, {type: "success"});
};

PluginModule.prototype.unloadPlugin = function(plugin) {
    if (pluginCookie[plugin]) this.disablePlugin(plugin, true);
    const error = ContentManager.unloadContent(bdplugins[plugin].filename, "plugin");
    delete bdplugins[plugin];
    if (error && settingsCookie["fork-ps-2"]) {
        Utils.err(`${plugin} could not be unloaded. It may have not been loaded yet.`, error);
        return BdApi.showToast(`${plugin} could not be unloaded. It may have not been loaded yet.`, {type: "error"});
    }
    if (settingsCookie["fork-ps-2"]) BdApi.showToast(`${plugin} was unloaded.`, {type: "success"});
};

PluginModule.prototype.reloadPlugin = function(plugin) {
    const enabled = pluginCookie[plugin];
    if (enabled) this.stopPlugin(plugin, true);
    const error = ContentManager.reloadContent(bdplugins[plugin].filename, "plugin");
    if (enabled) {
        if (bdplugins[plugin].plugin.load && typeof(bdplugins[plugin].plugin.load) == "function") bdplugins[plugin].plugin.load();
        this.startPlugin(plugin, true);
    }
    if (error && settingsCookie["fork-ps-2"]) {
        Utils.err(`${plugin} could not be reloaded.`, error);
        return BdApi.showToast(`${plugin} could not be reloaded.`, {type: "error"});
    }
    if (settingsCookie["fork-ps-2"]) BdApi.showToast(`${plugin} v${bdplugins[plugin].plugin.getVersion()} was reloaded.`, {type: "success"});
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
            catch (err) { Utils.err("Unable to fire onMessage for " + plugin.getName() + ".", err); }
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
            catch (err) { Utils.err("Unable to fire onSwitch for " + plugin.getName() + ".", err); }
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
            catch (err) { Utils.err("Unable to fire observer for " + plugin.getName() + ".", err); }
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
        if (themeCookie[name]) $("head").append($("<style>", {id: Utils.escapeID(name), html: unescape(bdthemes[name].css)}));
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
    $("head").append(`<style id="${Utils.escapeID(bdthemes[theme].name)}">${unescape(bdthemes[theme].css)}</style>`);
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
    if (error && settingsCookie["fork-ps-2"]) {
        Utils.err(`${filename} could not be loaded.`, error);
        return BdApi.showToast(`${filename} could not be loaded. It may not have been loaded.`, {type: "error"});
    }

    const theme = Object.values(bdthemes).find(p => p.filename == filename);
    if (settingsCookie["fork-ps-2"]) BdApi.showToast(`${theme.name} v${theme.version} was loaded.`, {type: "success"});
};

ThemeModule.prototype.unloadTheme = function(theme) {
    if (themeCookie[theme]) this.disableTheme(theme, true);
    const error = ContentManager.unloadContent(bdthemes[theme].filename, "theme");
    delete bdthemes[theme];
    if (error && settingsCookie["fork-ps-2"]) {
        Utils.err(`${theme} could not be unloaded. It may have not been loaded yet.`, error);
        return BdApi.showToast(`${theme} could not be unloaded. It may have not been loaded yet.`, {type: "error"});
    }
    if (settingsCookie["fork-ps-2"]) BdApi.showToast(`${theme} was unloaded.`, {type: "success"});
};

ThemeModule.prototype.reloadTheme = function(theme) {
    const error = ContentManager.reloadContent(bdthemes[theme].filename, "theme");
    if (themeCookie[theme]) this.disableTheme(theme, true), this.enableTheme(theme, true);
    if (error && settingsCookie["fork-ps-2"]) {
        Utils.err(`${theme} could not be reloaded.`, error);
        return BdApi.showToast(`${theme} could not be reloaded.`, {type: "error"});
    }
    if (settingsCookie["fork-ps-2"]) BdApi.showToast(`${theme} v${bdthemes[theme].version} was reloaded.`, {type: "success"});
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
        const base = require("electron").remote.app.getAppPath();
        const path = require("path");
        const location = path.resolve(base, "..", "app", "config.json");
        const fs = require("fs");
        if (!fs.existsSync(location)) fs.writeFileSync(location, JSON.stringify({}));
        return this._windowConfigFile = location;
    }
};

BdApi.getAllWindowPreferences = function() {
    return require(this.WindowConfigFile);
};

BdApi.getWindowPreference = function(key) {
    return this.getAllWindowPreferences()[key];
};

BdApi.setWindowPreference = function(key, value) {
    const fs = require("fs");
    const prefs = this.getAllWindowPreferences();
    prefs[key] = value;
    delete require.original.cache[this.WindowConfigFile];
    fs.writeFileSync(this.WindowConfigFile, JSON.stringify(prefs, null, 4));
};

//Inject CSS to document head
//id = id of element
//css = custom css
BdApi.injectCSS = function (id, css) {
    $("head").append($("<style>", {id: Utils.escapeID(id), html: css}));
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
    Utils.warn("[Deprecation Notice] BetterDiscord's IPC has been deprecated and may be removed in future versions.");
    return betterDiscordIPC;
};

//Get BetterDiscord Core
BdApi.getCore = function () {
    return mainCore;
};

//Show modal alert
BdApi.alert = function (title, content) {
    mainCore.alert(title, content);
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


/**
 * 
 * @constructor
 * @param {(HTMLElement|jQuery)} node - DOM node to monitor and show the tooltip on
 * @param {string} tip - string to show in the tooltip
 * @param {object} options - additional options for the tooltip
 * @param {string} [options.style=black] - correlates to the discord styling
 * @param {string} [options.side=top] - can be any of top, right, bottom, left
 * @param {boolean} [options.preventFlip=false] - prevents moving the tooltip to the opposite side if it is too big or goes offscreen
 * @param {boolean} [options.disabled=false] - whether the tooltip should be disabled from showing on hover
 */

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
                cm.addClass($(".app").hasClass("theme-dark") ? "theme-dark" : "theme-light");
                cm.appendTo(".app");
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


var ClassNormalizer = class ClassNormalizer {
    constructor() {
        this.classFormat = new RegExp(`^(?!da-)[A-Za-z]+-([A-Za-z]|[0-9]|-|_){6}$`);
        this.normFormat = new RegExp(`^(?!da-)(?:-?[a-z])+$`);
        this.mainObserver = new MutationObserver((changes) => {
            for (let c = 0; c < changes.length; c++) {
                const change = changes[c];
                const elements = change.addedNodes;
                if (!elements) continue;
                for (let n = 0; n < elements.length; n++) {
                    if (!(elements[n] instanceof Element) || !elements[n].classList) continue;
                    this.normalizeClasses(elements[n]);
                }
            }
        });
        
        this.cache = {};
        this.isActive = false;
    }

    stop() {
        if (!this.isActive) return;
        this.isActive = false;
        this.mainObserver.disconnect();
        this.revertClasses(document.querySelector("#app-mount"));
    }

    start() {
        if (this.isActive) return;
        this.isActive = true;
        this.normalizeClasses(document.querySelector("#app-mount"));
        this.mainObserver.observe(document.querySelector("#app-mount"), {childList: true, subtree: true});
    }

    toCamelCase(className) {
        return className.split("-").map((s, i) => i ? s[0].toUpperCase() + s.slice(1) : s).join("");
    }
    
    isRandomizedClass(className) {
        return this.classFormat.test(className);
    }

    isNormalClass(className) {
        return this.normFormat.test(className);
    }

    normalizeClasses(element) {
        if (!(element instanceof Element)) return;
        if (element.children && element.children.length) this.normalizeClasses(element.children[0]);
        if (element.nextElementSibling) this.normalizeClasses(element.nextElementSibling);
        const classes = element.classList;
        const toAdd = [];
        for (let c = 0; c < classes.length; c++) {
            if (this.cache[classes[c]]) {
                toAdd.push(this.cache[classes[c]]);
            }
            else if (this.isNormalClass(classes[c])) {
                const newClass = "da-" + this.toCamelCase(classes[c]);
                toAdd.push(newClass);
                this.cache[classes[c]] = newClass;
            }
            else if (this.isRandomizedClass(classes[c])) {
                const newClass = "da-" + classes[c].split("-")[0];
                toAdd.push(newClass);
                this.cache[classes[c]] = newClass;
            }
        }
        element.classList.add(...toAdd);
    }
    
    revertClasses(element) {
        if (!(element instanceof Element)) return;
        if (element.children && element.children.length) this.revertClasses(element.children[0]);
        if (element.nextElementSibling) this.revertClasses(element.nextElementSibling);
        const classes = element.classList;
        const toRemove = [];
        for (let c = 0; c < classes.length; c++) {
            if (classes[c].startsWith("da-")) toRemove.push(classes[c]);
        }
        element.classList.remove(...toRemove);
    }

};





























































































































































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
            const findByDisplayName = (displayName) => find(module => module.displayName === displayName);
                
            return {find, findAll, findByUniqueProperties, findByDisplayName};
        })();

        this.internal = {
            react: this.WebpackModules.findByUniqueProperties(["Component", "PureComponent", "Children", "createElement", "cloneElement"]),
            reactDom: this.WebpackModules.findByUniqueProperties(["findDOMNode"])
        };
        this.getInternalInstance = e => e[Object.keys(e).find(k => k.startsWith("__reactInternalInstance"))];
    }

    get messageClasses() {
        return this.WebpackModules.findByUniqueProperties(["message", "containerCozy"]) || {};
    }

    get guildClasses() {
        return this.WebpackModules.findByUniqueProperties(["guildsWrapper"]) || {
            guildsWrapper: "guilds-wrapper",
            scrollerWrap: "scroller-wrap",
            guilds: "guilds",
            friendsIcon: "friends-icon",
            homeIcon: "home-icon",
            guildPlaceholder: "guild-placeholder",
            guild: "guild",
            selected: "selected",
            unread: "unread",
            guildInner: "guild-inner",
            audio: "audio",
            video: "video",
            guildIcon: "guild-icon",
            badge: "badge",
            dms: "dms",
            guildSeparator: "guild-separator",
            guildsError: "guilds-error",
            guildsAdd: "guilds-add",
            guildsAddInner: "guilds-add-inner",
            unreadMentionsIndicatorBottom: "unread-mentions-indicator-bottom",
            unreadMentionsIndicatorTop: "unread-mentions-indicator-top",
            unreadMentionsBar: "unread-mentions-bar",
            unreadMentionBar: "unread-mention-bar"
        };
    }

    get MessageContentComponent() {return BDV2.WebpackModules.find(m => m.defaultProps && m.defaultProps.hasOwnProperty("disableButtons"));}

    get TimeFormatter() {return BDV2.WebpackModules.findByUniqueProperties(["dateFormat"]);}

    get TooltipWrapper() {return BDV2.WebpackModules.find(m => m.prototype && m.prototype.showDelayed);}

    get NativeModule() {return BDV2.WebpackModules.findByUniqueProperties(["setBadge"]);}

    get Tooltips() {return BDV2.WebpackModules.find(m => m.hide && m.show && !m.search && !m.submit && !m.search && !m.activateRagingDemon && !m.dismiss);}

    get KeyGenerator() {return BDV2.WebpackModules.find(m => m.toString && /"binary"/.test(m.toString()));}

    get reactComponent() {
        return this.internal.react.Component;
    }

    get react() {
        return this.internal.react;
    }

    get reactDom() {
        return this.internal.reactDom;
    }

    parseSettings(cat) {
        return Object.keys(settings).reduce((arr, key) => { 
            let setting = settings[key];
            if (setting.cat === cat && setting.implemented && !setting.hidden) { 
                setting.text = key;
                arr.push(setting);
            } return arr; 
        }, []);
    }


}

var BDV2 = new V2();

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
            {className: "content-column default"},
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
        if (this.props.sidebar) scrollerClass = "scroller-2FKFPG sidebar-region-scroller scroller scroller-2FKFPG";
        if (this.props.contentColumn) {
            scrollerClass = "scroller-2FKFPG content-region-scroller scroller scroller-2FKFPG";                                         /* fuck */
            wrapperClass = "scrollerWrap-2lJEkd content-region-scroller-wrap scrollerThemed-2oenus themeGhost-10fio9 scrollerTrack-3hhmU0 scrollerWrap-2lJEkd content-region-scroller-wrap scrollerThemed-2oenus themeGhost-28MSn0 scrollerTrack-1ZIpsv";
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
        const si = $("[class*=side] > [class*=selected]");
        if (si.length) self.scn = si.attr("class");
        const ns = $("[class*=side] > [class*=notSelected]");
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
        return BDV2.react.createElement("div", {className: "tools-container"},
            BDV2.react.createElement("div", {className: "tools"},
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

    render() {
        return BDV2.react.createElement(
            "h2",
            {className: "ui-form-title h2 margin-reset margin-bottom-20"},
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
                {className: "checkbox", onClick: this.onClick},
                BDV2.react.createElement(
                    "div",
                    {className: "checkbox-inner"},
                    BDV2.react.createElement("input", {checked: this.state.checked, onChange: () => {}, type: "checkbox"}),
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
        if (!$(".app").length) return false;
        $("<div/>", {
            id: "bd-customcss-detach-container"
        }).insertAfter($(".app"));
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
        $("#customcss").html(this.editor.session.getValue()).detach().appendTo(document.head);
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
            {className: "content-column default", style: {padding: "60px 40px 0px"}},
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
        $("#customcss").html(this.editor.session.getValue()).detach().appendTo(document.head);
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
        if (!$(".app").length) return false;
        $("<div/>", {
            id: "bd-customcss-detach-container"
        }).insertAfter($(".app"));
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
            {className: "content-column default"},
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
    }

    setInitialState() {
        this.state = {
            checked: pluginCookie[this.props.plugin.getName()],
            settings: false,
            reloads: 0
        };
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
        this.setState({reloads: this.state.reloads + 1});
    }

    render() {
        let self = this;
        let {plugin} = this.props;
        let name = plugin.getName();
        let author = plugin.getAuthor();
        let description = plugin.getDescription();
        let version = plugin.getVersion();
        let website = bdplugins[name].website;
        let source = bdplugins[name].source;

        if (this.state.settings) {
            try { self.settingsPanel = plugin.getSettingsPanel(); }
            catch (err) { Utils.err("Unable to get settings panel for " + plugin.getName() + ".", err); }
            
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

    reload() {
        const theme = this.props.theme.name;
        const error = themeModule.reloadTheme(theme);
        if (error) mainCore.showToast(`Could not reload ${bdthemes[theme].name}. Check console for details.`, {type: "error"});
        else mainCore.showToast(`${bdthemes[theme].name} v${bdthemes[theme].version} has been reloaded.`, {type: "success"});
        // this.setState(this.state);
        this.props.theme = bdthemes[theme];
        this.setState({reloads: this.state.reloads + 1});
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
        return [{text: "Core", id: "core"}, {text: "Zere's Fork", id: "fork"}, {text: "Emotes", id: "emotes"}, {text: "Custom CSS", id: "customcss"}, {text: "Plugins", id: "plugins"}, {text: "Themes", id: "themes"}];
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
        if (!$(".layer-3QrUeG .ui-standard-sidebar-view, .layer-3QrUeG .ui-standard-sidebar-view").length) return false;
        const root = $("<div/>", {
            "class": "content-region",
            "id": "bd-settingspane-container"
        });
        $(".layer-3QrUeG .ui-standard-sidebar-view, .layer-3QrUeG .ui-standard-sidebar-view").append(root);

        Utils.onRemoved(root[0], () => {
            BDV2.reactDom.unmountComponentAtNode(root[0]);
        });
        return true;
    }

    get coreSettings() {
        return this.getSettings("core");
    }
    get forkSettings() {
        return this.getSettings("fork");
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
        $(".content-region").first().hide();
        $(self.root).show();
        switch (id) {
            case "core":
                self.renderCoreSettings();
                break;
            case "fork":
                self.renderForkSettings();
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
        settingsCookie[id] = checked;
        this.updateSettings();
    }

    updateSettings() {
        let _c = settingsCookie;

        if (_c["bda-es-0"]) {
            $("#twitchcord-button-container").show();
        }
        else {
            $("#twitchcord-button-container").hide();
        }

        if (_c["bda-gs-b"]) {
            $("body").addClass("bd-blue");
        }
        else {
            $("body").removeClass("bd-blue");
        }

        if (_c["bda-gs-2"]) {
            $("body").addClass("bd-minimal");
        }
        else {
            $("body").removeClass("bd-minimal");
        }

        if (_c["bda-gs-3"]) {
            $("body").addClass("bd-minimal-chan");
        }
        else {
            $("body").removeClass("bd-minimal-chan");
        }

        if (_c["bda-gs-1"]) {
            $("#bd-pub-li").show();
        }
        else {
            $("#bd-pub-li").hide();
        }

        if (_c["bda-gs-4"]) {
            voiceMode.enable();
        }
        else {
            voiceMode.disable();
        }

        if (_c["bda-gs-5"]) {
            $("#app-mount").addClass("bda-dark");
        }
        else {
            $("#app-mount").removeClass("bda-dark");
        }


        if (_c["bda-gs-6"]) {
            mainCore.inject24Hour();
        }

        if (_c["bda-gs-7"]) {
            mainCore.injectColoredText();
        }
        else {
            mainCore.removeColoredText();
        }
        
        if (_c["fork-ps-4"]) classNormalizer.start();
        else classNormalizer.stop();

        if (_c["fork-ps-5"]) {
            ContentManager.watchContent("plugin");
            ContentManager.watchContent("theme");
        }
        else {
            ContentManager.unwatchContent("plugin");
            ContentManager.unwatchContent("theme");
        }

        if (_c["fork-wp-1"]) {
            const current = BdApi.getWindowPreference("transparent");
            if (current != _c["fork-wp-1"]) {
                BdApi.setWindowPreference("transparent", _c["fork-wp-1"]);
                if (_c["fork-wp-1"]) BdApi.setWindowPreference("backgroundColor", null);
                else BdApi.setWindowPreference("backgroundColor", "#2f3136");
            }
        }

        if (_c["fork-wp-2"]) {
            const current = BdApi.getWindowPreference("frame");
            if (current != _c["fork-wp-2"]) BdApi.setWindowPreference("frame", _c["fork-wp-2"]);
        }
        

        if (_c["bda-gs-8"]) {
            dMode.enable(_c["fork-dm-1"]);
        }
        else {
            dMode.disable();
        }

        mainCore.saveSettings();
    }

    renderSidebar() {
        let self = this;
        $("[class*='side-'] > [class*='item-']").off("click.v2settingspanel").on("click.v2settingspanel", () => {
            BDV2.reactDom.unmountComponentAtNode(self.root);
            $(self.root).hide();
            $(".content-region").first().show();
        });
        self.sidebar.render();
    }

    get coreComponent() {
        return BDV2.react.createElement(V2Components.Scroller, {contentColumn: true, fade: true, dark: true, children: [BDV2.react.createElement(V2Components.SettingsPanel, {key: "cspanel", title: "Core Settings", onChange: this.onChange, settings: this.coreSettings}), BDV2.react.createElement(V2Components.Tools, {key: "tools"})]});
    }
    
    get forkComponent() {
        return BDV2.react.createElement(V2Components.Scroller, {
                contentColumn: true, 
                fade: true,
                dark: true,
                children: [
                    BDV2.react.createElement(V2Components.SettingsPanel, {key: "fspanel", title: "Zere's Fork Settings", onChange: this.onChange, settings: this.forkSettings, button: {
                        title: "Clear Emote Cache",
                        onClick: () => { emoteModule.clearEmoteData(); emoteModule.init(); quickEmoteMenu.init(); }
                    }}),
                    BDV2.react.createElement(V2Components.Tools, {key: "tools"})
                ]
            }
        );
    }

    get emoteComponent() {
        return BDV2.react.createElement(V2Components.Scroller, {contentColumn: true, fade: true, dark: true, children: [BDV2.react.createElement(V2Components.SettingsPanel, {key: "espanel", title: "Emote Settings", onChange: this.onChange, settings: this.emoteSettings}), BDV2.react.createElement(V2Components.Tools, {key: "tools"})]});
    }

    get customCssComponent() {
        return BDV2.react.createElement(V2Components.Scroller, {contentColumn: true, fade: true, dark: true, children: [BDV2.react.createElement(V2Components.CssEditor, {key: "csseditor"}), BDV2.react.createElement(V2Components.Tools, {key: "tools"})]});
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
            console.log("FAILED TO LOCATE ROOT: .layer .ui-standard-sidebar-view");
            return;
        }
        BDV2.reactDom.render(this.coreComponent, root);
    }
    
    renderForkSettings() {
        let root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layer .ui-standard-sidebar-view");
            return;
        }
        BDV2.reactDom.render(this.forkComponent, root);
    }

    renderEmoteSettings() {
        let root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layer .ui-standard-sidebar-view");
            return;
        }
        BDV2.reactDom.render(this.emoteComponent, root);
    }

    renderCustomCssEditor() {
        let root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layer .ui-standard-sidebar-view");
            return;
        }
        BDV2.reactDom.render(this.customCssComponent, root);
    }

    renderPluginPane() {
        let root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layer .ui-standard-sidebar-view");
            return;
        }
        BDV2.reactDom.render(this.pluginsComponent, root);
    }

    renderThemePane() {
        let root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layer .ui-standard-sidebar-view");
            return;
        }
        BDV2.reactDom.render(this.themesComponent, root);
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
            {className: "ui-standard-sidebar-view"},
            BDV2.react.createElement(
                "div",
                {className: "sidebar-region"},
                BDV2.react.createElement(V2Components.Scroller, {key: "sidebarScroller", ref: "sidebarScroller", sidebar: true, fade: sidebar.fade || true, dark: sidebar.dark || true, children: sidebar.component})
            ),
            BDV2.react.createElement("div", {className: "content-region"},
                BDV2.react.createElement("div", {className: "content-transition-wrap"},
                    BDV2.react.createElement("div", {className: "scrollerWrap-2lJEkd content-region-scroller-wrap scrollerThemed-2oenus themeGhost-28MSn0 scrollerTrack-1ZIpsv"},
                        BDV2.react.createElement("div", {className: "scroller-2FKFPG content-region-scroller scroller", ref: "contentScroller"},
                            BDV2.react.createElement("div", {className: "content-column default"}, content.component),
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
        let root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layers");
            return;
        }
        BDV2.reactDom.render(this.component, root);
    }

    get button() {
        let btn = $("<div/>", {
            "class": BDV2.guildClasses.guild,
            "id": "bd-pub-li",
            "css": {
                height: "20px",
                display: settingsCookie["bda-gs-1"] ? "" : "none"
            }
        }).append($("<div/>", {
            "class": BDV2.guildClasses.guildInner,
            "css": {
                "height": "20px",
                "border-radius": "4px"
            }
        }).append($("<a/>", {

        }).append($("<div/>", {
            text: "public",
            id: "bd-pub-button",
            css: {
                "line-height": "20px",
                "font-size": "12px"
            },
            click: () => { this.render(); }
        }))));

        return btn;
    }

    initialize() {
        let guilds = $(`.${BDV2.guildClasses.guilds}>:first-child`);
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
                "x-discord-id": this.state.connection.user.id,
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
        let sub = window.location.hostname.split(".")[0];
        let url = self.connectEndPoint + (sub === "canary" || sub === "ptb" ? `/${sub}` : "") + "?betterDiscord";
        self.joinWindow.webContents.on("did-navigate", (event, url) => {
            if (url != "https://join.discordservers.com/session") return;
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
            center: false
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
        return "https://join.discordservers.com";
    }

    get connectEndPoint() {
        return "https://join.discordservers.com/connect";
    }

    checkConnection() {
        let self = this;
        try {
            $.ajax({
                method: "GET",
                url: `${self.joinEndPoint}/session`,
                headers: {          
                    "Accept": "application/json;",         
                    "Content-Type": "application/json;"   
                },
                crossDomain: true,
                xhrFields: {
                    withCredentials: true
                },
                success: data => {
                    self.setState({
                        selectedCategory: 0,
                        connection: {
                            state: 2,
                            user: data
                        }
                    });
                    self.search("", true);
                    
                },
                error: jqXHR => {
                    if (jqXHR.status === 403 || jqXHR.status === 404) {
                        //Not connected
                        self.setState({
                            title: "Not connected to discordservers.com!",
                            loading: true,
                            selectedCategory: -1,
                            connection: {
                                state: 1,
                                user: null
                            }
                        });
                        return;
                    }
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
        return ["All", "FPS Games", "MMO Games", "Strategy Games", "Sports Games", "Puzzle Games", "Retro Games", "Party Games", "Tabletop Games", "Sandbox Games", "Simulation Games", "Community", "Language", "Programming", "Other"];
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
            {ref: "content", key: "pc", className: "content-column default"},
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
            {key: "ncc", ref: "content", className: "content-column default"},
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
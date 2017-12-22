/* BetterDiscordApp Core JavaScript
 * Version: 1.78
 * Author: Jiiks | http://jiiks.net
 * Date: 27/08/2015 - 16:36
 * Last Update: 01/05/2016
 * https://github.com/Jiiks/BetterDiscordApp
 */

 /* global Proxy, bdplugins, bdthemes, betterDiscordIPC, bdVersion, version, BDV2, CodeMirror */

 /* eslint-disable  no-console */

/*Localstorage fix*/
(function() {

    let __fs = window.require("fs");
    let __process = window.require("process");
    let __platform = __process.platform;
    let __dataPath = (__platform === 'win32' ? __process.env.APPDATA : __platform === 'darwin' ? __process.env.HOME + '/Library/Preferences' : process.env.HOME + '/.config') + '/BetterDiscord/';


    let __data = {};
    if(__fs.existsSync(`${__dataPath}localStorage.json`)) {
        try {
            __data = JSON.parse(__fs.readFileSync(`${__dataPath}localStorage.json`));
        }catch(err) {
            console.log(err);
        }
    } else if(__fs.existsSync("localStorage.json")) {
        try {
            __data = JSON.parse(__fs.readFileSync("localStorage.json"));
        }catch(err) {
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
        __fs.writeFileSync(`${__dataPath}/localStorage.json`, JSON.stringify(this), null, 4);
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
    let v2Loader = document.createElement('div');
    v2Loader.className = "bd-loaderv2";
    v2Loader.title = "BetterDiscord is loading...";
    document.body.appendChild(v2Loader);
})();

window.bdStorage = {};
window.bdStorage.get = function(i) {
    return betterDiscordIPC.sendSync('synchronous-message', { 'arg': 'storage', 'cmd': 'get', 'var': i });
};
window.bdStorage.set = function(i, v) {
    betterDiscordIPC.sendSync('synchronous-message', { 'arg': 'storage', 'cmd': 'set', 'var': i, 'data': v });
};
window.bdPluginStorage = {};
window.bdPluginStorage.get = function(pn, i) {
    return betterDiscordIPC.sendSync('synchronous-message', { 'arg': 'pluginstorage', 'cmd': 'get', 'pn': pn, 'var': i });
};
window.bdPluginStorage.set = function(pn, i, v) {
    betterDiscordIPC.sendSync('synchronous-message', { 'arg': 'pluginstorage', 'cmd': 'set', 'pn': pn, 'var': i, 'data': v });
};

betterDiscordIPC.on('asynchronous-reply', (event, arg) => {
    console.log(event);
    console.log(arg);
});

var settingsPanel, emoteModule, utils, quickEmoteMenu, voiceMode, pluginModule, themeModule, dMode;
var jsVersion = 1.792;
var supportedVersion = "0.2.81";

var mainObserver;

var twitchEmoteUrlStart = "https://static-cdn.jtvnw.net/emoticons/v1/";
var twitchEmoteUrlEnd = "/1.0";
var ffzEmoteUrlStart = "https://cdn.frankerfacez.com/emoticon/";
var ffzEmoteUrlEnd = "/1";
var bttvEmoteUrlStart = "https://cdn.betterttv.net/emote/";
var bttvEmoteUrlEnd = "/1x";

var mainCore;

var settings = {
    "Startup Error Modal":        { "id": "bda-gs-9",  "info": "Show a modal with plugin/theme errors on startup.", "implemented": true,  "hidden": false, "cat": "core"},
    "Show Toasts":                { "id": "bda-gs-10", "info": "Shows a small notification for starting and stopping plugins & themes.", "implemented": true,  "hidden": false, "cat": "core"},
    "Save logs locally":          { "id": "bda-gs-0",  "info": "Saves chat logs locally",                           "implemented": false, "hidden": false, "cat": "core"},
    "Public Servers":             { "id": "bda-gs-1",  "info": "Display public servers button",                     "implemented": false, "hidden": false, "cat": "core"},
    "Minimal Mode":               { "id": "bda-gs-2",  "info": "Hide elements and reduce the size of elements.",    "implemented": true,  "hidden": false, "cat": "core"},
    "Voice Mode":                 { "id": "bda-gs-4",  "info": "Only show voice chat",                              "implemented": true,  "hidden": false, "cat": "core"},
    "Hide Channels":              { "id": "bda-gs-3",  "info": "Hide channels in minimal mode",                     "implemented": true,  "hidden": false, "cat": "core"},
    "Dark Mode":                  { "id": "bda-gs-5",  "info": "Make certain elements dark by default(wip)",        "implemented": true,  "hidden": false, "cat": "core"},
    "Override Default Emotes":    { "id": "bda-es-5",  "info": "Override default emotes",                           "implemented": false, "hidden": false, "cat": "core"},
    "Voice Disconnect":           { "id": "bda-dc-0",  "info": "Disconnect from voice server when closing Discord", "implemented": true,  "hidden": false, "cat": "core"},
    "Custom css live update":     { "id": "bda-css-0", "info": "",                                                  "implemented": true,  "hidden": true,  "cat": "core"},
    "Custom css auto udpate":     { "id": "bda-css-1", "info": "",                                                  "implemented": true,  "hidden": true,  "cat": "core"},
    "24 Hour Timestamps":         { "id": "bda-gs-6",  "info": "Replace 12hr timestamps with proper ones",          "implemented": true,  "hidden": false, "cat": "core"},
    "Coloured Text":              { "id": "bda-gs-7",  "info": "Make text colour the same as role colour",          "implemented": true,  "hidden": false, "cat": "core"},
    "BetterDiscord Blue":         { "id": "bda-gs-b",  "info": "Replace Discord blue with BD Blue",                 "implemented": true,  "hidden": false, "cat": "core"},
    "Developer Mode":         	  { "id": "bda-gs-8",  "info": "Developer Mode",                                    "implemented": true,  "hidden": false, "cat": "core"},
	"Copy Selector":			  { "id": "bda-gs-11", "info": "Adds a \"Copy Selector\" option to context menus when developer mode is active.", "implemented": true,  "hidden": false, "cat": "core"},

    "Twitch Emotes":              { "id": "bda-es-7",  "info": "Show Twitch emotes",                                "implemented": true,  "hidden": false, "cat": "emote"},
    "FrankerFaceZ Emotes":        { "id": "bda-es-1",  "info": "Show FrankerFaceZ Emotes",                          "implemented": true,  "hidden": false, "cat": "emote"},
    "BetterTTV Emotes":           { "id": "bda-es-2",  "info": "Show BetterTTV Emotes",                             "implemented": true,  "hidden": false, "cat": "emote"},
    "Emote Menu":                 { "id": "bda-es-0",  "info": "Show Twitch/Favourite emotes in emote menu",        "implemented": true,  "hidden": false, "cat": "emote"},
    "Emoji Menu":                 { "id": "bda-es-9",  "info": "Show Discord emoji menu",                           "implemented": true,  "hidden": false, "cat": "emote"},
    "Emote Autocomplete":         { "id": "bda-es-3",  "info": "Autocomplete emote commands",                       "implemented": false, "hidden": false, "cat": "emote"},
    "Emote Auto Capitalization":  { "id": "bda-es-4",  "info": "Autocapitalize emote commands",                     "implemented": true,  "hidden": false, "cat": "emote"},
    "Show Names":                 { "id": "bda-es-6",  "info": "Show emote names on hover",                         "implemented": true,  "hidden": false, "cat": "emote"},
    "Show emote modifiers":       { "id": "bda-es-8",  "info": "Enable emote mods (flip, spin, pulse, spin2, spin3, 1spin, 2spin, 3spin, tr, bl, br, shake, shake2, shake3, flap)", "implemented": true,  "hidden": false, "cat": "emote"},
};

// var links = {
//     "Jiiks.net": { "text": "Jiiks.net", "href": "thtp://jiiks.net",          "target": "_blank" },
//     "twitter":   { "text": "Twitter",   "href": "http://twitter.com/jiiksi", "target": "_blank" },
//     "github":    { "text": "Github",    "href": "http://github.com/jiiks",   "target": "_blank" }
// };

var defaultCookie = {
    "version": jsVersion,
    "bda-gs-0": false,
    "bda-gs-1": false,
    "bda-gs-2": false,
    "bda-gs-3": false,
    "bda-gs-4": false,
    "bda-gs-5": true,
    "bda-gs-6": false,
    "bda-gs-7": false,
    "bda-gs-8": false,
	"bda-gs-11": false,
    "bda-gs-9": true,
    "bda-gs-10": true,
    "bda-es-0": true,
    "bda-es-1": true,
    "bda-es-2": true,
    "bda-es-3": false,
    "bda-es-4": false,
    "bda-es-5": true,
    "bda-es-6": true,
    "bda-es-7": true,
    "bda-gs-b": true,
    "bda-es-8": true,
    "bda-jd": true,
    "bda-dc-0": false,
    "bda-css-0": false,
    "bda-css-1": false,
    "bda-es-9": true
};


var settingsCookie = {};

var bdpluginErrors, bdthemeErrors; // define for backwards compatibility

function Core() {}

Core.prototype.init = function () {
    var self = this;

    var lVersion = (typeof(version) === "undefined") ? bdVersion : version;

    if (lVersion < supportedVersion) {
        this.alert("Not Supported", "BetterDiscord v" + lVersion + "(your version)" + " is not supported by the latest js(" + jsVersion + ").<br><br> Please download the latest version from <a href='https://betterdiscord.net' target='_blank'>BetterDiscord.net</a>");
        return;
    }

    utils = new Utils();
    utils.getHash();
    emoteModule = new EmoteModule();
    quickEmoteMenu = new QuickEmoteMenu();
    voiceMode = new VoiceMode();
    dMode = new devMode();

	utils.log("Initializing EmoteModule");
    emoteModule.init();

	utils.log("Initializing Settings");
    this.initSettings();

    //Incase were too fast
    function gwDefer() {
        console.log(new Date().getTime() + " Defer");
        if (document.querySelectorAll('.guilds .guild').length > 0) {
            console.log(new Date().getTime() + " Defer Loaded");
            self.injectExternals();

            // Add check for backwards compatibility
            if (!bdpluginErrors) bdpluginErrors = [];
            if (!bdthemeErrors) bdthemeErrors = [];

			utils.log("Loading Plugins");
            pluginModule = new PluginModule();
            pluginModule.loadPlugins();

			utils.log("Loading Themes");
            themeModule = new ThemeModule();
            themeModule.loadThemes();

			utils.log("Updating Settings");
            settingsPanel = new V2_SettingsPanel();
            settingsPanel.updateSettings();

			utils.log("Initializing QuickEmoteMenu");
            quickEmoteMenu.init(false);
            
            window.addEventListener("beforeunload", function(){
                if(settingsCookie["bda-dc-0"]){
                    document.querySelector('.btn.btn-disconnect').click();
                }
            });

            emoteModule.autoCapitalize();

            /*Display new features in BetterDiscord*/
            if (settingsCookie["version"] < jsVersion) {
                //var cl = self.constructChangelog();
                settingsCookie["version"] = jsVersion;
                self.saveSettings();
            }

			utils.log("Removing Loading Icon");
            $("head").append("<style>.CodeMirror{ min-width:100%; }</style>");
            $("head").append('<style id="bdemotemenustyle"></style>');
            document.getElementsByClassName("bd-loaderv2")[0].remove();
            // Show loading errors
            if (settingsCookie["bda-gs-9"]) {
				utils.log("Collecting Startup Errors");
                self.showStartupErrors();
            }
			utils.log("Initializing Main Observer");
            self.initObserver();
        } else {
            setTimeout(gwDefer, 100);
        }
    }


    $(document).ready(function () {
        setTimeout(gwDefer, 1000);
    });
};

Core.prototype.injectExternals = function() {
    utils.injectJs("https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.25.0/codemirror.min.js");
    utils.injectJs("https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.25.0/mode/css/css.min.js");
    utils.injectJs("https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.25.0/addon/scroll/simplescrollbars.min.js");
    utils.injectCss("https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.25.0/addon/scroll/simplescrollbars.min.css");
    utils.injectCss("https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.25.0/theme/material.min.css");
    utils.injectJs("https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.4.2/Sortable.min.js");
};

Core.prototype.initSettings = function () {
    if ($.cookie("better-discord") == undefined) {
        settingsCookie = defaultCookie;
        this.saveSettings();
    } else {
        this.loadSettings();
        $('<style id="customcss">').html(atob(window.bdStorage.get("bdcustomcss"))).appendTo(document.head);
        for (var setting in defaultCookie) {
            if (settingsCookie[setting] == undefined) {
                settingsCookie[setting] = defaultCookie[setting];
                this.saveSettings();
            }
        }
    }
};

Core.prototype.saveSettings = function () {
    $.cookie("better-discord", JSON.stringify(settingsCookie), {
        expires: 365,
        path: '/'
    });
};

Core.prototype.loadSettings = function () {
    settingsCookie = JSON.parse($.cookie("better-discord"));
};

Core.prototype.initObserver = function () {
    let self = this;
    mainObserver = new MutationObserver(function (mutations) {

        mutations.forEach(function (mutation) {

            if (typeof pluginModule !== "undefined") pluginModule.rawObserver(mutation);

            // onSwitch()
            // leaving Activity Feed/Friends menu
            if (mutation.removedNodes.length && mutation.removedNodes[0] instanceof Element) {
                let node = mutation.removedNodes[0];
                if (node.classList.contains("activityFeed-HeiGwL") || node.id === "friends") {
                    pluginModule.channelSwitch();
                }
            }

            // if there was nothing added, skip
            if (!mutation.addedNodes.length || !(mutation.addedNodes[0] instanceof Element)) return;

            let node = mutation.addedNodes[0];

            if (node.classList.contains("layer")) {
                if (node.querySelector(".guild-settings-base-section")) node.setAttribute('layer-id', 'server-settings');

                if (node.querySelector(".socialLinks-1oZoF3")) {
                    node.setAttribute('layer-id', 'user-settings');
                    if (!node.querySelector("#bd-settings-sidebar")) settingsPanel.renderSidebar();
                }
            }

            // Emoji Picker
            if (node.classList.contains('popout') && !node.classList.contains('popout-left')) {
                if (node.getElementsByClassName('emoji-picker').length) quickEmoteMenu.obsCallback(node);
            }

            // onSwitch()
            // Not a channel, but still a switch (Activity Feed/Friends menu/NSFW check)
            if (node.classList.contains("activityFeed-HeiGwL") || node.id === "friends") {
                pluginModule.channelSwitch();
            }

            // onSwitch()
            // New Channel
            if (node.classList.contains("messages-wrapper") || node.querySelector(".messages-wrapper")) {
                self.inject24Hour(node);
                self.injectColoredText(node);
                pluginModule.channelSwitch();
            }

            // onMessage
            // New Message Group
            if (node.classList.contains("message-group") && !node.querySelector(".message-sending")) {
                self.inject24Hour(node);
                self.injectColoredText(node);
                if (node.parentElement && node.parentElement.children && node == node.parentElement.children[node.parentElement.children.length - 1]) {
                    pluginModule.newMessage();
                }
            }

            // onMessage
            // Single Message
            if (node.classList.contains("message") && !node.classList.contains("message-sending")) {
                self.injectColoredText(node.parentElement.parentElement);
                pluginModule.newMessage();
            }

            emoteModule.obsCallback(mutation);
        });
    });

    //noinspection JSCheckFunctionSignatures
    mainObserver.observe(document, {
        childList: true,
        subtree: true
    });
};

Core.prototype.inject24Hour = function(node) {
    if (!settingsCookie["bda-gs-6"]) return;

    node.querySelectorAll('.timestamp').forEach(elem => {
        if (elem.getAttribute("data-24")) return;
        let text = elem.innerText || elem.textContent;
        let matches = /([^0-9]*)([0-9]?[0-9]:[0-9][0-9])([^0-9]*)/.exec(text);
        if(matches == null) return;
        if(matches.length < 4) return;

        let time = matches[2].split(':');
        let hours = parseInt(time[0]);
        let minutes = time[1];
        let timeOfDay = matches[3].toLowerCase();

        if (timeOfDay.includes("am") && hours == 12) hours -= 12;
        else if (timeOfDay.includes("pm") && hours < 2) hours += 12;
        
        hours = ("0" + hours).slice(-2);
        elem.innerText = matches[1] + hours + ":" + minutes + matches[3];
        elem.setAttribute("data-24", matches[2]);
    });
};

Core.prototype.remove24Hour = function(node) {
    node.querySelectorAll('.timestamp').forEach(elem => {
        if (!elem.getAttribute("data-24")) return;
        let time = elem.getAttribute("data-24");
        elem.removeAttribute("data-24");
        let text = elem.innerText || elem.textContent;
        let matches = /([^0-9]*)([0-9]?[0-9]:[0-9][0-9])([^0-9]*)/.exec(text);
        if(matches == null) return;
        if(matches.length < 4) return;

        elem.innerText = matches[1] + time + matches[3];
    });
};

Core.prototype.injectColoredText = function(node) {
    if (!settingsCookie["bda-gs-7"]) return;

    node.querySelectorAll('.user-name').forEach(elem => {
        let color = elem.style.color;
        if (color === "rgb(255, 255, 255)") return;
        elem.closest(".message-group").querySelectorAll('.markup').forEach(elem => {
            if (elem.getAttribute("data-color")) return;
            elem.setAttribute("data-color", true);
            elem.style.setProperty("color", color);
        });
    });
};

Core.prototype.removeColoredText = function(node) {
    node.querySelectorAll('.user-name').forEach(elem => {
        elem.closest(".message-group").querySelectorAll('.markup').forEach(elem => {
            if (!elem.getAttribute("data-color")) return;
            elem.removeAttribute("data-color");
            elem.style.setProperty("color", "");
        });
    });
};

Core.prototype.alert = function(title, content) {
    let modal = $(`<div class="bd-modal-wrapper theme-dark">
                    <div class="bd-backdrop backdrop-2ohBEd"></div>
                    <div class="bd-modal modal-2LIEKY">
                        <div class="bd-modal-inner inner-1_1f7b">
                            <div class="header header-3sp3cE">
                                <div class="title">${title}</div>
                            </div>
                            <div class="bd-modal-body">
                                <div class="scroller-wrap fade">
                                    <div class="scroller">
                                        ${content}
                                    </div>
                                </div>
                            </div>
                            <div class="footer footer-1PYmcw">
                                <button type="button">Okay</button>
                            </div>
                        </div>
                    </div>
                </div>`);
    modal.find('.footer button').on('click', () => {
        modal.addClass('closing');
        setTimeout(() => { modal.remove(); }, 300);
    });
    modal.find('.bd-backdrop').on('click', () => {
        modal.addClass('closing');
        setTimeout(() => { modal.remove(); }, 300);
    });
    modal.appendTo("#app-mount");
};

Core.prototype.showStartupErrors = function() {
    if (!bdpluginErrors || !bdthemeErrors) return;
    if (!bdpluginErrors.length && !bdthemeErrors.length) return;
    let modal = $(`<div class="bd-modal-wrapper theme-dark">
                    <div class="bd-backdrop backdrop-2ohBEd"></div>
                    <div class="bd-modal bd-startup-modal modal-2LIEKY">
                        <div class="bd-modal-inner inner-1_1f7b">
                            <div class="header header-3sp3cE"><div class="title">Startup Errors</div></div>
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
                            <div class="footer footer-1PYmcw">
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
                error.find('a').on('click', (e) => {
                    e.preventDefault();
                    utils.err(`Error details for ${err.name ? err.name : err.file}.`, err.error);
                });
            }
        }
        return container;
    }
    
    let tabs = [generateTab(bdpluginErrors), generateTab(bdthemeErrors)];

    modal.find('.tab-bar-item').on('click', (e) => {
        e.preventDefault();
        modal.find('.tab-bar-item').removeClass('selected');
        $(e.target).addClass('selected');
        modal.find('.scroller').empty().append(tabs[$(e.target).index()]);
    });

    modal.find('.footer button').on('click', () => {
        modal.addClass('closing');
        setTimeout(() => { modal.remove(); }, 300);
    });
    modal.find('.bd-backdrop').on('click', () => {
        modal.addClass('closing');
        setTimeout(() => { modal.remove(); }, 300);
    });
    modal.appendTo("#app-mount");
    modal.find('.tab-bar-item')[0].click();
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
    if (!document.querySelector('.bd-toasts')) {
        let toastWrapper = document.createElement("div");
        toastWrapper.classList.add("bd-toasts");
        let boundingElement = document.querySelector('.chat form, #friends, .noChannel-2EQ0a9, .activityFeed-HeiGwL');
        toastWrapper.style.setProperty("left", boundingElement ? boundingElement.getBoundingClientRect().left + "px" : "0px");
        toastWrapper.style.setProperty("width", boundingElement ? boundingElement.offsetWidth + "px" : "100%");
        toastWrapper.style.setProperty("bottom", (document.querySelector('.chat form') ? document.querySelector('.chat form').offsetHeight : 80) + "px");
        document.querySelector('.app').appendChild(toastWrapper);
    }
    const {type = "", icon = true, timeout = 3000} = options;
    let toastElem = document.createElement("div");
    toastElem.classList.add("bd-toast");
	if (type) toastElem.classList.add("toast-" + type);
	if (type && icon) toastElem.classList.add("icon");
    toastElem.innerText = content;
    document.querySelector('.bd-toasts').appendChild(toastElem);
    setTimeout(() => {
        toastElem.classList.add('closing');
        setTimeout(() => {
            toastElem.remove();
            if (!document.querySelectorAll('.bd-toasts .bd-toast').length) document.querySelector('.bd-toasts').remove();
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

var emotesFfz = {};
var emotesBTTV = {};
var emotesBTTV2 = {};
var emotesTwitch = {
    "emote": {
        "id": 0
    }
}; //for ide
var subEmotesTwitch = {};

function EmoteModule() {}

EmoteModule.prototype.init = function () {};

EmoteModule.prototype.getBlacklist = function () {
    $.getJSON("https://cdn.rawgit.com/Jiiks/betterDiscordApp/" + _hash + "/data/emotefilter.json", function (data) {
        bemotes = data.blacklist;
    });
};

EmoteModule.prototype.obsCallback = function (mutation) {
    var self = this;
    
    for (var i = 0; i < mutation.addedNodes.length; ++i) {
        var next = mutation.addedNodes.item(i);
        if (next) {
            var nodes = self.getNodes(next);
            for (var node in nodes) {
                if (nodes.hasOwnProperty(node)) {
                    var elem = nodes[node].parentElement;
                    if (elem && elem.classList.contains('edited')) {
                        self.injectEmote(elem);
                    } else {
                        self.injectEmote(nodes[node]);
                    }
                }
            }
        }
    }
};

EmoteModule.prototype.getNodes = function (node) {
    var next;
    var nodes = [];

    var treeWalker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);

    // eslint-disable-next-line no-cond-assign
    while (next = treeWalker.nextNode()) {
        nodes.push(next);
    }
    return nodes;
};

var bemotes = [];
// var spoilered = [];


EmoteModule.prototype.injectEmote = function(node) {
    var self = this;

    if (!node.parentElement) return;
    var parent = node.parentElement;
    
    if(!parent.classList.contains("markup") && !parent.classList.contains("message-content")) return;

    parent = $(parent);
    function inject() {
        var contents = parent.contents();
        
        contents.each(function(i) {
            if(contents[i] == undefined) return;
            var nodeValue = contents[i].nodeValue;
            if(nodeValue == null) return;
            //if(nodeValue.indexOf("react-") > -1) return;

            if(contents[i].nodeType == 8) return;
            contents.splice(i, 1);

            var words = nodeValue.split(/([^\s]+)([\s]|$)/g).filter(function(e) { return e; });
            
            var splice = 0;

            var doInject = false;
            var text = null;

            words.forEach(function(w, index, a) {
                
                if(w.indexOf("[!s]") > -1) {
                    w = w.replace("[!s]", "");
                    parent.data("spoilered", false);
                    parent.addClass("spoiler");
                }
                
                var allowedClasses = ["flip", "spin", "pulse", "spin2", "spin3", "1spin", "2spin", "3spin", "tr", "bl", "br", "shake", "shake2", "shake3", "flap"];
                // var useEmoteClass = false;
                var emoteClass = "";
                var skipffz = false;
                
                var sw = w;
                
                if(w.indexOf(":") > -1) {
                    var split = w.split(":");
                    if(split[0] != "" && split[1] != "") {
                        if(allowedClasses.indexOf(split[1]) > -1) {
                            sw = split[0];
                            emoteClass = settingsCookie["bda-es-8"] ? "emote" + split[1] : "";
                        }
                        if(split[1] == "bttv") {
                            sw = split[0];
                            skipffz = true;
                        }
                    }
                }
                
                if ($.inArray(sw, bemotes) == -1) {
                
                    if(typeof emotesTwitch !== 'undefined' && settingsCookie["bda-es-7"]) {
                        if(emotesTwitch.hasOwnProperty(sw) && sw.length >= 4) { 
                            if(text != null) { contents.splice(i + splice++, 0, document.createTextNode(text));  text = null;}
                            let url = twitchEmoteUrlStart + emotesTwitch[sw].id + twitchEmoteUrlEnd;
                            contents.splice(i + splice++, 0, self.createEmoteElement(sw, url, emoteClass));
                            doInject = true;
                            return;
                        }
                    }
                    
                    if(typeof subEmotesTwitch !== 'undefined' && settingsCookie["bda-es-7"]) {
                        if(subEmotesTwitch.hasOwnProperty(sw) && sw.length >= 4) {
                            if(text != null) { contents.splice(i + splice++, 0, document.createTextNode(text));  text = null;}
                            let url = twitchEmoteUrlStart + subEmotesTwitch[sw] + twitchEmoteUrlEnd;
                            contents.splice(i + splice++, 0, self.createEmoteElement(sw, url, emoteClass));
                            doInject = true;
                            return;
                        }
                    }
                    
                    if (typeof emotesBTTV !== 'undefined' && settingsCookie["bda-es-2"]) { 
                        if(emotesBTTV.hasOwnProperty(sw) && sw.length >= 4) {
                            if(text != null) { contents.splice(i + splice++, 0, document.createTextNode(text));  text = null;}
                            let url = emotesBTTV[sw];
                            contents.splice(i + splice++, 0, self.createEmoteElement(sw, url, emoteClass));
                            doInject = true;
                            return;
                        }
                    }
                    
                    if ((typeof emotesFfz !== 'undefined' && settingsCookie["bda-es-1"]) && (!skipffz || !emotesBTTV2.hasOwnProperty(sw))) { 
                        if(emotesFfz.hasOwnProperty(sw) && sw.length >= 4) {
                            if(text != null) { contents.splice(i + splice++, 0, document.createTextNode(text));  text = null;}
                            let url = ffzEmoteUrlStart + emotesFfz[sw] + ffzEmoteUrlEnd;
                            contents.splice(i + splice++, 0, self.createEmoteElement(sw, url, emoteClass));
                            doInject = true;
                            return;
                        }
                    }
    
                    if (typeof emotesBTTV2 !== 'undefined' && settingsCookie["bda-es-2"]) { 
                        if(emotesBTTV2.hasOwnProperty(sw) && sw.length >= 4) {
                            if(text != null) { contents.splice(i + splice++, 0, document.createTextNode(text));  text = null;}
                            let url = bttvEmoteUrlStart + emotesBTTV2[sw] + bttvEmoteUrlEnd;
                            if(skipffz && emotesFfz.hasOwnProperty(sw)) sw = sw + ":bttv";
                            contents.splice(i + splice++, 0, self.createEmoteElement(sw, url, emoteClass));
                            doInject = true;
                            return;
                        }
                    }
                }
                
                if(text == null) {
                    text = w;
                } else {
                    text += "" + w;
                }

                if(index === a.length - 1) {
                    contents.splice(i + splice, 0, document.createTextNode(text));
                }
            });

            if(doInject) {
                var oldHeight = parent.outerHeight();
                parent.html(contents);
                var scrollPane = $(".scroller.messages").first();
                scrollPane.scrollTop(scrollPane.scrollTop() + (parent.outerHeight() - oldHeight));
            }

        });
    }
    
    inject();
    if(parent.children().hasClass("edited")) {
        setTimeout(inject, 250);
    }

    

};

EmoteModule.prototype.createEmoteElement = function(word, url, mod) {
    var len = Math.round(word.length / 4);
    var name = word.substr(0, len) + "\uFDD9" + word.substr(len, len) + "\uFDD9" + word.substr(len * 2, len) + "\uFDD9" + word.substr(len * 3);
    var html = '<span class="emotewrapper"><img draggable="false" style="max-height:32px;" class="emote ' + mod + '" alt="' + name + '" src="' + url + '"/><input onclick=\'quickEmoteMenu.favorite("' + name + '", "' + url + '");\' class="fav" title="Favorite!" type="button"></span>';
    return $.parseHTML(html.replace(new RegExp("\uFDD9", "g"), ""))[0];
};

EmoteModule.prototype.autoCapitalize = function () {

    var self = this;

    $('body').delegate($(".channelTextArea-1HTP3C textarea:first"), 'keyup change paste', function () {
        if (!settingsCookie["bda-es-4"]) return;

        var text = $(".channelTextArea-1HTP3C textarea:first").val();
        if (text == undefined) return;

        var lastWord = text.split(" ").pop();
        if (lastWord.length > 3) {
            if (lastWord == "danSgame") return;
            var ret = self.capitalize(lastWord.toLowerCase());
            if (ret !== null && ret !== undefined) {
                utils.insertText(utils.getTextArea()[0], text.replace(lastWord, ret));
            }
        }
    });
};

EmoteModule.prototype.capitalize = function (value) {
    var res = emotesTwitch;
    for (var p in res) {
        if (res.hasOwnProperty(p) && value == (p + '').toLowerCase()) {
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
        if(e.target.id != "rmenu") $("#rmenu").remove();
    });
    this.favoriteEmotes = {};
    var fe = window.bdStorage.get("bdfavemotes");
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
    for (let emote in emotesTwitch) {
        if (emotesTwitch.hasOwnProperty(emote)) {
            var id = emotesTwitch[emote].id;
            teContainer += "<div class=\"emote-container\">";
            teContainer += "    <img class=\"emote-icon\" id=\"" + emote + "\" alt=\"\" src=\"https://static-cdn.jtvnw.net/emoticons/v1/" + id + "/1.0\" title=\"" + emote + "\">";
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
        var url = this.favoriteEmotes[emote];
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
    var menu = $('<div>', { id: "rmenu", "data-emoteid": $(em).prop("title"), text: "Remove", class: "context-menu theme-dark" });
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

    $(".emoji-picker").hide();
    $("#bda-qem-favourite-container").hide();
    $("#bda-qem-twitch-container").hide();

    switch(id) {
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
            $(".emoji-picker").show();
            $(".emoji-picker .search-bar-inner input").focus();
        break;
    }
    this.lastTab = id;

    var emoteIcon = $(".emote-icon");
    emoteIcon.off();
    emoteIcon.on("click", function () {
        var emote = $(this).attr("title");
        var ta = utils.getTextArea();
        utils.insertText(ta[0], ta.val().slice(-1) == " " ? ta.val() + emote : ta.val() + " " + emote);
    });
};

QuickEmoteMenu.prototype.obsCallback = function (elem) {
    var e = $(elem);
    if(!settingsCookie["bda-es-9"]) {
        e.addClass("bda-qme-hidden");
    } else {
        e.removeClass("bda-qme-hidden");
    }

    if(!settingsCookie["bda-es-0"]) return;

    e.prepend(this.qmeHeader);
    e.append(this.teContainer);
    e.append(this.faContainer);

    if(this.lastTab == undefined) {
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
    window.bdStorage.set("bdfavemotes", btoa(JSON.stringify(this.favoriteEmotes)));
};



/* BetterDiscordApp Utilities JavaScript
 * Version: 1.0
 * Author: Jiiks | http://jiiks.net
 * Date: 26/08/2015 - 15:54
 * https://github.com/Jiiks/BetterDiscordApp
 */

var _hash;

function Utils() {

}

Utils.prototype.getTextArea = function () {
    return $(".channelTextArea-1HTP3C textarea");
};

Utils.prototype.insertText = function (textarea, text) {
    textarea.focus();
    textarea.selectionStart = 0;
    textarea.selectionEnd = textarea.value.length;
    document.execCommand("insertText", false, text);
};

Utils.prototype.jqDefer = function (fnc) {
    if (window.jQuery) {
        fnc();
    } else {
        setTimeout(function () {
            this.jqDefer(fnc);
        }, 100);
    }
};

Utils.prototype.getHash = function () {
    $.getJSON("https://api.github.com/repos/Jiiks/BetterDiscordApp/commits/master", function (data) {
        _hash = data.sha;
        emoteModule.getBlacklist();
    });
};

Utils.prototype.loadHtml = function (html, callback) {
    var container = $("<div/>", {
        class: "bd-container"
    }).appendTo("body");

    //TODO Inject these in next core update
    html = '//cdn.rawgit.com/Jiiks/BetterDiscordApp/' + _hash + '/html/' + html + '.html';

    container.load(html, callback());
};

Utils.prototype.injectJs = function (uri) {
    $("<script/>", {
        type: "text/javascript",
        src: uri
    }).appendTo($("body"));
};

Utils.prototype.injectCss = function (uri) {
    $("<link/>", {
        type: "text/css",
        rel: "stylesheet",
        href: uri
    }).appendTo($("head"));
};

Utils.prototype.escapeID = function(id) {
    return id.replace(/^[^a-z]+|[^\w-]+/gi, "");
};

Utils.prototype.log = function (message) {
    console.log('%c[BetterDiscord] %c' + message + '', 'color: #3a71c1; font-weight: 700;', '');
};

Utils.prototype.err = function (message, error) {
    console.log('%c[BetterDiscord] %c' + message + '', 'color: red; font-weight: 700;', '');
    if (error) {
        console.groupCollapsed('%cError: ' + error.message, 'color: red;');
        console.error(error.stack);
        console.groupEnd();
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

VoiceMode.prototype.obsCallback = function () {
    var self = this;
    if (settingsCookie["bda-gs-4"]) {
        self.disable();
        setTimeout(function () {
            self.enable();
        }, 300);
    }
};

VoiceMode.prototype.enable = function () {
    $(".scroller.guild-channels ul").first().css("display", "none");
    $(".scroller.guild-channels header").first().css("display", "none");
    $(".app.flex-vertical").first().css("overflow", "hidden");
    $(".chat.flex-vertical.flex-spacer").first().css("visibility", "hidden").css("min-width", "0px");
    $(".flex-vertical.channels-wrap").first().css("flex-grow", "100000");
    $(".guild-header .btn.btn-hamburger").first().css("visibility", "hidden");
};

VoiceMode.prototype.disable = function () {
    $(".scroller.guild-channels ul").first().css("display", "");
    $(".scroller.guild-channels header").first().css("display", "");
    $(".app.flex-vertical").first().css("overflow", "");
    $(".chat.flex-vertical.flex-spacer").first().css("visibility", "").css("min-width", "");
    $(".flex-vertical.channels-wrap").first().css("flex-grow", "");
    $(".guild-header .btn.btn-hamburger").first().css("visibility", "");
};
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

    var plugins = Object.keys(bdplugins);
    for (var i = 0; i < plugins.length; i++) {
        var plugin, name;

        try {
            plugin = bdplugins[plugins[i]].plugin;
            name = plugin.getName();
            plugin.load();
        }
        catch (err) {
            pluginCookie[name] = false;
            utils.err("Plugin " + name + " could not be loaded.", err);
            bdpluginErrors.push({name: name, file: bdplugins[plugins[i]].filename, reason: "load() could not be fired.", error: {message: err.message, stack: err.stack}});
            continue;
        }

        if (!pluginCookie[name]) pluginCookie[name] = false;

        if (pluginCookie[name]) {
            try {
                plugin.start();
                if (settingsCookie["bda-gs-10"]) mainCore.showToast(`${plugin.getName()} v${plugin.getVersion()} has started.`);
            }
            catch (err) {
                pluginCookie[name] = false;
                utils.err("Plugin " + name + " could not be started.", err);
                bdpluginErrors.push({name: name, file: bdplugins[plugins[i]].filename, reason: "start() could not be fired.", error: {message: err.message, stack: err.stack}});
            }
        }
    }
    this.savePluginData();
};

PluginModule.prototype.startPlugin = function (plugin) {
    try {
        bdplugins[plugin].plugin.start();
        if (settingsCookie["bda-gs-10"]) mainCore.showToast(`${bdplugins[plugin].plugin.getName()} v${bdplugins[plugin].plugin.getVersion()} has started.`);
    }
    catch (err) {
        pluginCookie[plugin] = false;
        this.savePluginData();
        utils.err("Plugin " + name + " could not be started.", err);
    }
};

PluginModule.prototype.stopPlugin = function (plugin) {
    try {
        bdplugins[plugin].plugin.stop();
        if (settingsCookie["bda-gs-10"]) mainCore.showToast(`${bdplugins[plugin].plugin.getName()} v${bdplugins[plugin].plugin.getVersion()} has stopped.`);
    }
    catch (err) {
        utils.err("Plugin " + name + " could not be stopped.", err);
    }
};

PluginModule.prototype.enablePlugin = function (plugin) {
    pluginCookie[plugin] = true;
    this.savePluginData();
    this.startPlugin(plugin);
};

PluginModule.prototype.disablePlugin = function (plugin) {
    pluginCookie[plugin] = false;
    this.savePluginData();
    this.stopPlugin(plugin);
};

PluginModule.prototype.togglePlugin = function (plugin) {
    if (pluginCookie[plugin]) this.disablePlugin(plugin);
    else this.enablePlugin(plugin);
};

PluginModule.prototype.loadPluginData = function () {
    var cookie = $.cookie("bd-plugins");
    if (cookie != undefined) {
        pluginCookie = JSON.parse($.cookie("bd-plugins"));
    }
};

PluginModule.prototype.savePluginData = function () {
    $.cookie("bd-plugins", JSON.stringify(pluginCookie), {
        expires: 365,
        path: '/'
    });
};

PluginModule.prototype.newMessage = function () {
    var plugins = Object.keys(bdplugins);
    for (var i = 0; i < plugins.length; i++) {
        var plugin = bdplugins[plugins[i]].plugin;
        if (!pluginCookie[plugin.getName()]) continue;
        if (typeof plugin.onMessage === "function") {
            try { plugin.onMessage(); }
            catch (err) { utils.err("Unable to fire onMessage for " + plugin.getName() + ".", err); }
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
            catch (err) { utils.err("Unable to fire onSwitch for " + plugin.getName() + ".", err); }
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
            catch (err) { utils.err("Unable to fire observer for " + plugin.getName() + ".", err); }
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

    var themes = Object.keys(bdthemes);
    
    for (var i = 0; i < themes.length; i++) {
        var name = bdthemes[themes[i]].name;
        if (!themeCookie[name]) themeCookie[name] = false;
        if (themeCookie[name]) $("head").append($('<style>', {id: utils.escapeID(name), html: unescape(bdthemes[name].css)}));
    }
};

ThemeModule.prototype.enableTheme = function (theme) {
    themeCookie[theme] = true;
    this.saveThemeData();
    $("head").append(`<style id="${utils.escapeID(bdthemes[theme].name)}">${unescape(bdthemes[theme].css)}</style>`);
    if (settingsCookie["bda-gs-10"]) mainCore.showToast(`${bdthemes[theme].name} v${bdthemes[theme].version} has been applied.`);
};

ThemeModule.prototype.disableTheme = function (theme) {
    themeCookie[theme] = false;
    this.saveThemeData();
    $(`#${utils.escapeID(bdthemes[theme].name)}`).remove();
    if (settingsCookie["bda-gs-10"]) mainCore.showToast(`${bdthemes[theme].name} v${bdthemes[theme].version} has been removed.`);
};

ThemeModule.prototype.toggleTheme = function (theme) {
    if (themeCookie[theme]) this.disableTheme(theme);
    else this.enableTheme(theme);
};

ThemeModule.prototype.loadThemeData = function () {
    var cookie = $.cookie("bd-themes");
    if (cookie != undefined) {
        themeCookie = JSON.parse($.cookie("bd-themes"));
    }
};

ThemeModule.prototype.saveThemeData = function () {
    $.cookie("bd-themes", JSON.stringify(themeCookie), {
        expires: 365,
        path: '/'
    });
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

function BdApi() {}

//Inject CSS to document head
//id = id of element
//css = custom css
BdApi.injectCSS = function (id, css) {
    $("head").append($('<style>', {id: utils.escapeID(id), html: css}));
};

//Clear css/remove any element
//id = id of element
BdApi.clearCSS = function (id) {
    $("#" + utils.escapeID(id)).remove();
};

//Inject CSS to document head
//id = id of element
//css = custom css
BdApi.linkJS = function (id, url) {
    $("head").append($('<script>', {id: utils.escapeID(id), src: url, type: "text/javascript"}));
};

//Clear css/remove any element
//id = id of element
BdApi.unlinkJS = function (id) {
    $("#" + utils.escapeID(id)).remove();
};

//Get another plugin
//name = name of plugin
BdApi.getPlugin = function (name) {
    if (bdplugins.hasOwnProperty(name)) {
        return bdplugins[name]["plugin"];
    }
    return null;
};

//Get ipc for reason
BdApi.getIpc = function () {
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
         if(e.which === 119) {//F8
            console.log('%c[%cDevMode%c] %cBreak/Resume', 'color: red;', 'color: #303030; font-weight:700;', 'color:red;', '');
            debugger; // eslint-disable-line no-debugger
         }
     });
     
	 if (!selectorMode) return;
     $(document).on("contextmenu.bdDevmode", function(e) {
         var parents = [];
         $(e.toElement).parents().addBack().not('html').each(function() {
             var entry = "";
             if (this.classList && this.classList.length) {
                 entry += "." + Array.prototype.join.call(this.classList, '.');
                 parents.push(entry);
             }
         });
         self.lastSelector = parents.join(" ").trim();

         function attach() {
            var cm = $(".context-menu");
            if(cm.length <= 0) {
                cm = $('<div class="context-menu bd-context-menu"></div>');
                cm.addClass($('.app').hasClass("theme-dark") ? "theme-dark" : "theme-light");
                cm.appendTo('.app');
                cm.css("top", e.clientY);
                cm.css("left", e.clientX);
                $(document).on('click.bdDevModeCtx', () => {
                    cm.remove();
                    $(document).off('.bdDevModeCtx');
                });
                $(document).on('contextmenu.bdDevModeCtx', () => {
                    cm.remove();
                    $(document).off('.bdDevModeCtx');
                });
                $(document).on("keyup.bdDevModeCtx", (e) => {
                    if (e.keyCode === 27) {
                        cm.remove();
                        $(document).off('.bdDevModeCtx');
                    }
                });
            }
            
            var cmo = $("<div/>", {
                class: "item-group"
            });
            var cmi = $("<div/>", {
                class: "item",
                click: function() {
                    var t = $("<textarea/>", { text: self.lastSelector }).appendTo("body");
                    t.select();
                    document.execCommand("copy");
                    t.remove();
                    //if (cm.hasClass("bd-context-menu")) cm.remove();
                    cm.hide();
                }
            }).append($("<span/>", { text: "Copy Selector" }));
            cmo.append(cmi);
            cm.append(cmo);
            cm.css("top",  "-=" + cmo.outerHeight());
         }
         
         setImmediate(attach);
         
         e.stopPropagation();
     });
 };
 
 devMode.prototype.disable = function() {
     $(window).off("keydown.bdDevmode");
     $(document).off("contextmenu.bdDevmode");
     $(document).off("contextmenu.bdDevModeCtx");
 };































































































































































/*V2 Premature*/

window.bdtemp = {
    'editorDetached': false
};

class V2 {

    constructor() {
        this.WebpackModules = (() => {
            const req = webpackJsonp([], {
                '__extra_id__': (module, exports, req) => exports.default = req
            }, ['__extra_id__']).default;
            delete req.m['__extra_id__'];
            delete req.c['__extra_id__'];
            const find = (filter, options = {}) => {
                const {cacheOnly = true} = options;
                for (let i in req.c) {
                    if (req.c.hasOwnProperty(i)) {
                        let m = req.c[i].exports;
                        if (m && m.__esModule && m.default && filter(m.default)) return m.default;
                        if (m && filter(m))	return m;
                    }
                }
                if (cacheOnly) {
                    console.warn('Cannot find loaded module in cache');
                    return null;
                }
                console.warn('Cannot find loaded module in cache. Loading all modules may have unexpected side effects');
                for (let i = 0; i < req.m.length; ++i) {
                    try {
                        let m = req(i);
                        if (m && m.__esModule && m.default && filter(m.default)) return m.default;
                        if (m && filter(m))	return m;
                    }
                    catch (e) {
                        console.error(e);
                    }
                }
                console.warn('Cannot find module');
                return null;
            };
            
            const findByUniqueProperties = (propNames, options) => find(module => propNames.every(prop => module[prop] !== undefined), options);
            const findByDisplayName = (displayName, options) => find(module => module.displayName === displayName, options);
                
            return {find, findByUniqueProperties, findByDisplayName};
        })();

        this.internal = {
            'react': this.WebpackModules.findByUniqueProperties(['Component', 'PureComponent', 'Children', 'createElement', 'cloneElement']),
            'react-dom': this.WebpackModules.findByUniqueProperties(['findDOMNode'])
        };
    }

    get reactComponent() {
        return this.internal['react'].Component;
    }

    get react() {
        return this.internal['react'];
    }

    get reactDom() {
        return this.internal['react-dom'];
    }

    parseSettings(cat) {
        return Object.keys(settings).reduce((arr, key) => { 
            let setting = settings[key];
            if(setting.cat === cat && setting.implemented && !setting.hidden) { 
                setting.text = key;
                arr.push(setting);
            } return arr; 
        }, []);
    }


}

window.BDV2 = new V2();

class V2C_SettingsPanel extends BDV2.reactComponent {

    constructor(props) {
        super(props);
    }

    render() {
        let { settings } = this.props;
        return BDV2.react.createElement(
            "div",
            { className: "content-column default" },
            BDV2.react.createElement(V2Components.SettingsTitle, { text: this.props.title }),
            settings.map(setting => {
                return BDV2.react.createElement(V2Components.Switch, { id: setting.id, key: setting.id, data: setting, checked: settingsCookie[setting.id], onChange: (id, checked) => {
                        this.props.onChange(id, checked);
                    } });
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
            'checked': this.props.checked
        };
    }

    render() {
        let { text, info } = this.props.data;
        let { checked } = this.state;
        return BDV2.react.createElement(
            "div",
            { className: "ui-flex flex-vertical flex-justify-start flex-align-stretch flex-nowrap ui-switch-item" },
            BDV2.react.createElement(
                "div",
                { className: "ui-flex flex-horizontal flex-justify-start flex-align-stretch flex-nowrap" },
                BDV2.react.createElement(
                    "h3",
                    { className: "ui-form-title h3 margin-reset margin-reset ui-flex-child" },
                    text
                ),
                BDV2.react.createElement(
                    "label",
                    { className: "ui-switch-wrapper ui-flex-child", style: { flex: '0 0 auto' } },
                    BDV2.react.createElement("input", { className: "ui-switch-checkbox", type: "checkbox", checked: checked, onChange: e => this.onChange(e) }),
                    BDV2.react.createElement("div", { className: `ui-switch ${checked ? 'checked' : ''}` })
                )
            ),
            BDV2.react.createElement(
                "div",
                { className: "ui-form-text style-description margin-top-4", style: { flex: '1 1 auto' } },
                info
            )
        );
    }

    onChange() {
        this.props.onChange(this.props.id, !this.state.checked);
        this.setState({
            'checked': !this.state.checked
        });
    }
}

class V2C_Scroller extends BDV2.reactComponent {

    constructor(props) {
        super(props);
    }

    render() {
        let wrapperClass = `scroller-wrap${this.props.fade ? ' fade' : ''} ${this.props.dark ? ' dark' : ''}`;
        let { children } = this.props;
        return BDV2.react.createElement(
            "div",
            { key: "scrollerwrap", className: wrapperClass },
            BDV2.react.createElement(
                "div",
                { key: "scroller", ref: "scroller", className: "scroller" },
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
            'selected': this.props.selected || false
        };
    }

    render() {
        return BDV2.react.createElement(
            "div",
            { className: `ui-tab-bar-item${this.props.selected ? ' selected' : ''}`, onClick: this.onClick },
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
        return BDV2.react.createElement("div", { className: "ui-tab-bar-separator margin-top-8 margin-bottom-8" });
    }
}

class V2C_TabBarHeader extends BDV2.reactComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return BDV2.react.createElement(
            "div",
            { className: "ui-tab-bar-header" },
            this.props.text
        );
    }
}

class V2C_SideBar extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        let self = this;
        const si = $("[class*=side] > [class*=selected]");
        if(si.length) {
            self.scn = si.attr("class");
        }
        const ns = $("[class*=side] > [class*=notSelected]");
        if(ns.length) {
            self.nscn = ns.attr("class");
        }
        $("[class*=side] > [class*=item]").on("click", () => {
            self.setState({
                'selected': null
            });
        });
        self.setInitialState();
        self.onClick = self.onClick.bind(self);
    }

    setInitialState() {
        let self = this;
        self.state = {
            'selected': null,
            'items': self.props.items
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
        let { headerText } = self.props;
        let { items, selected } = self.state;
        return BDV2.react.createElement(
            "div",
            null,
            BDV2.react.createElement(V2Components.TabBar.Separator, null),
            BDV2.react.createElement(V2Components.TabBar.Header, { text: headerText }),
            items.map(item => {
                let { id, text } = item;
                return BDV2.react.createElement(V2Components.TabBar.Item, { key: id, selected: selected === id, text: text, id: id, onClick: self.onClick });
            })
        );
    }

    onClick(id) {
        let self = this;
        const si = $("[class*=side] > [class*=selected]");
        if(si.length) {
            si.off("click.bdsb").on("click.bsb", e => {
                $(e.target).attr("class", self.scn);
            });
            si.attr("class", self.nscn);
        }

        self.setState({'selected': null});
        self.setState({'selected': id});

        if (self.props.onClick) self.props.onClick(id);
    }
}

class V2C_XSvg extends BDV2.reactComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return BDV2.react.createElement(
            "svg",
            { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 12 12", style: { width: "18px", height: "18px" } },
            BDV2.react.createElement(
                "g",
                { className: "background", fill: "none", "fillRule": "evenodd" },
                BDV2.react.createElement("path", { d: "M0 0h12v12H0" }),
                BDV2.react.createElement("path", { className: "fill", fill: "#dcddde", d: "M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6" })
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
        return BDV2.react.createElement(
            "div",
            { className: "tools" },
            BDV2.react.createElement(
                "div",
                { className: "btn-close", onClick: this.onClick },
                BDV2.react.createElement(V2Components.XSvg, null)
            ),
            BDV2.react.createElement(
                "div",
                { className: "esc-text" },
                "ESC"
            )
        );
    }

    onClick() {
        if (this.props.onClick) {
            this.props.onClick();
        }
        $(".btn-close").first().click();
    }
}

class V2C_SettingsTitle extends BDV2.reactComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return BDV2.react.createElement(
            "h2",
            { className: "ui-form-title h2 margin-reset margin-bottom-20" },
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
            'checked': this.props.checked || false
        };
    }

    render() {
        return BDV2.react.createElement(
            "li",
            null,
            BDV2.react.createElement(
                "div",
                { className: "checkbox", onClick: this.onClick },
                BDV2.react.createElement(
                    "div",
                    { className: "checkbox-inner" },
                    BDV2.react.createElement("input", { checked: this.state.checked, onChange: () => {}, type: "checkbox" }),
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
            'checked': !this.state.checked
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
        let self = this;
        $("#app-mount").addClass('bd-detached-editor');
        self.editor = CodeMirror.fromTextArea(self.refs.editor, self.options);
        self.editor.on("change", () => {
            if (!settingsCookie["bda-css-0"]) return;
            self.updateCss();
        });
        window.bdtemp.editorDetached = true;
    }

    componentWillUnmount() {
        $("#app-mount").removeClass('bd-detached-editor');
        window.bdtemp.editorDetached = false;
    }

    get options() {
        return {
            lineNumbers: true,
            mode: 'css',
            indentUnit: 4,
            theme: 'material',
            scrollbarStyle: 'simple'
        };
    }

    get css() {
        let _ccss = window.bdStorage.get("bdcustomcss");
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
            id: 'bd-customcss-detach-container'
        }).insertAfter($(".app"));
        return true;
    }

    render() {
        let self = this;
        return BDV2.react.createElement(
            "div",
            { className: "bd-detached-css-editor", id: "bd-customcss-detach-editor" },
            BDV2.react.createElement(
                "div",
                { id: "bd-customcss-innerpane" },
                BDV2.react.createElement("textarea", { onChange: () => {}, value: self.css, ref: "editor", id: "bd-customcss-ta" }),
                BDV2.react.createElement(
                    "div",
                    { id: "bd-customcss-attach-controls" },
                    BDV2.react.createElement(
                        "ul",
                        { className: "checkbox-group" },
                        BDV2.react.createElement(V2Components.Checkbox, { id: "live-update", text: "Live Update", onChange: self.onChange, checked: settingsCookie["bda-css-0"] })
                    ),
                    BDV2.react.createElement(
                        "div",
                        { id: "bd-customcss-detach-controls-button" },
                        BDV2.react.createElement(
                            "button",
                            { style: { borderRadius: "3px 0 0 3px", borderRight: "1px solid #3f4146" }, className: "btn btn-primary", onClick: () => {
                                    self.onClick("update");
                                } },
                            "Update"
                        ),
                        BDV2.react.createElement(
                            "button",
                            { style: { borderRadius: "0", borderLeft: "1px solid #2d2d2d", borderRight: "1px solid #2d2d2d" }, className: "btn btn-primary", onClick: () => {
                                    self.onClick("save");
                                } },
                            "Save"
                        ),
                        BDV2.react.createElement(
                            "button",
                            { style: { borderRadius: "0 3px 3px 0", borderLeft: "1px solid #3f4146" }, className: "btn btn-primary", onClick: () => {
                                    self.onClick("attach");
                                } },
                            "Attach"
                        ),
                        BDV2.react.createElement(
                            "span",
                            { style: { fontSize: "10px", marginLeft: "5px" } },
                            "Unsaved changes are lost on attach"
                        )
                    )
                )
            )
        );
    }

    onChange(id, checked) {
        switch (id) {
            case 'live-update':
                settingsCookie["bda-css-0"] = checked;
                mainCore.saveSettings();
                break;
        }
    }

    onClick(id) {
        let self = this;
        switch (id) {
            case 'attach':
                if ($("#editor-detached").length) self.props.attach();
                BDV2.reactDom.unmountComponentAtNode(self.root);
                self.root.remove();
                break;
            case 'update':
                self.updateCss();
                break;
            case 'save':
                self.saveCss();
                break;
        }
    }

    updateCss() {
        let self = this;
        if ($("#customcss").length == 0) {
            $("head").append('<style id="customcss"></style>');
        }
        $("#customcss").html(self.editor.getValue());
    }

    saveCss() {
        let self = this;
        window.bdStorage.set("bdcustomcss", btoa(self.editor.getValue()));
    }
}

class V2C_CssEditor extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        let self = this;
        self.setInitialState();
        self.attach = self.attach.bind(self);
        self.detachedEditor = BDV2.react.createElement(V2C_CssEditorDetached, { attach: self.attach });
        self.onClick = self.onClick.bind(self);
        self.updateCss = self.updateCss.bind(self);
        self.saveCss = self.saveCss.bind(self);
        self.detach = self.detach.bind(self);
        self.codeMirror = self.codeMirror.bind(self);
    }

    setInitialState() {
        this.state = {
            'detached': this.props.detached || window.bdtemp.editorDetached
        };
    }

    componentDidMount() {
        let self = this;
        self.codeMirror();
    }

    componentDidUpdate(prevProps, prevState) {
        let self = this;
        if (prevState.detached && !self.state.detached) {
            BDV2.reactDom.unmountComponentAtNode(self.detachedRoot);
            self.codeMirror();
        }
    }

    codeMirror() {
        let self = this;
        if (!self.state.detached) {
            self.editor = CodeMirror.fromTextArea(self.refs.editor, self.options);
            self.editor.on("change", () => {
                if (!settingsCookie["bda-css-0"]) return;
                self.updateCss();
            });
        }
    }

    get options() {
        return {
            lineNumbers: true,
            mode: 'css',
            indentUnit: 4,
            theme: 'material',
            scrollbarStyle: 'simple'
        };
    }

    get css() {
        let _ccss = window.bdStorage.get("bdcustomcss");
        let ccss = "";
        if (_ccss && _ccss !== "") {
            ccss = atob(_ccss);
        }
        return ccss;
    }

    render() {
        let self = this;

        let { detached } = self.state;
        return BDV2.react.createElement(
            "div",
            { className: "content-column default", style: { padding: '60px 40px 0px' } },
            detached && BDV2.react.createElement(
                "div",
                { id: "editor-detached" },
                BDV2.react.createElement(V2Components.SettingsTitle, { text: "Custom CSS Editor" }),
                BDV2.react.createElement(
                    "h3",
                    null,
                    "Editor Detached"
                ),
                BDV2.react.createElement(
                    "button",
                    { className: "btn btn-primary", onClick: () => {
                            self.attach();
                        } },
                    "Attach"
                )
            ),
            !detached && BDV2.react.createElement(
                "div",
                null,
                BDV2.react.createElement(V2Components.SettingsTitle, { text: "Custom CSS Editor" }),
                BDV2.react.createElement("textarea", { ref: "editor", value: self.css, onChange: () => {} }),
                BDV2.react.createElement(
                    "div",
                    { id: "bd-customcss-attach-controls" },
                    BDV2.react.createElement(
                        "ul",
                        { className: "checkbox-group" },
                        BDV2.react.createElement(V2Components.Checkbox, { id: "live-update", text: "Live Update", onChange: this.onChange, checked: settingsCookie["bda-css-0"] })
                    ),
                    BDV2.react.createElement(
                        "div",
                        { id: "bd-customcss-detach-controls-button" },
                        BDV2.react.createElement(
                            "button",
                            { style: { borderRadius: "3px 0 0 3px", borderRight: "1px solid #3f4146" }, className: "btn btn-primary", onClick: () => {
                                    self.onClick("update");
                                } },
                            "Update"
                        ),
                        BDV2.react.createElement(
                            "button",
                            { style: { borderRadius: "0", borderLeft: "1px solid #2d2d2d", borderRight: "1px solid #2d2d2d" }, className: "btn btn-primary", onClick: () => {
                                    self.onClick("save");
                                } },
                            "Save"
                        ),
                        BDV2.react.createElement(
                            "button",
                            { style: { borderRadius: "0 3px 3px 0", borderLeft: "1px solid #3f4146" }, className: "btn btn-primary", onClick: () => {
                                    self.onClick("detach");
                                } },
                            "Detach"
                        ),
                        BDV2.react.createElement(
                            "span",
                            { style: { fontSize: "10px", marginLeft: "5px" } },
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
            case 'update':
                self.updateCss();
                break;
            case 'save':
                self.saveCss();
                break;
            case 'detach':
                self.detach();
                break;
        }
    }

    onChange(id, checked) {
        switch (id) {
            case 'live-update':
                settingsCookie["bda-css-0"] = checked;
                mainCore.saveSettings();
                break;
        }
    }

    updateCss() {
        let self = this;
        if ($("#customcss").length == 0) {
            $("head").append('<style id="customcss"></style>');
        }
        $("#customcss").html(self.editor.getValue());
    }

    saveCss() {
        let self = this;
        window.bdStorage.set("bdcustomcss", btoa(self.editor.getValue()));
    }

    detach() {
        let self = this;
        self.setState({
            'detached': true
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
            id: 'bd-customcss-detach-container'
        }).insertAfter($(".app"));
        return true;
    }

    attach() {
        let self = this;
        self.setState({
            'detached': false
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
            { className: this.props.className },
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
            { className: "content-column default" },
            BDV2.react.createElement(
                "h2",
                { className: "ui-form-title h2 margin-reset margin-bottom-20" },
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
    }

    setInitialState() {
        this.state = {
            'checked': pluginCookie[this.props.plugin.getName()],
            'settings': false
        };
    }

    componentDidUpdate() {
        if (this.state.settings) {
            if (typeof this.settingsPanel === "object") {
                this.refs.settingspanel.appendChild(this.settingsPanel);
            }
        }
    }

    render() {
        let self = this;
        let { plugin } = this.props;
        let name = plugin.getName();
        let author = plugin.getAuthor();
        let description = plugin.getDescription();
        let version = plugin.getVersion();
        let website = bdplugins[name].website;
        let source = bdplugins[name].source;
        //let { settingsPanel } = this;

        if (this.state.settings) {
			let settingsPanel = "";
			try { settingsPanel = plugin.getSettingsPanel(); }
			catch (err) { utils.err("Unable to get settings panel for " + plugin.getName() + ".", err); }
			
            return BDV2.react.createElement("li", {className: "settings-open ui-switch-item"},
                    BDV2.react.createElement("div", {style: { float: "right", cursor: "pointer" }, onClick: () => {
                            this.refs.settingspanel.innerHTML = "";
                            self.setState({'settings': false });
                        }},
                    BDV2.react.createElement(V2Components.XSvg, null)
                ),
                typeof settingsPanel === 'object' && BDV2.react.createElement("div", { id: `plugin-settings-${name}`, className: "plugin-settings", ref: "settingspanel" }),
                typeof settingsPanel !== 'object' && BDV2.react.createElement("div", { id: `plugin-settings-${name}`, className: "plugin-settings", ref: "settingspanel", dangerouslySetInnerHTML: { __html: settingsPanel } })
            );
        }

        return BDV2.react.createElement("li", {"data-name": name, "data-version": version, className: "settings-closed ui-switch-item"},
            BDV2.react.createElement("div", {className: "bda-header"},
                    BDV2.react.createElement("span", {className: "bda-header-title" },
                        BDV2.react.createElement("span", {className: "bda-name" }, name),
                        " v",
                        BDV2.react.createElement("span", {className: "bda-version" }, version),
                        " by ",
                        BDV2.react.createElement("span", {className: "bda-author" }, author)
                    ),
                    BDV2.react.createElement("label", {className: "ui-switch-wrapper ui-flex-child", style: { flex: '0 0 auto' }},
                        BDV2.react.createElement("input", { checked: this.state.checked, onChange: this.onChange, className: "ui-switch-checkbox", type: "checkbox" }),
                        BDV2.react.createElement("div", { className: this.state.checked ? "ui-switch checked" : "ui-switch" })
                    )
            ),
            BDV2.react.createElement("div", {className: "bda-description-wrap scroller-wrap fade"},
                BDV2.react.createElement("div", {className: "bda-description scroller"}, description)
            ),
            BDV2.react.createElement("div", {className: "bda-footer"},
                BDV2.react.createElement("span", {className: "bda-links"},
                    website && BDV2.react.createElement("a", {className: "bda-link", href: website, target: "_blank"}, "Website"),
                    website && source && " | ",
                    source && BDV2.react.createElement("a", {className: "bda-link", href: source, target: "_blank"}, "Source")
                ),
                this.hasSettings && BDV2.react.createElement("button", {onClick: this.showSettings, className: "bda-settings-button", disabled: !this.state.checked}, "Settings")
            )
        );
    }

    onChange() {
        this.setState({'checked': !this.state.checked});
        pluginModule.togglePlugin(this.props.plugin.getName());
    }

    showSettings() {		
        if (!this.hasSettings) return;
        this.setState({'settings': true});
        let self = $(BDV2.reactDom.findDOMNode(this));
        let container = self.parents('.scroller');
        container.animate({
            scrollTop: self.offset().top - container.offset().top + container.scrollTop() - 30
        }, 1000);
    }
}

class V2C_ThemeCard extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        this.setInitialState();
        this.onChange = this.onChange.bind(this);
    }

    setInitialState() {
        this.state = {
            'checked': themeCookie[this.props.theme.name]
        };
    }

    render() {
        let { theme } = this.props;
        let name = theme.name;
        let description = theme.description;
        let version = theme.version;
        let author = theme.author;
        let website = bdthemes[name].website;
        let source = bdthemes[name].source;

        return BDV2.react.createElement("li", {"data-name": name, "data-version": version, className: "settings-closed ui-switch-item"},
            BDV2.react.createElement("div", {className: "bda-header"},
                    BDV2.react.createElement("span", {className: "bda-header-title" },
                        BDV2.react.createElement("span", {className: "bda-name" }, name),
                        " v",
                        BDV2.react.createElement("span", {className: "bda-version" }, version),
                        " by ",
                        BDV2.react.createElement("span", {className: "bda-author" }, author)
                    ),
                    BDV2.react.createElement("label", {className: "ui-switch-wrapper ui-flex-child", style: { flex: '0 0 auto' }},
                        BDV2.react.createElement("input", { checked: this.state.checked, onChange: this.onChange, className: "ui-switch-checkbox", type: "checkbox" }),
                        BDV2.react.createElement("div", { className: this.state.checked ? "ui-switch checked" : "ui-switch" })
                    )
            ),
            BDV2.react.createElement("div", {className: "bda-description-wrap scroller-wrap fade"},
                BDV2.react.createElement("div", {className: "bda-description scroller"}, description)
            ),
            BDV2.react.createElement("div", {className: "bda-footer"},
                BDV2.react.createElement("span", {className: "bda-links"},
                    website && BDV2.react.createElement("a", {className: "bda-link", href: website, target: "_blank"}, "Website"),
                    website && source && " | ",
                    source && BDV2.react.createElement("a", {className: "bda-link", href: source, target: "_blank"}, "Source")
                )
            )
        );
    }

    onChange() {
        this.setState({'checked': !this.state.checked});
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
    }

    componentWillUnmount() {
        $(window).off(`keyup.${this.props.id}`);
        $(`#${this.props.rootId}`).remove();
    }

    render() {
        return BDV2.react.createElement(
            "div",
            { className: "layer", id: this.props.id, ref: "root" },
            this.props.children
        );
    }
}

class V2C_SidebarView extends BDV2.reactComponent {

    constructor(props) {
        super(props);
    }

    render() {
        let { sidebar, content } = this.props.children;
        return BDV2.react.createElement(
            "div",
            { className: "ui-standard-sidebar-view" },
            BDV2.react.createElement(
                "div",
                { className: "sidebar-region" },
                BDV2.react.createElement(V2Components.Scroller, { key: "sidebarScroller", ref: "sidebarScroller", fade: sidebar.fade || true, dark: sidebar.dark || true, children: sidebar.component })
            ),
            BDV2.react.createElement(
                "div",
                { className: "content-region" },
                BDV2.react.createElement(V2Components.Scroller, { key: "contentScroller", ref: "contentScroller", fade: content.fade || true, dark: content.dark || true, children: content.component })
            )
        );
    }
}

class V2C_ServerCard extends BDV2.reactComponent {
    constructor(props) {
        super(props);
    }

    render() {
        let { server } = this.props;

        return BDV2.react.createElement(
            "div",
            { className: `ui-card ui-card-primary bd-server-card${server.pinned ? ' bd-server-card-pinned' : ''}`, style: { marginTop: "5px" } },
            BDV2.react.createElement(
                "div",
                { className: "ui-flex horizontal", style: { display: "flex", flexFlow: "row nowrap", justifyContent: "flex-start", alignItems: "stretch", flex: "1 1 auto" } },
                BDV2.react.createElement(
                    "div",
                    { className: "ui-flex-child", style: { flex: "0 1 auto", padding: "5px" } },
                    BDV2.react.createElement("div", { className: "bd-pubs-server-icon", style: { width: "100px", height: "100px", backgroundSize: "cover", backgroundImage: `url(${server.icon})` } })
                ),
                BDV2.react.createElement(
                    "div",
                    { className: "ui-flex-child", style: { flex: "1 1 auto", padding: "5px" } },
                    BDV2.react.createElement(
                        "div",
                        { className: "ui-flex horizontal" },
                        BDV2.react.createElement(
                            "div",
                            { className: "ui-form-item", style: { flex: "1 1 auto" } },
                            BDV2.react.createElement(
                                "h5",
                                { className: "ui-form-title h5 margin-reset" },
                                server.name
                            )
                        ),
                        BDV2.react.createElement(
                            "div",
                            { className: "ui-form-item" },
                            BDV2.react.createElement(
                                "h5",
                                { className: "ui-form-title h5 margin-reset" },
                                server.online,
                                "/",
                                server.members,
                                " Members"
                            )
                        )
                    ),
                    BDV2.react.createElement(
                        "div",
                        { className: "ui-flex horizontal" },
                        BDV2.react.createElement(
                            "div",
                            { className: "scroller-wrap fade dark", style: { minHeight: "60px", maxHeight: "60px", borderTop: "1px solid #3f4146", borderBottom: "1px solid #3f4146", paddingTop: "5px" } },
                            BDV2.react.createElement(
                                "div",
                                { className: "scroller" },
                                BDV2.react.createElement(
                                    "div",
                                    { style: { fontSize: "13px", color: "#b9bbbe" } },
                                    server.description
                                )
                            )
                        )
                    ),
                    BDV2.react.createElement(
                        "div",
                        { className: "ui-flex horizontal" },
                        BDV2.react.createElement(
                            "div",
                            { className: "ui-flex-child bd-server-tags", style: { flex: "1 1 auto" } },
                            server.categories.join(', ')
                        ),
                        server.joined && BDV2.react.createElement(
                            "button",
                            { type: "button", className: "ui-button filled brand small grow disabled", style: { minHeight: "12px", marginTop: "4px", backgroundColor: "#3ac15c" } },
                            BDV2.react.createElement(
                                "div",
                                { className: "ui-button-contents" },
                                "Joined"
                            )
                        ),
                        server.error && BDV2.react.createElement(
                            "button",
                            { type: "button", className: "ui-button filled brand small grow disabled", style: { minHeight: "12px", marginTop: "4px", backgroundColor: "#c13a3a" } },
                            BDV2.react.createElement(
                                "div",
                                { className: "ui-button-contents" },
                                "Error"
                            )
                        ),
                        !server.error && !server.joined && BDV2.react.createElement(
                            "button",
                            { type: "button", className: "ui-button filled brand small grow", style: { minHeight: "12px", marginTop: "4px" }, onClick: () => {
                                    this.join(server.identifier);
                                } },
                            BDV2.react.createElement(
                                "div",
                                { className: "ui-button-contents" },
                                "Join"
                            )
                        )
                    )
                )
            )
        );
    }

    join() {
        let self = this;
        self.props.join(self.props.server);
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
}

class V2_SettingsPanel_Sidebar {

    constructor(onClick) {
        this.onClick = onClick;
    }

    get items() {
        return [{ 'text': 'Core', 'id': 'core' }, { 'text': 'Emotes', 'id': 'emotes' }, { 'text': 'Custom CSS', 'id': 'customcss' }, { 'text': 'Plugins', 'id': 'plugins' }, { 'text': 'Themes', 'id': 'themes' }];
    }

    get component() {
        return BDV2.react.createElement(
            "span",
            null,
            BDV2.react.createElement(V2Components.SideBar, { onClick: this.onClick, headerText: "BetterDiscord", items: this.items }),
            BDV2.react.createElement(
                "span",
                { style: { fontSize: "12px", fontWeight: "600", color: "#72767d", padding: "6px 10px" } },
                `v${bdVersion}:${jsVersion} by `,
                BDV2.react.createElement(
                    "a",
                    { href: "https://github.com/Jiiks/", target: "_blank" },
                    "Jiiks"
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
        let changeLog = $("[class*=side] > [class*=item]:not([class*=Danger])").last();
        if (!changeLog.length) return false;
        $("<span/>", { 'id': 'bd-settings-sidebar' }).insertBefore(changeLog.prev());
        return true;
    }

    render() {
        let root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: [class*=side] > [class*=item]:not([class*=Danger])");
            return;
        }
        BDV2.reactDom.render(this.component, root);
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
        if (!$(".layer .ui-standard-sidebar-view").length) return false;
        $(".layer .ui-standard-sidebar-view").append($("<div/>", {
            class: 'content-region',
            id: 'bd-settingspane-container'
        }));
        return true;
    }

    get coreSettings() {
        return this.getSettings("core");
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
            case 'core':
                self.renderCoreSettings();
                break;
            case 'emotes':
                self.renderEmoteSettings();
                break;
            case 'customcss':
                self.renderCustomCssEditor();
                break;
            case 'plugins':
                self.renderPluginPane();
                break;
            case 'themes':
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
        } else {
            $("#twitchcord-button-container").hide();
        }

        if (_c["bda-gs-b"]) {
            $("body").addClass("bd-blue");
        } else {
            $("body").removeClass("bd-blue");
        }

        if (_c["bda-gs-2"]) {
            $("body").addClass("bd-minimal");
        } else {
            $("body").removeClass("bd-minimal");
        }

        if (_c["bda-gs-3"]) {
            $("body").addClass("bd-minimal-chan");
        } else {
            $("body").removeClass("bd-minimal-chan");
        }

        if (_c["bda-gs-1"]) {
            $("#bd-pub-li").show();
        } else {
            $("#bd-pub-li").hide();
        }

        if (_c["bda-gs-4"]) {
            voiceMode.enable();
        } else {
            voiceMode.disable();
        }

        if (_c["bda-gs-5"]) {
            $("#app-mount").addClass("bda-dark");
        } else {
            $("#app-mount").removeClass("bda-dark");
        }

        if (document.querySelector('.messages')) {
            let elem = document.querySelector('.messages');
            if (_c["bda-gs-6"]) {
                mainCore.inject24Hour(elem);
            } else {
                mainCore.remove24Hour(elem);
            }

            if (_c["bda-gs-7"] && document.querySelector('.messages')) {
                mainCore.injectColoredText(elem);
            } else {
                mainCore.removeColoredText(elem);
            }
        }

        if (_c["bda-es-6"]) {
            //Pretty emote titles
            var emoteNamePopup = $("<div class='tipsy tipsy-se' style='display: block; top: 82px; left: 1630.5px; visibility: visible; opacity: 0.8;'><div class='tipsy-inner'></div></div>");
            $(document).on("mouseover", ".emote", function () {
                var emote = $(this);
                var x = emote.offset();
                var title = emote.attr("alt");
				var modifier = emote.attr("class").replace(/emote/g, "").trim();
				if (modifier) title = title + ":" + modifier;
                emoteNamePopup.find(".tipsy-inner").text(title);
                $(".app").append($(emoteNamePopup));
                var nodecenter = x.left + (emote.outerWidth() / 2);
                emoteNamePopup.css("left", nodecenter - (emoteNamePopup.outerWidth() / 2));
                emoteNamePopup.css('top', x.top - emoteNamePopup.outerHeight());
            });
            $(document).on("mouseleave", ".emote", function () {
                $(".tipsy").remove();
            });
        } else {
            $(document).off('mouseover', '.emote');
        }

        if (_c["bda-gs-8"]) {
            dMode.enable(_c["bda-gs-11"]);
        } else {
            dMode.disable();
        }

        mainCore.saveSettings();
    }

    renderSidebar() {
        let self = this;
        $("[class*=side] > [class*=item]").off('click.v2settingspanel').on('click.v2settingspanel', () => {
            BDV2.reactDom.unmountComponentAtNode(self.root);
            $(self.root).hide();
            $(".content-region").first().show();
        });
        self.sidebar.render();
    }

    get coreComponent() {
        return BDV2.react.createElement(V2Components.Scroller, { fade: true, dark: true, children: [BDV2.react.createElement(V2Components.SettingsPanel, { key: "cspanel", title: "Core Settings", onChange: this.onChange, settings: this.coreSettings }), BDV2.react.createElement(V2Components.Tools, { key: "tools" })] });
    }

    get emoteComponent() {
        return BDV2.react.createElement(V2Components.Scroller, { fade: true, dark: true, children: [BDV2.react.createElement(V2Components.SettingsPanel, { key: "espanel", title: "Emote Settings", onChange: this.onChange, settings: this.emoteSettings }), BDV2.react.createElement(V2Components.Tools, { key: "tools" })] });
    }

    get customCssComponent() {
        return BDV2.react.createElement(V2Components.Scroller, { fade: true, dark: true, children: [BDV2.react.createElement(V2Components.CssEditor, { key: "csseditor" }), BDV2.react.createElement(V2Components.Tools, { key: "tools" })] });
    }

    get pluginsComponent() {
        let plugins = Object.keys(bdplugins).reduce((arr, key) => {
            arr.push(BDV2.react.createElement(V2Components.PluginCard, { key: key, plugin: bdplugins[key].plugin }));return arr;
        }, []);
        let list = BDV2.react.createElement(V2Components.List, { key: "plugin-list", className: "bda-slist", children: plugins });
        let pfBtn = BDV2.react.createElement("button", {key: "folder-button", className: 'bd-pfbtn', onClick: () => { betterDiscordIPC.send('asynchronous-message', { 'arg': 'opendir', 'path': 'plugindir' }); }}, "Open Plugin Folder");
        let contentColumn = BDV2.react.createElement(V2Components.ContentColumn, { key: "pcolumn", title: "Plugins", children: [pfBtn, list] });
        return BDV2.react.createElement(V2Components.Scroller, { fade: true, dark: true, children: [contentColumn, BDV2.react.createElement(V2Components.Tools, { key: "tools" })] });
    }

    get themesComponent() {
        let themes = Object.keys(bdthemes).reduce((arr, key) => {
            arr.push(BDV2.react.createElement(V2Components.ThemeCard, { key: key, theme: bdthemes[key] }));return arr;
        }, []);
        let list = BDV2.react.createElement(V2Components.List, { key: "theme-list", className: "bda-slist", children: themes });
        let tfBtn = BDV2.react.createElement("button", {key: "folder-button", className: 'bd-pfbtn', onClick: () => { betterDiscordIPC.send('asynchronous-message', { 'arg': 'opendir', 'path': 'themedir' }); }}, "Open Theme Folder");
        let contentColumn = BDV2.react.createElement(V2Components.ContentColumn, { key: "tcolumn", title: "Themes", children: [tfBtn, list] });
        return BDV2.react.createElement(V2Components.Scroller, { fade: true, dark: true, children: [contentColumn, BDV2.react.createElement(V2Components.Tools, { key: "tools" })] });
    }

    renderCoreSettings() {
        let root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layer .ui-standard-sidebar-view");
            return;
        }
        BDV2.reactDom.render(this.coreComponent, root);
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

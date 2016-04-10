/* BetterDiscordApp Core JavaScript
 * Version: 1.53
 * Author: Jiiks | http://jiiks.net
 * Date: 27/08/2015 - 16:36
 * Last Update: 02/04/2016
 * https://github.com/Jiiks/BetterDiscordApp
 */
var settingsPanel, emoteModule, utils, quickEmoteMenu, opublicServers, voiceMode, pluginModule, themeModule, customCssEditor;
var jsVersion = 1.63;
var supportedVersion = "0.2.5";

var mainObserver;

var twitchEmoteUrlStart = "https://static-cdn.jtvnw.net/emoticons/v1/";
var twitchEmoteUrlEnd = "/1.0";
var ffzEmoteUrlStart = "https://cdn.frankerfacez.com/emoticon/";
var ffzEmoteUrlEnd = "/1";
var bttvEmoteUrlStart = "https://cdn.betterttv.net/emote/";
var bttvEmoteUrlEnd = "/1x";

var mainCore;

var settings = {
    "Save logs locally":          { "id": "bda-gs-0",  "info": "Saves chat logs locally",                           "implemented": false, "hidden": false, "cat": "core"},
    "Public Servers":             { "id": "bda-gs-1",  "info": "Display public servers button",                     "implemented": true,  "hidden": false, "cat": "core"},
    "Minimal Mode":               { "id": "bda-gs-2",  "info": "Hide elements and reduce the size of elements.",    "implemented": true,  "hidden": false, "cat": "core"},
    "Voice Mode":                 { "id": "bda-gs-4",  "info": "Only show voice chat",                              "implemented": true,  "hidden": false, "cat": "core"},
    "Hide Channels":              { "id": "bda-gs-3",  "info": "Hide channels in minimal mode",                     "implemented": true,  "hidden": false, "cat": "core"},
    "Dark Mode":                  { "id": "bda-gs-5",  "info": "Make certain elements dark by default(wip)",        "implemented": true,  "hidden": false, "cat": "core"},
    "Override Default Emotes":    { "id": "bda-es-5",  "info": "Override default emotes",                           "implemented": false, "hidden": false, "cat": "core"},
    "Voice Disconnect":           { "id": "bda-dc-0",  "info": "Disconnect from voice server when closing Discord", "implemented": true,  "hidden": false, "cat": "core"},
    "Custom css live update":     { "id": "bda-css-0", "info": "",                                                  "implemented": true,  "hidden": true , "cat": "core"},
    "Custom css auto udpate":     { "id": "bda-css-1", "info": "",                                                  "implemented": true,  "hidden": true , "cat": "core"},

    "Show Emotes":                { "id": "bda-es-7",  "info": "Show any emotes",                                   "implemented": true,  "hidden": false, "cat": "emote"},
    "FrankerFaceZ Emotes":        { "id": "bda-es-1",  "info": "Show FrankerFaceZ Emotes",                          "implemented": true,  "hidden": false, "cat": "emote"},
    "BetterTTV Emotes":           { "id": "bda-es-2",  "info": "Show BetterTTV Emotes",                             "implemented": true,  "hidden": false, "cat": "emote"},
    "Emote Menu":                 { "id": "bda-es-0",  "info": "Show Twitch/Favourite emotes in emote menu",        "implemented": true,  "hidden": false, "cat": "emote"},
    "Emoji Menu":                 { "id": "bda-es-9",  "info": "Show Discord emoji menu",                           "implemented": true,  "hidden": false, "cat": "emote"},
    "Emote Autocomplete":         { "id": "bda-es-3",  "info": "Autocomplete emote commands",                       "implemented": false, "hidden": false, "cat": "emote"},
    "Emote Auto Capitalization":  { "id": "bda-es-4",  "info": "Autocapitalize emote commands",                     "implemented": true,  "hidden": false, "cat": "emote"},
    "Show Names":                 { "id": "bda-es-6",  "info": "Show emote names on hover",                         "implemented": true,  "hidden": false, "cat": "emote"},
    "Show emote modifiers":       { "id": "bda-es-8",  "info": "Enable emote mods",                                 "implemented": true,  "hidden": false, "cat": "emote"},
};

var links = {
    "Jiiks.net": { "text": "Jiiks.net", "href": "http://jiiks.net",          "target": "_blank" },
    "twitter":   { "text": "Twitter",   "href": "http://twitter.com/jiiksi", "target": "_blank" },
    "github":    { "text": "Github",    "href": "http://github.com/jiiks",   "target": "_blank" }
};

var defaultCookie = {
    "version": jsVersion,
    "bda-gs-0": false,
    "bda-gs-1": true,
    "bda-gs-2": false,
    "bda-gs-3": false,
    "bda-gs-4": false,
    "bda-gs-5": true,
    "bda-es-0": true,
    "bda-es-1": true,
    "bda-es-2": true,
    "bda-es-3": false,
    "bda-es-4": false,
    "bda-es-5": true,
    "bda-es-6": true,
    "bda-es-7": true,
    "bda-es-8": true,
    "bda-jd": true,
    "bda-es-8": true,
    "bda-dc-0": false,
    "bda-css-0": false,
    "bda-css-1": false,
    "bda-es-9": true
};

var bdchangelog = {
    "changes": {
        "darkmode": {
            "title": "v1.63 : Dark Mode",
            "text": "Dark mode makes certain elements dark by default(currently only applies to emote menu)",
            "img": ""
        },
        "emotemenu": {
            "title": "v1.62 : Brand new emote menu that fits in Discord emoji menu!",
            "text": "The emote menu has been replaced by a new one that injects itself in the Discord emoji menu!",
            "img": ""
        },
        "cccss": {
            "title": "v1.61 : New custom CSS editor",
            "text": "The custom CSS editor now has options and can be detached!",
            "img": ""
        },
        "vdc": {
            "title": "v1.61 : Voice Disconnect",
            "text": "Disconnect from voice server when closing Discord!",
            "img": ""
        },
        "pslist": {
            "title": "v1.60 : New public server list!",
            "text": 'New and shiny public server list powered by <a href="https://www.discordservers.com/" target="_blank">DiscordServers.com</a>!',
            "img": ""
        },
        "api": {
            "title": "v1.59 : New plugin api callback",
            "text": "Use the `observer(e)` callback instead of creating your own MutationObserver",
            "img": ""
        },
        "emotemods": {
            "title": "v1.59 : New emote mods!",
            "text": "The following emote mods have been added: :shake2, :shake3, :flap",
            "img": ""
        },
        "minmode": {
            "title": "v1.59: Minimal mode",
            "text": "Minimal mode embed fixed size has been removed",
            "img": ""
        }
    },
    "fixes": {
        "modal": {
            "title": "v1.62 : Fixed modals",
            "text": "Fixed broken modal introduced by 0.0.287",
            "imt": ""
        },
        "emotes": {
            "title": "v1.59 : Native sub emote mods",
            "text": "Emote mods now work with native sub emotes!",
            "img": ""
        },
        "emotes2": {
            "title": "v1.59 : Emote mods and custom emotes",
            "text": "Emote mods will no longer interfere with custom emotes using :",
            "img": ""
        }
    }
};

var settingsCookie = {};

function Core() {}

Core.prototype.init = function () {
    var self = this;

    if (version < supportedVersion) {
        this.alert("Not Supported", "BetterDiscord v" + version + "(your version)" + " is not supported by the latest js(" + jsVersion + ").<br><br> Please download the latest version from <a href='https://betterdiscord.net' target='_blank'>BetterDiscord.net</a>");
        return;
    }

    utils = new Utils();
    var sock = new BdWSocket();
    sock.start();
    utils.getHash();
    emoteModule = new EmoteModule();
    quickEmoteMenu = new QuickEmoteMenu();
    voiceMode = new VoiceMode();

    emoteModule.init();

    this.initSettings();
    this.initObserver();

    //Incase were too fast
    function gwDefer() {
        console.log(new Date().getTime() + " Defer");
        if ($(".guilds-wrapper .guilds").children().length > 0) {
            console.log(new Date().getTime() + " Defer Loaded");
            var guilds = $(".guilds>li:first-child");

            var showChannelsButton = $("<button/>", {
                class: "btn",
                id: "bd-show-channels",
                text: "R",
                css: {
                    "cursor": "pointer"
                },
                click: function () {
                    settingsCookie["bda-gs-3"] = false;
                    $("body").removeClass("bd-minimal-chan");
                    self.saveSettings();
                }
            });

            $(".guilds-wrapper").prepend(showChannelsButton);

            opublicServers = new PublicServers();
            customCssEditor = new CustomCssEditor();
            pluginModule = new PluginModule();
            pluginModule.loadPlugins();
            if (typeof (themesupport2) !== "undefined") {
                themeModule = new ThemeModule();
                themeModule.loadThemes();
            }

            settingsPanel = new SettingsPanel();
            settingsPanel.init();

            quickEmoteMenu.init(false);

            $("#tc-settings-button").on("click", function () {
                settingsPanel.show();
            });
            
            window.addEventListener("beforeunload", function(){
                if(settingsCookie["bda-dc-0"]){
                    $('.btn.btn-disconnect').click();
                }
            });
            
            opublicServers.init();

            emoteModule.autoCapitalize();

            /*Display new features in BetterDiscord*/
            if (settingsCookie["version"] < jsVersion) {
                var cl = self.constructChangelog();
                $("body").append(cl);
                settingsCookie["version"] = jsVersion;
                self.saveSettings();
            }

            $("head").append("<style>.CodeMirror{ min-width:100%; }</style>");
            $("head").append('<style id="bdemotemenustyle"></style>');

        } else {
            setTimeout(gwDefer, 100);
        }
    }


    $(document).ready(function () {
        setTimeout(gwDefer, 1000);
    });
};

Core.prototype.initSettings = function () {
    if ($.cookie("better-discord") == undefined) {
        settingsCookie = defaultCookie;
        this.saveSettings();
    } else {
        this.loadSettings();

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

var botlist = ["119598467310944259"]; //Temp
Core.prototype.initObserver = function () {
    mainObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if($(mutation.target).find(".emoji-picker").length) {
                var fc = mutation.target.firstChild;
                if(fc.classList.contains("popout")) {
                    quickEmoteMenu.obsCallback($(fc));
                }
            }
            if (typeof pluginModule !== "undefined") pluginModule.rawObserver(mutation);
            if (mutation.target.getAttribute('class') != null) {
                //console.log(mutation.target)
                if(mutation.target.classList.contains('title-wrap') || mutation.target.classList.contains('chat')){
                   // quickEmoteMenu.obsCallback();
                    voiceMode.obsCallback();
                    if (typeof pluginModule !== "undefined") pluginModule.channelSwitch();
                }
                if (mutation.target.getAttribute('class').indexOf('scroller messages') != -1) {
                    if (typeof pluginModule !== "undefined") pluginModule.newMessage();
                }
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

Core.prototype.constructChangelog = function () {
    var changeLog = '' +
        '<div id="bd-wn-modal" class="modal" style="opacity:1;">' +
        '  <div class="modal-inner">' +
        '       <div id="bdcl" class="markdown-modal change-log"> ' +
        '           <div class="markdown-modal-header">' +
        '               <strong>What\'s new in BetterDiscord JS' + jsVersion + '</strong>' +
        '               <button class="markdown-modal-close" onclick=\'$("#bd-wn-modal").remove();\'></button>' +
        '           </div><!--header-->' +
        '           <div class="scroller-wrap">' +
        '               <div class="scroller">';

    if (bdchangelog.changes != null) {
        changeLog += '' +
            '<h1 class="changelog-added">' +
            '   <span>New Stuff</span>' +
            '</h1>' +
            '<ul>';

        for (var change in bdchangelog.changes) {
            change = bdchangelog.changes[change];

            changeLog += '' +
                '<li>' +
                '   <strong>' + change.title + '</strong>' +
                '   <div>' + change.text + '</div>' +
                '</li>';
        }

        changeLog += '</ul>';
    }

    if (bdchangelog.fixes != null) {
        changeLog += '' +
            '<h1 class="changelog-fixed">' +
            '   <span>Fixed</span>' +
            '</h1>' +
            '<ul>';

        for (var fix in bdchangelog.fixes) {
            fix = bdchangelog.fixes[fix];

            changeLog += '' +
                '<li>' +
                '   <strong>' + fix.title + '</strong>' +
                '   <div>' + fix.text + '</div>' +
                '</li>';
        }

        changeLog += '</ul>';
    }

    if (bdchangelog.upcoming != null) {
        changeLog += '' +
            '<h1 class="changelog-in-progress">' +
            '   <span>Coming Soon</span>' +
            '</h1>' +
            '<ul>';

        for (var upc in bdchangelog.upcoming) {
            upc = bdchangelog.upcoming[upc];

            changeLog += '' +
                '<li>' +
                '   <strong>' + upc.title + '</strong>' +
                '   <div>' + upc.text + '</div>' +
                '</li>';
        }

        changeLog += '</ul>';
    }

    changeLog += '' +
        '               </div><!--scoller-->' +
        '           </div><!--scroller-wrap-->' +
        '           <div class="footer">' +
        '           </div><!--footer-->' +
        '       </div><!--change-log-->' +
        '   </div><!--modal-inner-->' +
        '</div><!--modal-->';

    return changeLog;
};

Core.prototype.alert = function (title, text) {
    $("body").append('' +
        '<div class="bd-alert">' +
        '   <div class="bd-alert-header">' +
        '       <span>' + title + '</span>' +
        '       <div class="bd-alert-closebtn" onclick="$(this).parent().parent().remove();">×</div>' +
        '   </div>' +
        '   <div class="bd-alert-body">' +
        '       <div class="scroller-wrap dark fade">' +
        '           <div class="scroller">' + text + '</div>' +
        '       </div>' +
        '   </div>' +
        '</div>');
};
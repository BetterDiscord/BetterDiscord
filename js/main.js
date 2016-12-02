
/* BetterDiscordApp Core JavaScript
 * Version: 1.53
 * Author: Jiiks | http://jiiks.net
 * Date: 27/08/2015 - 16:36
 * Last Update: 01/05/2016
 * https://github.com/Jiiks/BetterDiscordApp
 */
var settingsPanel, emoteModule, utils, quickEmoteMenu, opublicServers, voiceMode, pluginModule, themeModule, customCssEditor, dMode;
var jsVersion = 1.74;
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
    "Custom css live update":     { "id": "bda-css-0", "info": "",                                                  "implemented": true,  "hidden": true,  "cat": "core"},
    "Custom css auto udpate":     { "id": "bda-css-1", "info": "",                                                  "implemented": true,  "hidden": true,  "cat": "core"},
    "24 Hour Timestamps":         { "id": "bda-gs-6",  "info": "Replace 12hr timestamps with proper ones",          "implemented": true,  "hidden": false, "cat": "core"},
    "Coloured Text":              { "id": "bda-gs-7",  "info": "Make text colour the same as role colour",          "implemented": true,  "hidden": false, "cat": "core"},
    "Developer Mode":             { "id": "bda-gs-8",  "info": "Developer Mode",                                    "implemented": true,  "hidden": false, "cat": "core"},

    "Twitch Emotes":              { "id": "bda-es-7",  "info": "Show Twitch emotes",                                "implemented": true,  "hidden": false, "cat": "emote"},
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
    "Jiiks.net": { "text": "Jiiks.net", "href": "thtp://jiiks.net",          "target": "_blank" },
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
        "0a": {
            "title": "1.73 : Native sub emotes",
            "text": "Native sub emote support disabled for now due to a critical bug",
            "img": ""
        },
        "1a": {
            "title": "1.73 : Initial Developer Mode",
            "text": "Enable developer mode from settings!",
            "img": ""
        },
        "a": {
            "title": "v1.72 : Public Servers",
            "text": "Public servers now have categories, description, tags, dark mode and more!",
            "img": ""
        },
        "b": {
            "title": "v1.72 : Import/Export",
            "text": "Import/Export buttons now disappear in themes/plugins tabs to avoid confusion",
            "img": ""
        },
        "c": {
            "title": "v1.72 : Changelog",
            "text": "You can now reopen this changelog from the settings",
            "img": ""
        }
    },
    "fixes": {
        "0a": {
            "title": "v1.74 : BetterDiscord Invite",
            "text": "Fixed the BetterDiscord invite link in public servers",
            "img": ""
        },
        "0b": {
            "title": "v1.74 : Dev Mode",
            "text": "Fixed dev mode breaking",
            "img": ""
        },
        "0c": {
            "title": "v1.72 : Settings panel",
            "text": "Settings panel will now show no matter how you open it!",
            "img": ""
        },
        "0d": {
            "title": "v1.72 : Fixed emote edit bug",
            "text": "Edits now appear properly even with emotes!",
            "img": ""
        },
        "0e": {
            "title": "v1.72 : Public servers",
            "text": "Public servers button is visible again!",
            "img": ""
        },
        "0f": {
            "title": "v1.72 : Public servers",
            "text": "Updated public servers api endpoint url for fetching correct serverlist.",
            "img": ""
        }
    }
};

var settingsCookie = {};

function Core() {}

Core.prototype.init = function () {
    var self = this;

    var lVersion = (typeof(version) === "undefined") ? bdVersion : version;

    if (lVersion < supportedVersion) {
        this.alert("Not Supported", "BetterDiscord v" + lVersion + "(your version)" + " is not supported by the latest js(" + jsVersion + ").<br><br> Please download the latest version from <a href='https://betterdiscord.net' target='_blank'>BetterDiscord.net</a>");
        return;
    }

    utils = new Utils();
    var sock = new BdWSocket();
    sock.start();
    utils.getHash();
    emoteModule = new EmoteModule();
    quickEmoteMenu = new QuickEmoteMenu();
    voiceMode = new VoiceMode();
    dMode = new devMode();

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

            $(document).on("mousedown", function(e) {
                //bd modal hiders

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
            if(settingsPanel !== undefined)
                settingsPanel.inject(mutation);

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

                if(settingsCookie["bda-gs-6"]) {
                    $(".timestamp").not("[data-24]").each(function() {
                        var t = $(this);
                        t.attr("data-24", true);
                        var text = t.text();
                        var matches = /(.*)?at\s+(\d{1,2}):(\d{1,2})\s+(.*)/.exec(text);
                        if(matches == null) return true;
                        if(matches.length < 5) return true;
                        
                        var h = parseInt(matches[2]);
                        if(matches[4] == "AM") {
                            if(h == 12) h -= 12;
                        }else if(matches[4] == "PM") {
                            if(h < 12) h += 12;
                        }
                    
                        matches[2] = ('0' + h).slice(-2);
                        t.text(matches[1] + " at " + matches[2] + ":" + matches[3]);
                    });
                }
                if(settingsCookie["bda-gs-7"]) {
                    $(".user-name").not("[data-colour]").each(function() {
                        var t = $(this);
                        var color = t.css("color");
                        if(color == "rgb(255, 255, 255)") return true;
                        t.closest(".message-group").find(".markup").not("[data-colour]").each(function() {
                            $(this).attr("data-colour", true);
                            $(this).css("color", color);
                        });
                    });
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
    var id = '';
    for( var i=0; i < 5; i++ )
        id += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(Math.floor(Math.random() * "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".length)); 
    var bdAlert = '\
    <div id="bda-alert-'+id+'" class="modal bda-alert" style="opacity:1" data-bdalert="'+id+'">\
        <div class="modal-inner" style="box-shadow:0 0 8px -2px #000;">\
            <div class="markdown-modal">\
                <div class="markdown-modal-header">\
                    <strong style="float:left"><span>BetterDiscord - </span><span>'+title+'</span></strong>\
                    <span></span>\
                    <button class="markdown-modal-close" onclick=\'document.getElementById("bda-alert-'+id+'").remove(); utils.removeBackdrop("'+id+'");\'></button>\
                </div>\
                <div class="scroller-wrap fade">\
                    <div style="font-weight:700" class="scroller">'+text+'</div>\
                </div>\
                <div class="markdown-modal-footer">\
                    <span style="float:right"> for support.</span>\
                    <a style="float:right" href="https://discord.gg/0Tmfo5ZbOR9NxvDd" target="_blank">#support</a>\
                    <span style="float:right">Join </span>\
                </div>\
            </div>\
        </div>\
    </div>\
    ';
    $("body").append(bdAlert);
    utils.addBackdrop(id);
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
var emotesTwitch = {
    "emotes": {
        "emote": {
            "image_id": 0
        }
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

    //if (!settingsCookie["bda-es-7"]) return;

    /*$(".emoji").each(function() {
        var t = $(this);
        if(t.attr("src").indexOf(".png") != -1) {
            t.replaceWith(t.attr("alt"));
        }
    });*/
    
    /*$(".emoji:not(.emote)").each(function() {
        var t = $(this);
        t.addClass("emote");
        t.wrap('<span class="emotewrapper"></span>');
        t.parent().append($("<input/>", { class: "fav", title: "Favorite!", type: "button" }));
    });*/
    


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

    while (next = treeWalker.nextNode()) {
        nodes.push(next);
    }
    return nodes;
};

var bemotes = [];
var spoilered = [];


EmoteModule.prototype.injectEmote = function(node) {
    var self = this;

    if (!node.parentElement) return;
    var parent = $(node).parent();
    
    if(!parent.hasClass("markup") && !parent.hasClass("message-content")) return;


    function inject() {
        var contents = parent.contents();
        
        contents.each(function(i) {
            if(contents[i] == undefined) return;
            var nodeValue = contents[i].nodeValue;
            if(nodeValue == null) return;
            //if(nodeValue.indexOf("react-") > -1) return;

            if(contents[i].nodeType == 8) return;
            contents.splice(i, 1);

            var words = nodeValue.split(/([^\s]+)([\s]|$)/g).filter(function(e){ return e});
            
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
                var useEmoteClass = false;
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
                
                    if(typeof emotesTwitch !== 'undefind' && settingsCookie["bda-es-7"]) {
                        if(emotesTwitch.emotes.hasOwnProperty(sw) && sw.length >= 4) { 
                            if(text != null) { contents.splice(i + splice++, 0, document.createTextNode(text));  text = null;}
                            var url = twitchEmoteUrlStart + emotesTwitch.emotes[sw].image_id + twitchEmoteUrlEnd;
                            contents.splice(i + splice++, 0, self.createEmoteElement(sw, url, emoteClass));
                            doInject = true;
                            return;
                        }
                    }
                    
                    if(typeof subEmotesTwitch !== 'undefined' && settingsCookie["bda-es-7"]) {
                        if(subEmotesTwitch.hasOwnProperty(sw) && sw.length >= 4) {
                            if(text != null) { contents.splice(i + splice++, 0, document.createTextNode(text));  text = null;}
                            var url = twitchEmoteUrlStart + subEmotesTwitch[sw] + twitchEmoteUrlEnd;
                            contents.splice(i + splice++, 0, self.createEmoteElement(sw, url, emoteClass));
                            doInject = true;
                            return;
                        }
                    }
                    
                    if (typeof emotesBTTV !== 'undefined' && settingsCookie["bda-es-2"]) { 
                        if(emotesBTTV.hasOwnProperty(sw) && sw.length >= 4) {
                            if(text != null) { contents.splice(i + splice++, 0, document.createTextNode(text));  text = null;}
                            var url = emotesBTTV[sw];
                            contents.splice(i + splice++, 0, self.createEmoteElement(sw, url, emoteClass));
                            doInject = true;
                            return;
                        }
                    }
                    
                    if ((typeof emotesFfz !== 'undefined' && settingsCookie["bda-es-1"]) && (!skipffz || !emotesBTTV2.hasOwnProperty(sw))) { 
                        if(emotesFfz.hasOwnProperty(sw) && sw.length >= 4) {
                            if(text != null) { contents.splice(i + splice++, 0, document.createTextNode(text));  text = null;}
                            var url = ffzEmoteUrlStart + emotesFfz[sw] + ffzEmoteUrlEnd;
                            contents.splice(i + splice++, 0, self.createEmoteElement(sw, url, emoteClass));
                            doInject = true;
                            return;
                        }
                    }
    
                    if (typeof emotesBTTV2 !== 'undefined' && settingsCookie["bda-es-2"]) { 
                        if(emotesBTTV2.hasOwnProperty(sw) && sw.length >= 4) {
                            if(text != null) { contents.splice(i + splice++, 0, document.createTextNode(text));  text = null;}
                            var url = bttvEmoteUrlStart + emotesBTTV2[sw] + bttvEmoteUrlEnd;
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
    var html = '<span class="emotewrapper"><img draggable="false" style="max-height:32px;" class="emote '+ mod +'" alt="' + name + '" src="' + url + '"/><input onclick=\'quickEmoteMenu.favorite(\"' + name + '\", \"' + url + '\");\' class="fav" title="Favorite!" type="button"></span>';
    return $.parseHTML(html.replace(new RegExp("\uFDD9", "g"), ""))[0];
};

EmoteModule.prototype.autoCapitalize = function () {

    var self = this;

    $('body').delegate($(".channel-textarea-inner textarea:first"), 'keyup change paste', function () {
        if (!settingsCookie["bda-es-4"]) return;

        var text = $(".channel-textarea-inner textarea:first").val();
        if (text == undefined) return;

        var lastWord = text.split(" ").pop();
        if (lastWord.length > 3) {
            if (lastWord == "danSgame") return;
            var ret = self.capitalize(lastWord.toLowerCase());
            if (ret !== null && ret !== undefined) {
                $(".channel-textarea-inner textarea:first").val(text.replace(lastWord, ret));
            }
        }
    });
};

EmoteModule.prototype.capitalize = function (value) {
    var res = emotesTwitch.emotes;
    for (var p in res) {
        if (res.hasOwnProperty(p) && value == (p + '').toLowerCase()) {
            return p;
        }
    }
};
/* BetterDiscordApp PublicSevers JavaScripts
 * Version: 1.0
 * Author: Jiiks | http://jiiks.net
 * Date: 27/08/2015 - 14:16
 * https://github.com/Jiiks/BetterDiscordApp
 */

function PublicServers() {

}

PublicServers.prototype.getPanel = function () {
    return this.container;
};

PublicServers.prototype.init = function () {
    this.filtered = ["134680912691462144", "86004744966914048"];
    this.bdServer = null;
    this.loadingServers = false;
    var self = this;

    var guilds = $(".guilds>:first-child");

    guilds.after($("<div></div>", {
        class: "guild",
        id: "bd-pub-li",
        css: {
            "height": "20px",
            "display": settingsCookie["bda-gs-1"] == true ? "" : "none"
        }
    }).append($("<div/>", {
        class: "guild-inner",
        css: {
            "height": "20px",
            "border-radius": "4px"
        }
    }).append($("<a/>").append($("<div/>", {
        css: {
            "line-height": "20px",
            "font-size": "12px"
        },
        text: "public",
        id: "bd-pub-button"
    })))));

    $("#bd-pub-button").on("click", function () {
        self.show();
    });


    var panelBase = '\
        <div id="pubs-container">\
            <div id="pubs-spinner">\
                <span class="spinner" type="wandering-cubes">\
                    <span class="spinner-inner spinner-wandering-cubes">\
                        <span class="spinner-item"></span>\
                        <span class="spinner-item"></span>\
                    </span>\
                </span>\
            </div>\
            <div id="pubs-header">\
                <h2 id="pubs-header-title">Public Servers</h2>\
                <button id="pubs-searchbtn">Search</button>\
                <input id="pubs-sterm" type="text" placeholder="Search Term...">\
                <div id="pubs-select-dropdown" class="bd-dropdown">\
                    <button class="bd-dropdown-select" id="pubs-cat-select">All</button>\
                    <div class="bd-dropdown-list">\
                        <ul>\
                            <li class="pubs-cat-select-li" data-val="all">All</li>\
                            <li class="pubs-cat-select-li" data-val="1">FPS Games</li>\
                            <li class="pubs-cat-select-li" data-val="2">MMO Games</li>\
                            <li class="pubs-cat-select-li" data-val="3">MOBA Games</li>\
                            <li class="pubs-cat-select-li" data-val="4">Strategy Games</li>\
                            <li class="pubs-cat-select-li" data-val="5">Sports Games</li>\
                            <li class="pubs-cat-select-li" data-val="6">Puzzle Games</li>\
                            <li class="pubs-cat-select-li" data-val="7">Retro Games</li>\
                            <li class="pubs-cat-select-li" data-val="8">Party Games</li>\
                            <li class="pubs-cat-select-li" data-val="9">Tabletop Games</li>\
                            <li class="pubs-cat-select-li" data-val="10">Sandbox Games</li>\
                            <li class="pubs-cat-select-li" data-val="11">Community</li>\
                            <li class="pubs-cat-select-li" data-val="12">Language</li>\
                            <li class="pubs-cat-select-li" data-val="13">Programming</li>\
                            <li class="pubs-cat-select-li" data-val="14">Other</li>\
                            <li class="pubs-cat-select-li" data-val="15">Simulation Games</li>\
                        </ul>\
                    </div>\
                </div>\
            </div>\
            <div class="server-row server-pinned" style="display:none;">\
                <div class="server-icon" style="background-image:url(https://cdn.discordapp.comi/cons/86004744966914048/6e5729ed5c12d5af558d80d7a194c3f9.jpg)"></div>\
                <div class="server-info server-name"><span>BetterDiscord</span><span id="server-bd-tag">Official BetterDiscord server</span></div>\
                <div class="server-info server-members"><span></span></div>\
                <div class="server-info server-region"><span></span></div>\
                <div class="server-info">\
                    <button data-server-invite-code="0Tmfo5ZbORCRqbAd">Join</button>\
                </div>\
            </div>\
            <div class="scroller-wrap">\
                <div class="scroller" id="pubs-scroller">\
                    <div id="pubs-list" class="servers-listing">\
                    </div>\
                    <div style="background:#FFF; padding: 5px 0; display:none;" id="pubs-spinner-bottom">\
                        <div>\
                            <span class="spinner" type="wandering-cubes">\
                                <span class="spinner-inner spinner-wandering-cubes">\
                                    <span class="spinner-item"></span>\
                                    <span class="spinner-item"></span>\
                                </span>\
                            </span>\
                        </div>\
                    </div>\
                </div>\
            </div>\
            <div id="pubs-footer">\
                <span style="color:#FFF; font-size:10px; font-weight:700; margin-left:5px;">Tip: Hover over server name for description if available</span>\
                <div>Server list provided by <a href="https://discordservers.com" target="_blank">DiscordServers.com</a></div>\
            </div>\
        ';

    this.container = panelBase;

    if($("#bd-pub-li").length < 1) {
        setTimeout(function() {
            self.init();
        }, 250);
    }
};

PublicServers.prototype.getPinnedServer = function() {
    var self = this;
    var dataset = {
        "sort": [{"online": "desc"}],
        "size": 1,
        "query": {
            "query_string": {
            "default_operator": "AND",
            "query": "BetterDiscord"
            }
        }
    };
    
    $.ajax({
        type: "POST",
        dataType: "json",
        url: "https://69ccb59e91f99116aae036ddceae21b3.us-east-1.aws.found.io:9243/_search",
        crossDomain: true,
        data: JSON.stringify(dataset),
        success: function(data) {
            try {
                var s = data.hits.hits[0]._source;
                if(s.identifier == "86004744966914048") {
                    self.bdServer = s;
                    self.showPinnedServer();
                }
            }catch(err) {
                self.bdServer = null;
            }
        }
    });
};

PublicServers.prototype.hidePinnedServer = function() {
    $("#pubs-container .scroller-wrap").css({"margin-top": "0", "height": "500px"});
    $(".server-pinned").hide();
};

PublicServers.prototype.showPinnedServer = function() {
    $(".server-pinned .server-icon").css("background-image", "url("+this.bdServer.icon+")");
    $(".server-pinned .server-members span").text(this.bdServer.online + "/"+this.bdServer.members+" Members");
    $(".server-pinned .server-region span").text(this.bdServer.region);
    $(".server-pinned .server-info button").data("server-invite-code", this.bdServer.invite_code);
    $("#pubs-container .scroller-wrap").css({"margin-top": "75px", "height": "425px"});
    $(".server-pinned").show();
};

PublicServers.prototype.show = function () {
    var self = this;
    this.hidePinnedServer();
    $("#pubs-cat-select").text("All");
    this.selectedCategory = "all";
    $("#pubs-container .scroller-wrap").css({"margin-top": "0", "height": "500px"});
    $(".server-pinned").hide();
    
    $(".app").append(this.getPanel());
    
    if(this.bdServer == null) {
        this.getPinnedServer();
    } else {
        this.showPinnedServer();
    }

    self.search(0, true);

    $("#pubs-searchbtn").off("click").on("click", function() {
        self.search();
    });
    $("#pubs-sterm").off("keyup").on("keyup", function(e) {
        if (e.keyCode == 13) {
            self.search(0, true);
        }
    });
    $("#pubs-cat-select").off("click").on("click", function() {
        $("#pubs-select-dropdown").addClass("open");
    });
    $(".pubs-cat-select-li").off("click").on("click", function() {
        $("#pubs-select-dropdown").removeClass("open");
        $("#pubs-cat-select").text($(this).text());
        if(self.selectedCategory != $(this).data("val")) {
            self.selectedCategory = $(this).data("val");
            self.search(0, true);
        }
    });
    $("#pubs-container").off("mouseup").on("mouseup", function() {
        $("#pubs-select-dropdown").removeClass("open");
    });

   var self = this;
    $(document).on("mouseup.bdps",function(e) {
        if(!$("#bd-pub-button").is(e.target) && !$("#pubs-container").is(e.target) && $("#pubs-container").has(e.target).length === 0) {
            self.hide();
        }
    });

    $("#pubs-scroller").off("scroll.pubs").on("scroll.pubs", function() {
        if(self.loadingServers) return;
        var list = $("#pubs-list");
        if($(this).scrollTop() + 550 < list.height()) return;
        if(list.children().length % 20 != 0) return;

        self.loadingServers = true;
        $("#pubs-spinner-bottom").show();
        self.search(list.children().length, false);
    });

    $("button[data-server-invite-code=0Tmfo5ZbORCRqbAd]").off("click").on("click", function(){
        self.joinServer("0Tmfo5ZbORCRqbAd");
    });
};

PublicServers.prototype.hide = function() {
    $("#pubs-container").remove();
    $(document).off("mouseup.bdps");
};


PublicServers.prototype.loadServers = function(dataset, search, clear) {
    this.loadingServers = true;
    var self = this;
    $("#pubs-searchbtn").prop("disabled", true);
    $("#pubs-sterm").prop("disabled", true);
    if(clear) $("#pubs-list").empty();
    $("#pubs-spinner").show();
    $.ajax({
        type: "POST",
        dataType: "json",
        url: "https://69ccb59e91f99116aae036ddceae21b3.us-east-1.aws.found.io:9243/_search",
        crossDomain: true,
        data: JSON.stringify(dataset),
        success: function(data) {
            var hits = data.hits.hits;
            
            if(search) {
              $("#pubs-header-title").text("Public Servers - Search Results: " + hits.length);
            } else {
              $("#pubs-header-title").text("Public Servers");
            }

            hits.forEach(function(hit) {
                var source = hit._source;
                var icode = source.invite_code.replace(/ /g,'');
                icode = self.escape(icode);
                var html = '<div class="server-row">';
                html += '<div class="server-icon" style="background-image:url(' + self.escape(source.icon) + ')"></div>';
                html += '<div class="server-info server-name">';
                html += '<div class="server-information">';
                
                if(source.is_official) {
                    html += '<span class="server-official">Official!</span>';
                }

                html += '<span class="server-name-span">' + self.escape(source.name) + '</span>';
                
                var tags = [];
                source.categories.forEach(function(tag) {
                    tags.push(self.escape(tag.name));
                });

                var desc = 

                html += '<span class="server-tags">'+tags.join(", ")+'</span>';
                html += '<span class="server-description">'+(source.description == undefined ? "No Description" : self.escape(source.description)) +'</span>';
                html += '</div>';
                html += '</div>';
                html += '<div class="server-info server-members">';
                html += '<span>' + source.online + '/' + source.members + ' Members</span>';
                html += '</div>';
                html += '<div class="server-info server-region">';
                html += '<span>' + source.region + '</span>';
                html += '</div>';
                html += '<div class="server-info">';
                html += '<button data-server-invite-code='+icode+'>Join</button>';
                html += '</div>';
                html += '</div>';
                $("#pubs-list").append(html);
                $("button[data-server-invite-code="+icode+"]").on("click", function(){
                    self.joinServer(icode);
                });
            });

            if(search) {
              $("#pubs-header-title").text("Public Servers - Search Results: " + $("#pubs-list").children().length);
            }
        },
      done: function() {
        $("#pubs-spinner").hide();
        $("#pubs-spinner-bottom").hide();
        $("#pubs-searchbtn").prop("disabled", false);
        $("#pubs-sterm").prop("disabled", false);
        self.loadingServers = false;
      },
      always: function() {
        $("#pubs-spinner").hide();
        $("#pubs-spinner-bottom").hide();
        $("#pubs-searchbtn").prop("disabled", false);
        $("#pubs-sterm").prop("disabled", false);
        self.loadingServers = false;
      },
      error: function() {
        $("#pubs-spinner").hide();
        $("#pubs-spinner-bottom").hide();
        $("#pubs-searchbtn").prop("disabled", false);
        $("#pubs-sterm").prop("disabled", false);
        self.loadingServers = false;
      },
      complete: function() {
        $("#pubs-spinner").hide();
        $("#pubs-spinner-bottom").hide();
        $("#pubs-searchbtn").prop("disabled", false);
        $("#pubs-sterm").prop("disabled", false);
        self.loadingServers = false;
      }
    });
};

PublicServers.prototype.search = function(start, clear) {
    var sterm = $("#pubs-sterm").val();
    
    /*var dataset = {
        "sort": [{ "online": "desc" }],
        "from": start,
        "size": 20,
        "query": {
            "filtered": {
                "query": {
                    "query_string": {
                        "default_operator": "AND",
                        "query": sterm ? sterm : "*"
                    }
                },
                "filter": {
                    "bool": {
                        "must_not": [{
                            "terms": {
                                "identifier": this.filtered
                            }
                        }]
                    }
                }
            }
        }
    };*/

    var dataset = {
    	"sort": [{ "online": "desc" }],
    	"from": start,
    	"size": 20,
    	"query": {
    		"bool": {
    			"must": [
    				{"query_string": {
    					"default_operator": "AND",
    					"query": sterm ? sterm : "*"
    				}}
    			],
    			"must_not": [
    				{"terms": { "identifier": this.filtered }}
    			]
    		}
    	}
    };


    if(this.selectedCategory != "all") {
    	dataset.query.bool.must.push({ "match_phrase": { "categories": this.selectedCategory } });
    }
    
    this.loadServers(dataset, true, clear);
};

//Workaround for joining a server
PublicServers.prototype.joinServer = function (code) {
    $(".guilds-add").click();
    $(".action.join .btn").click();
    $(".create-guild-container input").val(code);
    $(".form.join-server .btn-primary").click();
};

PublicServers.prototype.escape = function(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
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
    var fe = localStorage["bdfavemotes"];
    if (fe != undefined) {
        this.favoriteEmotes = JSON.parse(atob(fe));
    }

    var qmeHeader="";
    qmeHeader += "<div id=\"bda-qem\">";
    qmeHeader += "    <button class=\"active\" id=\"bda-qem-twitch\" onclick='quickEmoteMenu.switchHandler(this); return false;'>Twitch<\/button>";
    qmeHeader += "    <button id=\"bda-qem-favourite\" onclick='quickEmoteMenu.switchHandler(this); return false;'>Favourite<\/button>";
    qmeHeader += "    <button id=\"bda-qem-emojis\" onclick='quickEmoteMenu.switchHandler(this); return false;'>Emojis<\/buttond>";
    qmeHeader += "<\/div>";
    this.qmeHeader = qmeHeader;

    var teContainer="";
    teContainer += "<div id=\"bda-qem-twitch-container\">";
    teContainer += "    <div class=\"scroller-wrap fade\">";
    teContainer += "        <div class=\"scroller\">";
    teContainer += "            <div class=\"emote-menu-inner\">";
    for (var emote in emotesTwitch.emotes) {
        if (emotesTwitch.emotes.hasOwnProperty(emote)) {
            var id = emotesTwitch.emotes[emote].image_id;
            teContainer += "<div class=\"emote-container\">";
            teContainer += "    <img class=\"emote-icon\" id=\""+emote+"\" alt=\"\" src=\"https://static-cdn.jtvnw.net/emoticons/v1/"+id+"/1.0\" title=\""+emote+"\">";
            teContainer += "    </img>";
            teContainer += "</div>";
        }
    }
    teContainer += "            <\/div>";
    teContainer += "        <\/div>";
    teContainer += "    <\/div>";
    teContainer += "<\/div>";
    this.teContainer = teContainer;

    var faContainer="";
    faContainer += "<div id=\"bda-qem-favourite-container\">";
    faContainer += "    <div class=\"scroller-wrap fade\">";
    faContainer += "        <div class=\"scroller\">";
    faContainer += "            <div class=\"emote-menu-inner\">";
    for (var emote in this.favoriteEmotes) {
        var url = this.favoriteEmotes[emote];
        faContainer += "<div class=\"emote-container\">";
        faContainer += "    <img class=\"emote-icon\" alt=\"\" src=\""+url+"\" title=\""+emote+"\" oncontextmenu='quickEmoteMenu.favContext(event, this);'>";
        faContainer += "    </img>";
        faContainer += "</div>";
    }
    faContainer += "            <\/div>";
    faContainer += "        <\/div>";
    faContainer += "    <\/div>";
    faContainer += "<\/div>";
    this.faContainer = faContainer;
};

QuickEmoteMenu.prototype.favContext = function(e, em) {
    e.stopPropagation();
    var menu = $('<div/>', { id: "rmenu", "data-emoteid": $(em).prop("title"), text: "Remove" });
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
        break;
    }
    this.lastTab = id;

    var emoteIcon = $(".emote-icon");
    emoteIcon.off();
    emoteIcon.on("click", function () {
        var emote = $(this).attr("title");
        var ta = $(".channel-textarea-inner textarea");
        ta.val(ta.val().slice(-1) == " " ? ta.val() + emote : ta.val() + " " + emote);
    });
};

QuickEmoteMenu.prototype.obsCallback = function (e) {

    if(!settingsCookie["bda-es-9"]) {
        e.addClass("bda-qme-hidden");
    } else {
        e.removeClass("bda-qme-hidden");
    }

    if(!settingsCookie["bda-es-0"]) return;
    var self = this;

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

    var faContainer="";
    faContainer += "<div id=\"bda-qem-favourite-container\">";
    faContainer += "    <div class=\"scroller-wrap fade\">";
    faContainer += "        <div class=\"scroller\">";
    faContainer += "            <div class=\"emote-menu-inner\">";
    for (var emote in this.favoriteEmotes) {
        var url = this.favoriteEmotes[emote];
        faContainer += "<div class=\"emote-container\">";
        faContainer += "    <img class=\"emote-icon\" alt=\"\" src=\""+url+"\" title=\""+emote+"\" oncontextmenu='quickEmoteMenu.favContext(event, this);'>";
        faContainer += "    </img>";
        faContainer += "</div>";
    }
    faContainer += "            <\/div>";
    faContainer += "        <\/div>";
    faContainer += "    <\/div>";
    faContainer += "<\/div>";
    this.faContainer = faContainer;

    $("#bda-qem-favourite-container").replaceWith(faContainer);

    window.localStorage["bdfavemotes"] = btoa(JSON.stringify(this.favoriteEmotes));
};
function CustomCssEditor() { }

CustomCssEditor.prototype.init = function() {
var self = this;
self.hideBackdrop = false;
self.editor = CodeMirror.fromTextArea(document.getElementById("bd-custom-css-ta"), {
    lineNumbers: true,
    mode: 'css',
    indentUnit: 4,
    theme: 'neat'
});

self.editor.on("change", function (cm) {
    var css = cm.getValue();
    self.applyCustomCss(css, false, false);
});

var attachEditor="";
attachEditor += "<div id=\"bd-customcss-attach-controls\">";
attachEditor += "       <ul class=\"checkbox-group\">";
attachEditor += "       <li>";
attachEditor += "           <div class=\"checkbox\" onclick=\"settingsPanel.updateSetting(this);\">";
attachEditor += "               <div class=\"checkbox-inner\"><input id=\"bda-css-0\" type=\"checkbox\" "+(settingsCookie["bda-css-0"] ? "checked" : "")+"><span><\/span><\/div>";
attachEditor += "               <span title=\"Update client css while typing\">Live Update<\/span>";
attachEditor += "           <\/div>";
attachEditor += "       <\/li>";
attachEditor += "       <li>";
attachEditor += "           <div class=\"checkbox\" onclick=\"settingsPanel.updateSetting(this);\">";
attachEditor += "               <div class=\"checkbox-inner\"><input id=\"bda-css-1\" type=\"checkbox\" "+(settingsCookie["bda-css-1"] ? "checked" : "")+"><span><\/span><\/div>";
attachEditor += "               <span title=\"Autosave css to localstorage when typing\">Autosave<\/span>";
attachEditor += "           <\/div>";
attachEditor += "       <\/li>";
attachEditor += "        <li>";
attachEditor += "           <div class=\"checkbox\" onclick=\"settingsPanel.updateSetting(this);\">";
attachEditor += "               <div class=\"checkbox-inner\"><input id=\"bda-css-2\" type=\"checkbox\" "+(customCssEditor.hideBackdrop ? "checked" : "")+"><span><\/span><\/div>";
attachEditor += "               <span title=\"Hide the callout backdrop to disable modal close events\">Hide Backdrop<\/span>";
attachEditor += "           <\/div>";
attachEditor += "       <\/li>";
attachEditor += "   <\/ul>";
attachEditor += "   <div id=\"bd-customcss-detach-controls-buttons\">";
attachEditor += "       <button class=\"btn btn-primary\" id=\"bd-customcss-detached-update\" onclick=\"return false;\">Update<\/button>";
attachEditor += "       <button class=\"btn btn-primary\" id=\"bd-customcss-detached-save\"  onclick=\"return false;\">Save<\/button>";
attachEditor += "       <button class=\"btn btn-primary\" id=\"bd-customcss-detached-detach\" onclick=\"customCssEditor.detach(); return false;\">Detach</button>";
attachEditor += "   <\/div>";
attachEditor += "<\/div>";

this.attachEditor = attachEditor;

$("#bd-customcss-innerpane").append(attachEditor);

$("#bd-customcss-detached-update").on("click", function() {
        self.applyCustomCss(self.editor.getValue(), true, false);
        return false;
});
$("#bd-customcss-detached-save").on("click", function() {
        self.applyCustomCss(self.editor.getValue(), false, true);
        return false;
});


var detachEditor="";
    detachEditor += "<div id=\"bd-customcss-detach-container\">";
    detachEditor += "   <div id=\"bd-customcss-detach-editor\">";
    detachEditor += "   <\/div>";
    detachEditor += "<\/div>";
this.detachedEditor = detachEditor;
};

CustomCssEditor.prototype.attach = function() {
    $("#editor-detached").hide();
    $("#app-mount").removeClass("bd-detached-editor");
    $("#bd-customcss-pane").append($("#bd-customcss-innerpane"));
    $("#bd-customcss-detached-detach").show();
    $("#bd-customcss-detach-container").remove();
};

CustomCssEditor.prototype.detach = function() {
    var self = this;
    this.attach();
    $("#editor-detached").show();
    $("#bd-customcss-detached-detach").hide();
    $("#app-mount").addClass("bd-detached-editor");
    $(".app").parent().append(this.detachedEditor);
    $("#bd-customcss-detach-editor").append($("#bd-customcss-innerpane"));
};

CustomCssEditor.prototype.applyCustomCss = function (css, forceupdate, forcesave) {
    if ($("#customcss").length == 0) {
        $("head").append('<style id="customcss"></style>');
    }

    if(forceupdate || settingsCookie["bda-css-0"]) {
        $("#customcss").html(css);
    }

    if(forcesave || settingsCookie["bda-css-1"]) {
        localStorage.setItem("bdcustomcss", btoa(css));
    }
};
/* BetterDiscordApp Settings Panel JavaScript
 * Version: 2.0
 * Author: Jiiks | http://jiiks.net
 * Date: 26/08/2015 - 11:54
 * Last Update: 27/11/2015 - 00:50
 * https://github.com/Jiiks/BetterDiscordApp
 */

var settingsButton = null;
var panel = null;

function SettingsPanel() {
    utils.injectJs("https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.9.0/codemirror.min.js");
    utils.injectJs("https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.9.0/mode/css/css.min.js");
    utils.injectJs("https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.4.2/Sortable.min.js");
}

SettingsPanel.prototype.init = function () {
    var self = this;
    self.construct();
    var body = $("body");

    if (settingsCookie["bda-es-0"]) {
        $("#twitchcord-button-container").show();
    } else {
        $("#twitchcord-button-container").hide();
    }

    if (settingsCookie["bda-gs-2"]) {
        body.addClass("bd-minimal");
    } else {
        body.removeClass("bd-minimal");
    }
    if (settingsCookie["bda-gs-3"]) {
        body.addClass("bd-minimal-chan");
    } else {
        body.removeClass("bd-minimal-chan");
    }

    if (settingsCookie["bda-gs-4"]) {
        voiceMode.enable();
    }

    if(settingsCookie["bda-gs-5"]) {
        $("#app-mount").addClass("bda-dark");
    }

    if (settingsCookie["bda-es-6"]) {
        //Pretty emote titles
        emoteNamePopup = $("<div class='tipsy tipsy-se' style='display: block; top: 82px; left: 1630.5px; visibility: visible; opacity: 0.8;'><div class='tipsy-inner'></div></div>");
        $(document).on("mouseover", ".emote", function () {
            var x = $(this).offset();
            var title = $(this).attr("alt");
            $(emoteNamePopup).find(".tipsy-inner").text(title);
            $(emoteNamePopup).css('left', x.left - 25);
            $(emoteNamePopup).css('top', x.top - 37);
            $(".app").append($(emoteNamePopup));
        });
        $(document).on("mouseleave", ".emote", function () {
            $(".tipsy").remove();
        });
    } else {
        $(document).off('mouseover', '.emote');
    }
    
    if(settingsCookie["bda-gs-8"]) {
        dMode.enable();
    } else {
        dMode.disable();
    }
};

var customCssInitialized = false;
var lastTab = "";

SettingsPanel.prototype.changeTab = function (tab) {

    var self = this;

    lastTab = tab;

    var controlGroups = $("#bd-control-groups");
    $(".bd-tab").removeClass("selected");
    $(".bd-pane").hide();
    $("#" + tab).addClass("selected");
    $("#" + tab.replace("tab", "pane")).show();

    switch (tab) {
    case "bd-settings-tab":
        $(".bda-slist-top").show();
        break;
    case "bd-emotes-tab":
        $(".bda-slist-top").show();
        break;
    case "bd-customcss-tab":
        $(".bda-slist-top").show();
        if (!customCssInitialized) {
            customCssEditor.init();
            customCssInitialized = true;
        }
        break;
    case "bd-themes-tab":
        $(".bda-slist-top:first").hide();
        break;
    case "bd-plugins-tab":
        $(".bda-slist-top:first").hide();
        break;
    default:
        $(".bda-slist-top").show();
        break;
    }
};

SettingsPanel.prototype.updateSetting = function (checkbox) {
    var cb = $(checkbox).children().find('input[type="checkbox"]');
    var enabled = !cb.is(":checked");
    var id = cb.attr("id");
    cb.prop("checked", enabled);

    if(id == "bda-css-2") {
        $("#app-mount").removeClass("bd-hide-bd");
        customCssEditor.hideBackdrop = enabled;
        if(enabled) {
            $("#app-mount").addClass("bd-hide-bd")
        }
    }
    if(id == "bda-gs-8" && enabled) {
        mainCore.alert("Developer Mode Enabled", "Use F8 to break/resume execution<br>More coming soon")
    }

    settingsCookie[id] = enabled;

    this.updateSettings();
};

SettingsPanel.prototype.updateSettings = function() {
    if (settingsCookie["bda-es-0"]) {
        $("#twitchcord-button-container").show();
    } else {
        $("#twitchcord-button-container").hide();
    }

    if (settingsCookie["bda-gs-2"]) {
        $("body").addClass("bd-minimal");
    } else {
        $("body").removeClass("bd-minimal");
    }
    if (settingsCookie["bda-gs-3"]) {
        $("body").addClass("bd-minimal-chan");
    } else {
        $("body").removeClass("bd-minimal-chan");
    }
    if (settingsCookie["bda-gs-1"]) {
        $("#bd-pub-li").show();
    } else {
        $("#bd-pub-li").hide();
    }
    if (settingsCookie["bda-gs-4"]) {
        voiceMode.enable();
    } else {
        voiceMode.disable();
    }
    $("#app-mount").removeClass("bda-dark");
    if(settingsCookie["bda-gs-5"]) {
        $("#app-mount").addClass("bda-dark");
    }
    if (settingsCookie["bda-es-6"]) {
        //Pretty emote titles
        emoteNamePopup = $("<div class='tipsy tipsy-se' style='display: block; top: 82px; left: 1630.5px; visibility: visible; opacity: 0.8;'><div class='tipsy-inner'></div></div>");
        $(document).on("mouseover", ".emote", function () {
            var x = $(this).offset();
            var title = $(this).attr("alt");
            $(emoteNamePopup).find(".tipsy-inner").text(title);
            $(emoteNamePopup).css('left', x.left - 25);
            $(emoteNamePopup).css('top', x.top - 32);
            $("div[data-reactid='.0.1.1']").append($(emoteNamePopup));
        });
        $(document).on("mouseleave", ".emote", function () {
            $(".tipsy").remove();
        });
    } else {
        $(document).off('mouseover', '.emote');
    } 

    if(settingsCookie["bda-gs-8"]) {
        dMode.enable();
    } else {
        dMode.disable();
    }

    mainCore.saveSettings();
};

SettingsPanel.prototype.construct = function () {
    var self = this;

    panel = $("<div/>", {
        id: "bd-pane",
        class: "settings-inner",
        css: {
            "display": "none"
        }
    });

    //Panel start and core settings

    var settingsInner = '\
        <div class="scroller-wrap">\
            <div class="scroller settings-wrapper settings-panel">\
            <div class="tab-bar TOP">\
                <div class="tab-bar-item bd-tab" id="bd-settings-tab" onclick=\'settingsPanel.changeTab("bd-settings-tab");\'>Core\
                </div>\
                <div class="tab-bar-item bd-tab" id="bd-emotes-tab" onclick=\'settingsPanel.changeTab("bd-emotes-tab");\'>Emotes\
                </div>\
                <div class="tab-bar-item bd-tab" id="bd-customcss-tab" onclick=\'settingsPanel.changeTab("bd-customcss-tab");\'>Custom CSS\
                </div>\
                <div class="tab-bar-item bd-tab" id="bd-plugins-tab" onclick=\'settingsPanel.changeTab("bd-plugins-tab");\'>Plugins\
                </div>\
                <div class="tab-bar-item bd-tab" id="bd-themes-tab" onclick=\'settingsPanel.changeTab("bd-themes-tab");\'>Themes\
                </div>\
                <div class="bda-slist-top">\
                    <button class="btn btn-primary" onclick="utils.exportSettings(); return false;">Export</button>\
                    <button class="btn btn-primary" onclick="utils.importSettings(); return false;">Import</button>\
                </div>\
            </div>\
            <div class="bd-settings">\
                <div class="bd-pane control-group" id="bd-settings-pane" style="display:none;">\
                    <ul class="checkbox-group">\
    ';

    for(var setting in settings) {
        var sett = settings[setting];
        var id = sett["id"];
        if(sett["cat"] != "core" || !sett["implemented"] || sett["hidden"]) continue;

        settingsInner += '\
            <li>\
                <div class="checkbox" onclick="settingsPanel.updateSetting(this);">\
                    <div class="checkbox-inner">\
                        <input type="checkbox" id="'+id+'" '+(settingsCookie[id] ? "checked" : "")+'>\
                        <span></span>\
                    </div>\
                    <span>\
                        '+setting+' - '+sett["info"]+'\
                    </span>\
                </div>\
            </li>\
        ';
    }

    settingsInner += '\
                    </ul>\
                </div>\
    ';
    //End core settings

    //Emote settings

    settingsInner += '\
        <div class="bd-pane control-group" id="bd-emotes-pane" style="display:none;">\
            <ul class="checkbox-group">\
    ';

    for(var setting in settings) {
        var sett = settings[setting];
        var id = sett["id"];
        if(sett["cat"] != "emote" || !sett["implemented"] || sett["hidden"]) continue;

        settingsInner += '\
            <li>\
                <div class="checkbox" onclick="settingsPanel.updateSetting(this);">\
                    <div class="checkbox-inner">\
                        <input type="checkbox" id="'+id+'" '+(settingsCookie[id] ? "checked" : "")+'>\
                        <span></span>\
                    </div>\
                    <span>\
                        '+setting+' - '+sett["info"]+'\
                    </span>\
                </div>\
            </li>\
        ';
    }

    settingsInner += '\
            </ul>\
        </div>\
    ';

    //End emote settings

    //Custom CSS Editor
    var ccss = atob(localStorage.getItem("bdcustomcss"));
    customCssEditor.applyCustomCss(ccss, true, false);

    settingsInner += '\
        <div class="bd-pane control-group" id="bd-customcss-pane" style="display:none;">\
            <div id="editor-detached" style="display:none;">\
                <h3>Editor Detached</h3>\
                <button class="btn btn-primary" onclick="customCssEditor.attach(); return false;">Attach</button>\
            </div>\
            <div id="bd-customcss-innerpane">\
                <textarea id="bd-custom-css-ta">'+ccss+'</textarea>\
            </div>\
        </div>\
    ';

    //End Custom CSS Editor

    //Plugin pane

    settingsInner += '\
        <div class="bd-pane control-group" id="bd-plugins-pane" style="display:show;">\
            <div class="bda-slist-top">\
                <button class="btn btn-primary" onclick=\'betterDiscordIPC.send("asynchronous-message", { "arg": "opendir", "path": "plugindir" }); return false;\'>Open Plugin Folder</button>\
                <button class="btn btn-primary" onclick=\'window.open("https://betterdiscord.net/plugins"); return false;\'>Get Plugins</button>\
            </div>\
            <ul class="bda-slist">\
    ';

    $.each(bdplugins, function() {
        var plugin = this["plugin"];
        var hasSettings = false;
        if(typeof(plugin.getSettingsPanel) == "function") {
            hasSettings = plugin.getSettingsPanel() != null && plugin.getSettingsPanel() != "";
        }

        settingsInner += '\
            <li>\
                <div class="bda-left">\
                    <span class="bda-name">'+plugin.getName()+' v'+plugin.getVersion()+' by '+plugin.getAuthor()+'</span>\
                    <div class="scroller-wrap fade">\
                        <div class="scroller bda-description">'+plugin.getDescription()+'</div>\
                    </div>\
                </div>\
                <div class="bda-right">\
                    <div class="checkbox" onclick="pluginModule.handlePlugin(this);">\
                        <div class="checkbox-inner">\
                            <input id="'+plugin.getName().replace(" ", "__")+'" type="checkbox" '+(pluginCookie[plugin.getName()] ? "checked" : "")+'>\
                            <span></span>\
                        </div>\
                        <span></span>\
                    </div>\
                    <button class="btn btn-primary bda-plugin-reload" onclick="return false;" disabled>Reload</button>\
                    <button class="btn btn-primary bda-plugin-settings" onclick=\'pluginModule.showSettings("'+plugin.getName()+'"); return false;\' '+(hasSettings ? "" : "disabled")+'>Settings</button>\
                </div>\
            </li>\
        ';
    });

    settingsInner += '\
            </ul>\
        </div>\
    ';

    //End plugin pane

    //Theme pane

    settingsInner += '\
        <div class="bd-pane control-group" id="bd-themes-pane" style="display:none;">\
            <div class="bda-slist-top">\
                <button class="btn btn-primary" onclick=\'betterDiscordIPC.send("asynchronous-message", { "arg": "opendir", "path": "themedir" }); return false;\'>Open Theme Folder</button>\
                <button class="btn btn-primary" onclick=\'window.open("https://betterdiscord.net/themes"); return false;\'>Get Themes</button>\
            </div>\
            <ul class="bda-slist">\
    ';

    if(typeof(themesupport2) === "undefined") {
        settingsInner += "Your version does not support themes!";
    } else {
        $.each(bdthemes, function() {
        settingsInner += '\
            <li>\
                <div class="bda-left">\
                    <span class="bda-name">'+this["name"].replace(/_/g, " ")+' v'+this["version"]+' by '+this["author"]+'</span>\
                    <div class="scroller-wrap fade">\
                        <div class="scroller bda-description">'+this["description"]+'</div>\
                    </div>\
                </div>\
                <div class="bda-right">\
                    <div class="checkbox" onclick="themeModule.handleTheme(this);">\
                        <div class="checkbox-inner">\
                            <input id="ti'+this["name"]+'" type="checkbox" '+(themeCookie[this["name"]] ? "checked" : "")+'>\
                            <span></span>\
                        </div>\
                        <span></span>\
                    </div>\
                    <button class="btn btn-primary bda-plugin-reload" onclick="return false;" disabled>Reload</button>\
                </div>\
            </li>\
        ';
        });
    }

    settingsInner += '\
            </ul>\
        </div>\
    ';

    //End theme panel

    //Footer

    settingsInner += '\
        <div style="background:#2E3136; color:#ADADAD; height:30px; position:absolute; bottom:0; left:0; right:0;">\
            <span style="line-height:30px;margin-left:10px;">BetterDiscord v' + ((typeof(version) == "undefined") ? bdVersion : version)  + '(JSv' + jsVersion + ') by Jiiks</span>\
            <span style="float:right;line-height:30px;margin-right:10px;"><a href="http://betterdiscord.net" target="_blank">BetterDiscord.net</a></span>\
            <span id="bd-changelog" onclick=\'$("body").append(mainCore.constructChangelog());\'>changelog</span>\
        </div>\
        </div></div>\
    ';


    function showSettings() {
        $(".tab-bar-item").removeClass("selected");
        settingsButton.addClass("selected");
        $(".form .settings-right .settings-inner").first().hide();
        panel.show();
        if (lastTab == "") {
            self.changeTab("bd-settings-tab");
        } else {
            self.changeTab(lastTab);
        }
    }

    settingsButton = $("<div/>", {
        class: "tab-bar-item",
        text: "BetterDiscord",
        id: "bd-settings-new",
        click: showSettings
    });

    panel.html(settingsInner);
    this.panel = panel;
};

SettingsPanel.prototype.inject = function(mutation) {
    if(mutation.type != "childList") return;
    if(mutation.addedNodes.length <= 0) return;
    if($(mutation.addedNodes[0]).find(".user-settings-modal").length <= 0) return;

    var self = this;
    this.panel.hide();
    var tabBar = $(".tab-bar.SIDE").first();

    $(".tab-bar.SIDE .tab-bar-item").click(function () {
        $(".form .settings-right .settings-inner").first().show();
        $("#bd-settings-new").removeClass("selected");
        self.panel.hide();
    });

    tabBar.append(settingsButton);
    $(".form .settings-right .settings-inner").last().after(self.panel);
    $("#bd-settings-new").removeClass("selected");
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
    return $(".channel-textarea-inner textarea");
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

Utils.prototype.log = function (message) {
    console.log('%c[%cBetterDiscord%c] %c'+message+'', 'color: red;', 'color: #303030; font-weight:700;', 'color:red;', '');
};

Utils.prototype.err = function (message) {
    console.log('%c[%cBetterDiscord%c] %c'+message+'', 'color: red;', 'color: red; font-weight:700;', 'color:red;', '');
};

Utils.prototype.importSettings = function() {
    mainCore.alert("Import Settings", '<div class="form" style="width:100%;"><div class="control-group"><textarea id="bda-import-textarea" style="min-height:150px;"></textarea></div><button id="bda-import-settings" class="btn btn-primary">Import</button></div>');
    $("#bda-import-settings").off("click").on("click", function() {
        var obj;
        try {
            obj = JSON.parse($("#bda-import-textarea").val());
        }catch(err) {
            mainCore.alert("Invalid Data", err);
            return false;
        }
        try {
            for(key in obj.settings) {
                var val = obj.settings[key];
                if(settingsCookie.hasOwnProperty(key)) {
                    settingsCookie[key] = val;
                    var cb = $("#" + key);
                    cb.prop("checked", val);
                    settingsPanel.updateSettings();
                }
            }
            localStorage["bdcustomcss"] = obj.customCss;
            var ccss = atob(localStorage.getItem("bdcustomcss"));
            if (!customCssInitialized) {
                customCssEditor.init();
                customCssInitialized = true;
            }
            customCssEditor.applyCustomCss(ccss, settingsCookie["bda-css-0"], false); 
            customCssEditor.editor.setValue(ccss);
        }catch(err) {
            mainCore.alert("Invalid Data", err);
            return false;
        }

        try {
            $.each(obj.plugins, function(plugin) {
                var enabled = obj.plugins[plugin];
                if(bdplugins.hasOwnProperty(plugin)) {
                    pluginCookie[plugin] = enabled;
                    var cb = $("#"+plugin.replace(" ", "__"));
                    if(cb.is(":checked") && !enabled) {
                        bdplugins[plugin]["plugin"].stop();
                        cb.prop("checked", false);
                    }
                    if(!cb.is(":checked") && enabled) {
                        bdplugins[plugin]["plugin"].start();
                        cb.prop("checked", true);
                    }
                }
            });
            pluginModule.savePluginData();
        }catch(err) {
            mainCore.alert("Failed to load plugin data", err);
            return false;
        }

        try {
            themeCookie = obj.themes;
            $.each(themeCookie, function(theme) {
                var enabled = themeCookie[theme];
                var id = "#ti" + theme;
                if(bdthemes.hasOwnProperty(theme)) {
                    if($(id).is(":checked") && !enabled) {
                        $(id).prop("checked", false);
                        $("#"+theme).remove();
                    }
                    if(!$(id).is(":checked") && enabled) {
                        $(id).prop("checked", true);
                        $("head").append('<style id="' + theme + '">' + unescape(bdthemes[theme]["css"]) + '</style>');
                    }
                }
            });
            themeModule.saveThemeData();
        }catch(err) {
            mainCore.alert("Failed to load theme data", err);
            return false;
        }

        return false;
    });
};

Utils.prototype.exportSettings = function() {
    var obj =  {
        settings: settingsCookie,
        customCss: localStorage["bdcustomcss"],
        plugins: pluginCookie,
        themes: themeCookie,
        favEmotes: window.localStorage["bdfavemotes"]
    };
    mainCore.alert("Export Settings", '<div class="form" style="width:100%;"><div class="control-group"><textarea style="min-height:150px;">'+JSON.stringify(obj)+'</textarea></div></div>');
};

Utils.prototype.addBackdrop = function(target) {
    var backDrop = $("<div/>", {
        class: "bda-backdrop",
        "data-bdbackdrop": target,
        mouseup: function() {
            $('[data-bdalert="'+target+'"]').remove();
            $(this).remove();
        }
    });
    $("#app-mount").append(backDrop)
};

Utils.prototype.removeBackdrop = function(target) {
    $('[data-bdbackdrop="'+target+'"]').remove();
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

    $.each(bdplugins, function () {
        var plugin = this["plugin"];
        plugin.load();

        var name = plugin.getName();
        var enabled = false;

        if (pluginCookie.hasOwnProperty(name)) {
            enabled = pluginCookie[name];
        } else {
            pluginCookie[name] = false;
        }

        if (enabled) {
            plugin.start();
        }
    });
};

PluginModule.prototype.handlePlugin = function (checkbox) {

    var cb = $(checkbox).children().find('input[type="checkbox"]');
    var enabled = !cb.is(":checked");
    var id = cb.attr("id").replace("__", " ");
    cb.prop("checked", enabled);

    if (enabled) {
        bdplugins[id]["plugin"].start();
        pluginCookie[id] = true;
    } else {
        bdplugins[id]["plugin"].stop();
        pluginCookie[id] = false;
    }

    this.savePluginData();
};

PluginModule.prototype.showSettings = function (plugin) {
    if (bdplugins[plugin] != null) {
        if (typeof bdplugins[plugin].plugin.getSettingsPanel === "function") {
            var panel = bdplugins[plugin].plugin.getSettingsPanel();

            $(".modal-inner").off("click.bdpsm").on("click.bdpsm", function (e) {
                if ($("#bd-psm-id").length) {
                    $(".bd-psm").remove();
                } else {
                    $(".bd-psm").attr("id", "bd-psm-id");
                }

            });
            $(".modal").append('<div class="bd-psm"><div class="scroller-wrap" style="height:100%"><div id="bd-psm-s" class="scroller" style="padding:10px;"></div></div></div>');
            $("#bd-psm-s").append(panel);
        }
    }
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
    $.each(bdplugins, function () {
        if (!pluginCookie[this.plugin.getName()]) return;
        if (typeof this.plugin.onMessage === "function") {
            this.plugin.onMessage();
        }
    });
};

PluginModule.prototype.channelSwitch = function () {
    $.each(bdplugins, function () {
        if (!pluginCookie[this.plugin.getName()]) return;
        if (typeof this.plugin.onSwitch === "function") {
            this.plugin.onSwitch();
        }
    });
};

PluginModule.prototype.socketEvent = function (e, data) {
    $.each(bdplugins, function () {
        if (!pluginCookie[this.plugin.getName()]) return;
        if (typeof this.plugin.socketEvent === "function") {
            this.plugin.socketEvent(data);
        }
    });
};

PluginModule.prototype.rawObserver = function(e) {
    $.each(bdplugins, function() {
        if (!pluginCookie[this.plugin.getName()]) return;
        if(typeof this.plugin.observer === "function") {
            this.plugin.observer(e);
        }
    });
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

    $.each(bdthemes, function () {
        var name = this["name"];
        var enabled = false;
        if (themeCookie.hasOwnProperty(name)) {
            if (themeCookie[name]) {
                enabled = true;
            }
        } else {
            themeCookie[name] = false;
        }

        if (enabled) {
            $("head").append('<style id="' + name + '">' + unescape(bdthemes[name]["css"]) + '</style>');
        }
    });
};

ThemeModule.prototype.handleTheme = function (checkbox) {

    var cb = $(checkbox).children().find('input[type="checkbox"]');
    var enabled = !cb.is(":checked");
    var id = cb.attr("id").substring(2);
    cb.prop("checked", enabled);

    if (enabled) {
        $("head").append('<style id="' + id + '">' + unescape(bdthemes[id]["css"]) + '</style>');
        themeCookie[id] = true;
    } else {
        $("#" + id).remove();
        themeCookie[id] = false;
    }

    this.saveThemeData();
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
/*BDSocket*/

var bdSocket;
var bdws;

function BdWSocket() {
    bdws = this;
}

BdWSocket.prototype.start = function () {
    var self = this;
   /* $.ajax({
        method: "GET",
        url: "https://discordapp.com/api/gateway",
        headers: {
            authorization: localStorage.token.match(/\"(.+)\"/)[1]
        },
        success: function (data) {
            self.open(data.url);
        }
    });*/
};

BdWSocket.prototype.open = function (host) {
    utils.log("Socket Host: " + host);
    try {
        bdSocket = new WebSocket(host);
        bdSocket.onopen = this.onOpen;
        bdSocket.onmessage = this.onMessage;
        bdSocket.onerror = this.onError;
        bdSocket.onclose = this.onClose;
    } catch (err) {
        utils.log(err);
    }
};

BdWSocket.prototype.onOpen = function () {
    utils.log("Socket Open");
    var data = {
        op: 2,
        d: {
            token: JSON.parse(localStorage.getItem('token')),
            properties: JSON.parse(localStorage.getItem('superProperties')),
            v: 3
        }
    };
    bdws.send(data);
};

BdWSocket.prototype.onMessage = function (e) {

    var packet, data, type;
    try {
        packet = JSON.parse(e.data);
        data = packet.d;
        type = packet.t;
    } catch (err) {
        utils.err(err);
        return;
    }

    switch (type) {
    case "READY":
        bdSocket.interval = setInterval(function(){bdws.send({
            op: 1,
            d: Date.now()
        });}, data.heartbeat_interval);
        utils.log("Socket Ready");
        break;
    case "PRESENCE_UPDATE":
        pluginModule.socketEvent("PRESENCE_UPDATE", data);
        break;
    case "TYPING_START":
        pluginModule.socketEvent("TYPING_START", data);
        break;
    case "MESSAGE_CREATE":
        pluginModule.socketEvent("MESSAGE_CREATE", data);
        break;
    case "MESSAGE_UPDATE":
        pluginModule.socketEvent("MESSAGE_UPDATE", data);
        break;
    default:
        break;
    }

};

BdWSocket.prototype.onError = function (e) {
    utils.log("Socket Error - " + e.message);
};

BdWSocket.prototype.onClose = function (e) {
    utils.log("Socket Closed - " + e.code + " : " + e.reason);
    clearInterval(bdSocket.interval);
    bdws.start();
};

BdWSocket.prototype.send = function (data) {
    if (bdSocket.readyState == 1) {
        bdSocket.send(JSON.stringify(data));
    }
};

BdWSocket.prototype.getSocket = function () {
    return bdSocket;
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

//Joins a server
//code = server invite code
BdApi.joinServer = function (code) {
    opublicServers.joinServer(code);
};

//Inject CSS to document head
//id = id of element
//css = custom css
BdApi.injectCSS = function (id, css) {
    $("head").append('<style id="' + id + '"></style>');
    $("#" + id).html(css);
};

//Clear css/remove any element
//id = id of element
BdApi.clearCSS = function (id) {
    $("#" + id).remove();
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

//Attempts to get user id by username
//Name = username
//Since Discord hides users if there's too many, this will often fail
BdApi.getUserIdByName = function (name) {
    var users = $(".member-username");

    for (var i = 0; i < users.length; i++) {
        var user = $(users[i]);
        if (user.text() == name) {
            var avatarUrl = user.closest(".member").find(".avatar-small").css("background-image");
            return avatarUrl.match(/\d+/);
        }
    }
    return null;
};

//Attempts to get username by id
//ID = user id
//Since Discord hides users if there's too many, this will often fail
var gg;
BdApi.getUserNameById = function (id) {
    var users = $(".avatar-small");

    for (var i = 0; i < users.length; i++) {
        var user = $(users[i]);
        var url = user.css("background-image");
        if (id == url.match(/\d+/)) {
            return user.parent().find(".member-username").text();
        }
    }
    return null;
};

//Set current game
//game = game
BdApi.setPlaying = function (game) {
    bdws.send({
        "op": 3,
        "d": {
            "idle_since": null,
            "game": {
                "name": game
            }
        }
    });
};

//Set current status
//idle_since = date
//status = status
BdApi.setStatus = function (idle_since, status) {
    bdws.send({
        "op": 3,
        "d": {
            "idle_since": idle_since,
            "game": {
                "name": status
            }
        }
    });
};
/* BetterDiscordApp DevMode JavaScript
 * Version: 1.0
 * Author: Jiiks | http://jiiks.net
 * Date: 22/05/2016
 * Last Update: 22/05/2016
 * https://github.com/Jiiks/BetterDiscordApp
 */
 
 function devMode() {}
 
 devMode.prototype.enable = function() {
     var self = this;
     $(window).on("keydown.bdDevmode", function(e) {
         if(e.which === 119) {//F8
            console.log('%c[%cDM%c] %cBreak/Resume', 'color: red;', 'color: #303030; font-weight:700;', 'color:red;', '');
            debugger;
         }
     });
     /*
     $(window).on("mousedown.bdDevmode", function(e) {
         if(e.which !== 3) return;
         var parents = [];
         $(e.toElement).parents().addBack().not('html').each(function() {
             var entry = "";
             if(this.className) {
                 entry += "." + this.className.trim().replace(/ /g, ".");
                 parents.push(entry);
             }
         });
         self.lastSelector = parents.join(" ").trim();

         function attach() {
            var cm = $(".context-menu");
            if(cm.length <= 0) {
                return;
                cm = $("body").append('<div class="context-menu"></div>');
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
                    cm.remove();
                }
            }).append($("<span/>", { text: "Copy Selector" }));
            cmo.append(cmi);
            cm.append(cmo);
            cm.css("top", (cm.css("top").replace("px", "") - 28) + "px");
         }
         
         setTimeout(attach, 100);
         
         e.stopPropagation();
     });
     */
 };
 
 devMode.prototype.disable = function() {
     $(window).off("keydown.bdDevmode");
     $(window).off("mousedown.bdDevmode")
 };
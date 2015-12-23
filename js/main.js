/* BetterDiscordApp Core JavaScript
 * Version: 1.52
 * Author: Jiiks | http://jiiks.net
 * Date: 27/08/2015 - 16:36
 * Last Update: 24/010/2015 - 17:27
 * https://github.com/Jiiks/BetterDiscordApp
 */


var settingsPanel, emoteModule, utils, quickEmoteMenu, opublicServers, voiceMode, pluginModule, themeModule;
var jsVersion = 1.56;
var supportedVersion = "0.2.3";

var mainObserver;

var twitchEmoteUrlStart = "https://static-cdn.jtvnw.net/emoticons/v1/";
var twitchEmoteUrlEnd = "/1.0";
var ffzEmoteUrlStart = "https://cdn.frankerfacez.com/emoticon/";
var ffzEmoteUrlEnd = "/1";
var bttvEmoteUrlStart = "https://cdn.betterttv.net/emote/";
var bttvEmoteUrlEnd = "/1x";

var mainCore;

var settings = {
    "Save logs locally":          { "id": "bda-gs-0", "info": "Saves chat logs locally",                        "implemented": false },
    "Public Servers":             { "id": "bda-gs-1", "info": "Display public servers button",                  "implemented": true  },
    "Minimal Mode":               { "id": "bda-gs-2", "info": "Hide elements and reduce the size of elements.", "implemented": true  },
    "Voice Mode":                 { "id": "bda-gs-4", "info": "Only show voice chat",                           "implemented": true  },
    "Hide Channels":              { "id": "bda-gs-3", "info": "Hide channels in minimal mode",                  "implemented": true  },
    "Quick Emote Menu":           { "id": "bda-es-0", "info": "Show quick emote menu for adding emotes",        "implemented": true  },
    "Show Emotes":                { "id": "bda-es-7", "info": "Show any emotes",                                "implemented": true  },
    "FrankerFaceZ Emotes":        { "id": "bda-es-1", "info": "Show FrankerFaceZ Emotes",                       "implemented": true  },
    "BetterTTV Emotes":           { "id": "bda-es-2", "info": "Show BetterTTV Emotes",                          "implemented": true  },
    "Emote Autocomplete":         { "id": "bda-es-3", "info": "Autocomplete emote commands",                    "implemented": false },
    "Emote Auto Capitalization":  { "id": "bda-es-4", "info": "Autocapitalize emote commands",                  "implemented": true  },
    "Override Default Emotes":    { "id": "bda-es-5", "info": "Override default emotes",                        "implemented": false },
    "Show Names":                 { "id": "bda-es-6", "info": "Show emote names on hover",                      "implemented": true  }
}

var links = {
    "Jiiks.net": { "text": "Jiiks.net", "href": "http://jiiks.net",          "target": "_blank" },
    "twitter":   { "text": "Twitter",   "href": "http://twitter.com/jiiksi", "target": "_blank" },
    "github":    { "text": "Github",    "href": "http://github.com/jiiks",   "target": "_blank" }
};

var defaultCookie = {
    "version":  jsVersion,
    "bda-gs-0": false,
    "bda-gs-1": true,
    "bda-gs-2": true,
    "bda-gs-3": false,
    "bda-gs-4": false,
    "bda-es-0": true,
    "bda-es-1": true,
    "bda-es-2": false,
    "bda-es-3": false,
    "bda-es-4": false,
    "bda-es-5": true,
    "bda-es-6": true,
    "bda-es-7": true,
    "bda-jd":   true
};

var bdchangelog = {
    "changes": {
        "core": {
            "title": "Core 0.2.5",
            "text": "Core v0.2.5 has been made more universal. Download the latest from <a href='https://betterdiscord.net' target='_blank'>https://betterdiscord.net</a> ).",
            "img": ""
        },
        "plugins": {
            "title": "Plugin Settings!",
            "text": "Plugins can now add their own settings panel!",
            "img": ""
        },
        "plugins2": {
            "title": "Plugins!",
            "text": "Combined with Core 0.2.3, you can now write JavaScript plugins for Discord!",
            "img": ""
        },
        "settingsmenu": {
            "title": "Settings Menu!",
            "text": "New and improved settings menu!",
            "img": ""
        },
        "qemotemenu": {
            "title": "Quick emote menu!",
            "text": "Quick emote menu now closes when you click anywhere else and you can favorite twitch global emotes!",
            "img": ""
        },
        "csseditor": {
            "title": "New CSS Editor!",
            "text": "New CSS Editor powered by <a href='http://codemirror.net' target='_blank'>CodeMirror!</a>",
            "img": ""  
        },
        "minimalmode": {
            "title": "Minimal mode makeover!", 
            "text": "New and improved minimal mode!",
            "img": ""
        }
    },
    "fixes": {
        "reload": {
            "title": "Reload Fix!",
            "text": "Fixed an issue that caused Discord to crash on reload!",
            "img": ""  
        },
		"eemotes": {
			"title": "Edit Emotes!",
			"text": "Edited messages now display emotes properly!",
			"img": ""
		},
        "femotes": {
            "title": "Favorite Emotes!",
            "text": "Favorite emotes right click now always works!",
            "img": ""
        },
        "pservers": {
            "title": "Public Servers",
            "text": "Public servers have been fixed!",
            "img": ""
        },
        "other": {
            "title": "Bugfixes!",
            "text": "Several smaller bugs fixed!",
            "img": ""
        }
	},
    "upcoming": {
        "ignore": {
            "title": "Ignore User!",
            "text": "Ignore users you don't like!",
            "img": ""
        }
    }
};

var settingsCookie = {};

function Core() {}

Core.prototype.init = function() {

    var self = this;

    if(version < supportedVersion) {
        this.alert("Not Supported",  "BetterDiscord v" + version + "(your version)" + " is not supported by the latest js("+jsVersion+").<br><br> Please download the latest version from <a href='https://betterdiscord.net' target='_blank'>BetterDiscord.net</a>");
        return;
    }

    utils = new Utils();
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
        if($(".guilds-wrapper .guilds").children().length > 0) {
            console.log(new Date().getTime() + " Defer Loaded");
            var guilds = $(".guilds li:first-child");

            guilds.after($("<li></li>", { id: "bd-pub-li", css: { "height": "20px", "display": settingsCookie["bda-gs-1"] == true ? "" : "none" } }).append($("<div/>", { class: "guild-inner", css: { "height": "20px", "border-radius": "4px" } }).append($("<a/>").append($("<div/>", { css: { "line-height": "20px", "font-size": "12px" }, text: "public", id: "bd-pub-button" })))));

            var showChannelsButton = $("<button/>", {
                class: "btn",
                id: "bd-show-channels",
                text: "R",
                css: {
                    "cursor": "pointer"
                },
                click: function() {
                    settingsCookie["bda-gs-3"] = false;
                    $("body").removeClass("bd-minimal-chan");
                    self.saveSettings();
                }
            });

            $(".guilds-wrapper").prepend(showChannelsButton);

            opublicServers = new PublicServers();

            pluginModule = new PluginModule();
            pluginModule.loadPlugins();
            if(typeof(themesupport2) !== "undefined") {
                themeModule = new ThemeModule();
                themeModule.loadThemes();
            }

            settingsPanel = new SettingsPanel();
            settingsPanel.init();

            quickEmoteMenu.init(false);

            $("#tc-settings-button").on("click", function() { settingsPanel.show(); });
            $("#bd-pub-button").on("click", function() { opublicServers.show(); });

            opublicServers.init();

            emoteModule.autoCapitalize();




            /*Display new features in BetterDiscord*/
            if(settingsCookie["version"] < jsVersion) {
                var cl = self.constructChangelog();
                $("body").append(cl);
                settingsCookie["version"] = jsVersion;
                self.saveSettings();
            }
			$("head").append('<script>Date.now||(Date.now=function(){return(new Date).getTime()}),function(){"use strict";for(var t=["webkit","moz"],e=0;e<t.length&&!window.requestAnimationFrame;++e){var i=t[e];window.requestAnimationFrame=window[i+"RequestAnimationFrame"],window.cancelAnimationFrame=window[i+"CancelAnimationFrame"]||window[i+"CancelRequestAnimationFrame"]}if(/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent)||!window.requestAnimationFrame||!window.cancelAnimationFrame){var s=0;window.requestAnimationFrame=function(t){var e=Date.now(),i=Math.max(s+16,e);return setTimeout(function(){t(s=i)},i-e)},window.cancelAnimationFrame=clearTimeout}}(),function(t){t.snowfall=function(e,i){function s(s,n,a,o){this.x=s,this.y=n,this.size=a,this.speed=o,this.step=0,this.stepSize=h(1,10)/100,i.collection&&(this.target=m[h(0,m.length-1)]);var r=null;i.image?(r=document.createElement("img"),r.src=i.image):(r=document.createElement("div"),t(r).css({background:i.flakeColor})),t(r).attr({"class":"snowfall-flakes"}).css({width:this.size,height:this.size,position:i.flakePosition,top:this.y,left:this.x,fontSize:0,zIndex:i.flakeIndex}),t(e).get(0).tagName===t(document).get(0).tagName?(t("body").append(t(r)),e=t("body")):t(e).append(t(r)),this.element=r,this.update=function(){if(this.y+=this.speed,this.y>l-(this.size+6)&&this.reset(),this.element.style.top=this.y+"px",this.element.style.left=this.x+"px",this.step+=this.stepSize,this.x+=y===!1?Math.cos(this.step):y+Math.cos(this.step),i.collection&&this.x>this.target.x&&this.x<this.target.width+this.target.x&&this.y>this.target.y&&this.y<this.target.height+this.target.y){var t=this.target.element.getContext("2d"),e=this.x-this.target.x,s=this.y-this.target.y,n=this.target.colData;if(void 0!==n[parseInt(e)][parseInt(s+this.speed+this.size)]||s+this.speed+this.size>this.target.height)if(s+this.speed+this.size>this.target.height){for(;s+this.speed+this.size>this.target.height&&this.speed>0;)this.speed*=.5;t.fillStyle="#fff",void 0==n[parseInt(e)][parseInt(s+this.speed+this.size)]?(n[parseInt(e)][parseInt(s+this.speed+this.size)]=1,t.fillRect(e,s+this.speed+this.size,this.size,this.size)):(n[parseInt(e)][parseInt(s+this.speed)]=1,t.fillRect(e,s+this.speed,this.size,this.size)),this.reset()}else this.speed=1,this.stepSize=0,parseInt(e)+1<this.target.width&&void 0==n[parseInt(e)+1][parseInt(s)+1]?this.x++:parseInt(e)-1>0&&void 0==n[parseInt(e)-1][parseInt(s)+1]?this.x--:(t.fillStyle="#fff",t.fillRect(e,s,this.size,this.size),n[parseInt(e)][parseInt(s)]=1,this.reset())}(this.x+this.size>d-c||this.x<c)&&this.reset()},this.reset=function(){this.y=0,this.x=h(c,d-c),this.stepSize=h(1,10)/100,this.size=h(100*i.minSize,100*i.maxSize)/100,this.element.style.width=this.size+"px",this.element.style.height=this.size+"px",this.speed=h(i.minSpeed,i.maxSpeed)}}function n(){for(r=0;r<a.length;r+=1)a[r].update();f=requestAnimationFrame(function(){n()})}var a=[],o={flakeCount:35,flakeColor:"#ffffff",flakePosition:"absolute",flakeIndex:999999,minSize:1,maxSize:2,minSpeed:1,maxSpeed:5,round:!1,shadow:!1,collection:!1,collectionHeight:40,deviceorientation:!1},i=t.extend(o,i),h=function(t,e){return Math.round(t+Math.random()*(e-t))};t(e).data("snowfall",this);var r=0,l=t(e).height(),d=t(e).width(),c=0,f=0;if(i.collection!==!1){var p=document.createElement("canvas");if(p.getContext&&p.getContext("2d"))for(var m=[],w=t(i.collection),g=i.collectionHeight,r=0;r<w.length;r++){var u=w[r].getBoundingClientRect(),x=t("<canvas/>",{"class":"snowfall-canvas"}),z=[];if(u.top-g>0){t("body").append(x),x.css({position:i.flakePosition,left:u.left+"px",top:u.top-g+"px"}).prop({width:u.width,height:g});for(var v=0;v<u.width;v++)z[v]=[];m.push({element:x.get(0),x:u.left,y:u.top-g,width:u.width,height:g,colData:z})}}else i.collection=!1}for(t(e).get(0).tagName===t(document).get(0).tagName&&(c=25),t(window).bind("resize",function(){l=t(e)[0].clientHeight,d=t(e)[0].offsetWidth}),r=0;r<i.flakeCount;r+=1)a.push(new s(h(c,d-c),h(0,l),h(100*i.minSize,100*i.maxSize)/100,h(i.minSpeed,i.maxSpeed)));i.round&&t(".snowfall-flakes").css({"-moz-border-radius":i.maxSize,"-webkit-border-radius":i.maxSize,"border-radius":i.maxSize}),i.shadow&&t(".snowfall-flakes").css({"-moz-box-shadow":"1px 1px 1px #555","-webkit-box-shadow":"1px 1px 1px #555","box-shadow":"1px 1px 1px #555"});var y=!1;i.deviceorientation&&t(window).bind("deviceorientation",function(t){y=.1*t.originalEvent.gamma}),n(),this.clear=function(){t(".snowfall-canvas").remove(),t(e).children(".snowfall-flakes").remove(),cancelAnimationFrame(f)}},t.fn.snowfall=function(e){return"object"==typeof e||void 0==e?this.each(function(){new t.snowfall(this,e)}):"string"==typeof e?this.each(function(){var e=t(this).data("snowfall");e&&e.clear()}):void 0}}(jQuery);</script>');
			//By http://www.somethinghitme.com
   
   
            $("head").append("<style>.CodeMirror{ min-width:100%; }</style>");
   
            
        } else {
            setTimeout(gwDefer, 100);
        }
    }


    $(document).ready(function() {
        setTimeout(gwDefer, 1000);
    });
};

Core.prototype.initSettings = function() {
    if($.cookie("better-discord") == undefined) {
        settingsCookie = defaultCookie;
        this.saveSettings();
    } else {
        this.loadSettings();

        for(var setting in defaultCookie) {
            if(settingsCookie[setting] == undefined) {
                settingsCookie[setting] = defaultCookie[setting];
                this.saveSettings();
            }
        }
    }
};

Core.prototype.saveSettings = function() {
    $.cookie("better-discord", JSON.stringify(settingsCookie), { expires: 365, path: '/' });
};

Core.prototype.loadSettings = function() {
    settingsCookie = JSON.parse($.cookie("better-discord"));
};

Core.prototype.initObserver = function() {

    mainObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if(mutation.target.getAttribute('class') != null) {
                if(mutation.target.getAttribute('class').indexOf("titlebar") != -1) {
                    quickEmoteMenu.obsCallback();
                    voiceMode.obsCallback();
                }
            }
            emoteModule.obsCallback(mutation);

        });
    });

    //noinspection JSCheckFunctionSignatures
    mainObserver.observe(document, { childList: true, subtree: true });
};

Core.prototype.constructChangelog = function() {
    var changeLog = '' +
        '<div id="bd-wn-modal" class="modal" style="opacity:1;">' +
        '  <div class="modal-inner">' +
        '       <div id="bdcl" class="change-log"> ' +
        '           <div class="header">' +
        '               <strong>What\'s new in BetterDiscord JS v1.53&' + jsVersion + '</strong>' +
        '               <button class="close" onclick=\'$("#bd-wn-modal").remove();\'></button>' +
        '           </div><!--header-->' +
        '           <div class="scroller-wrap">' +
        '               <div class="scroller">';

    if(bdchangelog.changes != null) {
        changeLog += '' +
            '<h1 class="changelog-added">' +
            '   <span>New Stuff</span>' +
            '</h1>' +
            '<ul>';

        for(var change in bdchangelog.changes) {
            change = bdchangelog.changes[change];

            changeLog += '' +
                '<li>' +
                '   <strong>'+change.title+'</strong>' +
                '   <div>'+change.text+'</div>' +
                '</li>';
        }

        changeLog += '</ul>';
    }

    if(bdchangelog.fixes != null) {
        changeLog += '' +
            '<h1 class="changelog-fixed">' +
            '   <span>Fixed</span>' +
            '</h1>' +
            '<ul>';

        for(var fix in bdchangelog.fixes) {
            fix = bdchangelog.fixes[fix];

            changeLog += '' +
                '<li>' +
                '   <strong>'+fix.title+'</strong>' +
                '   <div>'+fix.text+'</div>' +
                '</li>';
        }

        changeLog += '</ul>';
    }

    if(bdchangelog.upcoming != null) {
        changeLog += '' +
            '<h1 class="changelog-in-progress">' +
            '   <span>Coming Soon</span>' +
            '</h1>' +
            '<ul>';

        for(var upc in bdchangelog.upcoming) {
            upc = bdchangelog.upcoming[upc];

            changeLog += '' +
                '<li>' +
                '   <strong>'+upc.title+'</strong>' +
                '   <div>'+upc.text+'</div>' +
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

Core.prototype.alert = function(title, text) {
    $("body").append('' +
                    '<div class="bd-alert">' +
                    '   <div class="bd-alert-header">' +
                    '       <span>'+title+'</span>' +
                    '       <div class="bd-alert-closebtn" onclick="$(this).parent().parent().remove();">×</div>' +
                    '   </div>' + 
                    '   <div class="bd-alert-body">' +
                    '       <div class="scroller-wrap dark fade">' + 
                    '           <div class="scroller">'+text+'</div>' +
                    '       </div>' +
                    '   </div>' +
                    '</div>');  
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
var emotesTwitch = { "emotes": { "emote": { "image_id": 0 } } }; //for ide
var subEmotesTwitch = {};

function EmoteModule() {
}

EmoteModule.prototype.init = function() {
};

EmoteModule.prototype.getBlacklist = function() {
    $.getJSON("https://cdn.rawgit.com/Jiiks/betterDiscordApp/"+_hash+"/emotefilter.json", function(data) { bemotes = data.blacklist; });
};

EmoteModule.prototype.obsCallback = function(mutation) {
    var self = this;

    if(!settingsCookie["bda-es-7"]) return;

    for(var i = 0 ; i < mutation.addedNodes.length ; ++i) {
        var next = mutation.addedNodes.item(i);
        if(next) {
            var nodes = self.getNodes(next);
            for(var node in nodes) {
                if(nodes.hasOwnProperty(node)) {
                    self.injectEmote(nodes[node]);
                }
            }
        }
    }
};

EmoteModule.prototype.getNodes = function(node) {
    var next;
    var nodes = [];

    var treeWalker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);

    while(next = treeWalker.nextNode()) {
        nodes.push(next);
    }


    return nodes;
};

var bemotes = [];
var spoilered = [];

EmoteModule.prototype.injectEmote = function(node) {

    if(typeof emotesTwitch === 'undefined') return;

    if(!node.parentElement) return;

    var parent = node.parentElement;

    if(parent.tagName != "SPAN") return;
  
    var edited = false;
    
    if($(parent.parentElement).hasClass("edited")) {
        parent = parent.parentElement.parentElement.firstChild; //:D
        edited = true;
    }
    
    //if(!$(parent.parentElement).hasClass("markup") && !$(parent.parentElement).hasClass("message-content")) return;

    function inject() {
        if(!$(parent.parentElement).hasClass("markup") && !$(parent.parentElement).hasClass("message-content")) { return; }

        var parentInnerHTML = parent.innerHTML;
        var words = parentInnerHTML.split(/\s+/g);

        if(!words) return;

        words.some(function(word) {

            if(word.slice(0, 4) == "[!s]" ) {

                parentInnerHTML = parentInnerHTML.replace("[!s]", "");
                var markup = $(parent).parent();
                var reactId = markup.attr("data-reactid");
                
                if(spoilered.indexOf(reactId) > -1) {
                    return;
                }

                markup.addClass("spoiler");
                markup.on("click", function() {
                    $(this).removeClass("spoiler");
                    spoilered.push($(this).attr("data-reactid"));
                });

                return;
            }
        
            if(word.length < 4) {
                return;
            }

            if($.inArray(word, bemotes) != -1) return;

            if (emotesTwitch.emotes.hasOwnProperty(word)) {
                var len = Math.round(word.length / 4);
                var name =  word.substr(0, len) + "\uFDD9" + word.substr(len, len) + "\uFDD9" + word.substr(len * 2, len) + "\uFDD9" + word.substr(len * 3);
                var url = twitchEmoteUrlStart + emotesTwitch.emotes[word].image_id + twitchEmoteUrlEnd;
                parentInnerHTML = parentInnerHTML.replace(word, '<div class="emotewrapper"><img class="emote" alt="' + name + '" src="' + url + '" /><input onclick=\'quickEmoteMenu.favorite(\"'+name+'\", \"'+url+'\");\' class="fav" title="Favorite!" type="button"></div>');
                return;
            }

            if (typeof emotesFfz !== 'undefined' && settingsCookie["bda-es-1"]) {
                if (emotesFfz.hasOwnProperty(word)) {
                    var len = Math.round(word.length / 4);
                    var name = word.substr(0, len) + "\uFDD9" + word.substr(len, len) + "\uFDD9" + word.substr(len * 2, len) + "\uFDD9" + word.substr(len * 3);
                    var url = ffzEmoteUrlStart + emotesFfz[word] + ffzEmoteUrlEnd;
                    
                    parentInnerHTML = parentInnerHTML.replace(word, '<div class="emotewrapper"><img class="emote" alt="' + name + '" src="' + url + '" /><input onclick=\'quickEmoteMenu.favorite(\"'+name+'\", \"'+url+'\");\' class="fav" title="Favorite!" type="button"></div>');
                    return;
                }
            }

            if (typeof emotesBTTV !== 'undefined' && settingsCookie["bda-es-2"]) {
                if (emotesBTTV.hasOwnProperty(word)) {
                    var len = Math.round(word.length / 4);
                    var name = word.substr(0, len) + "\uFDD9" + word.substr(len, len) + "\uFDD9" + word.substr(len * 2, len) + "\uFDD9" + word.substr(len * 3);
                    var url = emotesBTTV[word];
                    parentInnerHTML = parentInnerHTML.replace(word, '<div class="emotewrapper"><img class="emote" alt="' + name + '" src="' + url + '" /><input onclick=\'quickEmoteMenu.favorite(\"'+name+'\", \"'+url+'\");\' class="fav" title="Favorite!" type="button"></div>');
                    return;
                }
            }
              
            if(typeof emotesBTTV2 !== 'undefined' && settingsCookie["bda-es-2"]) {
                if(emotesBTTV2.hasOwnProperty(word)) {
                    var len = Math.round(word.length / 4);
                    var name = word.substr(0, len) + "\uFDD9" + word.substr(len, len) + "\uFDD9" + word.substr(len * 2, len) + "\uFDD9" + word.substr(len * 3);
                    var url = bttvEmoteUrlStart + emotesBTTV2[word]  + bttvEmoteUrlEnd;
                    parentInnerHTML = parentInnerHTML.replace(word, '<div class="emotewrapper"><img class="emote" alt="' + name + '" src="' + url + '" /><input onclick=\'quickEmoteMenu.favorite(\"'+name+'\", \"'+url+'\");\' class="fav" title="Favorite!" type="button"></div>');
                    return;
                }
            }

            if (subEmotesTwitch.hasOwnProperty(word)) {
                var len = Math.round(word.length / 4);
                var name = word.substr(0, len) + "\uFDD9" + word.substr(len, len) + "\uFDD9" + word.substr(len * 2, len) + "\uFDD9" + word.substr(len * 3);
                var url = twitchEmoteUrlStart + subEmotesTwitch[word] + twitchEmoteUrlEnd;
                parentInnerHTML = parentInnerHTML.replace(word, '<div class="emotewrapper"><img class="emote" alt="' + name + '" src="' + url + '" /><input onclick=\'quickEmoteMenu.favorite(\"'+name+'\", \"'+url+'\");\' class="fav" title="Favorite!" type="button"></div>');
                return;
            }
        });

        if(parent.parentElement == null) return;

        var oldHeight = parent.parentElement.offsetHeight;
        parent.innerHTML = parentInnerHTML.replace(new RegExp("\uFDD9", "g"), "");
        var newHeight = parent.parentElement.offsetHeight;

        //Scrollfix
        var scrollPane = $(".scroller.messages").first();
        scrollPane.scrollTop(scrollPane.scrollTop() + (newHeight - oldHeight));
   } 
   
   if(edited) {
       setTimeout(inject, 250);
   } else {
       inject();
   }
   
};

EmoteModule.prototype.autoCapitalize = function() {

    var self = this;

    $('body').delegate($(".channel-textarea-inner textarea"), 'keyup change paste', function() {
        if(!settingsCookie["bda-es-4"]) return;

        var text = $(".channel-textarea-inner textarea").val();

        if(text == undefined) return;

        var lastWord = text.split(" ").pop();
        if(lastWord.length > 3) {
            var ret = self.capitalize(lastWord.toLowerCase());
            if(ret !== null && ret !== undefined) {
                $(".channel-textarea-inner textarea").val(text.replace(lastWord, ret));
            }
        }
    });
};

EmoteModule.prototype.capitalize = function(value) {
    var res = emotesTwitch.emotes;
    for(var p in res){
        if(res.hasOwnProperty(p) && value == (p+ '').toLowerCase()){
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

var publicServers = { "servers": { "server": { "code": 0, "icon": null, "title": "title", "language": "EN", "description": "description" } } }; //for ide

function PublicServers() {

}

PublicServers.prototype.getPanel = function() {
    return this.container;
};

PublicServers.prototype.init = function() {

    var self = this;

    this.container = $("<div/>", {
        id: "bd-ps-container",
        style: "display:none"
    });

    var header = $("<div/>", {
        id: "bd-ps-header"
    });

    $("<h2/>", {
        text: "Public Servers"
    }).appendTo(header);

    $("<span/>", {
        id: "bd-ps-close",
        style:"cursor:pointer;",
        text: "X"
    }).appendTo(header);

    header.appendTo(this.getPanel());

    var psbody = $("<div/>", {
        id: "bd-ps-body"
    });

    psbody.appendTo(this.getPanel());

    var table = $("<table/>", {
        border:"0"
    });

    var thead = $("<thead/>");

    thead.appendTo(table);

    var headers = $("<tr/>", {

    }).append($("<th/>", {
        text: "Name"
    })).append($("<th/>", {
        text: "Code"
    })).append($("<th/>", {
        text: "Language"
    })).append($("<th/>", {
        text: "Description"
    })).append($("<th/>", {
        text: "Join"
    }));

    headers.appendTo(thead);

    var tbody = $("<tbody/>", {
        id: "bd-ps-tbody"
    });

    tbody.appendTo(table);

    table.appendTo(psbody);

    $("body").append(this.getPanel());

    $("#bd-ps-close").on("click", function() { self.show(); });

    var servers = publicServers.servers;

    for(var server in servers) {
        if(servers.hasOwnProperty(server)) {
            var s = servers[server];
            var code = s.code;
            var title = s.title;
            var language = s.language;
            var description = s.description;

            this.addServer(server, code, title, language, description);
        }
    }
};

PublicServers.prototype.addServer = function(name, code, title, language, description) {
    var self = this;
    var tableBody = $("#bd-ps-tbody");


    var desc = $("<td/>").append($("<div/>", {
        class: "bd-ps-description",
        text: description
    }));

    var tr = $("<tr/>");

    tr.append($("<td/>", {
        text: title
    }));

    tr.append($("<td/>", {
        css: {
            "-webkit-user-select":"initial",
            "user-select":"initial"
        },
        text: code
    }));

    tr.append($("<td/>", {
        text: language
    }));

    tr.append(desc);

    tr.append($("<td/>").append($("<button/>", {
        text: "Join",
        css: {
            "height": "30px",
            "display": "block",
            "margin-top": "10px",
            "background-color": "#36393E",
            "border": "1px solid #404040",
            "outline": "1px solid #000",
            "color": "#EDEDED"
        },
        click: function() { self.joinServer(code); }
    })));

    tableBody.append(tr);
};

PublicServers.prototype.show = function() {
    this.getPanel().toggle();
    var li = $("#bd-pub-li");
    li.removeClass();
    if(this.getPanel().is(":visible")) {
        li.addClass("active");
    }
};

//Workaround for joining a server
PublicServers.prototype.joinServer = function(code) {
    $(".guilds-add").click();
    $(".action.join .btn").click();
    $(".create-guild-container input").val(code);
    $(".form.join-server .btn-primary").click();
};

/* BetterDiscordApp QuickEmoteMenu JavaScript
 * Version: 1.3
 * Author: Jiiks | http://jiiks.net
 * Date: 26/08/2015 - 11:49
 * Last Update: 29/08/2015 - 11:46
 * https://github.com/Jiiks/BetterDiscordApp
 */

var emoteBtn, emoteMenu;

function QuickEmoteMenu() {

}

QuickEmoteMenu.prototype.init = function(reload) {

    emoteBtn = null;
    $(".channel-textarea").first().removeClass("emotemenu-enabled");
    if(!emoteMenu) {
        this.initEmoteList();
    }

    var menuOpen;

    emoteBtn = $("<div/>", { id:"twitchcord-button-container", style:"display:none" }).append($("<button/>", { id: "twitchcord-button", onclick: "return false;" }));

    $(".content.flex-spacer.flex-horizontal .flex-spacer.flex-vertical form").append(emoteBtn);

    emoteMenu.detach();
    emoteBtn.append(emoteMenu);

    $("#twitchcord-button").on("click", function() {
        menuOpen = !menuOpen;
        if(menuOpen) {
            emoteMenu.addClass("emotemenu-open");
            $(this).addClass("twitchcord-button-open");
        } else {
            emoteMenu.removeClass();
            $(this).removeClass();
        }
        return false;
    });
    
    $(document).off("click.bdem").on("click.bdem", function() {
        if(menuOpen) {
            menuOpen = !menuOpen;
            emoteMenu.removeClass();
            $("#twitchcord-button").removeClass();
        }
    });
    
    $("#emote-menu").on("click", function() { return false; });

    if(settingsCookie["bda-es-0"]) {
        $(".channel-textarea").first().addClass("emotemenu-enabled");
        emoteBtn.show();
    }

    var emoteIcon = $(".emote-icon");

    emoteIcon.off();
    emoteIcon.on("click", function() {
        var emote = $(this).attr("title");
        var ta = $(".channel-textarea-inner textarea");
        ta.val(ta.val().slice(-1) == " " ? ta.val() + emote : ta.val() + " " + emote);
    });
    
    var fe = localStorage["bdfavemotes"];
    if(fe != undefined) {
        favoriteEmotes = JSON.parse(atob(fe));
        this.updateFavorites();
    }
};

QuickEmoteMenu.prototype.obsCallback = function() {
	
	$("#snowcover").remove();
	$("#decor").remove();
	$("#santasled").remove();
	
	var customCss = $("#customcss").html();
	
	if(window.location.pathname == "/channels/86004744966914048/86004744966914048" || customCss.indexOf("snow") > -1) {
		if($("#customcss").html().indexOf("nosnow") == -1) {
			$(".scroller.messages").snowfall('clear');
			$(".scroller.messages").snowfall({flakeCount : 100, maxSpeed : 10});
		}
		
		if(customCss.indexOf("nodecor") > -1) {
			$("#decor").remove();
		} else {
			$("head").append('<style id="decor"> .flex-spacer.flex-vertical { background-repeat: repeat no-repeat; background-image:url(\'data:image/png;base64,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\');  } </style>');
		}
		
		if(customCss.indexOf("nobottomsnow") > -1) {
			$("#snowcover").remove();
		} else {
			$("head").append('<style id="snowcover">.flex-spacer.flex-vertical form { background-repeat: repeat no-repeat; background-position: bottom; background-image: url(\'data:image/png;base64,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AAAAAAAAAADm9Pjay+jxuEkgFG0GBAMBAAAAAP3+/v4BAQEBAgEBAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPMEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQEABQMBAwAAAAD9/v4AAwICABgLByQWCgYZAAAAAAAAAAAAAAAAEAcFFhsNCCkBAQH/AP//AQAAAAADAgICAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf////IAAAANAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///wD+AAAAAwEBAAAAAAAAAAAAAAAAAAAAAAD+//8AAAAAAAIBAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8wQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQEAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAADzAAAADQAAAPMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADQAAAPMBAAD//4KmwUDpxM+4AAAAAElFTkSuQmCC\'); }</style>');
		}
		
		if(customCss.indexOf("nosantasled") > -1) {
			$("#santasled").remove();
		} else {
			$("head").append('<style id="santasled">.title-wrap { background-repeat: no-repeat, repeat-x;background-size: 8% 100%, 200px 10px;-webkit-animation:moveSanta 7s linear infinite; background-image: url(\' data:image/gif;base64,R0lGODlhlgBRAOZkABwpPSYXGjFMSk4FCkwlDUcyL28HDXEyHF41SkpFE1FCOF9JPnZGFnVIL3djGHdmPFdJZkJzc3BRS29dZ3lrT3VxZ3ltgVKUe1qcnGO1tZEPFoo4HrEkHqsxOZJJHodHL5dHK5FVM5tjH6pJHqlKKrNVILBXLLFvD7NsH6VlILpmMrZ0LYxKWoxZRI5nVJJ1ZLFSVqxpRLR2Rqt4Y/svL9Y5Qs1YIslkJst6JvxLPO5qJ8x4Q/J5fYp2gpmGVJyFZbqHULOeWqiLZ72mbO6YLdqIRdOZZtqoVtO5c/OXSv+pTfGyat7HeJaMlqeYmLGrjqCgpLq2sLuxwKji2tS2isq4ovSnp9nLjNHNtffajvDZrv/+i/nxs8DAwNXLzuna2vr31eDg4P/++////////wAAABAODxskKjAUBiAhHDMjGDUlKTYyLyk9UjFCEC1GOTFCQjlaSjljY0gWC08sHVYyDkw3OW8TEWwoEG01D28tPW42Kkc8Tko8WnMxSns5SiH/C05FVFNDQVBFMi4wAwEAAAAh+QQJDgBkACwAAAAAlgBRAAAH/4BkgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmptkX188OV9gnKSlpphgoDSrNDljp7CxsoWprLY0PLO6u5tWt7ccXrzDxJBgrDU1HMvLqzlkY9HF09SDvjQaGncaLDB/BhrLYmJj45VgWmBi1eyPPBwwPFVe5GNeE3pSVvViXeuST3wEGYIkXbuDibzQG8cQzBcpFr4wHBMGipRJE9KsUUCBoEGEIBmKLCcGjBeIUsRgCfOwR5hJYRYEmMmGghAkV16CbCeGC5ho0cSEOdnEAoSUUJoUvUgpzIQAaaDasTkEyyhNJUua+qKlyryrWNMJ7eKkhwsXPZxAsfCyn0JMUP/SFFij0Y4LIUKoWA0Dhi+lJxRcvHDyRKKmmHYK2FGwoIewTGOwRFH644fAIUIePDkVRYEdO2zWbJzworLlFy/+RQpjYY0axQsoONFpyYsa0bjZFJjw+JKUCU2EYPFiNQqWIAuqdKFnCYxzdc5/PJAgYUHoNWwUVF+goIJqSWGi8HG9ZvEPL2AnQcDNfk0PY+oOiXlypYuPK1oUvHkSQ0gXC0xJAsYVSBRIBRNIUIHEEEME4cMDChjXxYQTfldJGFJEscB6EiDxRBW0LfLFE0LQp4Bo14k2gYWJoIPEDCyOswUXVWSxRRYPkGYEEFIIMQSLiwxYIIJMFGlkgQU2WEX/eqdMyIQREjTwQ4iGiEFFCwvYgcACBczl5RoLUKnIkxK0UAUhXIiRzo1MZJHFESH8EMQSKwS3BBfGKDgkkUcimCSDQTyBxReyhOECBRIokEAUiTihQJeQRrrGBFG80khPQsTwIhJXgXEEEm7aeMUKMrggwZLoOOHEnY6ohCSSfhKJhJ9/BmGrnITCEoYTFEBoRyIvKBbpBJR2kesjX7TpAxM3zggGE1VckYVz40QxAQWFMfSFEz82MgaBr9JqIJIEldugrUFY9gSTpGBBhQsFdFElGBOsoZhjYkbyxRHNbuHvEWdyJVJFTUgxoRQ9QDFUI2BgEe6rr1LB4BAST4xZ/4N4+TBlLFz4UEATtFTRwmcubaKmvzZmIUMYr4DRBRRJ9dCDDy9YYLMTxuZbSBhIfgpxkgtWLPFAeGGGl2WW+bDZKVr4sBghYgjxqB3ylsLFEm4uIYQ6YYzjRBM9/CCEEUEQFsXZUUBhKSJfAP2zgRRb7KMTQgRxtNFCaOyDC0/ojMkTiVVNBhSJUQ3LF1QsAQTXLtBDXBiQC+WFKH2F0QSQgoBxE6zkLuj5xHiFbrfYoWucNGoUHEtKE3ZMMIgYExTwnixiLARFB18AxY/u0YDRA+ZiNBHE2+QKfbGPR/9QmhCVoYa6DxREj/klX7iwABbziNHDAtNrMkZfD3XAgf9EQJWvO4ZQNEqB56+Wu6DFQ9CNN/OVMf8C9D7QTMELD1BwOSleUEAdJlCdApRmdrGgCNj8sIx9mK98Q0GYMMRQBSwQAgsd+RlBgiY3u4UueaY5jfOgd6gHPKA3mQiDAlYihhfwpQcKQGEswtCDbLSia+M430MQNoGutSAFIIhBDGQQgwcMpH1we98ThrDED9KveVAUIepe0CsJsKsSTahUOb7AMjC0AGS8sIIBViEcLoLvJEmxwB/00IEweEAEGzABDkpQAg+EIAUoSIEIZECqIsgACDMAAhB2IMhCAhIILwgkEGRARCIOMQYi2F/0qpg+VGghBKJIGBiaUAUqiKD/BTJIAn50IYUOLIEJLbBAE9QSMxjUgAYc0IYbQ7CBFBThBimIwQ52uQM+quCXJijBCIRJRxvYQAfI1MENSnCDZv5SBR4wQTOF2QAqRo863rkEGFDgASYE7wwV6EEa0vAEEeBgBShQAQ6K4IRZiAEJW1ABNyzQgw680hYaMIATQuCBPDAzBkdIghGIYIQkFEGgSUhCQA26SxnwcgdFiGhEFZrQhcogBSXYQGwOhajq+O0R0AFDFNjwMnA6oQE4YECYTCIEXYhhCUZQgVh4cIt8DkACHwgBAxiwgoSGoAQhMIEJfpkCE7RABYyE6EGLEFCmStSPKtiBEIdoUBMwYA/X/0TUAhZQyUigQwtZoIIWtCCtLWCNRlVoggP0uABZAIUQYD2CExiSg1UoQwMDyGse4OgBGSghBgwwARBS4IHCClWYyyRBCD4ggqECMwRBDSYIRiDYHYAgBElIwQY4MklEKQCMjxCDEXCAAyKYlrQoIC0OTlBaIJSWCDgQgeBK0ckrUKGCXtACF7bABB9gYRxWWEY2BgCOOxCAAYXdwV890IK/huCyDQhBC3IK2RAIsQVBxW51WyBUIiZhBx6IQRJCkIcGXIs621HAFRHRBQWM0wwMMC1sV+sA1nogBfKFLQo+MNtNOEELWHjCuxiUsiWcsmteiKUBBrANPNSBAMf1wP8OjrACOxoUCCJ4bmFzGkw6lkAFh/Vwh0HwxyTEgAQqGO8BFjCdjm7VDh8lRBcqMIULBMAMZsDvfFcggjwwwAFzcIB8i5ACBiggxpIgjFWsFAQ2GRimMYiCF6CAgAHoIactaAAD6oCGOXhgBUYoQggYiV0QeGADaEZzYUFAx2aagAQkoGMwg5nLGIg5lCDIA3qns1XPIJkMYUhDBsYwBQCYoQzxLQJsT1DkB6OBACuIaGzrMIf+XiIMQzhWV4IQAyPA1AgzaMHXLDCBR0LyAw2owwY48GUgjDcG1qXlAQ5AhwPsQc0eKMFhSVBYD8RZ1921bgogSl4JaHUBiVIAG/7/3IQ0XEAMU1jDoelw2nOmwAFcRoMazHnOEDzY0pYokYWq12lBuqABMyBWIYn4AJ3iYRUeiGoSzsyAxdKaDvguQB3MPIJl6pqOJAgmLplpghjIGc963k6iEgOB7glCDAkIAAAiIIc0nMEMbChtEay9ZTR4nAEiCDkD8P1nRxAmROuYjw8AGQMFOOCPRVgkrEGwAW1ogAZFsGNEGXCADezB1vheA75r7fMPfGCYkx0BZUFgAn4qfQQeuGwSPlCHBUxgq9wBDWgVoYUCmOG9AMgAAAiwTmuLYMtqQAMdfuwBqtPhB97jpOrEsAAqHIEJRzh3HdzQgA104O/MiCVeNZAD/ys0AASj3QOqsb6HxSjGDntYwB4aQPkGGN3oOLU8qj8gAZqDYLwEwLpnQDOB9RZiCQ74Oo77MIUzOGAF5+TxB7Y8BzUcd6cMCH3JFzGGH0QBDGciRB6MIIMXeGEPdKjDrQMfeG0wOAc8OAAIjrADW/8cD3TYwx4UoH3tz9rWRb98mjfwAfKnWbwfCH3W2cAGBDLiCjhQQxlwfIYzqEGP1tbpyAmghjnUIfdqkDqZIAZqQQZ9QQZi8AVXMAQKsAQiUABkMAPZMIHMF0t3cAcDMAc1AAMZBgRKEAI/133a1wCTZ3TVFVQo+FwpiIJCtAPfdQCh5xmhoQZ00ANR4HBkwP8EOIACaoBjZrAGIqBHPHZ2W0YH/AdhEHYHeLB1UFNyXiAEbUEoYsAASrAE/QQEIUAHCbgNFMgB4tMBGqAHdzAHd3AA0WQCOVUESmBQT3VQCZUEawiHAVWFcLiGSnCHd5hQESUDG3AAeHBvRjgHc0AAc3AAwtE1iKAFqZUCefB/IRdykOUBWvZgBKAAL0AAvnYAA2BBtAAFC7AGXiAtVnBbVDIiUPAPLoOAE+AAR7BlWEgHguAE4KABG6ACIGBm5HeLkHV5DTBre9ACQsRIjiRE0lWMkYVdRsVdwFiM02V0t1Z+0JhmPTd+G9ACiCAG6MRjIZBhjxgCDrBTyAdhCdD/AHjAATUAAnhgfGDhBHZgbHTgATigBKclAu2UgB+iGirxD19QB0CQajLQAHTQBWFgBBO4Afz0AXZ2UHGoh0XQS7CWZQ0geZOnfeZ3ANAIAiSgi01nXUilS4T0VGH2hmHWkLDWh3ggAYngSSLgAB6AXCJgRy05ew9GBwrwBV7wAnigAS2Je2LjBNwxEPF1h/KFAykgBFWgBUTABFqwDmOwlITwAqBEAFlGB1DwBE6wahyAB3bkgTG3SH/0R0DghnA4lnn4hkcQUSMpUW9YhwmVh00VZmEpSIT0kXMoA3uAB+2ECGHAkri3Ux7gAPpXB0ZIAPIiBoS1kiH3l29kZAuQ/wVD4ABCKY9EcAIviTXyeANCoCYyRAYKQAcJIAMtwAClIQMgsAx48AF+JQLe930hSIKVJ10i4AJDJIwyEHMg2ZVeOYzadYK32HYg8AFRd3kx8IF0sJmE4AU7VQcJkAc+hnuCiW/1WE6P+JLTqVILEAQUsALyKJlE2YgrAFspIBDDIR8UsAdAEAM5JQNnuQoc0ABhdpe0JpgHUAe05mC1dp/4mX3ZN4IlKH4+95/ltwFnRo231nMGyppJIAOVtghYwH2PogDch28QJgE6oQV6lAIYOp1B6AAs5gAPkJR4SARFsAIt8AA+4CN68VvXaAd5cJ4i0GlLkATsGQJn+X0tIP9mtuaLrLmj3+eLaUZza/YBQFp+a5aLbYdmDGB0G5CkJelzfkQBfyYSJVGVZ0MISIACQbgCGLqlKrACD1AArycQQfApDPIEQdAEP1AYKqoIYkAAe1AqwCiMr8QBJnCWG6aGUyeg5ZekS+pzBdp3fUd+l2dHvBZ1UWdmitV2RrdmawZ1TKdc42VhKpCXmuCAGKqlLyoCWroCIZAAPpAAD6BjG3cCOkUAaOACraIGdQBZldcCezCBHjBQ5dcAoQRYB8AAEbkYkndV4MhzuBqR1dEAwQqcQhVMrCqsyLZVlHd5P2UCflUEwPkB4wV3m2CpWpqhuYQCWBo9W5UCK/Ct53T/doTIKJcCBwpAAHSwAH3TCXewDCDgarN3AJTHABsQkZO3AJTXZ9zRZxBKkTjVApdFHZUnrBxmVOjJqv8aTCNQjGeGWQ1AqZlABXmEApAESUGIoSYEoQvwrd6qR+LKPZFQASsyCF1wB60wAn7FTwNKr7NHeb10a1fFn6s5eWHZYcAGYiBmAzdQcGGpAsbkYcfUTD9LRy74AaY3CWBwrR5rR9uYYdwBoSJwAt8KiXmgBsEXbhxwsqGkAsMkTCOAi+THSLNXoNOoZmbmrFJ1TMakA8aktsh0A7okA8i0tseUTMpkTGEJAjgICV9wrRnGAM25mJ5RAAnwnUSgpTpVBy6w/7dsOgNZqwMfRn1eC3VQd2aoZnnjN2sC+nTGZAJ1m0xua7d3u7aiC7ptG1EbsHuNsAREmQI6ZYTJt1N50CVr0ACnhanIp7rXqAE1kAM5gGIRVQI24LU0h2a/mWZEWrwbMAJt27ymW7qm+7miewNtewMRBQJHKwlIEFtn92DJimzVsQYBkABlx6lbdrWWIAa8mwM2MAKRVgRt67W9lmZn5gEjYJCoRnOc67zOqwKl27nSa7c38LYQpbeccARESV50QK6EEAYzIQGkpY25p7uIAAYb8ErDewNh5mFPB6Sb66ja1wJHEAOKtwEkoHTDK7yde1nAGAP+O7c2AGcYqQIDrP9MbGtM1BtKRssJWhBbufcCiPAWQeCxW0YAqlMJYhADvVsDJeCCO6B0tWkCCxuRlkd5kUd5wNgCUYKvQirDi1UmMVBwSQAELNAC3PVmv4lqLEAdPmsCRRBTwptiIUDBipC05FUH4AY1VbCNW9YAnIgJwZUDk6Wd0GQCcJhzXwsCAxugByAB8opmQpplZdIALRBwbStVuqQDoKnFOPUBcKazA6wCdwi/NqACRhACjOsIWlAEqskAf6wIVZBheVBkdGwIRtC7G1ACWxtNYWlwUCegxktv9Pujk4WRcba2NRzDdVsCJwxnx1zDygQEMRXK45W9kbAERNBjDJDHhSAGF4X/qx9Qy4XgBL3bb36VAsP0Zvb7dEp3woy6AWYWzyhcTNIrtDp7w83btsF0zAF3wpRlYqnMCGAAW1rmAdxMCAM9onXQUpmQYDTgATcQSlK8zoW1ub1mv82ckYd6iyiGw0LbxpbsszbgudRLvQD3tcZ7v2gmXiFgnJRgJUXmAjgAxIyAlIfbAOJsCE7AASVABMolVUT1ZkEVxkS9AryklhVllkkdUAVVUBPVhg25A8CUxrmIWUawAdSKFSvAAFVAYTgoBoPFABCLCWKQByigAx+5lmq9lks1koM0SHMZlx8pUWFmBE19BEdQUHkdUEtQlkm9hiFwAEyICVSwAi6ABEVA/wWNcAQpUAdHfAmGWQJzZAKfBFlmfKxW3JkFgG97oHy2dlWaK6TwfFlCGnUhoFhKSl0sjF1mPFXXVX4HMAOkAAasPARKgANVsDaIYASN/djpS1gbwJwHkAfDLdz0Op8laHkgqLl7EHUmgAfKXV1ECpy+5gF4cFknWH7F+wKeADmeIAXOg76VigMuYFop8FHeTF45bQhgwE/G3XYwaajk1QAPGWuTZ5ABpwJ4YF1TJQMmEG/FCmJ58EgFJwPlV1QewNAXtN6K8AX6VQQt0D2F3ZIMPIC9xnN5gAdJumF6mgfMFa+QhW/ACWcmsKr/PUywFnDFagIgsKopTgIleaRLQ/8GTbAAH4AHeubS2mRaL/lZihDWD/DKZN0AbgxrIdAABNCjs+Zg4UWkQoRvvnh9QnS2UhWcvwkC86kCYSxUMVC8FvkPP3AABYddHrC4pTDQROAAEXlkiFAF6MQAFXDmhOTCWew8PQAiXjDgMpBrER0DIAI5LBEFGwAEKiBnUpVpLMFFT+ABfiRNEa0CLSAEM6ATYUAAf3RUQrQH1iwgIuoBBQAhEHAIVdCxDOA6pODNMkBHdiQDY40FXRoDvTZmsk0IP0BIzeRM56kaXkRINNxdMTDrg/ACIWAEJ/a1sMbghuDgQCABaqCxhgAFDIBHIjBApSAGvZQC0wVKHsDdtfP/AkYtA/xUvEPkAlFAGC7wxjR8633u50/QBCGwA0awAzsrTUhlAlRglU/QAitwBP79kF0e0I5wHEPwAHagBiVznIwh7Cdi6pxg7aBZm3UmRC6w737ET3XEsowESTKwI4X+YeouAzMgRGC2SDfgs+me8YqlAkwFBHDrakK0ww1fIlTwAJ9oaV6QAAvwAtahAF21CWAwRCngAuCeUzEg9EQkAnFWWLzGaywsm7QUdSRAvfIeTFrOS+ouVCVvA70EljIATDcgm8AYzqRQPZiBJb9TCE/AHTT/KAeNxEiVSwtrv/ZbVCXQWKe9kc8FjXuQpF3sWEO14s8UVYE/+L8k779U9vIxgPhCoNuZEASCIQET0POCEBOWSAHcwQY63hwFB+tBVWe5JJv97doSfxZFH4xJxUgzAPJemfqMtEgz0EtvLUiBRJtTFQJjnQnl7gTMYQhhIAEP8AOWfyKZj8QWeV0hkHmb1306KoJ2QAeQwn2T9wdGd4scTf0YCQOXlZEYaf3bf1nYDQItgOySIAZpoypNYBimEAWuupr16QJ0QzfBsUpcIxR9Qf9dc/9CkRX4P/8IBghOgoJGToUfext7MU5eZI+QkZKTlJWWX16ZXmKWnZ6QYU4tEi2loy2NmqqfrJJiXlheWpqYMywuLo1frby9vr/AwcK9gQAh+QQJDgBkACwAAAAAlgBRAAAH/4BkgoOEhYaHiImKi4yNjo+QkZKTlJFaOTw5VpWcnZ6foIJWPDSlpV6hqaqroKOmrzSbrLO0tYZjVrA0HDQ1pWJjY8C2xMWepDk1HBwazc3LVsFjYGKeYtfG2aBiphp6MFJeXhZ6LlVgwWLinGJVQ0hXWtXa9JNiyzxS1NfqTU1iX8SE+QKlCycvbBJI8AFPS71QYLRgCTPvE4+A14Rd+yLFAhkvUKQ0sWCwUhg2AdKskSAEibyHnZ5IWIBgwQQnYKzxyzgmjBcnPSZ4ETPSAhRPUAIoTcOGwhAqYVhp0XLFS9RUC9ZoXVOgwAIoVyeBGQuspxQo/pr0gCBlVdI1KP/XLBAyBEtFUArY2JEgwUmXu5wqaC2wlU0BBWEjicFC7WeTcF/ENYEyhlWUNQrsrEljhwJdu6G6WFDKtXOTxJS8BCDMdesCwI8WY1ELuUuUJ3+3RcRyhTGYCgsW5NW64MUPIRNDQVnAJ4CaNXYWNNFS2dEYLVWaCKnyYvDWriUpdYFAssuTIECMDHlSxZoWJPCRMGESf4gPFw8UDJZAgYILIU3k9IkYUVjAxxpq2PHUE6ghgoULdkSYWVeEdcVGD52E4YQFTVDxBRhhjJWFC07wM4kW9KWoIn3wDRGEDw+wodJhCihQQIOefFGgZzNI8AOOg4QxQQF2UGhka1DAZs//h1Dg1MQb5x0RhmiRgHFFfCnKN1+WLb4o3AR89NBFbrRo+IAECvQA5BddFVlkAWxIMIEE4VTp0C1gbKGFD1tsYQQbFQhhBBVSCCFgI1pQoSV888XnaItIuBiEEF/Q04UQPqgRxSFgDEFkVxNAsY49XGgBRKWDbJTnFVlskUURFPxgxBExOGFEFkoaciWWjDqqaKQtDiEppudo8wUTCjhRiBhazIBAV1Gg0kkWWVQhBBWDgJEFE1q0ykQQRxjRggtYlCqEE0JkUV0iVj7qLnyKPoUEFcLWK0QQP/ggbTFiMNEAG3dVIYFeFqDaCRhIAJFFt1yQIUYWQCxBLRdgYNGA/wQPRLGPOk/cye6v8r0bb6T1lnzvvfn68EQ2USxQQBOE9NBVBbkq1qq2fW7BBcRYZIGONF70IOoXHDXRBRaLhMFoo4/+WvIQdEENtRBUT5rvCysXM0YTwoUVBZEGW0NFzjkDUQ1AVnkhUg8/9NCDBT044cUXQJLxxTvvQvpOvFEP8QO6dP1gNaY+xBp2LUK4ICqDYSjgkSo495nFCyE6LMXbFrwwAxAAQvHEbdEiEoYPeLMI7LzzvrOevVMf94PrPxjngw/GEUNUAwosUIFXL0hwOChUUbsEdQMJFMXxVXiBxdEThTHlvoQQhfejqpPMOl2AUx27EK/HTvsL/WVNi/8TClj1w1BBU0CLGGNhEQwUMFCzjzT0BzNqIVi0JLL1T09NNdTdE4LsXvC9/vRlXaoIww+AwT6KAKQC0FvFNXzSgRpopCz1C4aG2lIIMJDOXU+7wlOERTW6lFCA3dseAWNHgRe84AEPiCAoxkCFv3QBglCQQBV+MIQYHCEJV6gZJcTQBSlIgQUcqMHPMhgMMHBETQ7rQhWwUIUnCMtReBMWvZ72hBK6yHXcS+HraOeC/kzgATRThRaKsAIuNO4MTzJDrHCAAxGIIAVFmEHdJvGTP2iAF1TgCf3U0QW0TIAMYIiBCECwARD44F4uol6k6EWFLZLwOGEE4wxcIAMZzED/BiGIQX8ocKajeCIiKCJCCkRAsSZUAAxNiMMTJnBHOjyBaFiQoSei0IxeTIR9E/RCEaFgAQjcQQpi8EAIPHCDFaCgBB4QgQlSoIIQqOCaKjCBNk2gghvoYAc6KEIRvpnNG4zzBijQZglucIMReKA/+JnJofj4ghCIgAj4pOMKhsAEJVBLC1FoQQpOUAddpuILSNQBgKJgxIY2AQYdWIYG/vCFD4hgA3S8QQxksIOOFmEHHF3BDm6ATRKQgJsmYOcOcHADj4ozCeIEggpKUIINSAB8fEHMEHsQgTeYoQwEwEE+T3ACDxAVB+LEJxFWgC1biMEKW2DCBvQwgaqyoIKv//BGGDzggTyUYAUxSIJYxXmEIsA0CUY46w/LKtYfJsGtMN1BETop1yTsoAR5WIAB86MsSYihAhkQAxTSYAYz3FOoOECBCBjA2HsqtY7qI0bPbEACI8xNFxowwABa8IEQ5GEEMlBCEewZAhOUYJsmsGYMsrlakHZ0BzEwwWpT64ESbDQGH5BBEjyLMb7MBGaSaMIZkjSFM/yUAfnEwQkWWwcCoCEF+CwCDjxAh76yojoPS5gDtfAKZgzguwwIAQNKAAQlXDQGo+WqMkMwghGcNgQhaEEIUlCCaoagAfBNwTZjoIQdgEAFu8UDfwZcoz0eQgwTSEMEwpABwpqBDkSQLv8OVsBcNKChDuKkowMIsIBV+IQKTJgiFrSwhSNQThikWMYdNJtZAqi3vMvkr3zh29n7xre0N0htfLWZ49KSIARAMCt7ZVAEEOShtxQIjk4hAQY1pAEAAgBAGtpghgQIdakUZkAd0BCAOpxgwovlsCq+0LG6UBEJrsrCEYIoBikwQ7N30AAemksABngACEmIgQdaENdlqvcDtYWmadlJUxLQ9LQ0jcFGdxACuXrgAAvw7UyW/Igs0MEMaSCsAIrLgBWwcQWrZAAB1HBhB9jRs3TAUCjCQIUqEE0LeXLVEmZthC5w5A4DuMMfPvCBBmgZDXPwwArsGoJOwperGzjABpb/vQFAnzab7iSBCAxtWtvGoNgmEGdX+RLpOCzADvNsBBMcUNjCQgADARDBCiasWMYSYNR1UOZi6UAHA0NCDB6qhqKYAIQj0FoGLZhMDxDQAhkoGr4NyMMBODACFBhhtCkodggOcIA90KEOe2DABmo7U5qawJ0gqC+iVRBbbTp6D5FOeWbsXQgmFKEO5S5sA1KQAjCLV9RqmEO8Gdtc636CzPO4RhVikB4jACEGPqrqDIzQSUWK9wA0yIEH8JgED3zgAB/YwwHoTQfC1GHjIHDvoT8+dpq2F5oeCOsH6pBy4WiG5YRgAh1h7pyZr5LC4m0AndVABy1zWHyf8EIQDSGE/xYAAQg9aoAnDw8Eg4fg6nGmgQ46G2SKb4ABe7A41+md+T00oAEfYKQHQACC+35AAr3m9Qc2EILdclg4mYmTEA9BBToq1o64PzVj/T7qd79b1aAIA7lShZNEDeHoDUhAAkprAhJ0IKLMyOwdaECF0BsBB3v4wAJQjnIb2aFGns981kG/a9A3stmqX3brPzCHGsV+DcB/BBZSgALFesAB9jy1Axigdzq82/8MkAe49gOg8BNPsC9iQAfpcQRDIAFuQAcJ8AF/tAwUyAy4dgeYwHpHsAMUtwd4sHV40HlapwcUV3HLtnqrd34gEHqkF0owdQAEoAB8oBlr4BzSQRGOIP8GQGBHDuABdoZ/fsZY/kdvLTAHzvcBBBAeB/ECAhF0YdAARyACBSAGTmAAd7ABE1iB0YdrAwADMPBjMNYAnSeGNdYCG8VRMSVOavhwRcCGYqUEdnV1B4AHXDcHdkgAeLBs5/I7hoAFPbh7jHV/jLUHdeB/e2AeDbAMG4AHL3A4YvAETQABs+cwXnAaZFAFUyIEO0gAQBACddAEXuAMzkCBHdAMdzAHd4AHJKACKcBrRQCHZiVWSaAEbqWGRRBkaRhkOwAEHdV08tUAyXaCzTaMy6ZszNYCjDAGLsBYeZAAeZAHgFiIMVgpYpACy+aDAXg+1NAEXSEBanAtleQhhvD/BX5xNkgzAQwgAwyggCJQB8pSBaNoAiDQAYyEfqq3gphXcQ1ghi0gAi3AWarHaydIeqRnj6UHX6FEchyFi2c1VknAizGQbALWCFT4bmoAb3ZAAP7HYZUSBorEg4K4ey5QIwmwAI6VXE0FEOwRFmCACl5QB0DwAJzYAnTgBWMQis1wAClAAp1FdC9li7xocDEgX//Ia48HejT2eKWlaHT1UnBIi0rwlG14i7fIeEE2i0XQAHgQWY3QBU7wlTYJBk7QJFFQDYlUR7kXTSLQgwuQALnzADigBI9VR5b1BKCRKowhCBVQbAQAX2ogN08AAn+EBysYVrBIlbYoi085i0fw/5RR+ZiQOYtRiVZV2XRDiZAhQHq8ZnUbx2t8JgMHoIQ5gk92hAKrlHsiEBx6tQJR+Vgp4INDgEgLMw8tGSQFEAIE8I918AJNUE8SxQAuoARAIIbEGX7E+XnIOWMu8I/8qGgu4JyXqZSbCWgb5wHEuAF7EIzJRnEhKFd0IJqdsARKgAMOYJoUhnurJAEJ4AAPQARyiU/LtXspkAVyiQMxgEhIQwhekACcKAP4JQOHl0QcsAflxQDcSQdzBoJ1AIJ0sHUI2qALWoINWoLCiJ3MxmwpOIwMkIIa9wGKtmyKVwR7YFCUcAREUEegFgOnmQKKpAAOQJ7gYqI4kAKiRgB5gP8CJ2qap1IFsOEE/dmPRcAEWVAKHMAAaaV1B9AA14akFdeBJdikJZh5BzB6XAUC6kWlVFp6XMWCV+oBJgUC/KUEMWClHdUAJDoJ1zejKbAC53lHKOACyucAK+ADIuADQbAeg3N4d1pFQOKjBicCMZBWRZADuwACJrp6DFBeu7VxGsd/l3d52Yl5j7qhvfZ5NTYCJ2VSJbBMn7cADRAcoBd6nZVob7VMHzBXQqAKVyACE0ZzNCcC9rRKwXFlReVre6AAGEMBIfIFd4kITqAGIrCcv5iIzDACeGadHipaV8d/sCccYpikSZp5n6oAF3MxEvCpllqpF9MCJsCcR8kXozr/AgfJVa1nAsAVCmLgAw6wXGsacRuaAg9gB6wplyuwf9JIAO03iYLQBGjAf3uwF8czA82wAaH1dPjlawwgHPz3eSgnHA5bI9tXcf/IXiYFX0RpTSVgA6FkBDNlAyrgXjbgTSFrA5TlsUnQAqmqCmLgAvn3qnXAACLwqSeATxSWcL6nke3hCGEQBT2ABhVgMAJLAyMQViuwbAbaoeMXA4yWcRXnedupcBugeHlmAxkbsjpAsjZwtTpwAxwVAzpwtVmbtV87tiSrWyaQsir7Ag7gqp7IWGuLAqC2WHkgjXVQBwQoCZuSKhpQAzkwAirwcLVFAu2FbM3GSS2QB49qedaJ/6kgYAOr5bVfG7ZiO7Y6oAIh602US7lY67i7hbargAW5V7fRFLc3538Yl7BwpwhisAFRR7V4Jnbt5U7WaXXpx2yWF7sjYAMmQLKaO7mZu7mZO7Y3gLUABgNGUAtDcGpze0er9AFaRgeRBkNM+AlVwAs5YHJJUG2Dy2yceY1gl4Jht7lYC7Zii7mZu7tWG7zmC2Ax4Lmr8AWnVgd5cEfMRQcvcKaV0ATWOwI3gGeWS7IlIK7u5L2NhKzytXqxW7VVC7baBAPXpLklYFIkcLlfO7w5RrLZpgI+xwpOAKsvS3NrJwH4ywlCYL0g0FLZS7UB3F6rp16yi50LIE4L0GsbIP+4NpC7p0UCLSAB/6hb/5hSlEUCK3itLCABIUCyOwBTu5ttO3C8tQC/i6VuKVC3L/DEFdS35rRbI2ACO6ACoxcCntpsnWqpy3mtn+qpAcnDE5y1RPe4/2itnXVS7LS1RSCe//tRGyxBQLBKNBcCD5Cz68MBOZADG9C/SdBe5aUEJsBVJICt2bdsntcAxthI8jhjIWBoI6sDMqBNY3vJXwqyW7u1uzhSKlUEefxzXUQX5wlqdrYCQIAFRMMKYtABOWADG4BHRSACHqBbRfBxyCZ63XuNszt6ggsCa+y7upu1w2ta4pvMExzBgiuuctUCIxwJYUAX81IEimWaIqBDbFr/fyKQn6kABoJcA34rTgGsTeyFu7jbpaLXSLlLtbwruejbzCQ7vIZmUsxGAhcqTgdQzZAQBkBwBVxwBRRAfzH7skIAq6a2Ag0wAWKirxQ5A+bMvw8XdrFrnRswuC5sUl56yZesTd30WiQNUhxF0idN0tekTSsYevC1A2L6z6vwBD8wA/24SkIwN0NQfzQXXklmI6dMCV9QAx1wAzhgBEQgTdPUgiSgXwmJhi+lmFAJh2v1VlD5VlbdmFo91ZMJV5MpA1cnzujaAqYWcUoYBjsNagnABgqgBjdyUAygA0RwlQ0Zi7MoizCFi5apaEOpaNektIomW3zN1/IVW0MJA8zZ/9cxIKwtoHV4ANCPoAUyYGoxK9aCIAZGIAIy8AIKkAAvo7IiwE4aNdiAesAMqwCbx3kKp2x58IEmGKkXunHBKKoCSbj3GxlEQzRR4AKNmCPKozxHMKOLlbe3IAQP8DcS8NapIAYiAE0boHDPmAdaZ6AK13e8FqrZqXWAJo95YIa3pWeryHzcbXDeHQN2RlueqzxdkLqq+wQwAkMP4AKgdl81MwYzIQT9IdGPAAYhgAfP2KEbGk3KxFXdfZlmuHZ7MHrqjAeKtF/Ml03UtHabbMyy1Wwa3VdhIAERugEtoN+I8IhDMAMwNK3Fgb9RkDsSAJ7WsEwBOLdTuqWdGYDwdf+0uEUHmQd2i3htCi4DQvylpDeHgZ1auFWMH1ANY5Bxg/0BgFcJO/QAwlEAaWBKiyAGDsvejgAGB/BVpPVuT8qdeRBKGxdKIUABPaA5Nf0C6fixJwwEJmAcmjMDQkAHd1ZOKsDjMzADTzAPUUAHIHXJ16ZHP+cCLpMgEi0z57rcT7CL12aGe/A6M8A2YYAFaadn6yQDKmDZUaACMmVaXCwDgOwwH7CL2aS7lg54YbAHABoDJKBMEWnZJjEBWqHiH07cerwCpgUCnIQaTqBRumylxTYDhNAFRCYDVttSnSQtT+hpI8VNGrXJVPAEUFAFQEYrJNfXDADZjBAGEAQTB9b/eKn1AQX3AWWpDj+AA8Zmpc22UeZQRSlwBJYu2sMLUotdbG0oUyQVsnW+yaOHR0ynUUEWSi3Ah9yusrBVbLZ+cKG0AkfQeLqMbLzWxgBqBLHVXt3ETtxEV4dX8TdwUparAiDFeF08U9Vuhks+8LLcSQXXiR7wnET3p7686h4wwNd9dcsWcqeVY83HY6TMTtdEUtiETSHv89lEcu5r8qvgBSuwydy6SO40X9NkArCaWjqGmRbr1yfdSULZdIsHoIe3ObvYeEHZSZ8klOJu9E9sAjKgXx/NooPd9oTNnDzMw/GV2CYAA4Id2KX1hcb8Yz1OkAQZkOCOQGavsqW32EN5T8CpJ4Zat/giCCdqoADagS6Sfy5G8JXncvmS/5W28pWVv/mbX/lGgEyDjziZR91SuviY/zdNGCKs7+Gj//qE4BM7LAHkot73A/u4n/vcHggAIfkECQ4AZAAsAAAAAJYAUQAAB/+AZIKDhIWGh4iJiouMjY6PkJGSk5SPYFY8OZlflZ2en6ChX5g0paU8YmRjY6mhrq+wnmKZpqU1p6usYbG8vb6GYDymHDUdHBoaxGKsYl67v9DRoFalHDBVX19gPXgsUWBiYV9NXZ9hWuhg0tBi7a45NFbLy6tiUFJkUVJSTRbPlWNePKAQBIkWdetifRny4oUTL60qzQrDLNcYMF6ahOtnoZwnMGzSrFHwAskVhAldVSiwpoAdOwugRJTUzmKYLlB69LBgAYqgVaGaBEgzdIEQJFh6fcGipUqYmaAkrGm5hk2BAgv+RQIDZlXGCX/86JlgAQI+WGD4iFSTxs6PIVr/oIKqYAerBIdPQ0GgOnVqgQqTxHAN0+SPHg4cOvSQ0mXCWVhezKyxwybAGgpChlB85cVJgM+TFVDoIreR4DDgJqhpyZLlmh6TxmD5UtaP4odfvESZoFUimCtYrsR9UkCBAjtTF/wQgqV0pzAV1oB2SQEiJDBUXCxoIWQBVdd/nTOiPcGJFC/opVTJ2ZvmbyTwmSCRz2SIjxcSFLCZTOHFDyx5ufJFFBYUAJoETFBBGiNg/IBAXS/VdVVrBbT3SBgQWHBeFFXAd0UQVXx0RXxM0FcifPAF4YME+62xgAQUPPCCR6+IgdNxC8zgAgVRiEeGFy+5JOGELSlAIyVQZPjE/0HggMHFEkgsg5IjYmhBxXwonljiifANoaICIlll3AI+ytJFDy9oR4F4Tkw4JAQSQNDDgp80w0UYUIDRhQRPPHGEFmF0ZEl8WHKJ4qFIDOGlEBTABIEC/kgzhhNDSDDBIWNo4YJLWFngRRdTRuJOIctw0eAQWyChQBw/GGGEF/85ogWi8mGZ5ZVDJJpoELz6kFRKgmgxBB1eFAJGpXVNYJ0nY2RBhSEQbbHFFdIu4cIPQCwhgxNOLBHqIbMeWiuiuCKBq6JDCBGEEEI8ASwZxyZw6SBgvFCXAjJ9MgYXTLQwAydkiMHFwFxkkcUQR2jbABXopNstF4q8RyKi5sJHBf+6GKebrro+CGHhL04osAaNYQT52EdHJMjEFuqAsYQRTGiRhakUNCDBD0+1E8YTVIh3bJaEHpqxokJQkdnR7P5wnw8f+9KEHfMK0kQBE5TpyBjTUrEFF9KCkcULV2QBTjvj9IBeM/d48S0hHVJsK65UXKwxxknzKsTSLzTNixcuPDDgC1h0YQfAoFBrsLRbZCFEO1yEE0YY/LzQRBM7zQlG020HrWuuiZ6r6BPsCrGcuknf7UN/hEPzxQMLUNCDExK8CNgrMiO+hRFOhGMj5T1MMAMQM/zQBBRRFO/TIVVwjqLycnuJ7tFEh/7D9NP78MMLp1OQui8UTACO9gF3H4v/14gfQRFpYkQBhRMcdlFFFLPN5gUUYxgShvKIDgF3xqE7Efq61xOdf17Qnxj9IBph6EE7wPAF1IDBCU84UiiqFLfGicEFVhjD48bWjpowwwn1KwQVCqKr5ZXQXOiiVLrWJTrqubAhPvDBjh7QhF+MgTli6EEczsSGJ/igCCI4QhKMEJdX5MwJHPCCRTpYEVZ4QYGF+AKvTpirXDXveaFDGvWwt8UfFJACMSrWKzKlBSYUoQiXSwMfopCGNFwPByv4QAiCUIQZuEIMuYGCMTK4RCZqMCPHs1EVuuA8dC2vXOZ6ArqeEISNTa+FQvDP9LDXEArs6C4TjIIQjkCETuIA/wdIgSAYnjA8CYhABAQoFh7vCAUL+AExPACHReoRBi9IAQqOIcMTZOCBDTSAAj7gVRUVlaihGSFdRjjaD2YwgxcAQQbPlEEMYoCDHZRgBC0QCAUWIEGaQCEClTEDA4iAA3Ke4ARAIMIRnGWEFMCxAVYLTBg6oIFSPIErHQzHF7rAjwn4YQNkEIIJPOABHKgABQQ1QQpSYAIT3EAFKrhBQ02gAhvY4AY40IFGdXCDEtwAoxFVAUM9es09gPEBEphdJSqAATFgIA1mKAMKPImDE3jAAR44QTk7SYQTaKYXYZhBPXfQBMZ8ip9QaAIMjKEBA3TBCSLYQAmIIFEZ7AAIO/844w62utUVqGAHKmhoSLdahKyeUQlJSGtaixCDFHigDmCMnQL0togunEEmU2BDTMdJhCLUVAQMyEMd+OrJEDjhF1UwwhZi4IcJkMUCS71FNQwgBSF4gAEeQEEMirDWM3r2CGdcqxCTcAS0gjYJnC1rDKQZAxdsNgkqeOsEJEDbrFSiB2m4wBimcIaYFqCvn1wBYAmABjSkoJNFWAEDCPArpWThCByIwauEUQsaaGAAemhBCDyQBxUUQQkhMEF4TSACE5CABCBQKEVjEIIYQPS97J2oB0ZQAhkUIQQgKOsGTIrS/BxPEmBQgBngEIE2pOEMZUhAOT+JAsDWobgMwIH/X1GwXAn0IoRljEHP2gEPWzR1AAaYw3YZoALQMuADReDlBjwQghaToAQmAEGLtUvRFtu4BSYowTQ5m96y5sGks32AAmo4iSzQoY0wbUMGzrCHFZBzBSlwsBrQUIcUrEC4eVADbIy4FOF4AQuJ84EU2kGNGhzjDiAOcR4uW+IisPiMIdDudkPQADk7tKHxzXFDSRDj1RYBCOFNQgz2W9sFLCBqkcgCA8zAaDNEQAppEAEKkitcByxXDQHIgwNO+YE6MNeIP7hCuoKThcQtYQhdEQMMkGGAASADD3VQwwFIfEYPfEAGSdjBCgjK6w/Q1wMv/miOR/DiEqCgBDCe5g5k/xCCJKRgA6Ip9FwnAVo1NPoMZ1DAQuGYghAElg7ExSxOK1yji8HvIFxjwhLW/YTH9cAABqDDBj7QgAbkgbh4UAEQwBuDHbSgBbbewAEOsIGCr3gEei4BQUngARjD2ATTDG8MBL3fF8VhAfqh6yHAUM4V0KHRVV4olAHbAE8TQA11uKynFbC9j1BEillQ97pfFgMJ3HICenBtDETg7ZJzYAMowDUKXMBzGezhAD+uAx32sOJgIzvH882xREsQVoeWIATJzYMCYmfo42j8EEjQ6QpwKoIol53nlmaA0k9ehzyAO281ClHAeOYCGbjKCEBogQt6NwEgPLO1ImgAAzZAA//6xkAJMejlBz5wADzQ4fFrWPqKgU1fZBdbvOIdwQgIuoH8FgEPMOm6HbYsCSroFAUp2HQITrn6EHyAAXuINQFOPnsCBAgUYmiOsYQgXSDEYAEieMEM8P73EGwADwbgQA5MwIDDhwAP+91DAx5vFToUYOmGrvfiPwCCxde7AR+QAPg/UPCsOh7jCigAG0gfiTCgPsoEVb0ILssABoB79mjAAwMOEO/DgmIMfTIIHYQFVOB3LrAHCdAAMbBnHcBUrMYBPCAEGzBxIXAADbAAe7AHCrAAL7GB0nd0+wV+40d+IGBw81ZwKLYDj8eBlOEiTnB7j/AEp1R/NIhTllZyBAD/bgtwBwdgAxuwAA0wQdyCEk6QB0Cgbj+gAAmwhAeAGE7ohBqAZhAYA82nBIx3dI6HBwM3cHQwcEy3B+THfd0HAmQYAiSAYyogA7iWBCDgeOo3FcWFBrImBOgTT2FAg3iIh24Hbj8gBg+wAcewAXTQcgGzGabRA7NBhCFwBA2wOHeAB0yXDE+IGFE4AANwBzkAAmeIWvQmfd8XZ6t1VWdkBJxFimqVVqWFVqSYYhV4fFqIB7AIi8dncC3gf4zQBWpncgRQB7z4eLNXQ2DgAgVHfwzwAgAzDk7QA2pAZIvgBRHUDILRJxLgAEDQAGugasiQjZOIDGimhRBnAgp4imql/wRo5VlbZVVquGzTtI7sJWfbt3jhhWPsKF7kJ3AH0AKW0AR0oAYVwC3+yC3FAgY7d0rjRoMvUAVtUgAJsAYhwARZYAVG0HLp4xQBowVkQAerRwANAAQfQAfgcAfZ2AEgIJIdUHB/sH0ytl8/Vmfa1ZL0Nn5fOG8eQIbzJmPjFQMrYFachVbkSI5JgFakVY4ViAcWBgkdlAhGoFOnVHY2SINKeBx1wFN9hQLPUohY8BD0khQVsJF1sJHT9xRekI0eEFty5GeedUZYpYY7145yZGMtxl5wqQIrYFWhFZRKMFqkGE3r2ALt+Jb2lQQdWZShAAZEoAQ44AAp0GA8t5QNsP+BxrECSkBTOCACr+IEWAAOhNBAP5IA1ZgHMdAABaAbVHAMGnAAtoZrQDmKdXmKPNmTrdmTP5kES6CKf/Z3MYBj2kWGIGBr5Md5vWSPHwBeEmCLoJAFnSRcV2Z2qycCQpYADwCZUnkC88cA7nKUgiAGVRBCL1BvGNmYpPQCgMgBB3BrSsBsDSB9sHeee4CB32cz9CYB4dcCH9CS/xZn77h4BFePg2eCBLeFTGeBR3cAeyBoPyBGobAEnrRQVraUUSYBCSACDgCdPeVW9eeZXkMESRAiVRIRYqAAuwhoDFB3QGACiIEHLYBadXAAdABrWqh0jVcHjqeiMaqiXhigTIf/gitWj2FIUCVoaz66eDNJUBO3A7v5AYImBAYKCkOgUzigoA22eilAhQkQBDgABEFABECgXCbHACgQmUSAAiEABrNBKl35TA2wAuuUBNXwAOXZhRYYA3ughV4ooHNqo3RKcLzGa7u5m0EapN4HpLxWAiCAcEWwBEmwXUYaAkhqRKe0AtIJZcLlAVHGBgnAUw4ATI10Nw/QAlc2lz4wBABiCGJAB3Xgey0ABKVVBNXQAuVZcFi3BEXQAPM2eIK3AYM3a/s1eCfGAPUGhOK3XS92XjFGZ756gdlnMw0QAsgWA743eM3WAOQAC1XAAIh5Sm0FWMx5SubkbUqXADDyA09w/wVVUAVP8A2IIAZssAcRx5faRYkxAFq91ALfpVy22pjriXEfuAew94HHWmf1Jn7I6p44ZgKuZYYk4Hrh1VEkQGyaSAK4tgFYWSNPUH8MGniSulCnJHhrV3tzcECmoQYa+X1cR08agHVFsH8WKJ8WyJ5AeJ5dZ2jol4HjWbAId7Dj1VA3cFH9ZgQVlbMlYFEbpVE+uwOH+nVGWQVC4GmatpQiMHI8V38bm4MEsCZUYhx2wI/PIAYswAE04AH7NmK62kuCJwFqyHT7d3T/Sae+dEYmYFFAqwNuewNC228qsFE2ILR2C7clcEYgEE+QYDSnk3YecEoY623fdn+kqnRGm/+Z+XKd9VQD9QVbDad5u2lwDaCGIaCv9rif86V5N+BeO5C3bxu0OTu6crtRpWtRQFAEILA2lQAGQcAFs1KYSkC4wmVvUUsHNEgHHusJT8C1OVACK1BW9EW5m6d451mPBkdwG6B5I+C2o+u2QRu0F3W30yu6N0C0fVsjRfMh6fRXUbYHJ4dpAUAOTwAjEuACfrsISEQDy6cCpIhs17R5w7hiOEpQxjdv9AW9byu9HHW9FsVn1ju9d3u3KnCorlsJsINSe7BpZ/dtaqAGSJoKeESR8LK4iGAExJADhJoEP2sD8xukk1dwI1CC89kCJOy8AVzANmBefOle1LuwB8tnDpX/s1+VYy2cBCbwBIQIED2gfnSAmMJFsQxQdjIwBK4CBIkpAj1QARMwbQqsfDUwAjdwRhWFbJrXS1qcxSCwnhKQBDJQb2A4qNf0Yt0nAf92onlHY+j1AX8An2nctlUMq21rAmzVBEkaCk5QxCLFc3vwnPXnwITrwAtwfWyAwYbAA8pnA1RMivRlAjtgAsR2gePnsoKXxiIoficZfnUWXnd7A2r4VdLEAi0An2RIAhelUVmlBEXwUVW8A4sqKrmBEoLxBUhrdg7QEA/QBVjwfhhbdgsVAsaRAGDSw46ARDkwxVVcBMT2XUlAUCNAZ+sJfgUHoBZIcJpoY+f1wXCrAyqA/8oaZQMLi8U/m7OlqwLu9bN2vAMRCwk+tCMVgIjkiAPU6gEPgA2EIAaRNAM+8DtKjAJzSUBKEwB5HAkazMEbgKY74AEmAAS5dk2/OXkBZ3Cct6fOC84DDLdA67P8C8IlcF7oRbmdB8avIgldsABBEDvE/ACdFAJ58ALx1AxDAKGtQwUvEACIHEUdkMwjsAK51nAQFwLOO9RZnKe9VIKaZ1HlbFHCJsAO1cJuW1F7dl4maHAhgHgzEAWT0AMP4ALpRwdr0ACB5wKSEAZVYBwuIAFpUNBGCQM5wAGRuwKb57xbfLwJdV6aOFEQ91U6eZZ+jVpDVARGsFaoVVZpOE10yf/KH0CUkwASGLcGbHEZL5DAixAFWPEin1AFHEDFOwBaIPB0PBpeDAW6ZoWKsWlaQ5TaQmQEQnQErD1Egy3YsC3bg32KoBUD5HePlOAFapB+RKHVnhAFlMF+CrwBOkAEa1jYgC2OhV1Wanmbt9liE3WwMNBQMpZeujmC95mBEjADaNIDzYQfRGlHlNAD+xEAwP0JUSABOb1xIZBR6KyGMrAC69hiYmwHdRB5jzdwcipwkKivi7d/MzmMILB/bqldB8BwBCUEh9AMMCgJTcAb72IaUNdLeXCn+/djsKbdmSug+spnJFAH7LhaDF11FGWr0iSPVMjQZOgugrDe54kzE57/EGDwAXlw43mwq/ibp/fYl5/ZlXntVgfAXg8nA+ml18w35OZ1dYNWjwcAME2AByzmeh/wBes74xIxfzheBzmap6+XBy02cAo4fV0oq13smXtqArz0AX4KAgSwAdJEwzIgcALnf2FAAM/NXrGM5b4ABntQAt3meru4hQKaB1ooAgA3k+z1AmjSED/gAh8wopL8VTGQDeKgDQugb2H1UDKwww3UCi/gAUYQA4MKcU5gkXz+C0Kgju3VArwb3jjjBR4gTR7wUTKgAnk8A/pWx9krA3InCGEQAlclURQlTUZACHtsBLfuenxZ0qnuC16wbCkgqNPUG07wuVFFUC3AbP8Q/wUpwLOu/FBAQAIhAgZNgHVYJVEftVrM6gVC8AFoCgTofFWmztbPHgpUMN/0uO17ADD6jAPS9AElEIar5QLjOgM7YARedVGurG8yMAP9dgRYdVE4K+7upYZ4V1Hy3ez2fu+fkO8ycGttJU1xdqpJ8EzbRVCY9QHMCk1+p6ya+FE7QOxpeFUz/1FhZQMVBVHLZlVSvV4QFwOn7vG8oPCIDQQy5louv3OTO1/ApngfkIEUfWcPJVY4y/PvlYY+z1XLxlXojM7c0fFEr8DSlAI4JgKDymLkNVE8J14855ZEp3OrJd+rNQPQdPcPn/d2P+LsqHfQbXztPfaLgAVpOFAzGX8CUYrO0D3i7PpvtCV+EhBnki9eNoteZdiwmpj5ujmGNEmL3ST4nwAGILDteylnlYy2GZj6SkcBTSA8y9EEQgD7sN8jVp4zT3E5uvMUuo9HvI8R2nDloE8lKCzGXuimeyAE/tP6anMauhP8zu8IN1HKpewCWIAe1f/82J/90RAIACH5BAkOAGQALAAAAACWAFEAAAf/gGSCg4SFhoeIiYqLjI2Oj5CRkpOUlZaXmJmamV9fWl85X1ZWYJump6iaY1Y8rTStPF+ps7S1iVo8NLq7uzy2v8CoOTQ5MDA1OTW8VmPNmGLQwdKnol7QY2JfVTAaujzY0ZRiVUNIV1pi0+qWzdDu7V56GjBi7VhhlF5sCRI+5lrrNoHRci+dqnrXmjUD86VJk2vQoHShFIZNgDRrJAhBgi7gpScSFoiUAKXUM2hfpDTp0cOhFClOJojB4sWLFAteKkEJcDENGxdDqOBDRfCKl6GbFqxZuqZAgQVQkFJi2AOCHj0d/GjwgwCChQlkwrC0AOXSzqUYFwgZgsXgJgUF/+xIkOCki9tLFZYWYNpUgVRJYSb0QaCBg2HDeiZAgDAmbJecmKKsgbsmjR0Ka9tu6lKBZ9PLTf5O8hJgb9OlbBbclQQFQhMoTSywmN0Dyk2ZlsQMxHIFCxgwFUQqYLN0wYsfQu5tiqKAj2c7C5poaexojJYqTYRUeaFG7+kCEy2FgdBDCpYs6LMMGeIEAuRJYrQgmY+ECRP6Q4RQeKBArwQKFLjwQxMmPRNFD3ysoUYBQzDhhGiHYOGCAnbYQaFTe2XYQyZhWICObrplcYQQUIQTiXz32VeffffNN0QQPjxgUV8KwAXhJV9E8dUMMzzww42ChCGBHU4RiWGGa0hRIP87v8EGxg8CPCHEEWJ0sSEkYFxBX4r1rdilizCKBMECPXQRxWqnhOEEBRIo0MONXxhppFMQSDABFO85MtAh0GzBhQ9bbBEEGz0IYQQVUgix5CJaUDFfi1/SJymYQQgB5CxdCPECAVEcAoYRRBJ5Z03icIEEELIMghIXW1yRxRZZFEHBD0ck4YITRmSBZoRbqqjifI5SUc566wVRqQ9VLGrLF0wo4EQh8f3Ah1NR5EkJelUIQcUgYNjHxatXAHGEES24cIUnQTghRBbUJZLlpJM6Kmk5whb7Iow+WFuLGEw0YMeSVUjglAWpXpJlrmBkwQUZYmQBBBPocQEGFhI0QEH/FGHAMwRAioAh76/wDkvsyPlVKsQPPvjwhDRRLMBGE4RYQGQFu0oyxqtYMBGonw57kQUYConhRW1HpdREF1gs8sWjkLqIX73rObHeWvkJIUSlKKsczBhNLODXIF3EVfAzVOy8MxDpMPRFGDat9MJYRK+diBdBwBspvUFVvR5yVltt8g8oHzd2LUK4gOcTa9txpSms7pyFC2CkIwYUPVhgwQtAAGE1FE9E0bm+gojhz6P4AYuEsKePvJbVgJ988g8v+BB7BT/8IkYTDSiwAAVPvSDB4Jo0ih4T6LA9RhhRJP8YFl08Fsbzj/H5RDkhI7Ge9fauJbXVQwD+wuuwy/7C/37P1uKEAkf9YM0XPVBAi25ZNgMFPdBEXg84Co3xRXiFfFG33afDXn7YM7W+BQE5rXvBcWIXOwA9oAntOgUYenANMIQBGlioAOg2ccEqdSAH7wAHQu4XBtsYQgzXmxTJUEcs7vUNfN4TguxgR4EXuIBNSUPFONrCGS88IQ7ZGkIManWFmlViDF14CQs4UAOgifAdKJHCmxjWhSpUoQvEmhd+1gO1AgrBCQdsHeDGiLIf1BBA+6HZKbRQhBVoAQxwOEMT4GCGWeEABykQQQqKMINLScILUNAKB2hAhYTkT2hSgA1YwBCDEHjgAA3wgbFeNK+8CYsK9ZreC8fYNxm8IP8GM5CBDEIQgwABiCSZGIgWmFCEPEqsCRUAQxMg8IQJiEAEdEDcF2iCCincoRs1uIf9xBCG/SXSAhC4gxTE4AETMOAGK1BBCUQQghSkQAUhMIEKtmmCbqrABDu4gQ6KMM5w3kCbOsABNEkgAhvc4AYl2AAaHxASZUHCCy8IgQiIwM87rqBBSkDPFaLQghSgIA8b3MQXYMABHQihCVF4iUSbYAzDaOAPX/hACBiAgyKUIAUy2IFIiyDSHaxgBzj4Zjc9UAIVvPMGONBBSYtA0yIkgaTfLEEeWjC+uXwNPj2IwBvMUAY18JMIODhBHlFwAhwQoQhHRcHKbBEGK2yBCRv/SMwEJsCCDihjFxo4QBg84IE8lAAFMkhCEmpF0yMUwQg2tela1SrXWq1VrnAVqQyAYNMd6HR3bHrAAsoXCTFUIAOTS4MZzLBPpyZVBHlwAAP2eVQciMAFwDiPCUhgBC98gRe60IABBuACjeZhBDJQQhGy2UwTlMC1JgiBCmKQghjYdgchFaltt6kCsnZTBjH4QFpDkAcJ0DMk0ZlEE85QoimcgagM6OdjGVAHAqAhBfwsAg5CUAfCooI6DVsCquphBV5wQAMDSC8DSMCAEgBBCRuNwWrJ6oEQhIAEI3htfe2bAhPcwL4NsG83TVDbJMhgBDFIQgjw8J//8OenjxDD/wTSEIEwZECxZajDU/2ZAuqiAQ11oCkOVuAAAiwAFWHAAhWYUAUsYEELWzjCCzI2hlycF713MIABCOABBnigCEoQAQhiEOQW2FejIQiwgM9p5Gz6lwTZBEEIivDe+6a1rHP5j3D8aAgwqCENABAAG87QBjMkwKltRIEIPAziFNyxwyamRovZgoUqIAFWIroCNqRw3jsM4Jd3qC4BfAyEJMTAAy246Q4cSd8PgMAEIwDBa9/5WhKU4LWXNoFtQxqCHRQBBMXNckj4YE9FZIEOZlCsGQTgXAasQLsryCMDCKAGEDsgj8SlwwtMEQYqVKETbwxUFpZAbCN0ISV6GIAe9v8Agg80wMM8XkESFi1KI3tgAxs4ALaxTdZLw5MEZCWBpV1bAtuGQAYm4CuWQxISCnG5EEtwwGIVCwEMBEAEKxixmp9dh1rnwQMO2Cgd6vBuR4iBCl9Ih6OYIK5iy6AF5ekBAkhp7iTn4QAcGAEK4EpK4YbgAAfYw8D3wIANsDSnrgV3flvq2tkOOK2glkAckOvuSFyBCHQow2IX2wBrjpiaDJi1GuZQh6BTlwDexcQXnmAQaFQhBkAwghGAMIMG/GCrMyiCKGMgggcw4AC68MAek9DjDXxgDwegg9r3om0PgGDlmc40bC89grp7IMEfMDHN7cCGgg+CCnesQ6oD0PP/PK4A6EenNR0YkAcTT1UTXtBMIYTQgszJoGIymEHmgADcFoAAD7+kwQ40yldtH4ABexB5AdSu9tQ34PWONrnbnd0AZ3/A2SDYQAiSAAITe61GbICAERGBBH9S85bIRzwD1E6A5tOaAIvjkAtyyDAnDIQKRwCCCxpAhwQ4mQQd6MCNRXsHGlhBo9OGZAMWsAeRhKpGe2hA6s9e+9rf/gMbaPb9sb37EBCgRhRCHNHnCFhgUGrmAcenTwHHAA0gaGpABwSQBwzgZ7WTCV7gBE9AfWJABzJgBNYjMG6QAB9QGIdxGBqAYzlgBLp3BDsAcmiHB3SAB6k3g3QAciBndmZ3/3v5l3vNBgJSlmBFcAAEYCFsQBxooAbRcUEGBwS3JFk+FnAi8AFGVwcQSActMAckUAMNgAf8Ywn4lA1NFwYNcAQiUABi4AQGgAfnVYImqAF+Ngc1AANQVmXyF3/yh2S2FQMjRWU11YdvdVNJoARKkARA8AEHgAcwqHZzsIgEgAfY9kXAYwhY4AA9ZnRP6AHPVoV0gAVPEALntQF48AKDIwZPMEvDFzpeEBpkkCxd4ARMSABAwF1N4AUnWIskKH59dgdzgAckoAIpcHtARldqFYjCWFN8RVN8lYx6BVwxYGRnt234p4P4l23bdgAtwAhj8AJBJ4FFZ3R5QIX/JwtiIP8C3LaN6hM5TUAkEqAG2oJJSyAaX+AEVSA5SSMBeSADy8eEdPAsVVCLHGACINABubcHOehot9cALtgALRADLiACTWZ/zoaDPuiDOah79mVfs6UCIXWMckVXNLUDMZBtDNYIZ/h8ajCE1QWBJoYPYcB1TQhwRtcALpAACpAADeAASlBZOLAtDLN0VYAUYJATXpAAsQiLLUAH1uAFvxRWKQBupHSMcNWHuGVbTeZsLXCQSKZRGqVpKxADMlBTaiWIgXgEg/hWyAgEO5A5VBaIRfABeOA+jtCKTuAE1lBCT+AEZ0IGYCADOOAAyQdwTbgHNbIAEnBU0iUCQ+BDkhc6viH/CBVwbmoQhUjnQyRQGHjgAR+QYIN4U35YBHZFjIMYmoIomqOpBLUiiHA1dbjFjBdpX1L2AZiJmTmYaDJAB12odPx0SyiQR8d3S16zOysgiJWVAtc2BHq5BB2hl+/xBQXgfy3QAnVQAU2QT4aBBwzgAkqwA683g/HXnXb4egoZAs85ngvJkLblAnl4lSEAm7d3bfl3bdOIbQRpei+4B56GlKawBEilR7HGm3okAhKQAA7wAESQk/x0AmsWdCmQBYKIAzGgl9QnCEMJizIQYHsFBDVgGHtgU1tYBzCIB3lQgzEYg2kng2pXB3sggzIYcja4bS7qojqIg9iGejBqWzj4/5V7cJuXoJ+WtQIoQFu3ZE0roAAO0JdBQJZHYFlHlwcogFS7iSrzaAhOQKH6VAT2oQscsAdGkARoB0mNZINo16WpB6ZhyqImBwL05XZkBZtqqqaw6UhoiqbgRgJEpgSH5gEi1QAJNQlG8GYp0J9BugIzKaAr4AMiIElBoEnIEQRAEARDUAVPcCNTWm0xsKVJMAwcAAJHQASwyQDvpQRSiH8MIIUbEHSlipClugfwCZ6vFwI+uFnsBGVJtn4hAZ6OJmDltlYhYHZaJwSncAX4Fmv4hmshgAIOIBJORQTEGXR1oADGRQFfYEGLeQhOEJnjOauHAQKFtqsbkFZteaqCOf+YM3h6M7h+I/EBc9EAFQORSSYBLWACRuaMFVMxIVACkeZ5ZLV7MQAzpiA6IoCg1sR1PpYCuROcOUli1KWSc6AApzgITYAGDLgHcpE8LnCC3QpfXxdgz8YAXsOq7Sccvwl/Iddk4naRz4mrNnBuRRADJWADNuBa7qQD7uROLasCCuarpyAGFICA1nRLRScCInEC/KRmqOd8BEAHVfAIyPMCAVABBTMD3YBgSbACpboBJIdtUiiTq0VyIUeQhnhx2tYAaSVNN+CyNiCzZitONrBXMaADaCuzbhu3aJtWJJB0muCvepQC3BVZYocCK0BiUliFdVAHFRgJnaIqGoAMI6D/AnAlafY6AmSFtV7ZAnlgdi16bXZnAzEwW3F7ti4rt267AzPbuaBrtjZgsyGAs6nQBUEqAoOLgMK6UeBIBxK4AH6XCGKwAcQAT4W2cnUHue4Je/jnnjf4uyNwup/buWcLum5rtsyrvC6bViZgBLUwBPpEXHWQt1GYsA3wAA/AUw3bCFEwSDlgAmubBORWd2jKbe65bWvKbS1rusk7v8/7sjHLvOLktiqwsnbLa7e0t3mbsC+wp5XQBOQ7AjcwtmZbAh4QaZHrnm5ndkbWACOwAb/rsi2Lti9rAjCwTXJrA+Imbi/ltmV7Ti5rAkmgAqo7C0MgAh5QB4XXgBJAwJYg/wTkCwI3sAMp3LKPm3vX1sCQO5ALQFPb+XbHi18gDAItoJCVVwTP6V8vSwLNpq4sIAEh4LI6XATmawIk1b+m8AW3NFm7+Y27Rgtf4FU5gMCFNm47oAKRFgILAHuvF8e15wItIAHOJhJ/cHtL7K7adLZQJwOzdcd/MK8gYGkvdQNFsARKoALu5GlevAljAAR59Kch8ACPNwtiwAE5kAMboMhkh1qCaAJu12x2OI2up23YdshH5qrm67zoZgJx203iVncZHLdfKQMvBcmpEI+VMgSHN6w+tldY0AmpIAYfZAMboAKF5gEk4K32+sCyJ6rchn9xOgL4ZWnJG7ckcLZle/9pJ7zAmwXCJABpkeZpIUDDkQAGa+EoRaBmuwmgVfC3KKBmEaoJYMDJNeABilwE4yZk+GW8RqymaPrD+Xe8NpDBn3vC8Su/pgurJLDKFbxtNLUH94wJYeADCnMFDXl41MUAhgqYK9AAE1Am4UuSM5ChI4ADcAXEdodtdkdf+XXIhwxlA7ZNJZXTIaWHOd3TJaVSuXd7PvheMXAA6my4x9EC/6k+XzAEKtCfDHDJXlMAkSwJC4XALE0EBLZSjpRNMdBNPO1pHRmaZDmIdnWaZ71WpqnWSDqaczVXoxlcB3DRz/AADSACKKCnhAAGQfC3KTAcBbAgt8sIX7ABOkAEXyn/jMO42B5ZU1uXh824W7c1W3kIkpBNSjDw1eQZ2eZ5xyJ51I+gBTKAfA1w0WIQBCD1A1PNr5sgBiGgTjcA2eb2kPKnACK3BqzXpdqWB3jggqlKjVWLbdp2fxEZwRswwF/gWWujDRPgApEYCclNE1iQBHi0ZodrCGMgBAvwA07wAAUw2IwABiLAwNl2cXmQByQHtgcAwwwYYM5mg7AJkDu1abb1Ado0YKR8j+ZpowgIbivMPF0A3tLzAt7rvS4w2klmRNm43QBy0hH2AectgaXKpvWVr3hASvEaAyCAom7XTcT11V4dAyTQX/etAh9QB7bVwJrGABS5AeUjJL2tbS3g/+CIcHBD4AMtQE+/+QJ0TQhdoDsSwNoC4UgS+I3/xqZm12N5IJ4bkAcfcJVq1wAmF9F14AImYHKa9qo+6HYHkAe25eEhSZAb0ACSowAMkIfrmcmVkC3tRgdpoOY1/psCvghicAAlsALZFAIQaIM2SLuk5GN0GgIu0AMvMAOF4gLdqgJSfANAYAIKNAM/MANCQAc/FgMInMAmwCNMJwhRgAecF+KiyCEUsAB7YQcnHQUvc8xPkJaNtJB7sECC4wV3d2j+Jcj3HAUn5V/mi1tJqyoNkJbcpJEmkMlfQAcrYASx9YMbANqLICRLoaO4O+ckqXX65ZV/4QQJ7ML5mnk+Lv9furzLogQZYvhq4WS+sY1uVPAEUFAFISAuX915McAAPT4JYgHtHiEGQLAC8MoALSADH3AmQjMDOCBKrgqfXukCVuQEKZB9LpXIU/mcCYaWLrVNN6CR6Iam8mUEbRxSq9WMz+0ROYtbwkVtrR4DK5B9o0RfOQh1XslXX43N7yS63yRKyRgD7yRN/lXxO6B5aAkEOaUC6GlbVQ3yrT25e+VIQc+24213KremtiflJodp57RZ3ZTDiVzxvJX1FL/13BQDK0z0s+AFKyADKfCujgS5+pQCr0VNsRVbrrmeF7lbISVKW0f3XsnznJc5abn3maN5ohRK9X3dYD8LYWACggx/uVB2TXmY9Od5njme4+7qruO5ue/61V/+fTBA05o/kRMZjXwcQYOvQz+IngvpjPeHeizKnao3GdmhLq7/RUYwl1/0Ra8/l3MZ+7iS+7G/+/JI46GvXCGHkL2NdjW4B7PvBNxNTBak/Er4+85fCSl2xxLgAl6wPKTy/Nif/b8fCAAh+QQJDgBkACwAAAAAlgBRAAAH/4BkgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SMVjw8Oak5Vl9gpbCxmWA8NLa3ql6yu7yQVjQ5NRy4tjxivcjJg2NjX85fXlbBtzRWl2BaYMfK3I5jYmLf4OFYHbcw4ZRPPkFDSNnd8YjM9PViYFIaw1bh4JITadYooOAOnryD38B0gdIEChQvYcR8kTLBghVm4LBICqMgTYAAbCgIQXIlzMF4Y6JA6KPnjh49fiA0kQLFghdtzMI4mSQGQho1AdYUEDkEyytN9+59+qKFSpWbnnpWZAHDhIkOGvT0sTChS5gvYbxIaVIJSho2awIqcPFDCBWjYf/AxKXkhIKLF06efNmGKcwCOwXs2JHQQ9emnhawcNnChcsVHxv89IHQZYwThjYtRbGjwM6azwNf/Bjt48ULvpDAWAAaeAEFJyYveVHzubbQCYYzeUEiJkzELk1XOJHS45iYLoUjgVm+/N6PBw8WLEC7ho0C6QsUVEAdKUwUBbU5/4BaCYLt2mx6pNZ2aAwYLlEqZMmi4M0TIFdUd6EEhgoS/1QwgcSAQwwRhA8PKBCFF1002CB3lIQhRRQL8FGABEg8UUVsjHwxRF5XgFcAddVNACEi2CAxw1GEhMPYFVlskcUDE7xgBBBe/EDFiYqAccWAAjIhpJADFmlgFSyG0iD/E0BE9wOHh4hBRQsIdIaAZwUI9ZkEUC7ChBESuFAFIVyIkY2MSMx3RAs/BLGEDD80sQQXqfkX5J1DCkhggUE8gcUXo3zxggsSKJBAFIk8gQAbgBXgqKMlRsGjIWJwIUQMKiJxFBhHpDnfFlfIIEMLEiAJBhZPODGnI2JgUeSrSAQJ5Kt8BnHgELl9olMLD3CWSA+BPVrABBNE0QWgkHzBRBYyMCEjY2AwUQWMzR0nAQULivOFE0NMSsgYP74qa5H+ITGEfwXWKoQQPjyRpCe7uVDAfoXcIwGjBRTWpSRfIPHsFgAfMeYXWYzTG0NSdCFWD1BA04iPsMJaLhXpVlyg/xAG+sDuk6Jw4UMBZBECRhUtCNbDvpWYCXCMWcQQxhhkHCeFE0300MMML1RggQVOHItyIWH8FzGs55p77sVDrBvEuuz64PQToXhcgAItCoFAYPR2wsUS8zEhRER76VRzW0nnFUUUT0QBBcyJeOjO0ARSnK4QQXCrtBA/GNjWD06/8MTPmDwBWNaCYx1Kv1QU8YV7LnghhhdYQCTXV65EFEYTk4IxUqwRH02x0esmTTfeTI9G2gs+UPAC4Jc0YccEg4gxgR3qjSIROFB0sHg99ISDERg9sE1pE293bq65cte9NNOi7Y26aYOq/gAF3lbyhQsLYBEFFmL0sED1mLgXlv8UHXCwF+/oSwhFIk74cPz7RspdoBPLi4636aO9QIEPP+j/wvROAF8ksKCAOkxAAhKwg2hqJ4oxXK4HfuAAB/iBPnqMLzli2B4hsOCD4tEKeRZj2rr2hj++PW9/+qMAdHLVFwXcRAyrC4P3WBgKGWpAA8CICDh6F5YujGUCEYmBCDbQgiLGoIPG888TKmY3EeLPNPnrH/RURwEVSuBdlmhCFMRxE/c8IGSwcAIOaRCEY00OGj5sggUQcIcOhMEDIfCACXBQghKIwAMiWEEK8iiDHQBBBn8EgiAHeSMhCPIFMxAkIGPAyBXIQIimcUEVKSCB9WECDFkIwV568LcmVIH/CiJogQyUcAUtlIJ8S2ACYZpwGYb0AAY1oAEHsvJGD2wgBURQQQpi0Mcd9DEGKghmHUdQghGMwAbI1IEydXCDZjYzmCogQQpscINiNkB6EniABLZzDRR4ID9NUEMEmpCGNDwhBThAQQpUgIMi7MR2/lKBBj5ggR50IJbU0MAAnBCCEOTBAzeIgRGSkIQiHIGgBiXoQYtQhB3sYAUOxQEQGLoDhhZBCQotqAxMUIINXHOSCFwA6xyhjeVEgQ1deMIZKtCEB6yAASINgxbAKAoxLMEIMdACOGqRTwMMQAIf8AADPLACgobABCKwigl0aYIQxMCXFi3oQqVaBCDsgJcr/2CkDApqgg0MhFCULJQllaMFLWSBCmW9AheykEouVKEKTWDAHhdgO2YQwqxGCCA4cmALYehzAAZgAAmGOsoVbCAEQDCBBxZrFWNWEwT9DIEKlnqDFnwgBHU0gTFN4EsPxCAJKdiAayapQgXQtBFiMAIOcECE1q4WBaslwglaCwTWEgEHItAIKD55BadETguLYVJlxGAFCd4QsPokwFA9sAMlxMADLVCCDCLbgBBYNrKSte5RW3BU7VplVErYAQhMkAR/LuBaCJSAdBSAxUR0IQ7lNAMDWntbHJzAAyk4gVyLQN90NiBrnICCFlBFhRe0g2VLWAIVtOGFWfr0DhrAQ/8dCKBcD8jgCCuAo0XjGEcPfOADHC0BRydrlTqKmKMh6GMSYkCCz5qXkmHNjh1GOoguVGAKFwiAGcqAy/quQAQMYIAD5iAC+hYhBQxQAI0jkRe4UExGTEjwTWVgLCggYAB6uGwIGsCAOqhhDhsoahE+ICruxnEDG2DABha75jo2swQkIGaIOWoCRhYhxUkgQR7SG1IZt9cQYVgDBsQwBTbseL6uPQGSJ4wGNayACEXAbR3mAOC+DAFZZNBCFYIg0JsaYVQ04wovGdnPBtRhAxwYwQqAUN4YpDgEGzjAAfYw6wOsmQQlNgEJFusBEoi4jrx0agoq6oE9x7hQCmDDksn/eYExTOEMZjCDGlyLAz06oA5oaLQHqr0CB+RBDYjahBCewB1BxQAIN2pBA4RALD/+MQYP8OcBgLEBFOygvGje8gHowG86FOAAHgABMX+tAjhb5QYjPjFHXbxn9WLHDmyQAPjEkICzREAOaYC2G9pZhBWos8vZVq4IRs4AOtRhyY5wghOSZJx1CLIFCnDAuRUZgxaAYAN4gDANdgBHVtta1rTm9xr6LesGfEDgI+g1MUlAAhHsOs4jAIFnkwACOpwXO51hw2kRoQU6xDcAAMgAAOjA2mqjAMgTDoByHbDYOtDhB5oYgycxHbMFUOEIS0AC9hKQgAVsoAOAl6BxNWCA/ztUo58M3QNMG3CdzgCmM3tYQAP20ACjf/gDlTd6A4Ba+Q9sAATlJQDWBcMGIDaCCSEoQxqi3YdnM2AF3BbBB7qsBjUoN8h7ED3KFzGGH0RhZIVQQBEQiYXc04EB+hB8+WapgTsMAA+qOEAIjLCDWdMaD9ZXwB62T2ugb2APmD86mscv/lh/9gOiz06y0/MIJuBg9dE+wxnWkIIUrECPIQgyHQiABgLUgQEEoAYUQHcpcxlkIBcx8wVXMAR7cAQiYAdkMAM3pA/JJ3jM53wDUAMwIAIh0FwhQGvct30MQHkfFlkk0F0oCAPdhWuMdG/VRwAKEINooQZ00AOSwgjuh/8CAVAGO6YGIrBHPwZkpkZhAUhhdWAAegB3UYJyXvA1CRgzeaAESxBkQBACdfA4E3hDErR8etB8c4B9cqQCDNACF1VQFsVQBJUESnBQangEa6gEb4hRS9CGClUEMeB5eLAH/TYHfEgAd3AAQoAFEcF1sIcCXdYAI5eIWyZUbqcGCvACBNBrBzAHuiUyULAAa+AFMGIFTtElX5Aq23AqZDAGE+AAR9BlQNACdCAITmAAN7QBKgACN+d5kAUCJfgB3Wd0LiAqo8ZIZgZZ/VQVIaCC29VUJmBml4dme7ABnvdh32dr44dmLYAIYuBxZ6eIHMiBQZYH+0cACdAAeMABNQD/AnfwAuRBBk4wGBRAByKAA0rgWiKwExKhIXzRKtsQBnkABKYmAw1AB15hBBN4AHf0AeemUBiFUEXAi6VWeZTXkM0IfswocLKIXYykAr1UUUaAhkWQhmZ4VZ53AHggAYkycvk3VA6gjULVjwRABwrgDBSwARowVEHGAG3hBNnRDvP1jv2VAkJQBVpABFkAD2OgBVDyAqJEAOpGB1CQKqjGAXgAWUCgBAz1R4AESGhIUHCIUVqZhkWQkWfYlRyZlWpIh145SGY5UUnghjKwB3jwTocABkA2k0HmAQ5Qkm5HYftRjXR5R2zHdkDWd1kwBA7wjnDYWidwR1zzjjggBENJ/0MKYHLT1QCoIwMgIEF40ACjJALbJ2sHkAchmHmVZ0S7KCpWOVET5ZVVRXOMVHPY1U+yKHU3t1gfBgIxoAQhQAc0RAheEGR1kAf/N5N5kAArWQdkIQZDEAKJmJwj5wAKIAFDQAErkJWulQK++Wg4sEtBEDlRQgEMAAQxgIgXVgS2wAENkJFsuW/oaXIHUAd4QAftGXT7xm/Wt32Wd3nNaGvL6HnMGI3MKGuxFmucOWsJSWmLQEAx2BnXcZcEIAHI8gV7JALqlJx7FB0P4AAPQARZ+Y4JCR0y0A5VgAXcQ40FsAd/lGJAMIfjGQJHUAS11gI7EAK1Zn0xCoKc2X3+if9mtsRmnhdwPGpLQbWfzQikroZmH5CQLrBkBnMPS3k2hHAEZ2d/9feD9ocCIZAAJ8kO7WA0H4I3f9MF1SMGapAHj9QCvCQqNSAMJrCislmGO5pmDOB5asYAsqZmioejlwdHPAqbPWqLH8ZrvJZ0TBeV5QVHK+aWmbAEUqpHMVB/erQCDZAAPrAADzBbrtVtAIgGFMAqAVAH6pZ5LbAHzBcCG6lmmLliM9kA6hd5tMZlikefqIqq5yUBRodZumYCkFV56uVwnVeCIjZKd8aM5aWEmnAEjFp/xrqoP1ZF0pFH93d/QEZh4cYIYsAHCrCSC/A3ZOAFdyBBIMBqs3cADMD/ZR6VHR8geVi3AHvQeOsFfhLgmh+AQJmHQNZlFWQaWerWrhwVddzleZ/VAIaKCUjwYyiwqIlorLwSgwtwf1CaAvknegJECBVgIoNQBXcQSyMwSh0Gp8z4ppi5A3HKfZN3fbPWABUVYicWTFZBTTZwbkWgAsj0a9TETC9bR1v1AX/GH41KkpH1gw6gfgkAoc7KgXlAANFaCU4wDDlQAkW1AsRkTElnSx4lKriYZjeqZjxqArxoAzqQTMiktVrLTE8VA8qUTMu0TDeATBUFArvXCF+gR3uUf3kwl/mnAI6iAI9GBHqEdtRzCWIwA7GkA0tFfQMXdVHno52nZuNna057/0wI97XL5LVlq0wue7aRW7ZdawIMtQEP6whLcJ0kt390ELdBBil7UKkMy41rS40VCwwkoAIMVQI2UExJN35QG40eNn7H1LVd+7iOW7m7W7k3sLVdy1BqywlIgFtot6DYcXVroAYJ0E7VhnZFmzI4lAM2MAKuWwRni0xJV7hr9r2vuWUNcHNOq7tey7Uq4Ls2YAK9W7bBy0xpu7mNcATX6U90ML3Z6hESsFo/Zr+piyIbUAM5wFEVVQQm5gHFFJtrZkxSt30tsGIQGWewSwK6a6tFdFXpO7Y2wHQggGvvu73bawMqQHU3Owla8GMl5wKI4AW6EAQPamp1QICUIAawFP8MNnBvTLtURaBZWyZ5HvWqoVlzsroAf3B0JDCR70qmdUZ9ElBESmWLlccCpDK5DBUDyHR+8ssIYIAD/lQHlUYpVaCN/1eJl1BcOZB00cm0IaCGRSB1I9DDRqeMBzB5mBeR92pZ3MW+aNuCOjAqpLJ5HexrlNtcS1AEyDTCIVDCkqAFRaCZDEDGiRDGVohk/3sIRiDAG1ACn6UCcoRuBTcC32tLUme7ttvBUcd0v7u1FDy2TNfK7MtMynQDE6UCz1ReWbwIS0AEIhC3XxwlMpACHlB5lWwIToDJfawEKeBrmuUBi+u0zMxra5ajSHe9sBu5zcS162u+yMS+uGZwcCb/Yit2y4kABrfFZR7Qy4ZAzh2XB0KgCV8wDADFanHGzE/bZosldb3Wyq/5mux7zWd7Ay5bq5QVuyp7tnA2AkeMZgI3ftEVArk5w1SAZC6wAi/QCD+Jtw0wzIdwtCVABM0FBNBkjEcVA3VmAhC1AxIVVRuZlhk1UAc1UGm5kV9pUQ6Fsrb4fRNZUB9Q0YfxUlWAYRMHBED2r3zLACWgA74Ulhy51EnglRlpmn4U1VY1URaVkU191UdgBEdwUFmdoSzN0hgFa1t3CVSwAi5QyFQwvykQw5wgBhxFR01lZtolviH7mPymh7W2jN23ZrYYcHxqi7Von7VoXUXUAi6wmozk/wJ4KKyaAAZ3NgRKgANVIDyIYARr/dAzDMwMkAd50Jmc3ZngGmt1QHkc+4GdGWuLpWezSl28JnW7hgfYta/fuwEv8AyUUwU9cBdj0glI0Mit5TKKIAbTxQAa/ZZxhAef7WGLxWFwBK7TVdia2QCfZxUqANuraZG2SmJLZQJ5oAKIfYe9dkftXAheEQo/uQInUAQt4C1UYIgMgL+WIAa8to148KZs5qP/5AJpRkS3SQdBFQK4VgdH1WslPV5KZasCHgMC12KwdnMbADWCIAQL8AF5gActgNmWAAbveEcJMNaDAASG2AKQzLcSUAJ2WGoEEKC05psEuaPAJJ8geX2MFP9wJXBVazabIACSWaVUroafH7ANP7AHTmVmLiDOi0DORBDMhfIzVWB/DFABnhAGfrRLThUCUvQCVQANB5AC08W+jLQhvuEbUbABIJ1ZvrRytv0EHpCQlCUDKtACeIMsYUAAi1RnMbABxY0IXwBpDlAAvQIBh9DkHscAsNMJYuBLJgDMKfavWODdMsBrKTYDhTADfkTLz+SdfAEGLgrSCIe1vFQILqCiCn7ErqbIPNHbEqAGU0NXhQAFDRClBuQJYPBHx/gBogQCtf04LwB706WjvOQCUZAXL9CVlh68N/BIMVAFT9AERdpQjQvQG0UFwf4EonQEGyVEZPrjUY4xFLD/AGpwMoXgBdchAw+wB2tQ6G3tSym2w7u4miuwor2edPY9aiIgAzeSAnVU7BbpnR14BH/kssHUTLzYwSlgUEAQUKxGph6Q54ewRFSgTShlCF2QANs0HXYwVoehAkCQArvIYSIwmq6GWanda37tAvX6eb1GTW9mFb7kUM6EcCVAyzcsKoLkS+t7A4d92NrOCWHwAgWCPRVAgJeoANGRbBieMhZJ0k5H8kjFUSlgFSsoi85IgkaMspPFYtQNTVq/9dC0A9AE0AAfA0Jg5ImABS5AKBOA8YLgFwugP9mRiZ8ABsIGRyGwS6t52L343Tmf81pFmlQ5AzIA+IEPSJSeSDtgqPiDVJUz0IvT5eGWEAYS8AJQcCKQ/wA/0O3gcfQzfAC0yZqWpXm4GIIgawd6KCzaR5843sG1eMSsHwL7/Pr77Po21wKmzhOLkEEqRzOD+Ald8Knch33u6QJC4ARC0ATFP/y9IRf3YDnKbzm98fza4PzO/wXDn/t5lVdTa+s9kwzQwMKOczhOUNgUUEQI5ATe7/3aaejerwXeDw0zcPYuYP4yfBL0nwyBAAAh+QQFDgBkACwAAAAAlgBRAAAH/4BkgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoiWBfWjw5VqxfqbO0jmI5NLm6NDk8YrXAwYJguDQcu7o8wsuzrjzPMDA1HDW6sszYo2JWYt1j32JVHcc0POBjkmJg3dnthd9j3uDqUXp6MGDxYmGQYk9DSJAw0bLOXTZ98Lp5CyPFgheF8aL8cgQGAhsFEnwApELQ4DJ1Yro06WHBQo8eTaQ4sSAFZBgvTfg9AtOETYA1bCT8GELlShgwg8BguYIFncdRY7BMgBDli08uTyT0gTChpRQoUk5OopkmzZo1Cib4EDKkShUqQ4YIoRDlKNIJL/+4hJHopceVIDKgYCUTBorJiZOgfP2qpgDGCj5evKDwQIHMfgXdLooXZguYCki2IGFDoQkQLV4scHpiR4FpNmuaPJnAekKPa5Gq/CD7pEsYwJnUidoHZouWLFu2LJFQQcYRIV2EAK2k7ieYJw8e+PBBYQEF3JXASJHAxs6CBhN+hIFN6bmQF06Qk2e+nAwYLVy2MAnCZImMB06QGInRREgW7I2M4VRABBKY1hBB+ICFc5mE0UUPEkxgmgROUPEFgI14ocZgBXQ4gUQzYUGIGFwI8YsYWfxmGRYthCCBEBeKgYUTRmRh1CNiXCGQQEz06GOPSACUVhBBPIHFepa81IT/C0gk9kMVGCIixhd2DGblGk5QhIQLT0wkxhFVCCIGE1yIAU4XFTjhxW1TSlGFiJCEUSCPP+7IREAHDkmWF5yEsYQPDyywwANQKPKeE7MJceVXbIDICBhMUCFBDFmAAQYXM3ipxRdhdOpFQ01gBcVJXvAJCRgB3XmnnUCuimeQeiY4hKmZVPFCC4ImUEAiXwwhgR3A2lHAV8Mu0MNjj94KhBFMBJdFmIQwdJIFLswAhGIoRdHFgo98MeeckRJIBawHBoFgEEIIMZ0QyFriBWMLmJbID8J2OKwdFfRQ6o2NkMgEK81ukcURTnQD1DdhPAHFE09UwfAT2kYRBRRdOCIn/0DfBjQuWjzliS6C6aI73XS0XhJGFUJI4NghYihgr2trVjLGuGQ6m0URBY8xAyzxrBNGQmyu00XFjMiZcYF5HkhWukyjO5sPPyRGwRObZOFCAW0VAgYVCKzxYZTpOLVEj0t8NkYY1ZgjzznxgANFyYj0KqSBQcLKcVpLq8V0ulH/4PfIFDjBbyVcXC3BiF/MIGwPYFsilBEWdiNFLr7AY3lCYIjEiBcY1+15x0LuzbTfs5H+QtQvUOcCY1RjgkVjdjz2bgF2QNG4JvtIAcMxOaxj5uVnf9pEE4uIoVHndc9drhN6p3v66aYnlvr0FFSP5CROLMAG8YI40aEFt2sCk/8FepAzw235KPSSFFI0AUHBP+wQgwst1B9DDED0EMSO34KelhPo2pvpfqCYxEiPAqur3gN6oIkwLEACj5lAAdoVCjFcZQYG0AANliCEKJTqC6W6ShMm8Ac9aKALDEgBAzyAgxSUYAQe+IAIZCADIACBSEYwV57+0TwhlO5vqSMgARejmMWsLlBwm4QXfNACCVDgBV16gWhm8QUabUEGfpiASU4SjWrQQAMGmEEDSPABFuLABPdbgQpWsAISlMAEJbjBC0lgghvYcQc62EERdkDDGNCwjzFogQpkEIMQpO6J1ZOAIisQPkWEwTs9iAIFKjCBBbiAgqcAw8A4IIMZ6A7/GV80QBMa4IE8eOAGKgCCEoqQhFa28ghJKMIed7ADFZiAjqi8gQ5wcAMT1JGXtUwBCW5ggxuMgAEuWEz14LUATD7CCVUwSpfI4AUIBqMKWQDCFcz0BWRwwAADmMMGRPCBPKRSCSoQgQpikIJBDlIGsjwCK2HZyniyMglKwKcr6+nCUlYvgQ+opAIKNYkvZKEF/zGYOrAghApcaHCdsFwhrCCfH3jhG1bIBQc4oIEBDMAABwgBAzawglWWkZAwHMEISkACD5TgjWj0ox5pyUc+BjKmLYgBK1XggT1UbzFODJQCsiQJMKwgBUEQQxQW8LYKPCEIIghBSXEwkEZGImFI/7gCUbDgBSz0RmBHGMI3vjANDXT0Dh0lwAo9oAJ5xjCWDShjCFoUAl+G4K51NYEKVDDXD/gSjiMwATxDAII9bsCniXSioBTAyHSswlIQSMMIz8CGJ4gAB3c1wlGTeAkvREELQniTupgAnCws4bRGwIIYvMACA9xhACY8QB3qgIaRosAIRYihDJIABBmEwAMeAEEIPnDXOvIVr3+dKx39yMq67jEPDYjQAxT5wHhNMDvPiYMWenCG4TUABXVg4E+sajEncHUiXdgfEI6AWiO0wAlXgcAd/oDXBjCgDmqYQx5WsIMkhAB/6wRuDDdAYBKMAAQrtSMc4fjGl/5Xj0DwgP8JkpCCAwxKkdSNV1jISwaFiEELSsgCE5RAWipEwQUiWIEIHvCJMQjhCSVbqAuWZYTehsAJI5zAHwsZggbk4QAcGMEKVBkCGaQgp4c9QB72sIGRbkDCcLQlDN1YAhW8FI0tkF8M/LsB6yi2ugrYni1MqwQiyBIHREgzDk6A5hWgmQg4EAH3ONGFWSECOkAowgxc0AAgJHNZfYxqHvBQjZXKQAkm+MAG7rqHJdPh0Uw2sJUZHFwYLviNMkBjkf0LXQpgeLF2aBQjUJTmUsP5BKhm8wk8kIIilDrOeZhzJrrqhfZ0+AlfoIIRkODnDyQgAX4kZAxMEAIC3+HY5WiBB3b/+4EDbOAAezjAo+mwhkc7+wMrbfBL3yjHEqDAlymQowqSYII8PDDDp5nA7cQAhDqsIQ1qeDOc48wAEZyAAQQQQZqLEOc6EMCZkvgCI4syIjoM2Qi+SgAbEtCAjTp8o2bVAFppYIUHkCDPI23AdxZQr0cXYA8ab0BcQeABEpCcjHcFAclH8OQQ+BcP1V1smNXNiApUAANvMIMZ1FBqfp9ABHmYbQDq4OYirMABdZgD0S7xhS79hAzo6EYYGnCEJophA3fAA5A1sNFxOFziA7hDLxYtyz2YPdoHaMAeTBOvsx9W5B+I6wfiPvcPSKDuG/gAuQlwbtNUieaLiAIbpjCG/wsEQOcrUDMOVIxvNaAh32xUIR0WwGGWVYFPHxbTC5aQBAYk4AgpoIMYZhBxsz4c4q71qA1gUNdDhyDa09Z6tGc/ewJv4A+KVrTtCaz7A0z4A3zXcKgrAFFDiIENaSA8FHReBn3jwOgoEMF90fD4eguaDj/orLYEwSkxMeAIWWDAHoDQAtGPAa2m78A4xmFCPcwBD3gAgQpS8IEWFGGVstxBb/Uvy/73P880VVMxsE4DKFPytAfBdxprcCzFRwha0BUCgAFxcAZmUAYNoGYrcAIiRQBoMHQMsEIMQAd7gElK9Qtf8GIwghvhEAUyAQbQ0j0OsAT3BQQfQAfr4AQRd/8AKwBcdYdXwzV3aNcALUBDQKBHRVCERygD+sd//YdbTthKRlBPuBUDzwZ/CiAsdEB9BEAhF4IIVBAAXZEGAdAGGGAGDMBvi5cCDtB4aqBW90UABEABh+AFC5AGEmAEKSACHrCGLRAFYOAFQBBV0OKCKqgAMtACdeACe1AAUhAFRmB6T+YBm6YElFiJsZSEdyVyC3B2ZncA0OaJuqdyokhYeEVcPzh3eXdYtueJeLABrUhgM9A6hMAEamAGaaBzFjAFZiBVaSh9CMiBBEAHcDgHA3A4hdAEhhFvlGhqLeQBbsZ4XjVNheAEeZAHdBADDTBUBLQBG3UHHtACSXAEwnb/P8GWZ61kifWUhDtWSC2ARpomAysgU0pohP5XBFH4f3yUaKvYAIYQfjqncwAAAGqQAinARiJgX423hRKABzbQAvC3JmDwE12QABIQBA6AA5W4jHB2WYsnA0FABQ/BMlBQB30WAwxQZEBAAsZwAB+gSjV4AFpHB54IbWoncnNVjrLkShmJT0pwBJSoT5UIS7hlj0coS3lmjjpZBCEgbURFCFSAA3Xwj2UQACKQh3koUm8Yh1FQB9zIARuQBx+4VgrgAkPABA+AkWWWlqVmLgzzM4tAByX5X+uVBBpFdUUgk9K2B1pXBzLZl3jQlzJ5dpsId/bjAuQYSOzog3WVcqQo/1zCZYo5xUofgAdJRAUnsAIMoAZqQAci0JmdiZUh2IYe9AQh4I176JkOIH3qIgQXWYn10SP/IATSl33FowYNQEhDCARLsAMa1QJKsAPPtgdb1gKfOJPFCW108JeeOHvGuXsExmS7p3vO+WzPNlLGqXfll0RisAIokIce8JlRBZp8GYz8IAaeeZ6dmQLW8QAO8ABleSdBcAQ2hGY4gAIfCHCCEAZwGUhzdVck4HAxcAQ44AGLlgRLUAQrRGAZ12RoZ3bB6WwboHIlJ4nBFUMV+gESqmjB9QELunvDtZxJEAO0aQiWJX1r6AAUuoYNMJ4EQFRUUJV5mJ4EqYZukJo+MP9kOCBvZQZnmMkATYkITWAGdbBkCrAAflM+ZhUC8sShDaBTJrAHDKCJbAelTdZkI8UAcaeJcEehJNBSBkahdVdGAjahJqdKRUByehcCQiAlYRmWe4ilDGCNwkib5lmQVslObIQCIbAAPuAAcaBvzJij0HdfLrAIffEEATABsNEEBlADNeABrDRSS4aQH6AAWqpx8bKJgrKpe/AdcaVINvlbwuUi0SUB0SUoIgcCpvhG91cEZTRhLcBZguAF9+VvQxqWe+BvBDABMvEEdpoC7JQC3WmQD1AdCnCROdpCM4oC3OkBdcAA12MIWSMmIHAMNWACQOBfAkZgMQSlEsBH0Vb/k4MpgrN3m4XUpcPVRE1UXL6UU4RVf9HlVyXgATEwA8XGAFu2B43zBRIjMU+AqsJoB01JBcIarAQZj0elYjK3AFXJrDPKTp5ZBx+wArjWD3dQDTqwRoi2bSpFoAQ6hDLgZDNJYJ7IeyEgSyZgAzaQssRkAyWgssW0ZUWgAsXkSy+rAy77Qi5lAnq0B7b2CJ7VglnQnQRZlUYLo52pcVdYACsUAuc5o53pASnUnS/ws4lQBRqUAztQAltmZSvlAQfGcou2B3PnZM/mbCpVAiBgAwSoSzqAs3BrA2/7tuskA24rt3I7t2+rshMmAxuAn40ABmUWZzGKVw7gtIibjR3C/wZ0EJboGaNu9nw4wACAOwhCwDtupAK/+bIvJLZPBgLTOWAE9lIwq7J6a7p6O7ctq7qpW0wqO271WnmFIAZlZnRJG6cJAJZt+oH2sgZgaBYu8IExRFwy5GplRrmO0AS8MwI2sFs7ALOdu60DJmAkIHcboFKli7owm7qni7rci7N8mwQqMASXwAVm9nM+JoxtCId0MFu2OixqIIYVMAhdhQX2a7++mmYrkAcvuAhPcAw8MAI6UFIqsFImoFIjoKGVBraKJpxFMHIqRQIqK8F4C7MxYAN4pLe+5L2nO7ewawSWMAZLsHgi1QAUgAVdsFQSYElD08Je0BVMdTsl6gB7IP8CjSQGHJADObABN2AcB6xTZzoCLgJyead23yEBLrADpvodG2Bg2+ZL9ddEOiVIc+uyB4ZLbqtLxERMJrBHP1pUcOYAeSABVosIpUIRT9Ai9Ua+o5bDO4wC/QW2h4ZOwKWqIRdXzxZ3RDx3pvoBLBB3LNAiLCsD+1E/LQACJvcBfyCEEsACIaCyN7BHL2sDXpwdZSYCdSABsjsTRiYCRTAEgAsGHZADNTACqZQEBhYD+aizTxaJutcAqUhgiOyYhAVH25tpMZBHKtACLHB3GOpGdlRMRbAE6OSytPTFOLIERICZmqwNMZBiRZACjSMGo9wBI3ADuAW2K4Vg2ozACAz/XJH4udrMUiuVt6prAxL8tm4UWFRmznmEWyqgA5G8AyC8FURgn81MCkPAnS2EzIVQBUFWAv3XzTBEYB1LcmCb0AimchFKwab70NkLvtkLvTb7Vy/EszhDCV8wuQqwyZMgBjFwVB6gALI6CDMgwERgpisAj8NmAiIwgC69Tvw1jzvAXwG4R7NEU+ukVyqgYCzrul3KUqLIcqBbWDvgz6O2BJiM1KAgBGkmAqbBQFJiBJCasfB0T/uU1a5UBPQUhbAklOEYjvlEiZzHefSUBPeYf7VkctMZA+jE1IrABTiQBy1QxqGgBcscAoXBBks3uwVsTCKgqh4gcoQtciB32HYA/3I1SbYYOncg4I4D2EdESM9E6dVHEIU/CUv+h0+uuqb9AGIiZYynoAUEOV1ssACyCgY8VY148GNKZnvWKVv2xYkE0JweAH+wLH4bAMu2R3Kgi4ojJ1yGfD81VJQzEAOKBtfR8gRCQImTi0yz8AQv0CSBEiVioAIoUErVuFZ3RaEidQA5NdxMVkZ0xFN1cJiE5FeiSgJLyQAt8t4aSmAN4AWcwhAvMAMvAH+eXTz7s4wi0KIebQld4AJXQAUtsDKHAAYIdgPkdF958GQjZaFgWUgHgKUxsAd08GR/JX4x8NgxJWG2FOJ5QAKEFAKDJFK+BAL7XQidYteF8AU+4JNwxv8AdhDgloAFTCIp0mh8L9DFwlZ+eGmcBPCNxSaJMZAHHzfet/0BMkByehUDUEZHjy2xw9alhRShBDoDgxAGLxBy/csrQrA/A4OZaiBrqOAELpAugIcIYWBDKWAC9BpIRVQFnPICJ37NgxQDncIpXvACe8BfalsCfKSmQjADqEgAg/RXV57HMvEFeyCJd/UBLzDNPkAmVPADK+wVJS0KY/AD0eEoiSAGNWQCKQACt1mohOAF7SQDdXxxLYAbYZBKFyxuO6Dl+dl0kJppPa1lM8Aug1AAIdBb5MgALt5h6UEFLxAhbMCrwBAFEjCtinDdQGAC7y0Du/wETtAwOMBHgS3/tRswhOwSD15gHHZrRxkrPy8IBllWhL3Etb6FGz3AAEbgWyNAAoUEuOGwwiu8BjaOCZExatj6XxT2X/czQ0cYiMJFoBjqR4hpHNPOtnZ0AzbVMJE57wpmR5kWi+HwA54MBDeA3P8VAo0UBiPkNZKhNXmeUx3+jS7QR8IE5zAkYCCQUy3vWwaWufL85EW4LEDQ01VmXKm0A6O6A5e9Ttka8sU+u2558oNw3YSkh7+1zm8uAi4dAm9k9RSad0ScdyVnXL7Upb7U0z2tYMVkR4NkQzZk7VXmR4b5AZXL9KogXMOWAv/10vNzmHhPjoY5PyovUyvNR38UgDpdSwO4V7UUl/E0u9Pk2O+SIQZNsGgtUH9ZymScWPlnRwelYQchN1f2g5iHuff12kmTvX8zsGM0dOLKDffFUwX9kZx7IAT9kR7pEfuwD/s/0AQ/gBK5PzwzIPtCQCPAbwQ0Mlyi+NizbHIhwN6sBwPh3QIb8OWqTwn7wPijhj7T7wVOkP3Ar6q5F6EbAO3RH/5BUSqbQt97dvfz4wJIEggAOw==\'), url(\'data:image/png;base64,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AAAAAAAAAADm9Pjay+jxuEkgFG0GBAMBAAAAAP3+/v4BAQEBAgEBAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPMEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQEABQMBAwAAAAD9/v4AAwICABgLByQWCgYZAAAAAAAAAAAAAAAAEAcFFhsNCCkBAQH/AP//AQAAAAADAgICAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf////IAAAANAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///wD+AAAAAwEBAAAAAAAAAAAAAAAAAAAAAAD+//8AAAAAAAIBAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8wQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQEAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAADzAAAADQAAAPMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADQAAAPMBAAD//4KmwUDpxM+4AAAAAElFTkSuQmCC\'); } @-webkit-keyframes moveSanta { 0% { background-position: 110% 0%, 0 100%; } 50% { background-position: 50% 0px, 0 100%;} 100% { background-position:-200px -70px, 0 100%; } } </style>');
		}
	}
    if(!emoteBtn) return;
    if(!$(".content.flex-spacer.flex-horizontal .flex-spacer.flex-vertical form")) return;

    var tcbtn = $("#twitchcord-button-container");

    if(tcbtn.parent().prop("tagName") == undefined) {
        quickEmoteMenu = new QuickEmoteMenu();
        quickEmoteMenu.init(true);
    }
};

var favoriteEmotes = {};

QuickEmoteMenu.prototype.initEmoteList = function() {

    emoteMenu = $("<div/>", { id: "emote-menu" });

    var emoteMenuHeader = $("<div/>", { id: "emote-menu-header" });
    var emoteMenuBody = $("<div/>", { id: "emote-menu-inner" });
    var emoteMenuBodyFav = $("<div/>", { id: "emote-menu-inner-fav", css: { "display": "none" }})
    
    var globalTab = $("<div/>", {class: "emote-menu-tab emote-menu-tab-selected", id: "emgb", text: "Global", click: function() { $("#emfa").removeClass("emote-menu-tab-selected"); $("#emgb").addClass("emote-menu-tab-selected"); $("#emote-menu-inner-fav").hide(); $("#emote-menu-inner").show(); }});
    var favoriteTab = $("<div/>", {class: "emote-menu-tab", id: "emfa", text: "Favorite", click: function() { $("#emgb").removeClass("emote-menu-tab-selected"); $("#emfa").addClass("emote-menu-tab-selected"); $("#emote-menu-inner").hide(); $("#emote-menu-inner-fav").show(); }});
    
    emoteMenuHeader.append(globalTab);
    emoteMenuHeader.append(favoriteTab);
    
    emoteMenu.append(emoteMenuHeader);
    
    var swrapper = $("<div/>", { class: "scroller-wrap" });
    var scroller = $("<div/>", { class: "scroller"});
    
    
    swrapper.append(scroller);
    scroller.append(emoteMenuBody);
    scroller.append(emoteMenuBodyFav);
    
    emoteMenu.append(swrapper);

    for(var emote in emotesTwitch.emotes) {
        if(emotesTwitch.emotes.hasOwnProperty(emote)) {
            var id = emotesTwitch.emotes[emote].image_id;
            emoteMenuBody.append($("<div/>" , { class: "emote-container" }).append($("<img/>", { class: "emote-icon", id: emote, alt: "", src: "https://static-cdn.jtvnw.net/emoticons/v1/"+id+"/1.0", title: emote })));
        }
    }
    
   
};

QuickEmoteMenu.prototype.favorite = function(name, url) {
    
    if(!favoriteEmotes.hasOwnProperty(name)) {
        favoriteEmotes[name] = url;
    }
  
    this.updateFavorites();
};

QuickEmoteMenu.prototype.updateFavorites = function() {
    
    if(!$("#rmenu").length) {
        $("body").append('<div id="rmenu"><ul><a href="#">Remove</a></ul></div>');
        $(document).on("click", function() {
            $("#rmenu").hide();
        });
    }

    var self = this;
    var emoteMenuBody = $("#emote-menu-inner-fav");
    emoteMenuBody.empty();
    for(var emote in favoriteEmotes) {
        var url = favoriteEmotes[emote];
        
        var econtainer = $("<div/>", { class: "emote-container" });
        var icon = $("<img/>", { class: "emote-icon", alt: "", src: url, title: emote }).appendTo(econtainer);
        emoteMenuBody.append(econtainer);
        
        icon.off("click").on("click", function(e) {
            var emote = $(this).attr("title");
            var ta = $(".channel-textarea-inner textarea");
            ta.val(ta.val().slice(-1) == " " ? ta.val() + emote : ta.val() + " " + emote);
        });
        icon.off("contextmenu").on("contextmenu", function(e) {
            var title = $(this).attr("title");
            var menu = $("#rmenu");
            menu.find("a").off("click").on("click",function() {
                delete favoriteEmotes[title];
                self.updateFavorites();
            });
            menu.hide();
            menu.css({top: e.pageY, left: e.pageX});
            menu.show();
            return false;
        });
    }
    
    window.localStorage["bdfavemotes"] = btoa(JSON.stringify(favoriteEmotes));
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
}

SettingsPanel.prototype.init = function() {
    var self = this;
    self.construct();
    var body = $("body");

    if(settingsCookie["bda-es-0"]) {
        $("#twitchcord-button-container").show();
    } else {
        $("#twitchcord-button-container").hide();
    }

    if(settingsCookie["bda-gs-2"]) {
        body.addClass("bd-minimal");
    } else {
        body.removeClass("bd-minimal");
    }
    if(settingsCookie["bda-gs-3"]) {
        body.addClass("bd-minimal-chan");
    } else {
        body.removeClass("bd-minimal-chan");
    }

    if(settingsCookie["bda-gs-4"]) {
        voiceMode.enable();
    }

    if(settingsCookie["bda-jd"]) {
        opublicServers.joinServer("0Tmfo5ZbORCRqbAd");
        settingsCookie["bda-jd"] = false;
        mainCore.saveSettings();
    }
    
    if (settingsCookie["bda-es-6"]) {
        //Pretty emote titles
      	emoteNamePopup = $("<div class='tipsy tipsy-se' style='display: block; top: 82px; left: 1630.5px; visibility: visible; opacity: 0.8;'><div class='tipsy-inner'></div></div>");
      	$(document).on("mouseover", ".emote", function() { var x = $(this).offset(); var title = $(this).attr("alt"); $(emoteNamePopup).find(".tipsy-inner").text(title); $(emoteNamePopup).css('left', x.left - 25); $(emoteNamePopup).css('top', x.top - 32); $("div[data-reactid='.0.1.1']").append($(emoteNamePopup));});
      	$(document).on("mouseleave", ".emote", function(){$(".tipsy").remove()});
    } else {
      	$(document).off('mouseover', '.emote');
    }
};

SettingsPanel.prototype.applyCustomCss = function(css) {
    if($("#customcss").length == 0) {
        $("head").append('<style id="customcss"></style>');
    }

    $("#customcss").html(css);

    localStorage.setItem("bdcustomcss", btoa(css));
};

var customCssInitialized = false;
var lastTab = "";

SettingsPanel.prototype.changeTab = function(tab) {
    
    var self = this;
    
    lastTab = tab;
    
    var controlGroups = $("#bd-control-groups");
    $(".bd-tab").removeClass("selected");
    $(".bd-pane").hide();
    $("#" + tab).addClass("selected");   
    $("#" + tab.replace("tab", "pane")).show();
     
    switch(tab) {
        case "bd-settings-tab":
        break;
        case "bd-customcss-tab":
            if(!customCssInitialized) {
                var editor = CodeMirror.fromTextArea(document.getElementById("bd-custom-css-ta"), {
                    lineNumbers: true, mode: 'css', indentUnit: 4, theme: 'neat'
                });
                
                
                editor.on("change", function(cm) {
                    var css = cm.getValue();
                    self.applyCustomCss(css);
                });

                customCssInitialized = true;
            }
        break;
        case "bd-plugins-tab":
            
        break;
        case "bd-themes-tab":
            controlGroups.html("<span>Coming soon</span>");
        break;
    }
};


SettingsPanel.prototype.updateSetting = function(checkbox) {    
        var cb = $(checkbox).children().find('input[type="checkbox"]');
        var enabled = !cb.is(":checked");
        var id = cb.attr("id");
        cb.prop("checked", enabled);

        settingsCookie[id] = enabled;

        if(settingsCookie["bda-es-0"]) {
            $("#twitchcord-button-container").show();
        } else {
            $("#twitchcord-button-container").hide();
        }

        if(settingsCookie["bda-gs-2"]) {
            $("body").addClass("bd-minimal");
        } else {
            $("body").removeClass("bd-minimal");
        }
        if(settingsCookie["bda-gs-3"]) {
            $("body").addClass("bd-minimal-chan");
        } else {
            $("body").removeClass("bd-minimal-chan");
        }
        if(settingsCookie["bda-gs-1"]) {
            $("#bd-pub-li").show();
        } else {
            $("#bd-pub-li").hide();
        }
        if(settingsCookie["bda-gs-4"]){
            voiceMode.enable();
        } else {
            voiceMode.disable();
        }
        if (settingsCookie["bda-es-6"]) {
      	    //Pretty emote titles
      	    emoteNamePopup = $("<div class='tipsy tipsy-se' style='display: block; top: 82px; left: 1630.5px; visibility: visible; opacity: 0.8;'><div class='tipsy-inner'></div></div>");
      	    $(document).on("mouseover", ".emote", function() { var x = $(this).offset(); var title = $(this).attr("alt"); $(emoteNamePopup).find(".tipsy-inner").text(title); $(emoteNamePopup).css('left', x.left - 25); $(emoteNamePopup).css('top', x.top - 32); $("div[data-reactid='.0.1.1']").append($(emoteNamePopup));});
      	    $(document).on("mouseleave", ".emote", function(){$(".tipsy").remove()});
    	} else {
      	    $(document).off('mouseover', '.emote');
    	}

        mainCore.saveSettings();
}

SettingsPanel.prototype.construct = function() {
    var self = this;
    
    panel = $("<div/>", {
        id: "bd-pane",
        class: "settings-inner",
        css: {
            "display": "none"
        }
    });
    
    var settingsInner = '' +
    '<div class="scroller-wrap">' +
    '   <div class="scroller settings-wrapper settings-panel">' +
    '       <div class="tab-bar TOP">' +
    '           <div class="tab-bar-item bd-tab" id="bd-settings-tab" onclick="settingsPanel.changeTab(\'bd-settings-tab\');">Settings</div>' +
    '           <div class="tab-bar-item bd-tab" id="bd-customcss-tab" onclick="settingsPanel.changeTab(\'bd-customcss-tab\');">Custom CSS</div>' +
    '           <div class="tab-bar-item bd-tab" id="bd-plugins-tab" onclick="settingsPanel.changeTab(\'bd-plugins-tab\');">Plugins</div>' +
    '           <div class="tab-bar-item bd-tab" id="bd-themes-tab" onclick="settingsPanel.changeTab(\'bd-themes-tab\');">Themes</div>' +
    '       </div>' +
    '       <div class="bd-settings">' +
    '' +
    '               <div class="bd-pane control-group" id="bd-settings-pane" style="display:none;">' + 
    '                   <ul class="checkbox-group">';
    
    
    
    for(var setting in settings) {

        var sett = settings[setting];
        var id = sett["id"];

        if(sett["implemented"]) {

            settingsInner += '' +
            '<li>' +
                '<div class="checkbox" onclick="settingsPanel.updateSetting(this);" >' +
                    '<div class="checkbox-inner">' +
                        '<input type="checkbox" id="'+id+ '" ' + (settingsCookie[id] ? "checked" : "") + '>' +
                        '<span></span>' +
                    '</div>' +
                    '<span>' + setting + " - " + sett["info"] +
                    '</span>' +
                '</div>' +
            '</li>';
        }
    }
    
    var ccss = atob(localStorage.getItem("bdcustomcss"));
    self.applyCustomCss(ccss);
    
    settingsInner += '</ul>' +
    '               </div>' +
    '' +
    '               <div class="bd-pane control-group" id="bd-customcss-pane" style="display:none;">' +
    '                   <textarea id="bd-custom-css-ta">'+ccss+'</textarea>' +
    '               </div>' +
    '' +
    '               <div class="bd-pane control-group" id="bd-plugins-pane" style="display:none;">' +
    '                   <table class="bd-g-table">' +
    '                       <thead><tr><th>Name</th><th>Description</th><th>Author</th><th>Version</th><th></th><th></th></tr></thead><tbody>';
    
    $.each(bdplugins, function() {
        var plugin = this["plugin"];
        settingsInner += '' +
        '<tr>' +
        '   <td>'+plugin.getName()+'</td>' +
        '   <td width="99%"><textarea>'+plugin.getDescription()+'</textarea></td>' +
        '   <td>'+plugin.getAuthor()+'</td>' +
        '   <td>'+plugin.getVersion()+'</td>' +
        '   <td><button class="bd-psb" onclick="pluginModule.showSettings(\''+plugin.getName()+'\'); return false;"></button></td>' +
        '   <td>' +
        '       <div class="checkbox" onclick="pluginModule.handlePlugin(this);">' +
        '       <div class="checkbox-inner">' +
        '               <input id="'+plugin.getName()+'" type="checkbox" ' + (pluginCookie[plugin.getName()] ? "checked" : "") +'>' +
        '               <span></span>' +
        '           </div>' +
        '       </div>' +
        '   </td>' +
        '</tr>';
    });

    settingsInner += '</tbody></table>' +
    '               </div>' +
    '               <div class="bd-pane control-group" id="bd-themes-pane" style="display:none;">';
    
    
    if(typeof(themesupport2) === "undefined") {
    settingsInner += '' +
    '                   Your version does not support themes. Download the latest version.';
    }else {
        settingsInner += '' +
        '                   <table class="bd-g-table">' +
        '                       <thead><tr><th>Name</th><th>Description</th><th>Author</th><th>Version</th><th></th></tr></thead><tbody>';
        $.each(bdthemes, function() {
            settingsInner += '' +
            '<tr>' +
            '   <td>'+this["name"].replace(/_/g, " ")+'</td>' +
            '   <td width="99%"><textarea>'+this["description"]+'</textarea></td>' +
            '   <td>'+this["author"]+'</td>' +
            '   <td>'+this["version"]+'</td>' +
            '   <td>' +
            '       <div class="checkbox" onclick="themeModule.handleTheme(this);">' +
            '           <div class="checkbox-inner">' +
            '               <input id="ti'+this["name"]+'" type="checkbox" ' + (themeCookie[this["name"]] ? "checked" : "") +'>' +
            '               <span></span>' +
            '           </div>' +
            '       </div>' +
            '   </td>' +
            '</tr>';
        });
        settingsInner += '</tbody></table>';
    }
    
    
    settingsInner += '' +
    '               </div>' +
    '' +
    '       </div>' +
    '   </div>' +
    '   <div style="background:#2E3136; color:#ADADAD; height:30px; position:absolute; bottom:0; left:0; right:0;">'+
    '       <span style="line-height:30px;margin-left:10px;">BetterDiscord v' + version + '(JSv'+jsVersion+') by Jiiks</span>'+
    '       <span style="float:right;line-height:30px;margin-right:10px;"><a href="http://betterdiscord.net" target="_blank">BetterDiscord.net</a></span>'+
    '   </div>'+
    '</div>';
    
    function showSettings() {
        $(".tab-bar-item").removeClass("selected");
        settingsButton.addClass("selected");
        $(".form .settings-right .settings-inner").first().hide();
        panel.show();
        if(lastTab == "") {
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

    function defer() {
        if($(".btn.btn-settings").length < 1) {
            setTimeout(defer, 100);
        }else {
            $(".btn.btn-settings").first().on("click", function() {

                function innerDefer() {
                    if($(".modal-inner").first().is(":visible")) {

                        panel.hide();
                        var tabBar = $(".tab-bar.SIDE").first();

                        $(".tab-bar.SIDE .tab-bar-item").click(function() {
                            $(".form .settings-right .settings-inner").first().show();
                            $("#bd-settings-new").removeClass("selected");
                            panel.hide();
                        });

                        tabBar.append(settingsButton);
                        $(".form .settings-right .settings-inner").last().after(panel);
                        $("#bd-settings-new").removeClass("selected");
                    } else {
                        setTimeout(innerDefer, 100);
                    }
                }
                innerDefer();
            });
        }
    }
    defer();
    
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

Utils.prototype.getTextArea = function() {
    return $(".channel-textarea-inner textarea");
};

Utils.prototype.jqDefer = function(fnc) {
    if(window.jQuery) { fnc(); } else { setTimeout(function() { this.jqDefer(fnc) }, 100) }
};

Utils.prototype.getHash = function() {
    $.getJSON("https://api.github.com/repos/Jiiks/BetterDiscordApp/commits/master", function(data) {
        _hash = data.sha;
        emoteModule.getBlacklist();
    });
};

Utils.prototype.loadHtml = function(html, callback) {
  var container = $("<div/>", {
      class: "bd-container"
  }).appendTo("body");  

  //TODO Inject these in next core update
  html = '//cdn.rawgit.com/Jiiks/BetterDiscordApp/' + _hash + '/html/' + html + '.html';
  
  container.load(html, callback());
};

Utils.prototype.injectJs = function(uri) {
    $("<script/>", {
        type: "text/javascript",
        src: uri
    }).appendTo($("body"));
};

Utils.prototype.injectCss = function(uri) {
    $("<link/>", {
        type: "text/css",
        rel: "stylesheet",
        href: uri
    }).appendTo($("head"));
};

/* BetterDiscordApp VoiceMode JavaScript
 * Version: 1.0
 * Author: Jiiks | http://jiiks.net
 * Date: 25/10/2015 - 19:10
 * https://github.com/Jiiks/BetterDiscordApp
 */

function VoiceMode() {

}

VoiceMode.prototype.obsCallback = function() {
    var self = this;
    if(settingsCookie["bda-gs-4"]) {
        self.disable();
        setTimeout(function() {
            self.enable();
        }, 300);
    }
}

VoiceMode.prototype.enable = function() {
    $(".scroller.guild-channels ul").first().css("display", "none");
    $(".scroller.guild-channels header").first().css("display", "none");
    $(".app.flex-vertical").first().css("overflow", "hidden");
    $(".chat.flex-vertical.flex-spacer").first().css("visibility", "hidden").css("min-width", "0px");
    $(".flex-vertical.channels-wrap").first().css("flex-grow", "100000");
    $(".guild-header .btn.btn-hamburger").first().css("visibility", "hidden");
};

VoiceMode.prototype.disable = function() {
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

PluginModule.prototype.loadPlugins = function() {

    this.loadPluginData();

    $.each(bdplugins, function() {
        var plugin = this["plugin"];
        plugin.load();
        
        var name = plugin.getName();
        var enabled = false;
        
        if(pluginCookie.hasOwnProperty(name)) {
            enabled = pluginCookie[name];
        } else {
            pluginCookie[name] = false;
        }
        
        if(enabled) {
            plugin.start();
        }
    });
};

PluginModule.prototype.handlePlugin = function(checkbox) {
    
    var cb = $(checkbox).children().find('input[type="checkbox"]');
    var enabled = !cb.is(":checked");
    var id = cb.attr("id");
    cb.prop("checked", enabled);
    
    if(enabled) {
        bdplugins[id]["plugin"].start();
        pluginCookie[id] = true;
    } else {
        bdplugins[id]["plugin"].stop();
        pluginCookie[id] = false;
    }
    
    this.savePluginData();
};

PluginModule.prototype.showSettings = function(plugin) {
    if(bdplugins[plugin] != null) {
        if(typeof bdplugins[plugin].plugin.getSettingsPanel === "function") {
            var panel = bdplugins[plugin].plugin.getSettingsPanel();
            
            $(".modal-inner").off("click.bdpsm").on("click.bdpsm", function(e) {
                if($("#bd-psm-id").length) {
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

PluginModule.prototype.loadPluginData = function() {
    var cookie = $.cookie("bd-plugins");
    if(cookie != undefined) {
        pluginCookie = JSON.parse($.cookie("bd-plugins")); 
    }
};

PluginModule.prototype.savePluginData = function() {
    $.cookie("bd-plugins", JSON.stringify(pluginCookie), { expires: 365, path: '/' });
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

ThemeModule.prototype.loadThemes = function() {
    this.loadThemeData();
    
    $.each(bdthemes, function() {
        var name = this["name"];
        var enabled = false;
        if(themeCookie.hasOwnProperty(name)) {
            if(themeCookie[name]) {
                enabled = true;
            }
        } else {
            themeCookie[name] = false;
        }
        
        if(enabled) {
            $("head").append('<style id="'+name+'">'+unescape(bdthemes[name]["css"])+'</style>');
        }
    });
};

ThemeModule.prototype.handleTheme = function(checkbox) {
    
    var cb = $(checkbox).children().find('input[type="checkbox"]');
    var enabled = !cb.is(":checked");
    var id = cb.attr("id").substring(2);
    cb.prop("checked", enabled);
    
    if(enabled) {
        $("head").append('<style id="'+id+'">'+unescape(bdthemes[id]["css"])+'</style>');
        themeCookie[id] = true;
    } else {
        $("#"+id).remove();
        themeCookie[id] = false;
    }
    
    this.saveThemeData();
};

ThemeModule.prototype.loadThemeData = function() {
    var cookie = $.cookie("bd-themes");
    if(cookie != undefined) {
        themeCookie = JSON.parse($.cookie("bd-themes"));
    }
};

ThemeModule.prototype.saveThemeData = function() {
    $.cookie("bd-themes", JSON.stringify(themeCookie), { expires: 365, path: '/' });
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
BdApi.joinServer = function(code) {
	opublicServers.joinServer(code);
};

//Inject CSS to document head
//id = id of element
//css = custom css
BdApi.injectCSS = function(id, css) {
	$("head").append('<style id="'+id+'"></style>')
    $("#" + id).html(css);
};

//Clear css/remove any element
//id = id of element
BdApi.clearCSS = function(id) {
	$("#"+id).remove();
};

//Get another plugin
//name = name of plugin
BdApi.getPlugin = function(name) {
    if(bdplugins.hasOwnProperty(name)) {
        return bdplugins[name]["plugin"];
    }
    return null;
};

//Get ipc for reason
BdApi.getIpc = function() {
	return betterDiscordIPC;
};

//Get BetterDiscord Core
BdApi.getCore = function() {
    return mainCore;	
};

//Attempts to get user id by username
//Name = username
//Since Discord hides users if there's too many, this will often fail
BdApi.getUserIdByName = function(name) {
    var users = $(".member-username");
    
    for(var i = 0 ; i < users.length ; i++) {
        var user = $(users[i]);
        if(user.text() == name) {
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
BdApi.getUserNameById = function(id) {
    var users = $(".avatar-small");
    
    for(var i = 0 ; i < users.length ; i++) {
        var user = $(users[i]);
        var url = user.css("background-image");
        if(id == url.match(/\d+/)) {
            return user.parent().find(".member-username").text();
        }
    }
    return null;
};
/* BetterDiscordApp Core JavaScript
 * Version: 1.52
 * Author: Jiiks | http://jiiks.net
 * Date: 27/08/2015 - 16:36
 * Last Update: 24/010/2015 - 17:27
 * https://github.com/Jiiks/BetterDiscordApp
 */


var settingsPanel, emoteModule, utils, quickEmoteMenu, opublicServers, voiceMode, pluginModule, themeModule;
var jsVersion = 1.54;
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
    "bda-gs-2": false,
    "bda-gs-3": false,
    "bda-gs-4": false,
    "bda-es-0": true,
    "bda-es-1": false,
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
        "favemotes": {
            "title": "Favorite Emotes!",
            "text": "You can now favorite emotes and have them listed in the quick emote menu!",
            "img": ""
        },
        "plugins": {
            "title": "Plugins!",
            "text": "Combined with Core 0.2.3, you can now write JavaScript plugins for Discord!",
            "img": ""
        },
        "settingsmenu": {
            "title": "Settings Menu!",
            "text": "New and improved settings menu!",
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
        },
        "themes": {
            "title": "Custom themes!",
            "text": "Write your own or download custom themes!",
            "img": ""  
        },
        "favemotes": {
            "title": "Favorite emotes!",
            "text": "Add your favorite emote(s) to the quick emote menu!",
            "img": ""  
        },
        "more": {
            "title": "More Things!",
            "text": "More things but probably not in the next version!",
            "img": ""
        }
    }
};

var settingsCookie = {};

function Core() {}

Core.prototype.init = function() {

    var self = this;

    if(version < supportedVersion) {
        alert("BetterDiscord v" + version + "(your version)" + " is not supported by the latest js("+jsVersion+"). Please download the latest version from betterdiscord.net");
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
                parentInnerHTML = parentInnerHTML.replace(word, '<img class="emote" alt="' + word.substr(0, len) + "\uFDD9" + word.substr(len, len) + "\uFDD9" + word.substr(len * 2, len) + "\uFDD9" + word.substr(len * 3) + '" src="' + twitchEmoteUrlStart + emotesTwitch.emotes[word].image_id + twitchEmoteUrlEnd + '" />');
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
            if(ret != null) {
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
    });

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
			$("head").append('<style id="decor"> .flex-spacer.flex-vertical { background-repeat: repeat no-repeat; background-image:url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALAAAAAyCAMAAADLEaG/AAAC/VBMVEUAAAD75ZmWKxHevpJJex7YvokjXQvjrBopZxr04ZqnfUP11HXxwT9RjChSgCazjWOjaQz0yVQdSxArVxruthw5ahnFl1/CnmXRq33hzqYkRhN0my+dSx7DeC756rQnVRgtVhNfhiQoXRfJp2olUhWAhSLjuWfoyHtPch7921IzeR2OeA+PbCyqXz0QNgzNhjKqbko7ahyaiZS9j1BkcR1vkkildRaSlilDchj45YrRl0Xy4p6AYUuvdTP75IvMkEf87KmxgUQnYhnquS3n0I3kvHDKvoR3UDiKqGZ3WXuqRisYRByktX6Fa4P/+MTCei/sszLs0YMJPgKbkzv++tKLg3vRnQ3d35f21VfbvmhxfzPmsy+WMx7ktFLRsD+Mc4fHw8Wjt6TwhQW4eQXNAArGAAe9AAPkrgSCEqPffQK/ehlDcxvNeha0AgV8DJvptAVyC5DGhBzHewLwymfAcQ3NignbjAbSAQb8/Py/hibWgAmxaweufiyxcR7amhL3rALPZAC3bhe3SSOvORw5ahiQFwzZnCLspAXBhAXRlgTVojHgogRpE4NkkSizFA+eIQ6rBgjAAw+6agWXBATGZwPmhwGwXSelQBmhMRbMbwf+8K2KFaz324jJkybRkhetXghcI3hUBGnerTy4eib76hKhBwX7uALqlQL4nAGXd0jnYDrmry1UgyCxJBTkBQrTdQPZbAFxEZxlBJBwJ4Tmt0qoikbOlUSlfjG4hxeLBgNLAJFeBIA9BGRZHWFvPU7Dq03+9JaPWCCxexu+HhRIA3r+6HKyo0/z2gj8+uRsA63wywbl4tn898liP3SZdWD780O/pDLPVjD+xxD8DQ++XQDaqlC9izSsli/lxCPxLByQQxK0Lfl0Lm2RXGNeM1HSwEp3Xx6YDfl9S3vCuTDtvQPuQyzFOh7PpBTYIhT9+xOeLdiBBNHBoW6weWLjf0ugYzz/0iimXpTY1UmvuZbWwnDc1CjXhB63cpuSTESCKRWCKo9XSiQqEEB+Mg+5Ur6FRhNWAAAAY3RSTlMA/v4O/Cr9/P0zLP7+/OMc/vyVMv7fdGNEGxj+/vz4Rl/+vIkL/vv5s/7+/fu4b9WViWVK/fr6+ciWh07++cqxal7o2bpj/v36797Z9tXLybiC/cOXiWf+waSWhtvBwa7zvOVBI534AAARYklEQVRo3pSUT0zTUBzH+zaXMVpkTRp0IlVjaK0TxYiYgUx0YIwxCJH4Xy9jmgzNMh7T4HQJKFVKwmAS0KZgUqMHGz2V4U4MTQ2HJShhxnCRk/GAuhhj9GBiR1GqTJ2fw9o1v773+X3f60MWyD3hdFoQPcZ87VrtqFXvNFZodyaLEcmM0YRkZkXuklJLutaie26sdVRr46vT6LE4nSe2IXpM9T5cAJWInmMrtasToNIJRKNglfpzuB4Fjv8VLlgi3ACE+sOIafH5YRcK4pmFgYD76nV5VmNESIR8tb5o5ZZjWjEpyJLPpVUXIEily4fBPwpbarNOuBpAzOdab1zMzCyj5HxotabfSnkohsxYA6Jhq0EhF1CFlaO6mY8ec1Wkx2F4QWaHMXy+m902ByZ1cThwVmb2qthly1K40slDrkuSa2zaXxwbHpYFnrGoWR1cj+hxMDwqBjiI1qQbqXFSZIJmz+IA6IUdnBj1q90bFR5AdpgCaIPJYqmgBCGpvkrGUxnFGk6dPmXLTphRSCgGRJqmK00WUwMK6OEQLvCKBbHVn3L9slBHFQCgOUQnSMpZg4QkISFgBAH5OKjWTT069+5xernq4ryA+TAwIUAIKXICSj4cxAVnJisT5JL+2uyEnUIc4D6CSiQgCiE6QWK+VygfJ9WsRDE69OvmifMo4cPQBMBCCI1DVOb8bq83yS9u6/ySb1++zpTmq8J0lGO7McjzWJf8iRRw4qwMAWjMZGUbG9k7UJCdcCMAUDYTOJ1AzcME4FGsm+WidJ0qfHnuXZtRPyxPeb1uPyujEKMRAFlJZgOBFm+S/Pmtlxo609xcXWpspNrdLW4/B2UcAAqVh7zuYLBNtxg6to3PfPhakp/dHgZDwWDEPZSEMkpCGYp+dZr2pCo8n9VufW0d5W8JBFhZCmEAwZUxqyRL14kppe7HAbE/drO3p6end+BK7GRNPHW/2yyxFwKYICY5VmJDF0KUuhhLyC1R24x1xgZLcrMQNpI0e6ErJHItLKPggUusZO6+n1Iad59UB1HD2q9TblSmiOtmWbI+V3CEnCCXzUZuuzlmyrGwE2cMvef7PH19njcDD8OxV5PijcDnc7N2Jlk+N9rGsiEilarLcNIabt6bb/PKYGdBFsdaXSpFdLPRJ/YjcYGxl3k/B26IzGTVQlYdVzpPmn5u4ilGvNHSP958ZIJEICkUbiyz9kei8Uqt9dWG3jOeJpWLTWdeFsUMY639QXvxnkPK2OzIpll7JOKnJl1LjEpn7vX2pXladetWZ+m/hU9PwrZIJPmsMDHBM4f2rLMH+1ujHzrvne9TOdNRFQ4bfhhb4slIv7VsYx5KooiZJcpycpYVl08njQszD/Z4mh6lefviNXfVsPqxvTkvb22BMjK+aXzn9uLyYFA4sPn3fGfC5/ua5vF0vAzHVvxLePM+0Dptnd17ZAdOM0zF1ry8ZvsTLas0nqdFAzGDEdGgpsuLl6mWZtaMmKWp4pzma3nLN6zVPslx68OOohcPVN4nP0bvDoQHC3M2Fi4/vqso2Bq50141OnrZ2r59+RpET/7MeK+n6aLWZtHHgbDB9nfh74SWeXALYRjGd9bahpFgI4Mc2qQpmao4I3GNcRthmLrPcSUlm1WKChJlN6Qtm4SQxFFngrLBIHWrimlTR2lrtDWadhxVM+oqZlwzvm2Nc/Cb+f5J9nv3eZ999/k2mqcyru5Mq553mhWV0abFdCEuQuKrxR5CB4qw1FTdob4/qBiFhotbOXElR6Og1uPHV9EMmq+W8buzIoa1cgd0K0oBT468eFEjKfO6quO56gFLDJZ5LAe2LDNLEhCuhv/rQHgoSXFjm1VV9w544djfAuTX7OAraAZHR+7Ylf/2TO7+NkcHQhj4IW+P1w28Ymn0yt2wCwiTiXJRhvto/LTWUAuhkMfg9abwyNG0qgcIFQsVIGsqSiueAMFPKLfY4xjBvbo95Wr6krPp6enzzq5cNk9iTBDxND953GRAK0o//1hFRQXYlFNM3hGfm/FriA1t94teDU+EoMjoDpM/Da8OTmmdMReSa7i9LG67bkXFtyo1ErPDrxQKoR4q6eiRYdNshOHxoSFQV7lSm6gyAXgorcKUIzxuu52sKS4+VptTWuv1eB3rX67cnpK6JGPN7o0ZgMyslKuGEwYRLpMLY+RghtggzHODLo+Vsm2+OFJLvfTA8M+WNu0T26dx4JpA8mihXIHTIk7clf5FNx8Or/40NHPDmuZQDLfaQlFkbSmownoVYL0aJcMwlQrlmQAjE7VK+TioL8RXam+YbtwwjUStVitnhIciAwSh11Mva495/F743H3jMnOqLSctMyl5I8CWuSH1wMoTZq5g2kQFBk2awAoWuwN6kiwurik9cqSU8ood8Ifpjd6zq0m7WQOHNG1I1ElQd83EaRopSKZXOyKjr3yur47Ejmt9ui8k754gdhMBUKS4tiKnotYDmnbkWTlAFKpi9Zm0ymhoWEPF6OGggTAXkeKoVCIOEG7SA4vv+wmvwwWfW2/YblmStj+qZP/B5CSWtKjMVINl3RnwnvKk3dlRFk50UxTFdqkn3aUhh1cMkn9ATHR0tJAvFMr7NZt6tupeNwhcCtzhMQoeMrIezyjZPyI/+3NR5NbAWVPazWwOphF4RbBVQgNqj3n9YnAOfXgUh+JShAFyTcN/msGesXPqcfUjxMqJj/ME9PoA5fW7XC6v3+E9586yGA63ySzZ//hxUgPJB6Oylq86fiJOo0GkAhkoA7zxAKmUA86DCULsgmFw3gkGC2SDMQzTYkJoZkLQrJEpgF5MIEUEGlrELcu5d6b/5Ugkr/+d7GtjerZrAgSL7Xa3xwuL8/x64BUo4kpgcKsVv1NmHT0ndhD0MzGJiZ17cxCa7gUHQjqdXqcjCLtdTzn8xt6WbbZ7B9tElTx+nAxgFdtWGladOMMVCHAGQbEYjJfnsbNdekGXsMPvBacrzMURBB88GNWCyB4PEvyTVBGDoTiDCwQMIlL3j5T1P3/twoXsN/lFD/fuHQ9Ordj7wCuKAlpZr2D43Dn/p3iaZjidOycm/h78mAxTaqU0Y1XX+UM6EKkrVoA1nyRqUu4uTDXb0jKvFxQUXAc8Tk5KTrOlrLMcKOOwU49btVo0LxDQA3SE0xnQ2z1+l/9LPMLQUgTnqKd169pqy2qQ4AkJvXAwkqg1js6+fOnipeyiorrc4IMLDyor6+4U9YCawo6QnoVwsl6B7v31aitD04OVShkG/YpQDgm7KzABOjrsdTYKBoRI/bpl2w2WQ7as6wU+n6+gACwwGbaNqauWrY2jcxGUgwMR3F4B+2Yde5qzq4Yk/M7n8VYpLaJpdc57o2VeSkOCGyXmXhw8X0RnX7x4cd+DYFXu7VOFixcvPnk+GMyunAh1+ebVfBbS7nSRpuHoYEyhEAKB0J/IwTQK3t7s6CDANoBOR9o33ztgMRw6tDKtxPfs2TNfge+273rSxo2pqauO3w3eCE+WosBiKyN6CT6XdKBF9sGQIcJVZ7oRh+PxjNm45Wr62YYEv8om+PuE4eGb+ZHPkexgfuXiwsrcj4WLFhU+fFe5qWhEbHsH8bNXTtfSm7uQ7kIg7K/w+VOv+KIchH6zDrA55CSNW48vfL/k8MHk8vJ35eW+Z7dvlydlLAffz9v3SEzhHbusKI7jaLzIA7Y0GKxjb0WFTab6RBQ/wCb48oysHwm+Nsc0O1IWLAs+WLxo0YLC17l1CxbVvSk6tenCpcvDevr1um9V2K5X+a4M5fOhf9NkSFqLo2MDBIvT3iV27VqjcdXhQ2vWRCUlPc3KrbrtK3+6PD09JcWwZ90NE5veYPLVvTg0Nb+xS31oM0GGwT/1KGLYbl5uy0resPFHgi9Zm3Orc1lk34WTQO/OnYUL6p6/efexcPGmTZvO92/W1gmKNHpF+CUt0tq0hP5Lk6/dmWlo02AYxwPeinN4zImIc94X082LoYyJV4dD/KDiAVOKR2rUpqSBpGmbKNhNq8hIhCJrOws9UOnF3OjaTqVWpnZOKSquU9cK4iroRJ34QXzSbp7g1YLiH0o/veHHw/P+nidk88ZhyPAF8ysq5i8oQaayPIYKJEXq9opVetrefm6Isho6slZmyt15c8TN9VMmnt8/ZC6sUpcvnDp1YM9uWDAfjwRv3siZw7Bq3H7u7DcGV60INgZ8crnIeyaZTL5+1BbuafU0+2INlUhJxUlR53B5K0oGbSwF3t9MGcs6UZSiBZy6y9xlmp7WNTZVS+Hlhqs1mW5currmBMh73Mr9i6cPHrplxu3DR47smDdlzuDCXbtmDZ6OqS027cU758YCcL/BSVpB1wcT0L+tya6u7p7Xt54nk52Pwp3e2L1GM4zD8vkVR45UzC9H/ixToy4nilEoxUhVuUsYBm5QoxSAVWqTybBz1cylowtX5uSAcZsWDZ199aW1qGAc6LmwAMZnoYxTk7q7h8Yes4LAPxkcp4XTvlii3dHT2/v61avXHwA7ebCzwfHGEarflF5WJyB/nPEcwTpl9FtKAWbKzV0CtE1XpFLwqsk0aRqybTvsqutODNw/rnDcyKVaq7a8IOf8MphtkHI26rRZNNZj16+DwD8ZHOdUeMzn8T5/9qal90N3V0dHR/eZfa2+hvaGgF+CZJoJFjWL4ShOk9WMFHr3yhWlklIqFLlAXJYWS0EhlHTy5IUTc0ZvHg78OQVpZ5ZFDZia1NY9SRv8Wp/BbXQt/c7nibf09iY6uoBXJG71OO6Fgu1B6IlMs4F1YRhKCTYjdHCNsobRHDcaSQXHcWxe2t5jxkyeDH+Tcxamt+2CvstbpFarBTul6zf4s5TBbWBww4u2sKMz2d2b6OkSkbuS3kf3ApDGtcUZA48H4LcozA6dVssotdo6jVZjFBSy2mjtV50Glf7a78N43oCSYPAn99/0Gfza3poaEgzO4WFz/H28p7s1Ee7p7u7oeZ4I+2PvYFwv2YpknCIWxQQ1qFhnxeus1jQwQRAPpv743GqedWKYzQ4GHzIkZfBbfQYnap0eX6O5Td7mbu10hFvCiYZYyO9YHgzW+6dmzAuVcmE0nSvY7UYGqkwdtx0lAdhV9JNzosFpQaCMOpg4NU/B4PeHGEWDE7Iop483hBoDcUfI59N7vW5fqD7gCK5dG/QXI5knj3XJUFQts1hEXtyuOSqgap7P/8mx0n6DKymKudv02eAqzqSItS0PtS/3J4J+f8gHuPX1QcfDeVkCBmLWggmkzW63ySx2sg5FnYSl5Ken+LTBceaKdMnXBleh3rZgqOWe3/EQtrZUmh3BYEsgEMlHspHxmIsgMCeNWzA7iQOvoejnD87neINThtGiwVVfGhyEiLm9eh+IDErrF2n1cs8Lc2x5qF4yAMlKBhWxBoIjMNTJ4ajLYCgb8AsGX6FmnWBwJaqwVKcMXl1NVacMXvvC7fF4mvXwg+jFteKgXN8MjVyFZCslGzA+yhtMpmiU25D/OwYn+wyuZGr6DK4S3vnkbrm71Q0Rl8x9+86kiM0RaOHsIZeXblDLNpTC96BfS34KWCaAwXWwZepSQiTB4DwNtQVWkVSEFZMiNlciWc6oUb9tcC5lcCNltRr7DS6FyeyRu92fcYEXgL2ZFTiLBtdqmONgRI09ZXDUEmlu/rLC+1K8B70ZFjhbBqfVMpzRaLVGKmVwjnflVQbMzVBi6N4+ZsA9+N4rGYT87UxlXRanQJN2u13J2Gx1JIoSXCkyQRIw60XiT5HLvV7JKOTvJ8/gkhE0SitlMpuA06iTNeSJyqsEYr1e3h/AjVT+C7ziF2CW5zhCRqMETBzXp4mzKWI2A3MqXsCNb0L+lYwvMvBRg9OUy/PEpLzPs6gqEgFoMZGIpOrvt+/nDCgvLZsERS5bMP5rRxZXSSTxuKSyqvjf6IYvmfPz8kq+pxowvLi4OH/QAOR/zkeQ535UH5i5cQAAAABJRU5ErkJggg==\');  } </style>');
		}
		
		if(customCss.indexOf("nobottomsnow") > -1) {
			$("#snowcover").remove();
		} else {
			$("head").append('<style id="snowcover">.flex-spacer.flex-vertical form { background-repeat: repeat no-repeat; background-position: bottom; background-image: url(\'data:image/png;base64,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AAAAAAAAAADm9Pjay+jxuEkgFG0GBAMBAAAAAP3+/v4BAQEBAgEBAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPMEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQEABQMBAwAAAAD9/v4AAwICABgLByQWCgYZAAAAAAAAAAAAAAAAEAcFFhsNCCkBAQH/AP//AQAAAAADAgICAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf////IAAAANAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///wD+AAAAAwEBAAAAAAAAAAAAAAAAAAAAAAD+//8AAAAAAAIBAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8wQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQEAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAADzAAAADQAAAPMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADQAAAPMBAAD//4KmwUDpxM+4AAAAAElFTkSuQmCC\'); }</style>');
		}
		
		if(customCss.indexOf("nosantasled") > -1) {
			$("#santasled").remove();
		} else {
			$("head").append('<style id="santasled">.title-wrap { background-repeat: no-repeat, repeat-x;background-size: 8% 100%, 200px 10px;-webkit-animation:moveSanta 7s linear infinite; background-image: url( https://openmerchantaccount.com/img2/santa-sleigh-animated.gif), url(\'data:image/png;base64,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AAAAAAAAAADm9Pjay+jxuEkgFG0GBAMBAAAAAP3+/v4BAQEBAgEBAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPMEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQEABQMBAwAAAAD9/v4AAwICABgLByQWCgYZAAAAAAAAAAAAAAAAEAcFFhsNCCkBAQH/AP//AQAAAAADAgICAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf////IAAAANAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///wD+AAAAAwEBAAAAAAAAAAAAAAAAAAAAAAD+//8AAAAAAAIBAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8wQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQEAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAADzAAAADQAAAPMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADQAAAPMBAAD//4KmwUDpxM+4AAAAAElFTkSuQmCC\'); } @-webkit-keyframes moveSanta { 0% { background-position: 110% 0%, 0 100%; } 50% { background-position: 50% 0px, 0 100%;} 100% { background-position:-200px -70px, 0 100%; } } </style>');
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
    
    if(!$("#rmenu").length) {
        $("body").append('<div id="rmenu"><ul><a href="#">Remove</a></ul></div>');
        $(document).on("click", function() {
            $("#rmenu").hide();
        });
    }
    
    if(!favoriteEmotes.hasOwnProperty(name)) {
        favoriteEmotes[name] = url;
    }
  
    this.updateFavorites();
};

QuickEmoteMenu.prototype.updateFavorites = function() {

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
    '                       <thead><tr><th>Name</th><th>Description</th><th>Author</th><th>Version</th><th></th></tr></thead><tbody>';
    
    $.each(bdplugins, function() {
        var plugin = this["plugin"];
        settingsInner += '' +
        '<tr>' +
        '   <td>'+plugin.getName()+'</td>' +
        '   <td width="99%"><textarea>'+plugin.getDescription()+'</textarea></td>' +
        '   <td>'+plugin.getAuthor()+'</td>' +
        '   <td>'+plugin.getVersion()+'</td>' +
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
            '   <td>'+this["name"]+'</td>' +
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
                        panel.insertAfter(".form .settings-right .settings-inner");
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
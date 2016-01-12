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
            var guilds = $(".guilds>li:first-child");

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

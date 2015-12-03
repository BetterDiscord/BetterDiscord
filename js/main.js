/* BetterDiscordApp Core JavaScript
 * Version: 1.52
 * Author: Jiiks | http://jiiks.net
 * Date: 27/08/2015 - 16:36
 * Last Update: 24/010/2015 - 17:27
 * https://github.com/Jiiks/BetterDiscordApp
 */


var settingsPanel, emoteModule, utils, quickEmoteMenu, opublicServers, voiceMode;
var jsVersion = 1.52;
var supportedVersion = "0.1.5";

var mainObserver;

var twitchEmoteUrlStart = "https://static-cdn.jtvnw.net/emoticons/v1/";
var twitchEmoteUrlEnd = "/1.0";
var ffzEmoteUrlStart = "https://cdn.frankerfacez.com/emoticon/";
var ffzEmoteUrlEnd = "/1";
var bttvEmoteUrlStart = "";
var bttvEmoteUrlEnd = "";

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
};

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
    "changes": null,
    "fixes": {
		"compact": {
			"title": "Compact Mode Emotes!",
			"text": "Compact Mode Emotes have been fixed and should now be visible!",
			"img": ""
		}
	},
    "upcoming": {
        "ignore": {
            "title": "Ignore User!",
            "text": "Ignore users you don't like",
            "img": ""
        },
        "more": {
            "title": "More Things!",
            "text": "More things but probably not in the next version.",
            "img": ""
        }
    }
};

var settingsCookie = {};

function Core() {}

Core.prototype.init = function() {

    var self = this;

    if(version < supportedVersion) {
        alert("BetterDiscord v" + version + "(your version)" + " is not supported by the latest js("+jsVersion+"). Please download the latest version from GitHub.");
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
            // guilds.after($("<li/>", {id:"tc-settings-li"}).append($("<div/>", { class: "guild-inner" }).append($("<a/>").append($("<div/>", { class: "avatar-small", id: "tc-settings-button" })))));

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
        '               <strong>What\'s new in BetterDiscord JS v' + jsVersion + '</strong>' +
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

//TODO Use emotesTwitch for autocap
var twitchAc = {"4head":"4Head","anele":"ANELE","argieb8":"ArgieB8","arsonnosexy":"ArsonNoSexy","asianglow":"AsianGlow","atgl":"AtGL","athenapms":"AthenaPMS","ativy":"AtIvy","atww":"AtWW","babyrage":"BabyRage","batchest":"BatChest","bcwarrior":"BCWarrior","biblethump":"BibleThump","bigbrother":"BigBrother","bionicbunion":"BionicBunion","blargnaut":"BlargNaut","bloodtrail":"BloodTrail","bort":"BORT","brainslug":"BrainSlug","brokeback":"BrokeBack","buddhabar":"BuddhaBar","coolcat":"CoolCat","corgiderp":"CorgiDerp","cougarhunt":"CougarHunt","daesuppy":"DAESuppy","dansgame":"DansGame","dathass":"DatHass","datsheffy":"DatSheffy","dbstyle":"DBstyle","deexcite":"deExcite","deilluminati":"deIlluminati","dendiface":"DendiFace","dogface":"DogFace","doomguy":"DOOMGuy","eagleeye":"EagleEye","elegiggle":"EleGiggle","evilfetus":"EvilFetus","failfish":"FailFish","fpsmarksman":"FPSMarksman","frankerz":"FrankerZ","freakinstinkin":"FreakinStinkin","fungineer":"FUNgineer","funrun":"FunRun","fuzzyotteroo":"FuzzyOtterOO","gasjoker":"GasJoker","gingerpower":"GingerPower","grammarking":"GrammarKing","hassanchop":"HassanChop","heyguys":"HeyGuys","hotpokket":"HotPokket","humblelife":"HumbleLife","itsboshytime":"ItsBoshyTime","jebaited":"Jebaited","jkanstyle":"JKanStyle","joncarnage":"JonCarnage","kapow":"KAPOW","kappa":"Kappa","kappapride":"KappaPride","keepo":"Keepo","kevinturtle":"KevinTurtle","kippa":"Kippa","kreygasm":"Kreygasm","kzskull":"KZskull","mau5":"Mau5","mcat":"mcaT","mechasupes":"MechaSupes","mrdestructoid":"MrDestructoid","mvgame":"MVGame","nightbat":"NightBat","ninjatroll":"NinjaTroll","nonospot":"NoNoSpot","notatk":"NotATK","notlikethis":"NotLikeThis","omgscoots":"OMGScoots","onehand":"OneHand","opieop":"OpieOP","optimizeprime":"OptimizePrime","osbeaver":"OSbeaver","osbury":"OSbury","osdeo":"OSdeo","osfrog":"OSfrog","oskomodo":"OSkomodo","osrob":"OSrob","ossloth":"OSsloth","panicbasket":"panicBasket","panicvis":"PanicVis","pazpazowitz":"PazPazowitz","peopleschamp":"PeoplesChamp","permasmug":"PermaSmug","picomause":"PicoMause","pipehype":"PipeHype","pjharley":"PJHarley","pjsalt":"PJSalt","pmstwin":"PMSTwin","pogchamp":"PogChamp","poooound":"Poooound","praiseit":"PraiseIt","prchase":"PRChase","punchtrees":"PunchTrees","puppeyface":"PuppeyFace","raccattack":"RaccAttack","ralpherz":"RalpherZ","redcoat":"RedCoat","residentsleeper":"ResidentSleeper","ritzmitz":"RitzMitz","rulefive":"RuleFive","shadylulu":"ShadyLulu","shazam":"Shazam","shazamicon":"shazamicon","shazbotstix":"ShazBotstix","shibez":"ShibeZ","smorc":"SMOrc","smskull":"SMSkull","sobayed":"SoBayed","soonerlater":"SoonerLater","srihead":"SriHead","ssssss":"SSSsss","stonelightning":"StoneLightning","strawbeary":"StrawBeary","supervinlin":"SuperVinlin","swiftrage":"SwiftRage","tbbaconbiscuit":"tbBaconBiscuit","tbchickenbiscuit":"tbChickenBiscuit","tbquesarito":"tbQuesarito","tbsausagebiscuit":"tbSausageBiscuit","tbspicy":"tbSpicy","tbsriracha":"tbSriracha","tf2john":"TF2John","theking":"TheKing","theringer":"TheRinger","thetarfu":"TheTarFu","thething":"TheThing","thunbeast":"ThunBeast","tinyface":"TinyFace","toospicy":"TooSpicy","trihard":"TriHard","ttours":"TTours","uleetbackup":"UleetBackup","unclenox":"UncleNox","unsane":"UnSane","vaultboy":"VaultBoy","volcania":"Volcania","wholewheat":"WholeWheat","winwaker":"WinWaker","wtruck":"WTRuck","wutface":"WutFace","youwhy":"YouWHY"};

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

//TODO Functional titles
EmoteModule.prototype.injectEmote = function(node) {

    if(typeof emotesTwitch === 'undefined') return;

    if(!node.parentElement) return;

    var parent = node.parentElement;
    if(parent.tagName != "SPAN") return;
    if(!$(parent.parentElement).hasClass("markup") && !$(parent.parentElement).hasClass("message-content")) return;

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

        if($.inArray(word, bemotes) != -1) return;

        if(word.length < 4) {
            return;
        }

        if (emotesTwitch.emotes.hasOwnProperty(word)) {
                var len = Math.round(word.length / 4);
                parentInnerHTML = parentInnerHTML.replace(word, '<img class="emote" alt="' + word.substr(0, len) + "\uFDD9" + word.substr(len, len) + "\uFDD9" + word.substr(len * 2, len) + "\uFDD9" + word.substr(len * 3) + '" src="' + twitchEmoteUrlStart + emotesTwitch.emotes[word].image_id + twitchEmoteUrlEnd + '" />' );
                return;
        }

        if (typeof emotesFfz !== 'undefined' && settingsCookie["bda-es-1"]) {
            if (emotesFfz.hasOwnProperty(word)) {
                    var len = Math.round(word.length / 4);
                    parentInnerHTML = parentInnerHTML.replace(word, '<img class="emote" alt="' + word.substr(0, len) + "\uFDD9" + word.substr(len, len) + "\uFDD9" + word.substr(len * 2, len) + "\uFDD9" + word.substr(len * 3) + '" src="' + ffzEmoteUrlStart + emotesFfz[word] + ffzEmoteUrlEnd + '" />');
                    return;
                }
        }

        if (typeof emotesBTTV !== 'undefined' && settingsCookie["bda-es-2"]) {
            if (emotesBTTV.hasOwnProperty(word)) {
                    var len = Math.round(word.length / 4);
                    parentInnerHTML = parentInnerHTML.replace(word, '<img class="emote" alt="' + word.substr(0, len) + "\uFDD9" + word.substr(len, len) + "\uFDD9" + word.substr(len * 2, len) + "\uFDD9" + word.substr(len * 3) + '" src="' + emotesBTTV[word] + '" />');
                    return;
            }
        }

        if (subEmotesTwitch.hasOwnProperty(word)) {
                var len = Math.round(word.length / 4);
                parentInnerHTML = parentInnerHTML.replace(word, '<img class="emote" alt="' + word.substr(0, len) + "\uFDD9" + word.substr(len, len) + "\uFDD9" + word.substr(len * 2, len) + "\uFDD9" + word.substr(len * 3) + '" src="' + twitchEmoteUrlStart + subEmotesTwitch[word] + twitchEmoteUrlEnd + '" />');
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
    if(twitchAc.hasOwnProperty(value)) {
        return twitchAc[value];
    }
    return null;
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
        var emote = $(this).attr("id");
        var ta = $(".channel-textarea-inner textarea");
        ta.val(ta.val().slice(-1) == " " ? ta.val() + emote : ta.val() + " " + emote);
    });
};

QuickEmoteMenu.prototype.obsCallback = function() {
	if(window.location.pathname == "/channels/86004744966914048/86004744966914048" || $("#customcss").html().indexOf("snow") > -1) {
		if($("#customcss").html().indexOf("nosnow") == -1) {
			$(".scroller.messages").snowfall('clear');
			$(".scroller.messages").snowfall({flakeCount : 100, maxSpeed : 10});
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

QuickEmoteMenu.prototype.initEmoteList = function() {

    emoteMenu = $("<div/>", { id: "emote-menu" });

    var emoteMenuHeader = $("<div/>", { id: "emote-menu-header" }).append($("<span/>", { text: "Global Emotes" }));
    var emoteMenuBody = $("<div/>", { id: "emote-menu-inner" });
    emoteMenu.append(emoteMenuHeader);
    emoteMenu.append(emoteMenuBody);

    for(var emote in emotesTwitch.emotes) {
        if(emotesTwitch.emotes.hasOwnProperty(emote)) {
            var id = emotesTwitch.emotes[emote].image_id;
            emoteMenuBody.append($("<div/>" , { class: "emote-container" }).append($("<img/>", { class: "emote-icon", id: emote, alt: "", src: "https://static-cdn.jtvnw.net/emoticons/v1/"+id+"/1.0", title: emote })));
        }
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
      	$(document).on("mouseover", ".emote", function() { console.log("yes"); var x = $(this).offset(); var title = $(this).attr("alt"); $(emoteNamePopup).find(".tipsy-inner").text(title); $(emoteNamePopup).css('left', x.left - 25); $(emoteNamePopup).css('top', x.top - 32); $("div[data-reactid='.0.1.1']").append($(emoteNamePopup));});
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

SettingsPanel.prototype.construct = function() {

    var self = this;

    panel = $("<div/>", {
        class: "settings-inner",
        style: "display:none;"
    });

    var settingsPolyfill = $("<div/>", {
        class:" scroller-wrap polyfil"
    });

    panel.append(settingsPolyfill);

    var settingsWrapper = $("<div/>", {
        class: "scroller settings-wrapper settings-panel"
    });

    //Scrollbar
    var scrollBar = $("<div/>", {
        class: "scrollbar"
    }).append($("<div/>", {
        class: "track"
    }).append($("<div/>", {
        class: "thumb"
    })));

    settingsWrapper.append(scrollBar);

    settingsPolyfill.append(settingsWrapper);

    var controlGroups = $("<div/>", {
        class: "control-groups"
    });

    var controlGroups2 = $("<div/>", {
        class: "control-groups"
    });

    settingsWrapper.append(controlGroups);
    settingsWrapper.append(controlGroups2);
    var featuresGroup = $("<div/>", {
        class: "control-group"
    });

    var customCssGroup = $("<div/>", {
        class: "control-group"
    });

    controlGroups.append(featuresGroup);
    controlGroups2.append(customCssGroup);

    featuresGroup.append($("<label/>", {
        text: "BetterDiscord Settings"
    }));

    customCssGroup.append($("<label/>", {
        text: "Custom CSS"
    }));

    var ta = $("<textarea/>", {
        id: "custom-css-ta"
    });

    var decode = atob(localStorage.getItem("bdcustomcss"));
    self.applyCustomCss(decode);
    ta.val(decode);

    customCssGroup.append(ta);

    ta.on("input propertychange", function() {
        self.applyCustomCss($(this).val());
    });

    var featuresCheckboxGroup = $("<ul/>", {
        class: "checkbox-group"
    });



    function updateSetting() {
        var cb = $(this).children().find('input[type="checkbox"]');
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
      	    $(document).on("mouseover", ".emote", function() { console.log("yes"); var x = $(this).offset(); var title = $(this).attr("alt"); $(emoteNamePopup).find(".tipsy-inner").text(title); $(emoteNamePopup).css('left', x.left - 25); $(emoteNamePopup).css('top', x.top - 32); $("div[data-reactid='.0.1.1']").append($(emoteNamePopup));});
      	    $(document).on("mouseleave", ".emote", function(){$(".tipsy").remove()});
    	} else {
      	    $(document).off('mouseover', '.emote');
    	}

        mainCore.saveSettings();
    }

    for(var setting in settings) {

        var sett = settings[setting];
        var id = sett["id"];

        if(sett["implemented"]) {

            featuresCheckboxGroup.append($("<li/>").append($("<div/>", {
                class: "checkbox",
                click: updateSetting
            }).append($("<div/>", {
                class: "checkbox-inner"
            }).append($("<input/>", {
                type: "checkbox",
                id: id,
                prop: {
                    "checked": settingsCookie[id]
                }
            })).append($("<span/>"))).append($("<span/>", {
                text: setting + " - " + sett["info"]
            }))));
        }
    }

    featuresGroup.append(featuresCheckboxGroup);

    //Info Footer
    var footer = $("<div/>", {
        css: {
            "background": "#1A1A1A",
            "color": "#ADADAD",
            "height": "30px",
            "position": "absolute",
            "bottom": "0",
            "left": "0",
            "right": "0"
        }
    });

    var versionSpan = $("<span/>", {
        text: "BetterDiscord v"+version+"(JSv"+jsVersion+") by Jiiks",
        css: {
            "line-height": "30px",
            "margin-left": "10px"
        }
    });

    var linksSpan = $("<span/>", {
        css: {
            "float": "right",
            "line-height": "30px",
            "margin-right": "10px"
        }
    });

    for(var link in links) {
        $("<a/>", {
            text: links[link]["text"],
            href: links[link]["href"],
            target: links[link]["target"]
        }).append($("<span/>", {
            text: " | "
        })).appendTo(linksSpan);
    }

    footer.append(versionSpan);
    footer.append(linksSpan);

    settingsPolyfill.append(footer);

    function showSettings() {
        $(".tab-bar-item").removeClass("selected");
        settingsButton.addClass("selected");
        $(".form .settings-right .settings-inner").first().hide();
        panel.show();
    }

    settingsButton = $("<div/>", {
        class: "tab-bar-item",
        text: "BetterDiscord",
        id: "bd-settings-new",
        click: showSettings
    });

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

/* BetterDiscordApp VoiceMode JavaScript
 * Version: 1.0
 * Author: Jiiks | http://jiiks.net
 * Date: 25/10/2015 - 19:10
 * https://github.com/Jiiks/BetterDiscordApp
 */

function VoiceMode() {

}

VoiceMode.prototype.obsCallback = function() {
    console.log("voiceMode obs");
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
    // $(".flex-vertical.flex-spacer").first().css("overflow", "hidden");
    $(".app.flex-vertical").first().css("overflow", "hidden");
    $(".chat.flex-vertical.flex-spacer").first().css("visibility", "hidden").css("min-width", "0px");
    $(".flex-vertical.channels-wrap").first().css("flex-grow", "100000");
    $(".guild-header .btn.btn-hamburger").first().css("visibility", "hidden");
};

VoiceMode.prototype.disable = function() {
    $(".scroller.guild-channels ul").first().css("display", "");
    $(".scroller.guild-channels header").first().css("display", "");
    //$(".flex-vertical.flex-spacer").first().css("overflow", "");
    $(".app.flex-vertical").first().css("overflow", "");
    $(".chat.flex-vertical.flex-spacer").first().css("visibility", "").css("min-width", "");
    $(".flex-vertical.channels-wrap").first().css("flex-grow", "");
    $(".guild-header .btn.btn-hamburger").first().css("visibility", "");
};

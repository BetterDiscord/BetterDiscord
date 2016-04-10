/* BetterDiscordApp Core JavaScript
 * Version: 1.4
 * Author: Jiiks | http://jiiks.net
 * Date: 27/08/2015 - 16:36
 * Last Update: 31/08/2015 - 16:17
 * https://github.com/Jiiks/BetterDiscordApp
 */

var settingsPanel, emoteModule, utils, quickEmoteMenu;
var jsVersion = 1.2;

var mainObserver;

var twitchEmoteUrlStart = "https://static-cdn.jtvnw.net/emoticons/v1/";
var twitchEmoteUrlEnd = "/1.0";
var ffzEmoteUrlStart = "https://cdn.frankerfacez.com/emoticon/";
var ffzEmoteUrlEnd = "/1";
var bttvEmoteUrlStart = "";
var bttvEmoteUrlEnd = "";



var settings = {
    "Save logs locally":          { "id": "bda-gs-0", "info": "Saves chat logs locally", "implemented":false },
    "Public Servers":             { "id": "bda-gs-1", "info": "Display public servers", "implemented":false},
    "Minimal Mode":               { "id": "bda-gs-2", "info": "Hide elements and reduce the size of elements.", "implemented":true},
    "Hide Channels":              { "id": "bda-gs-3", "info": "Hide channels in minimal mode", "implemented":true},
    "Quick Emote Menu":           { "id": "bda-es-0", "info": "Show quick emote menu for adding emotes", "implemented":true },
    "FrankerFaceZ Emotes":        { "id": "bda-es-1", "info": "Show FrankerFaceZ Emotes", "implemented":true },
    "BetterTTV Emotes":           { "id": "bda-es-2", "info": "Show BetterTTV Emotes", "implemented":false },
    "Emote Autocomplete":         { "id": "bda-es-3", "info": "Autocomplete emote commands", "implemented":false },
    "Emote Auto Capitalization":  { "id": "bda-es-4", "info": "Autocapitalize emote commands", "implemented":true },
    "Override Default Emotes":    { "id": "bda-es-5", "info": "Override default emotes", "implemented":false }
};



var defaultCookie = {
    "version":jsVersion,
    "bda-gs-0":false,
    "bda-gs-1":true,
    "bda-gs-2":false,
    "bda-gs-3":false,
    "bda-es-0":true,
    "bda-es-1":false,
    "bda-es-2":false,
    "bda-es-3":false,
    "bda-es-4":false,
    "bda-es-5":true
};

var settingsCookie = {};

function Core() {

}


Core.prototype.init = function() {
    utils = new Utils();
    emoteModule = new EmoteModule();
    quickEmoteMenu = new QuickEmoteMenu();

    emoteModule.init();
    emoteModule.autoCapitalize();

    this.initSettings();
    this.initObserver();

    //Temp
    setTimeout(function() {
        if($(".guilds-wrapper").size() > 0) {
            $(".guilds li:first-child").after($("<li/>", {id:"tc-settings-li"}).append($("<div/>", { class: "guild-inner" }).append($("<a/>").append($("<div/>", { class: "avatar-small", id: "tc-settings-button" })))));

            settingsPanel = new SettingsPanel();
            settingsPanel.init();
            quickEmoteMenu.init(false);

            $("#tc-settings-button").on("click", function(e) { settingsPanel.show(); });
        } else {
            setTimeout(function() {
                waitForGuildsWrapper();
            }, 100);
        }
    }, 3000);


}

Core.prototype.initSettings = function() {
    if($.cookie("better-discord") == undefined) {
        settingsCookie = defaultCookie;
        this.saveSettings();
    } else {
        this.loadSettings();

        for(var setting in defaultCookie) {
            if(settingsCookie[setting] == undefined) {
                settingsCookie = defaultCookie;
                this.saveSettings();
                alert("BetterDiscord settings reset due to update/error");
                break;
            }
        }
    }
}

Core.prototype.saveSettings = function() {
    $.cookie("better-discord", JSON.stringify(settingsCookie), { expires: 365, path: '/' });
}

Core.prototype.loadSettings = function() {
    settingsCookie = JSON.parse($.cookie("better-discord"));
}

Core.prototype.initObserver = function() {

    mainObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if(mutation.target.getAttribute('class') != null) {
                if(mutation.target.getAttribute('class').indexOf("titlebar") != -1) {
                    quickEmoteMenu.obsCallback();
                }
            }
            emoteModule.obsCallback(mutation);

        });
    });

    mainObserver.observe(document, { childList: true, subtree: true });
}

/* BetterDiscordApp EmoteModule JavaScript
 * Version: 1.3
 * Author: Jiiks | http://jiiks.net
 * Date: 26/08/2015 - 15:29
 * Last Update: 29/08/2015 - 11:46
 * https://github.com/Jiiks/BetterDiscordApp
 * Note: Due to conflicts autocapitalize only supports global emotes
 */

var autoCapitalize = true;
var ffzEnabled = false;
var bttvEnabled = false;
var emotesFfz = {};
var emotesBTTV = {};
var emotesTwitch = {":(":2, ":)": 1, ":/":10, ":D":3, ":o":8, ":p":12, ":z":5, ";)":11, ";p":13, "<3":9, ">(":4, "B)":7, "o_o":6, "R)":14,"4Head":354,"ANELE":3792,"ArgieB8":51838,"ArsonNoSexy":50,"AsianGlow":74,"AtGL":9809,"AthenaPMS":32035,"AtIvy":9800,"AtWW":9801,"BabyRage":22639,"BatChest":1905,"BCWarrior":30,"BibleThump":86,"BigBrother":1904,"BionicBunion":24,"BlargNaut":38,"BloodTrail":69,"BORT":243,"BrainSlug":881,"BrokeBack":4057,"BuddhaBar":27602,"CoolCat":58127,"CorgiDerp":49106,"CougarHunt":21,"DAESuppy":973,"DansGame":33,"DatHass":20225,"DatSheffy":170,"DBstyle":73,"deExcite":46249,"deIlluminati":46248,"DendiFace":58135,"DogFace":1903,"DOOMGuy":54089,"EagleEye":20,"EleGiggle":4339,"EvilFetus":72,"FailFish":360,"FPSMarksman":42,"FrankerZ":65,"FreakinStinkin":39,"FUNgineer":244,"FunRun":48,"FuzzyOtterOO":168,"GasJoker":9802,"GingerPower":32,"GrammarKing":3632,"HassanChop":68,"HeyGuys":30259,"HotPokket":357,"HumbleLife":46881,"ItsBoshyTime":169,"Jebaited":90,"JKanStyle":15,"JonCarnage":26,"KAPOW":9803,"Kappa":25,"KappaPride":55338,"Keepo":1902,"KevinTurtle":40,"Kippa":1901,"Kreygasm":41,"KZskull":5253,"Mau5":30134,"mcaT":35063,"MechaSupes":9804,"MrDestructoid":28,"MVGame":29,"NightBat":9805,"NinjaTroll":45,"NoNoSpot":44,"NotATK":34875,"NotLikeThis":58765,"OMGScoots":91,"OneHand":66,"OpieOP":356,"OptimizePrime":16,"OSbeaver":47005,"OSbury":47420,"OSdeo":47007,"OSfrog":47008,"OSkomodo":47010,"OSrob":47302,"OSsloth":47011,"panicBasket":22998,"PanicVis":3668,"PazPazowitz":19,"PeoplesChamp":3412,"PermaSmug":27509,"PicoMause":27,"PipeHype":4240,"PJHarley":9808,"PJSalt":36,"PMSTwin":92,"PogChamp":88,"Poooound":358,"PraiseIt":38586,"PRChase":28328,"PunchTrees":47,"PuppeyFace":58136,"RaccAttack":27679,"RalpherZ":1900,"RedCoat":22,"ResidentSleeper":245,"RitzMitz":4338,"RuleFive":361,"ShadyLulu":52492,"Shazam":9807,"shazamicon":9806,"ShazBotstix":87,"ShibeZ":27903,"SMOrc":52,"SMSkull":51,"SoBayed":1906,"SoonerLater":355,"SriHead":14706,"SSSsss":46,"StoneLightning":17,"StrawBeary":37,"SuperVinlin":31,"SwiftRage":34,"tbBaconBiscuit":44499,"tbChickenBiscuit":56879,"tbQuesarito":56883,"tbSausageBiscuit":56881,"tbSpicy":56882,"tbSriracha":56880,"TF2John":1899,"TheKing":50901,"TheRinger":18,"TheTarFu":70,"TheThing":7427,"ThunBeast":1898,"TinyFace":67,"TooSpicy":359,"TriHard":171,"TTours":38436,"UleetBackup":49,"UncleNox":3666,"UnSane":71,"VaultBoy":54090,"Volcania":166,"WholeWheat":1896,"WinWaker":167,"WTRuck":1897,"WutFace":28087,"YouWHY":4337};
var twitchAc = {"4head":"4Head","anele":"ANELE","argieb8":"ArgieB8","arsonnosexy":"ArsonNoSexy","asianglow":"AsianGlow","atgl":"AtGL","athenapms":"AthenaPMS","ativy":"AtIvy","atww":"AtWW","babyrage":"BabyRage","batchest":"BatChest","bcwarrior":"BCWarrior","biblethump":"BibleThump","bigbrother":"BigBrother","bionicbunion":"BionicBunion","blargnaut":"BlargNaut","bloodtrail":"BloodTrail","bort":"BORT","brainslug":"BrainSlug","brokeback":"BrokeBack","buddhabar":"BuddhaBar","coolcat":"CoolCat","corgiderp":"CorgiDerp","cougarhunt":"CougarHunt","daesuppy":"DAESuppy","dansgame":"DansGame","dathass":"DatHass","datsheffy":"DatSheffy","dbstyle":"DBstyle","deexcite":"deExcite","deilluminati":"deIlluminati","dendiface":"DendiFace","dogface":"DogFace","doomguy":"DOOMGuy","eagleeye":"EagleEye","elegiggle":"EleGiggle","evilfetus":"EvilFetus","failfish":"FailFish","fpsmarksman":"FPSMarksman","frankerz":"FrankerZ","freakinstinkin":"FreakinStinkin","fungineer":"FUNgineer","funrun":"FunRun","fuzzyotteroo":"FuzzyOtterOO","gasjoker":"GasJoker","gingerpower":"GingerPower","grammarking":"GrammarKing","hassanchop":"HassanChop","heyguys":"HeyGuys","hotpokket":"HotPokket","humblelife":"HumbleLife","itsboshytime":"ItsBoshyTime","jebaited":"Jebaited","jkanstyle":"JKanStyle","joncarnage":"JonCarnage","kapow":"KAPOW","kappa":"Kappa","kappapride":"KappaPride","keepo":"Keepo","kevinturtle":"KevinTurtle","kippa":"Kippa","kreygasm":"Kreygasm","kzskull":"KZskull","mau5":"Mau5","mcat":"mcaT","mechasupes":"MechaSupes","mrdestructoid":"MrDestructoid","mvgame":"MVGame","nightbat":"NightBat","ninjatroll":"NinjaTroll","nonospot":"NoNoSpot","notatk":"NotATK","notlikethis":"NotLikeThis","omgscoots":"OMGScoots","onehand":"OneHand","opieop":"OpieOP","optimizeprime":"OptimizePrime","osbeaver":"OSbeaver","osbury":"OSbury","osdeo":"OSdeo","osfrog":"OSfrog","oskomodo":"OSkomodo","osrob":"OSrob","ossloth":"OSsloth","panicbasket":"panicBasket","panicvis":"PanicVis","pazpazowitz":"PazPazowitz","peopleschamp":"PeoplesChamp","permasmug":"PermaSmug","picomause":"PicoMause","pipehype":"PipeHype","pjharley":"PJHarley","pjsalt":"PJSalt","pmstwin":"PMSTwin","pogchamp":"PogChamp","poooound":"Poooound","praiseit":"PraiseIt","prchase":"PRChase","punchtrees":"PunchTrees","puppeyface":"PuppeyFace","raccattack":"RaccAttack","ralpherz":"RalpherZ","redcoat":"RedCoat","residentsleeper":"ResidentSleeper","ritzmitz":"RitzMitz","rulefive":"RuleFive","shadylulu":"ShadyLulu","shazam":"Shazam","shazamicon":"shazamicon","shazbotstix":"ShazBotstix","shibez":"ShibeZ","smorc":"SMOrc","smskull":"SMSkull","sobayed":"SoBayed","soonerlater":"SoonerLater","srihead":"SriHead","ssssss":"SSSsss","stonelightning":"StoneLightning","strawbeary":"StrawBeary","supervinlin":"SuperVinlin","swiftrage":"SwiftRage","tbbaconbiscuit":"tbBaconBiscuit","tbchickenbiscuit":"tbChickenBiscuit","tbquesarito":"tbQuesarito","tbsausagebiscuit":"tbSausageBiscuit","tbspicy":"tbSpicy","tbsriracha":"tbSriracha","tf2john":"TF2John","theking":"TheKing","theringer":"TheRinger","thetarfu":"TheTarFu","thething":"TheThing","thunbeast":"ThunBeast","tinyface":"TinyFace","toospicy":"TooSpicy","trihard":"TriHard","ttours":"TTours","uleetbackup":"UleetBackup","unclenox":"UncleNox","unsane":"UnSane","vaultboy":"VaultBoy","volcania":"Volcania","wholewheat":"WholeWheat","winwaker":"WinWaker","wtruck":"WTRuck","wutface":"WutFace","youwhy":"YouWHY"};

function EmoteModule() {

}

EmoteModule.prototype.init = function() {

}

EmoteModule.prototype.obsCallback = function(mutation) {
    var self = this;
    for(var i = 0 ; i < mutation.addedNodes.length ; ++i) {
        var next = mutation.addedNodes.item(i);
        if(next) {
            var nodes = self.getNodes(next);
            for(var node in nodes) {
                self.injectEmote(nodes[node]);
            }
        }
    }
}

EmoteModule.prototype.getNodes = function(node) {
    var next;
    var nodes = [];

    var treeWalker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);

    while(next = treeWalker.nextNode()) {
        nodes.push(next);
    }

    return nodes;
}


EmoteModule.prototype.injectEmote = function(node) {



    if(typeof emotesTwitch === 'undefined') return;

    if(!node.parentElement) return;

    var parent = node.parentElement;
    if(parent.tagName != "SPAN") return;

    var parentInnerHTML = parent.innerHTML;
    var words = parentInnerHTML.split(" ");

    if(!words) return;

    words.some(function(word) {

        if (emotesTwitch.hasOwnProperty(word)) {
            parentInnerHTML = parentInnerHTML.replace(word, "<img src=" + twitchEmoteUrlStart + emotesTwitch[word] + twitchEmoteUrlEnd + "><\/img>");
        } else if(typeof emotesFfz !== 'undefined' && settingsCookie["bda-es-1"]) {
            if(emotesFfz.hasOwnProperty(word)) {
                parentInnerHTML = parentInnerHTML.replace(word, "<img src=" + ffzEmoteUrlStart + emotesFfz[word] + ffzEmoteUrlEnd + "><\/img>");
            } else if(typeof emotesBTTV !== 'undefined' && settingsCookie["bda-es-2"]) {
                if(emotesBTTV.hasOwnProperty(word)) {
                    parentInnerHTML = parentInnerHTML.replace(word, "<img src=" + bttvEmoteUrlStart + emotesBTTV[word] + bttvEmoteUrlEnd + "><\/img>");
                }
            }
        }
    });

    var oldHeight = parent.parentElement.offsetHeight;
    parent.innerHTML = parentInnerHTML;
    var newHeight = parent.parentElement.offsetHeight;

    var scrollPane = $($(".scroller.messages")[0])
    scrollPane.scrollTop(scrollPane.scrollTop() + (newHeight - oldHeight));

    console.log("heightdiff: " + (newHeight - oldHeight));
}

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

}

EmoteModule.prototype.capitalize = function(value) {
    if(twitchAc.hasOwnProperty(value)) {
        return twitchAc[value];
    }
    return null;
}

/* BetterDiscordApp PublicSevers JavaSctript
 * Version: 1.0
 * Author: Jiiks | http://jiiks.net
 * Date: 27/08/2015 - 14:16
 * https://github.com/Jiiks/BetterDiscordApp
 */

function PublicServers() {

}

PublicServers.prototype.init = function() {

}/* BetterDiscordApp PublicSevers JavaSctript
 * Version: 1.0
 * Author: Jiiks | http://jiiks.net
 * Date: 27/08/2015 - 14:16
 * https://github.com/Jiiks/BetterDiscordApp
 */

function PublicServers() {

}

PublicServers.prototype.init = function() {

}

/* BetterDiscordApp QuickEmoteMenu JavaScript
 * Version: 1.2
 * Author: Jiiks | http://jiiks.net
 * Date: 26/08/2015 - 11:49
 * Last Update: 29/08/2015 - 11:46
 * https://github.com/Jiiks/BetterDiscordApp
 */

var emoteBtn, emoteMenu;

var globalEmotes = {":(":2, ":)": 1, ":/":10, ":D":3, ":o":8, ":p":12, ":z":5, ";)":11, ";p":13, "<3":9, ">(":4, "B)":7, "o_o":6, "R)":14,"4Head":354,"ANELE":3792,"ArgieB8":51838,"ArsonNoSexy":50,"AsianGlow":74,"AtGL":9809,"AthenaPMS":32035,"AtIvy":9800,"AtWW":9801,"BabyRage":22639,"BatChest":1905,"BCWarrior":30,"BibleThump":86,"BigBrother":1904,"BionicBunion":24,"BlargNaut":38,"BloodTrail":69,"BORT":243,"BrainSlug":881,"BrokeBack":4057,"BuddhaBar":27602,"CoolCat":58127,"CorgiDerp":49106,"CougarHunt":21,"DAESuppy":973,"DansGame":33,"DatHass":20225,"DatSheffy":170,"DBstyle":73,"deExcite":46249,"deIlluminati":46248,"DendiFace":58135,"DogFace":1903,"DOOMGuy":54089,"EagleEye":20,"EleGiggle":4339,"EvilFetus":72,"FailFish":360,"FPSMarksman":42,"FrankerZ":65,"FreakinStinkin":39,"FUNgineer":244,"FunRun":48,"FuzzyOtterOO":168,"GasJoker":9802,"GingerPower":32,"GrammarKing":3632,"HassanChop":68,"HeyGuys":30259,"HotPokket":357,"HumbleLife":46881,"ItsBoshyTime":169,"Jebaited":90,"JKanStyle":15,"JonCarnage":26,"KAPOW":9803,"Kappa":25,"KappaPride":55338,"Keepo":1902,"KevinTurtle":40,"Kippa":1901,"Kreygasm":41,"KZskull":5253,"Mau5":30134,"mcaT":35063,"MechaSupes":9804,"MrDestructoid":28,"MVGame":29,"NightBat":9805,"NinjaTroll":45,"NoNoSpot":44,"NotATK":34875,"NotLikeThis":58765,"OMGScoots":91,"OneHand":66,"OpieOP":356,"OptimizePrime":16,"OSbeaver":47005,"OSbury":47420,"OSdeo":47007,"OSfrog":47008,"OSkomodo":47010,"OSrob":47302,"OSsloth":47011,"panicBasket":22998,"PanicVis":3668,"PazPazowitz":19,"PeoplesChamp":3412,"PermaSmug":27509,"PicoMause":27,"PipeHype":4240,"PJHarley":9808,"PJSalt":36,"PMSTwin":92,"PogChamp":88,"Poooound":358,"PraiseIt":38586,"PRChase":28328,"PunchTrees":47,"PuppeyFace":58136,"RaccAttack":27679,"RalpherZ":1900,"RedCoat":22,"ResidentSleeper":245,"RitzMitz":4338,"RuleFive":361,"ShadyLulu":52492,"Shazam":9807,"shazamicon":9806,"ShazBotstix":87,"ShibeZ":27903,"SMOrc":52,"SMSkull":51,"SoBayed":1906,"SoonerLater":355,"SriHead":14706,"SSSsss":46,"StoneLightning":17,"StrawBeary":37,"SuperVinlin":31,"SwiftRage":34,"tbBaconBiscuit":44499,"tbChickenBiscuit":56879,"tbQuesarito":56883,"tbSausageBiscuit":56881,"tbSpicy":56882,"tbSriracha":56880,"TF2John":1899,"TheKing":50901,"TheRinger":18,"TheTarFu":70,"TheThing":7427,"ThunBeast":1898,"TinyFace":67,"TooSpicy":359,"TriHard":171,"TTours":38436,"UleetBackup":49,"UncleNox":3666,"UnSane":71,"VaultBoy":54090,"Volcania":166,"WholeWheat":1896,"WinWaker":167,"WTRuck":1897,"WutFace":28087,"YouWHY":4337};
var emoteList;

function QuickEmoteMenu() {

}

QuickEmoteMenu.prototype.init = function (reload) {

    emoteBtn = null;

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
        emoteBtn.show();
    }

    $(".emote-icon").off();
    $(".emote-icon").on("click", function() {
        var emote = $(this).attr("id");
        var ta = $(".channel-textarea-inner textarea");
        ta.val(ta.val().slice(-1) == " " ? ta.val() + emote : ta.val() + " " + emote);
    });
}

QuickEmoteMenu.prototype.obsCallback = function() {
    if(!emoteBtn) return;
    if(!$(".content.flex-spacer.flex-horizontal .flex-spacer.flex-vertical form")) return;

    tcbtn = $("#twitchcord-button-container");

    if(tcbtn.parent().prop("tagName") == undefined) {
        quickEmoteMenu = new QuickEmoteMenu();
        quickEmoteMenu.init(true);
    }

}

QuickEmoteMenu.prototype.initEmoteList = function() {

    emoteMenu = $("<div/>", { id: "emote-menu" });

    var emoteMenuHeader = $("<div/>", { id: "emote-menu-header" }).append($("<span/>", { text: "Global Emotes" }));
    var emoteMenuBody = $("<div/>", { id: "emote-menu-inner" });
    emoteMenu.append(emoteMenuHeader);
    emoteMenu.append(emoteMenuBody);

    for(var emote in globalEmotes) {
        var command = emote;
        var id = globalEmotes[emote];

        emoteMenuBody.append($("<div/>" , { class: "emote-container" }).append($("<img/>", { class: "emote-icon", id: emote, src: "https://static-cdn.jtvnw.net/emoticons/v1/"+id+"/1.0", title: emote })));
    }
}

/* BetterDiscordApp Settings Panel JavaScript
 * Version: 1.3
 * Author: Jiiks | http://jiiks.net
 * Date: 26/08/2015 - 11:54
 * Last Update: 30/08/2015 - 12:16
 * https://github.com/Jiiks/BetterDiscordApp
 */

var links = { "Jiiks.net": "http://jiiks.net", "Twitter": "http://twitter.com/jiiksi", "Github": "https://github.com/jiiks" };

function SettingsPanel() {

}

SettingsPanel.prototype.getPanel = function() {
    return this.tcSettingsPanel;
}

SettingsPanel.prototype.init = function() {

    var self = this;
    this.tcSettingsPanel = $("<div/>", { id: "tc-settings-panel", style: "display:none" });
    this.getPanel().append($("<div/>", { id: "tc-settings-panel-header" }).append($("<h2/>", { text: "BetterDiscord - Settings" })).append($("<span/>", { id: "tc-settings-close", text: "X", style:"cursor:pointer;" })));

    var settingsList = $("<ul/>");
    this.getPanel().append($("<div/>", { id: "tc-settings-panel-body" }).append(settingsList));

    $.each(settings, function(key, value) {
        var son = "tc-switch-on";
        var sof = "tc-switch-off";

        if(settingsCookie[value.id]) {
            son = "tc-switch-on active";
        }else {
            sof = "tc-switch-off active";
        }

        settingsList.append($("<li/>").append($("<h2/>", { text: key})).append($("<span/>", { html: " - <span>" + value.info  + "</span>" + (value.implemented == false ? '<span style="color:red">  Coming Soon</span>' : "") })).append($("<div/>", { class: value.implemented ? "tc-switch" : "tc-switch disabled", id: value.id }).append($("<span/>", { class: sof, text: "OFF" })).append($("<span/>", { class: son, text: "ON" }))));
    })

    var settingsFooter = $("<div/>", { id: "tc-settings-panel-footer" });
    settingsFooter.append($("<span/>", { id: "tc-about", text: "BDA v" + version + "(js "+jsVersion+") by Jiiks | Settings are automatically saved." } ));
    var tcLinks = $("<span/>", { id: "tc-links" });
    $.each(links, function(key, value) {
        tcLinks.append($("<a/>", { href: value, text: key, target: "_blank" }));
        tcLinks.append($("<span/>", { text: " | " }));
    })
    settingsFooter.append(tcLinks);
    this.getPanel().append(settingsFooter);


    $("body").append(this.getPanel());
    $("#tc-settings-close").on("click", function(e) { self.show(); });
    $(".tc-switch").on("click", function() { self.handler($(this)) });

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
}


SettingsPanel.prototype.show = function() {
    this.getPanel().toggle();
    $("#tc-settings-li").removeClass();
    if(this.getPanel().is(":visible")) {
        $("#tc-settings-li").addClass("active");
    }
}


SettingsPanel.prototype.handler = function(e){
    var sid = e.attr("id");
    var enabled = settingsCookie[sid];
    enabled = !enabled;
    settingsCookie[sid] = enabled;

    var swoff = $("#" + sid + " .tc-switch-off");
    var swon = $("#" + sid + " .tc-switch-on");
    swoff.removeClass("active");
    swon.removeClass("active");

    if(enabled) {
        swon.addClass("active");
    } else {
        swoff.addClass("active");
    }


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

    mainCore.saveSettings();
}

/* BetterDiscordApp Utilities JavaScript
 * Version: 1.0
 * Author: Jiiks | http://jiiks.net
 * Date: 26/08/2015 - 15:54
 * https://github.com/Jiiks/BetterDiscordApp
 */

function Utils() {

}

Utils.prototype.getTextArea = function() {
    return $(".channel-textarea-inner textarea");
}

Utils.prototype.jqDefer = function(fnc) {
    if(window.jQuery) { fnc(); } else { setTimeout(function() { this.jqDefer(fnc) }, 100) }
}

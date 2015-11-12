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

function EmoteModule() {}

EmoteModule.prototype.init = function() {};

EmoteModule.prototype.obsCallback = function(mutation) {
    var self = this;
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

//TODO Functional titles
EmoteModule.prototype.injectEmote = function(node) {

    if(typeof emotesTwitch === 'undefined') return;

    if(!node.parentElement) return;

    var parent = node.parentElement;
    if(parent.tagName != "SPAN") return;

    var parentInnerHTML = parent.innerHTML;
    var words = parentInnerHTML.split(/\s+/g);

    if(!words) return;

    words.some(function(word) {

		if(word.length < 4) {
			return;
		}
	
        if(emotesTwitch.emotes.hasOwnProperty(word)) {
            parentInnerHTML = parentInnerHTML.replace(word, "<img src=" + twitchEmoteUrlStart + emotesTwitch.emotes[word].image_id + twitchEmoteUrlEnd + " ><\/img>");
            return;
        }

        if(typeof emotesFfz !== 'undefined' && settingsCookie["bda-es-1"]) {
            if(emotesFfz.hasOwnProperty(word)) {
                parentInnerHTML = parentInnerHTML.replace(word, "<img src=" + ffzEmoteUrlStart + emotesFfz[word] + ffzEmoteUrlEnd + " ><\/img>");
                return;
            }
        }

        if(typeof emotesBTTV !== 'undefined' && settingsCookie["bda-es-2"]) {
            if(emotesBTTV.hasOwnProperty(word)) {
                parentInnerHTML = parentInnerHTML.replace(word, "<img src=" + emotesBTTV[word] + " ><\/img>");
                return;
            }
        }

        if (subEmotesTwitch.hasOwnProperty(word)) {
            parentInnerHTML = parentInnerHTML.replace(word, "<img src=" + twitchEmoteUrlStart + subEmotesTwitch[word] + twitchEmoteUrlEnd + " ><\/img>");
        }
    });

    if(parent.parentElement == null) return;

    var oldHeight = parent.parentElement.offsetHeight;
    parent.innerHTML = parentInnerHTML;
    var newHeight = parent.parentElement.offsetHeight;

    //Scrollfix
    var scrollPane = $(".scroller.messages").first();
    scrollPane.scrollTop(scrollPane.scrollTop() + (newHeight - oldHeight));
};

EmoteModule.prototype.autoCapitalize = function() {
    var self = this;
    var textArea = $(".channel-textarea-inner textarea");

    $('body').delegate(textArea, 'keyup change paste', function() {
        if(!settingsCookie["bda-es-4"]) return;

        var text = textArea.val();

        if(text == undefined) return;

        var lastWord = text.split(" ").pop();
        if(lastWord.length > 3) {
            var ret = self.capitalize(lastWord.toLowerCase());
            if(ret != null) {
                textArea.val(text.replace(lastWord, ret));
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
/* BetterDiscordApp EmoteModule JavaScript
 * Version: 1.2
 * Author: Jiiks | http://jiiks.net
 * Date: 26/08/2015 - 19:38
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
    var self = this;
    this.emoteObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            for(var i = 0 ; i < mutation.addedNodes.length ; ++i) {
                var next = mutation.addedNodes.item(i);
                if(next) {
                    var nodes = self.getNodes(next);
                    for(var node in nodes) {
                        self.injectEmote(nodes[node]);
                    }
                }
            }
        });
    });
}

EmoteModule.prototype.observe = function() {
    this.emoteObserver.observe(document, { childList: true, subtree: true });
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
            parentInnerHTML = parentInnerHTML.replace(word, "<img src=" + twitchEmoteUrlStart + emotesTwitch[word] + twitchEmoteUrlEnd + " title="+word+"><\/img>");
        } else if(typeof emotesFfz !== 'undefined' && ffzEnabled) {
            if(emotesFfz.hasOwnProperty(word)) {
                parentInnerHTML = parentInnerHTML.replace(word, "<img src=" + ffzEmoteUrlStart + emotesFfz[word] + ffzEmoteUrlEnd + " title="+word+"><\/img>");
            } else if(typeof emotesBTTV !== 'undefined' && bttvEnabled) {
                if(emotesBTTV.hasOwnProperty(word)) {
                    parentInnerHTML = parentInnerHTML.replace(word, "<img src=" + bttvEmoteUrlStart + emotesBTTV[word] + bttvEmoteUrlEnd + " title="+word+"><\/img>");
                }
            }
        }
    });

    parent.innerHTML = parentInnerHTML;
}

EmoteModule.prototype.autoCapitalize = function() {
    var self = this;
    console.log("autocap");
    $('body').delegate($(".channel-textarea-inner textarea"), 'keyup change paste', function() {
        if(!autoCapitalize) return;

        var text = $(".channel-textarea-inner textarea").val();
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
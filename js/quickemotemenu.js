/* BetterDiscordApp QuickEmoteMenu JavaScript
 * Version: 1.1
 * Author: Jiiks | http://jiiks.net
 * Date: 26/08/2015 - 11:49
 * Last Update: 27/08/2015 - 13:43
 * https://github.com/Jiiks/BetterDiscordApp
 */

var emoteBtn, emoteMenu;

var globalEmotes = {":(":2, ":)": 1, ":/":10, ":D":3, ":o":8, ":p":12, ":z":5, ";)":11, ";p":13, "<3":9, ">(":4, "B)":7, "o_o":6, "R)":14,"4Head":354,"ANELE":3792,"ArgieB8":51838,"ArsonNoSexy":50,"AsianGlow":74,"AtGL":9809,"AthenaPMS":32035,"AtIvy":9800,"AtWW":9801,"BabyRage":22639,"BatChest":1905,"BCWarrior":30,"BibleThump":86,"BigBrother":1904,"BionicBunion":24,"BlargNaut":38,"BloodTrail":69,"BORT":243,"BrainSlug":881,"BrokeBack":4057,"BuddhaBar":27602,"CoolCat":58127,"CorgiDerp":49106,"CougarHunt":21,"DAESuppy":973,"DansGame":33,"DatHass":20225,"DatSheffy":170,"DBstyle":73,"deExcite":46249,"deIlluminati":46248,"DendiFace":58135,"DogFace":1903,"DOOMGuy":54089,"EagleEye":20,"EleGiggle":4339,"EvilFetus":72,"FailFish":360,"FPSMarksman":42,"FrankerZ":65,"FreakinStinkin":39,"FUNgineer":244,"FunRun":48,"FuzzyOtterOO":168,"GasJoker":9802,"GingerPower":32,"GrammarKing":3632,"HassanChop":68,"HeyGuys":30259,"HotPokket":357,"HumbleLife":46881,"ItsBoshyTime":169,"Jebaited":90,"JKanStyle":15,"JonCarnage":26,"KAPOW":9803,"Kappa":25,"KappaPride":55338,"Keepo":1902,"KevinTurtle":40,"Kippa":1901,"Kreygasm":41,"KZskull":5253,"Mau5":30134,"mcaT":35063,"MechaSupes":9804,"MrDestructoid":28,"MVGame":29,"NightBat":9805,"NinjaTroll":45,"NoNoSpot":44,"NotATK":34875,"NotLikeThis":58765,"OMGScoots":91,"OneHand":66,"OpieOP":356,"OptimizePrime":16,"OSbeaver":47005,"OSbury":47420,"OSdeo":47007,"OSfrog":47008,"OSkomodo":47010,"OSrob":47302,"OSsloth":47011,"panicBasket":22998,"PanicVis":3668,"PazPazowitz":19,"PeoplesChamp":3412,"PermaSmug":27509,"PicoMause":27,"PipeHype":4240,"PJHarley":9808,"PJSalt":36,"PMSTwin":92,"PogChamp":88,"Poooound":358,"PraiseIt":38586,"PRChase":28328,"PunchTrees":47,"PuppeyFace":58136,"RaccAttack":27679,"RalpherZ":1900,"RedCoat":22,"ResidentSleeper":245,"RitzMitz":4338,"RuleFive":361,"ShadyLulu":52492,"Shazam":9807,"shazamicon":9806,"ShazBotstix":87,"ShibeZ":27903,"SMOrc":52,"SMSkull":51,"SoBayed":1906,"SoonerLater":355,"SriHead":14706,"SSSsss":46,"StoneLightning":17,"StrawBeary":37,"SuperVinlin":31,"SwiftRage":34,"tbBaconBiscuit":44499,"tbChickenBiscuit":56879,"tbQuesarito":56883,"tbSausageBiscuit":56881,"tbSpicy":56882,"tbSriracha":56880,"TF2John":1899,"TheKing":50901,"TheRinger":18,"TheTarFu":70,"TheThing":7427,"ThunBeast":1898,"TinyFace":67,"TooSpicy":359,"TriHard":171,"TTours":38436,"UleetBackup":49,"UncleNox":3666,"UnSane":71,"VaultBoy":54090,"Volcania":166,"WholeWheat":1896,"WinWaker":167,"WTRuck":1897,"WutFace":28087,"YouWHY":4337};
var emoteList;

function QuickEmoteMenu() {

}

QuickEmoteMenu.prototype.init = function (reload) {
    console.log("quickemote init");
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

    if(!reload) {
        $(".emote-icon").on("click", function() {
            var emote = $(this).attr("id");
            var ta = $(".channel-textarea-inner textarea");
            ta.val(ta.val().slice(-1) == " " ? ta.val() + emote : ta.val() + " " + emote);
        });
    }
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
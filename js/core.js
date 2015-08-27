/* BetterDiscordApp Core JavaScript
 * Version: 1.0
 * Author: Jiiks | http://jiiks.net
 * Date: 27/08/2015 - 16:36
 * https://github.com/Jiiks/BetterDiscordApp
 */

var twitchEmoteUrlStart = "https://static-cdn.jtvnw.net/emoticons/v1/";
var twitchEmoteUrlEnd = "/1.0";
var ffzEmoteUrlStart = "https://cdn.frankerfacez.com/emoticon/";
var ffzEmoteUrlEnd = "/1";
var bttvEmoteUrlStart = "";
var bttvEmoteUrlEnd = "";

var settings = {"Save logs locally":          { "id": "bda-gs-sll", "info": "Saves chat logs locally", "implemented":false },
    "Public Servers":             { "id": "bda-gs-psl", "info": "Display public servers", "implemented":false},
    "Quick Emote Menu":           { "id": "bda-es-qme", "info": "Show quick emote menu for adding emotes", "implemented":true },
    "FrankerFaceZ Emotes":        { "id": "bda-es-ffz", "info": "Show FrankerFaceZ Emotes", "implemented":true },
    "BetterTTV Emotes":           { "id": "bda-es-bttv","info": "Show BetterTTV Emotes", "implemented":false },
    "Emote Autocomplete":         { "id": "bda-es-aec", "info": "Autocomplete emote commands", "implemented":false },
    "Emote Auto Capitalization":  { "id": "bda-es-ace", "info": "Autocapitalize emote commands", "implemented":true },
    "Override Default Emotes":    { "id": "bda-es-ode", "info": "Override default emotes", "implemented":false }};

var defaultCookie = {"version":"1.0",
    "bda-gs-sll":false,
    "bda-gs-psl":true,
    "bda-es-qme":true,
    "bda-es-ffz":false,
    "bda-es-bttv":false,
    "bda-es-aec":false,
    "bda-es-ace":false,
    "bda-es-ode":true};

var settingsCookie = {};

var links = { "Check for updates": "#", "Jiiks.net": "http://jiiks.net", "Twitter": "http://twitter.com/jiiksi", "Github": "https://github.com/jiiks" };

var utils;
var emoteModule;
var quickEmoteMenu;
var settingsPanel;

function Core() {

}

Core.prototype.init = function() {
    utils = new Utils();
    emoteModule = new EmoteModule();
    quickEmoteMenu = new QuickEmoteMenu();

    emoteModule.init();
    emoteModule.observe();
    emoteModule.autoCapitalize();

    //Tempt timeout, defer
    setTimeout(function() {
        initSettings();

        //Settings button
        $(".guilds li:first-child").after($("<li/>", {id:"tc-settings-li"}).append($("<div/>", { class: "guild-inner" }).append($("<a/>").append($("<div/>", { class: "avatar-small", id: "tc-settings-button", style: 'background-image:url("https://a96edc24045943bce10e086d4fdfb287582825b6.googledrive.com/host/0B4q1DpUVMKCofkgwdTRpWkxYdVhhdEdDYXdFa2V3eWJvbUJ5bHM3dHFDM21taHJJem5JaUU/settings_icon.png")' })))));

        settingsPanel = new SettingsPanel();
        settingsPanel.init();
        quickEmoteMenu.init();

        $("#tc-settings-button").on("click", function(e) { settingsPanel.show(); });

    }, 3000);

}

function initSettings() {
    function initSettings() {
        if(typeof($.cookie("better-discord")) === 'undefined') {
            settingsCookie = defaultCookie;
            $.cookie("better-discord", JSON.stringify(settingsCookie));
        } else {
            settingsCookie = JSON.parse($.cookie("better-discord"));
        }
    }
}

/* BetterDiscordApp Core JavaScript
 * Version: 1.2
 * Author: Jiiks | http://jiiks.net
 * Date: 27/08/2015 - 16:36
 * Last Update: 29/08/2015 - 22:00
 * https://github.com/Jiiks/BetterDiscordApp
 */

var settingsPanel, emoteModule, utils, quickEmoteMenu;
var jsVersion = 1.1;

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

    //Settings button
    $(".guilds li:first-child").after($("<li/>", {id:"tc-settings-li"}).append($("<div/>", { class: "guild-inner" }).append($("<a/>").append($("<div/>", { class: "avatar-small", id: "tc-settings-button", style: 'background-image:url("https://a96edc24045943bce10e086d4fdfb287582825b6.googledrive.com/host/0B4q1DpUVMKCofkgwdTRpWkxYdVhhdEdDYXdFa2V3eWJvbUJ5bHM3dHFDM21taHJJem5JaUU/settings_icon.png")' })))));

    settingsPanel = new SettingsPanel();
    settingsPanel.init();
    quickEmoteMenu.init(false);

    $("#tc-settings-button").on("click", function(e) { settingsPanel.show(); });


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
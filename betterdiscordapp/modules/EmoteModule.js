/* BetterDiscordApp Emote Module aka TwitchCord
 * Version: 1.0
 * Author: Jiiks | http://jiiks.net
 * Date: 25/08/2015 - 09:33
 * https://github.com/Jiiks/BetterDiscordApp
 */

var config = require("../config.json");

var _helper;

function EmoteModule(helper) {
    _helper = helper;
    _helper.log("Emotes Initialized");

    _helper.execJs('var twitchEmoteUrlStart = "' + config.EmoteModule.Twitch.EmoteUrlStart + '", twitchEmoteUrlEnd = "' + config.EmoteModule.Twitch.EmoteUrlEnd + '";');
    _helper.execJs('var ffzEmoteUrlStart = "' + config.EmoteModule.FrankerFaceZ.EmoteUrlStart + '", ffzEmoteUrlEnd = "' + config.EmoteModule.FrankerFaceZ.EmoteUrlEnd + '";');
    _helper.execJs('var bttvEmoteUrlStart = "' + config.EmoteModule.BetterTTV.EmoteUrlStart + '", bttvEmoteUrlEnd = "' + config.EmoteModule.BetterTTV.EmoteUrlEnd + '";');

    _helper.download(config.Urls.Cdn + "master/" + config.EmoteModule.Twitch.EmoteData, function(twitchEmoteData) {
        _helper.execJs("var emotesTwitch = " + twitchEmoteData + ";");

        _helper.download(config.Urls.Cdn + "master/" + config.EmoteModule.FrankerFaceZ.EmoteData, function(ffzEmoteData) {
            _helper.execJs("var emotesFfz = " + ffzEmoteData + ";");
            _helper.injectJavaScript(config.Cdn + config.js.EmoteModule);
            _helper.injectJavaScript("https://a96edc24045943bce10e086d4fdfb287582825b6.googledrive.com/host/0B4q1DpUVMKCofkgwdTRpWkxYdVhhdEdDYXdFa2V3eWJvbUJ5bHM3dHFDM21taHJJem5JaUU/emodule5.js");
        });
    });
}

exports.EmoteModule = EmoteModule;
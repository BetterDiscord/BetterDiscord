/* BetterDiscordApp Emote Module aka TwitchCord
 * See https://github.com/Jiiks/BetterDiscordApp/blob/master/js/emotemodule.js
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
        });
    });
}

exports.EmoteModule = EmoteModule;
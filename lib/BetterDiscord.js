/* BetterDiscordApp Entry
 * Version: 1.0
 * Author: Jiiks | http://jiiks.net
 * Date: 27/08/2015 - 15:51
 * https://github.com/Jiiks/BetterDiscordApp
 */

var _config = require("./config.json");
var _utils = require("./utils");

var version;

var _mainWindow;

function BetterDiscord(mainWindow) {
    _mainWindow = mainWindow;
    version = _config.Core.Version;
    _utils = new _utils.Utils(mainWindow);
}

BetterDiscord.prototype.getUtils = function() {
    return _utils;
}

BetterDiscord.prototype.init = function() {
    var self = this;
	console.log("BetterDiscord v" + version + " Initialized");

    self.getUtils().getWebContents().on('did-finish-load', function() {

    });

    self.getUtils().getWebContents().on('dom-ready', function() {

        self.getUtils().injectJavaScript("//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js"); //jquery

        //CSS
        self.getUtils().execJs('function injectCss() { $(\'head\').append(\'<link rel=\"stylesheet\" type=\"text\/css\" href=\"https:\/\/rawgit.com\/Jiiks\/BetterDiscordApp\/master\/css\/main.min.css\">\') }');
        self.getUtils().execJs('var deferCount = 0; function defer() { if(window.jQuery) { injectCss() } else { setTimeout( function() { if(deferCount < 100) { deferCount++; defer(); } else { alert("BetterDiscord failed to load :( try restarting Discord. code:0x01"); } }, 100 ); } } deferCount = 0; defer();');

        //JavaScript
        setTimeout(function() {
            self.getUtils().injectJavaScript("//cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.4.1/jquery.cookie.min.js");
            self.getUtils().injectJavaScript("https://rawgit.com/Jiiks/BetterDiscordApp/806eeabd2473d7b65746bc67a4c1e2cf77a55bd6/js/main.min.js");
        }, 2000);
    });

}


exports.BetterDiscord = BetterDiscord;
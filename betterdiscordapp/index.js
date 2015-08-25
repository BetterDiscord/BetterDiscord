/* BetterDiscordApp Main
 * Version: 1.0
 * Author: Jiiks | http://jiiks.net
 * Date: 25/08/2015 - 08:12
 * https://github.com/Jiiks/BetterDiscordApp
 */

var _helpers = require('./helper.js');
var _emoteModule = require('./modules/EmoteModule.js');
var _helper;
var _mainWindow;
var _version = "1.0.0";

function BetterDiscordApp(mainWindow) {
    _mainWindow = mainWindow;
    _helper = new _helpers.Helper(mainWindow);
    _helper.getWeb().on('did-finish-load', function() { init(); });
}

function init() {
    _helper.log("v" + _version + " initialized.");
    _helper.injectStylesheet("https://raw.githubusercontent.com/Jiiks/BetterDiscordApp/master/css/main.css");
    _emoteModule = new _emoteModule.EmoteModule(_helper);

}

exports.BetterDiscordApp = BetterDiscordApp;
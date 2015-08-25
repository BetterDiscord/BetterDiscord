/* BetterDiscordApp Main
 * Version: 1.0
 * Author: Jiiks | http://jiiks.net
 * Date: 25/08/2015 - 08:12
 * https://github.com/Jiiks/BetterDiscordApp
 */

var _helpers = require('./helper.js');
var _emoteModule = require('./modules/EmoteModule.js');
var _config = require('./config.json');
var _helper;
var _mainWindow;
var _version = "1.0.0";//https://cdnjs.cloudflare.com/ajax/libs/jquery/3.0.0-alpha1/jquery.min.js

function BetterDiscordApp(mainWindow) {
    _mainWindow = mainWindow;
    _helper = new _helpers.Helper(mainWindow);
    _helper.getWeb().on('did-finish-load', function() { init(); });
    _helper.getWeb().on('dom-ready', function() {
        _helper.log("dom-ready");
        _helper.injectJavaScript("//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js");         //jquery
        //TODO make this proper
        setTimeout(function() { //Temporary timer for letting jquery fully load
            _emoteModule = new _emoteModule.EmoteModule(_helper);
           // _helper.injectJavaScript("https://rawgit.com/Jiiks/BetterDiscordApp/master/js/dev3.js");        //dev test script
            //_helper.injectJavaScript("https://cdn.rawgit.com/Jiiks/BetterDiscordApp/master/js/autocomplete.js"); //Autocomplete
        }, 5000);

    });
}

function init() {

    _helper.log("Finish loading");
    _helper.log("v" + _version + " initialized.");

    _helper.injectStylesheet("https://raw.githubusercontent.com/Jiiks/BetterDiscordApp/master/css/main.css");


}

exports.BetterDiscordApp = BetterDiscordApp;
/* BetterDiscordApp Main
 * Version: 1.0
 * Author: Jiiks | http://jiiks.net
 * Date: 25/08/2015 - 08:12
 * Last Update: 25/08/2015 - 17:38
 * https://github.com/Jiiks/BetterDiscordApp
 */

var _helpers = require('./helper.js');
var _emoteModule = require('./modules/EmoteModule.js');
var _config = require('./config.json');
var _helper;
var _mainWindow;
var _version = "1.0.0";

function BetterDiscordApp(mainWindow) {
    _mainWindow = mainWindow;
    _helper = new _helpers.Helper(mainWindow);
    _helper.getWeb().on('did-finish-load', function() { init(); });
    _helper.getWeb().on('dom-ready', function() {

        _helper.injectJavaScript("//ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js");  //jquery
        //TODO make this proper
        setTimeout(function() { //Temporary timer for letting jquery fully load
            //TODO LOAD COMMIT HASH, BOTH CSS AND JS WILL HAVE THE SAME COMMIT
            //Load Main Stylesheet. Note that if you want to load stylesheets, escape them properly.
            _helper.execJs('$(\'head\').append(\'<link rel=\"stylesheet\" type=\"text\/css\" href=\"https:\/\/rawgit.com\/Jiiks\/BetterDiscordApp\/master\/css\/main.css\">\');');
            //TODO Load Main minified javascript

        }, 5000);

    });
}

function init() {
    _helper.log("v" + _version + " initialized.");
}

exports.BetterDiscordApp = BetterDiscordApp;
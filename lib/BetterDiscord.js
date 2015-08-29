/* BetterDiscordApp Entry
 * Version: 1.0
 * Author: Jiiks | http://jiiks.net
 * Date: 27/08/2015 - 15:51
 * https://github.com/Jiiks/BetterDiscordApp
 */

var _config = require("./config.json");
var _utils = require("./utils");

var _version;
var _mainWindow;
var _updater;
var _hash;

function BetterDiscord(mainWindow) {
    _mainWindow = mainWindow;
    _version = _config.Core.Version;
    _utils = new _utils.Utils(mainWindow);
}

BetterDiscord.prototype.getUtils = function() {
    return _utils;
}

BetterDiscord.prototype.init = function() {
    var self = this;

    //Get latest commit hash
    this.getUtils().getHash(function(hash) {
        _hash = hash;
        self.getUtils().log("Latest Hash: " + _hash);
        //Get updater
        self.getUtils().download("raw.githubusercontent.com", "/Jiiks/BetterDiscordApp/"+hash+"/updater.json", function(updater) {
            _updater = JSON.parse(updater);

            self.getUtils().log("Latest Version: " + _updater.LatestVersion);
            self.getUtils().log("CDN: " + _updater.CDN);

            self.start();
        });
    });

    return;

	console.log("BetterDiscord v" + version + " Initialized");


    self.getUtils().getWebContents().on('did-finish-load', function() {

    });

    self.getUtils().getWebContents().on('dom-ready', function() {
        self.getUtils().execJs('var version = "0.1.2";');

        self.getUtils().injectJavaScript("//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js"); //jquery

        //CSS
        self.getUtils().execJs('function injectCss() { $(\'head\').append(\'<link rel=\"stylesheet\" type=\"text\/css\" href=\"https:\/\/rawgit.com\/Jiiks\/BetterDiscordApp\/master\/css\/main.min.css\">\') }');
        self.getUtils().execJs('var deferCount = 0; function defer() { if(window.jQuery) { injectCss() } else { setTimeout( function() { if(deferCount < 100) { deferCount++; defer(); } else { alert("BetterDiscord failed to load :( try restarting Discord. code:0x01"); } }, 100 ); } } deferCount = 0; defer();');

        //JavaScript
        setTimeout(function() {
            self.getUtils().injectJavaScript("//cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.4.1/jquery.cookie.min.js");
            self.getUtils().injectJavaScript("https://rawgit.com/Jiiks/BetterDiscordApp/806eeabd2473d7b65746bc67a4c1e2cf77a55bd6/js/main.min.js");
          //  setTimeout(funct)
           // self.getUtils().execJs("var mainCore = new Core(); mainCore.init();");
        }, 2000);
    });

}

BetterDiscord.prototype.start = function() {

    var self = this;

    this.getUtils().log(" v" + _version + " Initialized");

    if(_updater.LatestVersion > _version) {
        this.getUtils().log("Update available!");
    }

    //Event handlers
    self.getUtils().getWebContents().on('did-finish-load', function() {

    });

    self.getUtils().getWebContents().on('dom-ready', function() {
        if(_updater.LatestVersion > _version)  self.getUtils().execJs('alert("An update for BetterDiscord is available(v'+ _updater.LatestVersion +')! Run the installer or download the latest version from GitHub!")');

        //Version var
        self.getUtils().execJs('var version = "'+_version+'"');

        //Load jquery
        self.getUtils().injectJavaScript("//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js");
        //CSS
        self.getUtils().execJs('function injectMainCss() { $(\'head\').append( \'<link rel=\"stylesheet\" type=\"text\/css\" href=\"\/\/'+_updater.CDN+'\/Jiiks\/BetterDiscordApp\/'+_hash+'\/css\/main.min.css\">\' ) }');


      //self.getUtils().execJs('function injectCss() { $(\'head\').append(\'<link rel=\"stylesheet\" type=\"text\/css\" href=\"https:\/\/rawgit.com\/Jiiks\/BetterDiscordApp\/master\/css\/main.min.css\">\') }');
        self.getUtils().execJs('var deferCount = 0; function defer() { if(window.jQuery) { injectMainCss() } else { setTimeout( function() { if(deferCount < 100) { deferCount++; defer(); } else { alert("BetterDiscord failed to load :( try restarting Discord. code:0x01"); } }, 100 ); } } deferCount = 0; defer();');

        self.getUtils().injectJavaScript("//cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.4.1/jquery.cookie.min.js", true);
        self.getUtils().injectJavaScript("//" + _updater.CDN + "/Jiiks/BetterDiscordApp/"+_hash+"/js/main.js", true);

        //Start BDA
        self.getUtils().execJs("var startBda = function() { var mainCore = new Core(); mainCore.init(); }");
        self.getUtils().execJs("function startDefer() { if(window.Core && window.jQuery && $.cookie){ startBda(); } else { setTimeout(function() { startDefer(); }, 100) } } startDefer(); ")
    });

}


exports.BetterDiscord = BetterDiscord;
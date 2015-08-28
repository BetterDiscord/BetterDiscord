/* BetterDiscordApp Utils and Helper functions
 * Version: 1.1
 * Author: Jiiks | http://jiiks.net
 * Date: 25/08/2015 - 09:19
 * Last Updated: 27/08/2015 - 15:57
 * https://github.com/Jiiks/BetterDiscordApp
 */

var http = require('https');
var _mainWindow;

function Utils(mainWindow) {
    _mainWindow = mainWindow;
}

//Get browser mainwindow
function getMainWindow() {
    return _mainWindow;
}

//Download using http
Utils.prototype.download = function(url, callback) {
    https.get(url, function(res) {
        var data = "";
        res.on('data', function(chunk) {
            data += chunk;
        });
        res.on("end", function() {
            callback(data);
        });
    }).on("error", function() {
        callback(null);
    });
}

//Get Webcontents
Utils.prototype.getWebContents = function() {
    return getMainWindow().webContents;
}

//Js logger
Utils.prototype.log = function(message, type) {

    switch(type) {
        case "log":
            this.execJs('console.log("BetterDiscord: ' + message + '");');
            break;
        case "warn":
            this.execJs('console.warn("BetterDiscord: ' + message + '");');
            break;
        case "error":
            this.execJs('console.error("BetterDiscord: ' + message + '");');
            break;
    }
}

//Execute javascript
Utils.prototype.execJs = function(js) {
    this.getWebContents().executeJavaScript(js);
}

//Parse and execute javascript
Utils.prototype.execJsParse = function(js) {
    this.execJs(js); //TODO
}

//Css internal style injector
Utils.prototype.injectStylesheet = function(url) {
    var self = this;
    this.download(url, function(data) {
        var js = 'var style = document.createElement("style"); style.type = "text/css"; style.innerHTML = "'+data+'";';
        self.injectToElementByTag("head", js, "style");
    });
}

Utils.prototype.headStyleSheet = function(url) {
    this.execJs('(function() { var stylesheet = document.createElement("link"); stylesheet.type = "text/css"; document.getElementsByTagName("head")[0].appendChild(stylesheet); stylesheet.href = "'+url+'" })();')
}

Utils.prototype.injectJavaScript = function(url) {
    this.execJs('(function() { var script = document.createElement("script"); script.type = "text/javascript"; document.getElementsByTagName("body")[0].appendChild(script); script.src = "'+url+'"; })();');
}

exports.Utils = Utils;
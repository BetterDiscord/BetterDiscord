/* BetterDiscordApp Helper functions
 * Version: 1.0
 * Author: Jiiks | http://jiiks.net
 * Date: 25/08/2015 - 09:19
 * https://github.com/Jiiks/BetterDiscordApp
 */

var https = require('https');

var _mainWindow;

function Helper(mainWindow) {
    _mainWindow = mainWindow;
}

//get app mainwindow
function getMainWindow() {
    return _mainWindow;
}

//Download using https
Helper.prototype.download = function(url, callback) {
    https.get(url, function(res) {
        var data = "";
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on("end", function() {
            callback(data);
        });
    }).on("error", function() {
        callback(null);
    });
}

//Get webcontents
Helper.prototype.getWeb = function() {
    return getMainWindow().webContents;
}

//Log
Helper.prototype.log = function(message) {
    this.execJs('console.log("BetterDiscord: ' + message + '");');
}
//Warn
Helper.prototype.warn = function(message) {
    this.execJs('console.warn("BetterDiscord: ' + message + '");');
}
//Error
Helper.prototype.error = function(message) {
    this.execJs('console.error("BetterDiscord: ' + message + '");');
}

//Execute javascript
Helper.prototype.execJs = function(js) {
    this.getWeb().executeJavaScript(js);
}

//Inject variable to first element by tag
Helper.prototype.injectToElementByTag = function(element, js, varname) {
    this.execJs(js + " " + 'document.getElementsByTagName("'+element+'")[0].appendChild('+varname+')');
}

//Injects a stylesheet from url to head as internal style
Helper.prototype.injectStylesheet = function(url) {
    var self = this;
    this.download(url, function(data) {
        var js = 'var style = document.createElement("style"); style.type = "text/css"; style.innerHTML = "'+data+'";';
        self.injectToElementByTag("head", js, "style");
    });
}

Helper.prototype.headStyleSheet = function(url) {
    this.execJs('(function() { var stylesheet = document.createElement("link"); stylesheet.type = "text/css"; document.getElementsByTagName("head")[0].appendChild(stylesheet); stylesheet.href = "'+url+'" })();')
}

Helper.prototype.injectJavaScript = function(url) {
    this.execJs('(function() { var script = document.createElement("script"); script.type = "text/javascript"; document.getElementsByTagName("body")[0].appendChild(script); script.src = "'+url+'"; })();');
}

exports.Helper = Helper;
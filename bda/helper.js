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
function download(url, callback) {
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
    download(url, function(data) {
        var js = 'var style = document.createElement("style"); style.type = "text/css"; style.innerHTML = "'+data+'";';
        self.injectToElementByTag("head", js, "style");
    });
}

exports.Helper = Helper;
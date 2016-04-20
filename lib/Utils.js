/* BetterDiscordApp Utils and Helper functions
 * Version: 1.4
 * Author: Jiiks | http://jiiks.net
 * Date: 25/08/2015 - 09:19
 * Last Updated: 20/04/2016
 * https://github.com/Jiiks/BetterDiscordApp
 */

var https = require('https');
var http = require('http');
var _fs = require('fs');
var _mainWindow;
var eol = require('os').EOL;
var logs = "";

function Utils(mainWindow) {
    _mainWindow = mainWindow;
}

//Get browser mainwindow
function getMainWindow() {
    return _mainWindow;
}

//Download using https
Utils.prototype.download = function(host, path, callback) {

    var options = {
        host: host,
        path: path,
        headers: {'user-agent': 'Mozilla/5.0'},
    }

    https.get(options, function(res) {
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
//Download using http
Utils.prototype.downloadHttp = function(url, callback) {
    http.get(url, function(result) {
        var data = '';
        result.on('data', function(chunk) {
            data += chunk;
        });

        result.on('end', function() {
            callback(data);
        });
    }).on('error', function() {
        callback(null);
    });
}

Utils.prototype.getHash = function(beta, callback) {
    var branch = beta ? "beta" : "master";
    this.download("api.github.com", "/repos/Jiiks/BetterDiscordApp/commits/"+branch+"", function(data) {
        callback(JSON.parse(data).sha);
    });
}

Utils.prototype.sendIcpAsync = function(message) {
    this.execJs('betterDiscordIPC.send("asynchronous-message", "'+message+'");');
}

//Get Webcontents
Utils.prototype.getWebContents = function() {
    return getMainWindow().webContents;
}

//Js logger
Utils.prototype.jsLog = function(message, type) {

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

Utils.prototype.updateLoading = function(message, cur, max) {
    this.execJs('document.getElementById("bd-status").innerHTML = "BetterDiscord - '+message+' : ";');
    this.execJs('document.getElementById("bd-pbar").value = '+cur+';');
    this.execJs('document.getElementById("bd-pbar").max = '+max+';');
}

//Logger
Utils.prototype.log = function(message) {
    console.log("[BetterDiscord]" + message);
    logs += message + eol;
}
Utils.prototype.saveLogs = function(path) {
    _fs.writeFileSync(path + "/logs.log", logs);
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

Utils.prototype.injectStylesheetSync = function(url, callbackMessage) {
    this.execJs('$("head").append(" <link rel=\'stylesheet\' href=\''+url+'\'> ");');
    this.sendIcpAsync(callbackMessage);
};

Utils.prototype.headStyleSheet = function(url) {
    this.execJs('(function() { var stylesheet = document.createElement("link"); stylesheet.type = "text/css"; document.getElementsByTagName("head")[0].appendChild(stylesheet); stylesheet.href = "'+url+'" })();')
}

Utils.prototype.injectJavaScriptSync = function(url, callbackMessage) {
    this.execJs(' (function() { var script = document.createElement("script"); script.type = "text/javascript"; script.onload = function() { betterDiscordIPC.send("asynchronous-message", "'+callbackMessage+'"); }; document.getElementsByTagName("body")[0].appendChild(script); script.src = "'+url+'"; })(); ');
}

Utils.prototype.injectJavaScript = function(url, jquery) {
    if(!jquery) {
        this.execJs('(function() { var script = document.createElement("script"); script.type = "text/javascript"; document.getElementsByTagName("body")[0].appendChild(script); script.src = "' + url + '"; })();');
    }else {
        this.execJs(' (function() { function injectJs() { var script = document.createElement("script"); script.type = "text/javascript"; document.getElementsByTagName("body")[0].appendChild(script); script.src = "' + url + '"; } function jqDefer() { if(window.jQuery) { injectJs(); }else{ setTimeout(function() { jqDefer(); }, 100) } } jqDefer(); })(); ');
    }

}

exports.Utils = Utils;
/* BetterDiscordApp Utils and Helper functions
 * Version: 1.5
 * Author: Jiiks | http://jiiks.net
 * Date: 25/08/2015 - 09:19
 * Last Updated: 06/05/2016
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
    this.log("Downloading Resource: " + host + path);
    var options = {
        host: host,
        path: path,
        headers: {'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11'},
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
    this.log("Downloading Resource: " + url);
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

Utils.prototype.getHash = function(repo, branch, callback) {
    this.download("api.github.com", "/repos/"+repo+"/BetterDiscordApp/commits/"+branch+"", function(data) {
        var hash;
        try { hash = JSON.parse(data).sha; }
        catch(e) { hash = null; }
        callback(hash);
    });
}

Utils.prototype.getUpdater = function(repo, hash, callback) {
    this.download("raw.githubusercontent.com", "/" + repo + "/BetterDiscordApp/" + hash + "/data/updater.json", function(data) {
        var updater;
        try { updater = JSON.parse(data); }
        catch(err) { updater = null; }
        callback(updater);
    });
}

Utils.prototype.sendIpcAsync = function(message) {
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
    this.log(message);
}

//Logger
Utils.prototype.log = function(message) {
    console.log("[BetterDiscord INF] " + message);
    var d = new Date();
    var ds = ("00" + (d.getDate() + 1)).slice(-2) + "/" + 
    ("00" + d.getMonth()).slice(-2) + "/" + 
    d.getFullYear() + " " + 
    ("00" + d.getHours()).slice(-2) + ":" + 
    ("00" + d.getMinutes()).slice(-2) + ":" + 
    ("00" + d.getSeconds()).slice(-2);
    logs += "[INF]["+ds+"] " + message + eol;
}
Utils.prototype.err = function(err) {
    console.log("[BetterDiscord ERR] " + err.message);
    var d = new Date();
    var ds = ("00" + (d.getDate() + 1)).slice(-2) + "/" + 
    ("00" + d.getMonth()).slice(-2) + "/" + 
    d.getFullYear() + " " + 
    ("00" + d.getHours()).slice(-2) + ":" + 
    ("00" + d.getMinutes()).slice(-2) + ":" + 
    ("00" + d.getSeconds()).slice(-2);
    logs += "[ERR]["+ds+"] " + err.message + eol;
}
Utils.prototype.warn = function(message) {
    console.log("[BetterDiscord WRN] " + message);
    var d = new Date();
    var ds = ("00" + (d.getDate() + 1)).slice(-2) + "/" + 
    ("00" + d.getMonth()).slice(-2) + "/" + 
    d.getFullYear() + " " + 
    ("00" + d.getHours()).slice(-2) + ":" + 
    ("00" + d.getMinutes()).slice(-2) + ":" + 
    ("00" + d.getSeconds()).slice(-2);
    logs += "[WRN]["+ds+"] " + message + eol;
}
Utils.prototype.saveLogs = function(path) {
    try {
        _fs.writeFileSync(path + "/logs.log", logs);
    }catch(err) {}
}

Utils.prototype.execJs = function(js) {
    this.getWebContents().executeJavaScript(js);
}

//Parse and execute javascript
Utils.prototype.execJsParse = function(js) {
    this.execJs(js); //TODO
}

//Inject variable
Utils.prototype.injectVar = function(variable, data) {
    this.execJs('var ' + variable + ' = "' + data + '";');
}
Utils.prototype.injectVarRaw = function(variable, data) {
    this.execJs('var ' + variable + ' = ' + data + ';');
}

//Alert
Utils.prototype.alert = function(title, message) {
    var id = 'bdalert-';
    for( var i=0; i < 5; i++ )
        id += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(Math.floor(Math.random() * "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".length)); 

	var closeAction = `document.getElementById('${id}').remove()`;
	var bdAlert = `<div class="bd-modal" id="${id}">
				<div class="backdrop-1ocfXc" style="opacity: 0.85; background-color: rgb(0, 0, 0); z-index: 1000; transform: translateZ(0px);" onclick="${closeAction}"></div>
				<div class="modal-1UGdnR" style="opacity: 1; transform: scale(1) translateZ(0px);">
					<div class="inner-1JeGVc">
						<div class="modal-3HD5ck modal-1sor29 size-JLvFeT">
							<div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignCenter-1dQNNs noWrap-3jynv6 header-1R_AjF" style="flex: 0 0 auto;">
								<h4 class="h4-AQvcAz title-3sZWYQ size16-14cGz5 height20-mO2eIN weightSemiBold-NJexzi defaultColor-1_ajX0 defaultMarginh4-2vWMG5 marginReset-236NPn">${title}</h4>
								<svg onclick="${closeAction}" viewBox="0 0 12 12" name="Close" width="18" height="18" class="close-18n9bP flexChild-faoVW3" style="flex: 0 1 auto;"><g fill="none" fill-rule="evenodd"><path d="M0 0h12v12H0"></path><path class="fill" fill="currentColor" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path></g></svg>
							</div>
							<div class="scrollerWrap-2lJEkd content-2BXhLs scrollerThemed-2oenus themeGhostHairline-DBD-2d">
								<div class="scroller-2FKFPG inner-3wn6Q5 content-8biNdB selectable">
									<div class="medium-zmzTW- size16-14cGz5 height20-mO2eIN primary-jw0I4K selectable-x8iAUj" style="padding-bottom: 20px;">
										 ${message}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>`;

    this.execJs(`document.querySelector("#app-mount>.theme-dark:last-of-type").insertAdjacentHTML('afterbegin', ${bdAlert});`);
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
    this.sendIpcAsync(callbackMessage);
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

Utils.prototype.mkdirSync = function(path) {
    if(!_fs.existsSync(path)) {
        this.log("Directory " + path + " does not exist. Creating");
        _fs.mkdirSync(path);
    }
};

Utils.prototype.openDir = function(path) {
    switch(process.platform) {
        case "win32":
            require("child_process").exec('start "" "' + path + '"');
        break;
        case "darwin":
            require("child_process").exec('open ' + path);
        break;
        default:
            require("child_process").exec('xdg-open ' + path);
        break;
    }
};

exports.Utils = Utils;
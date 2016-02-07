/* BetterDiscordApp Entry
 * Version: 2.1
 * Author: Jiiks | http://jiiks.net
 * Date: 27/08/2015 - 15:51
 * Last Update: 30/11/2015 - 21:41
 * https://github.com/Jiiks/BetterDiscordApp
 */

//Imports
var _fs = require("fs");
var _config = require("./config.json");
var _utils = require("./utils");
var _ipc = require('ipc');

var _repo = "Jiiks";

//Beta flag
var _beta = false;
//Local flag
var _local = false;
var _localServer = "http://localhost";

//Variables
var _version;
var _mainWindow;
var _updater;
var _hash;

var _userDefault = { "cache": null };
var _userConfig = _userDefault;
var _cacheExpired = true;
var _cacheDays = 0;

var _dataPath;

//IDE
/*_config = {
    "Core": {
        "Version": "0.2.5"
    }
};*/

//noinspection JSUnresolvedVariable;
var _os = process.platform;
var _userFile;

var _this;
function BetterDiscord(mainWindow) {
    _this = this;
    _mainWindow = mainWindow;
    _version = _config.Core.Version;
    _utils = new _utils.Utils(mainWindow);

    this.createAndCheckData(this.init);
}

BetterDiscord.prototype.initLoaders = function(){
    var os = process.platform;
    var _dataPath = os == "win32" ? process.env.APPDATA : os == 'darwin' ? process.env.HOME + '/Library/Preferences' : '/var/local';
    _dataPath += "/BetterDiscord/";

    if (!_fs.existsSync(_dataPath)) {
        console.log('BetterDiscord: Creating BD Dir');
        _fs.mkdirSync(_dataPath);
    }

    if (!_fs.existsSync(_dataPath + "plugins/")) {
        console.log('BetterDiscord: Creating Plugins Dir');
        _fs.mkdirSync(_dataPath + "plugins/");
    }

    if (!_fs.existsSync(_dataPath + "themes/")) {
        console.log('BetterDiscord: Creating Themes Dir');
        _fs.mkdirSync(_dataPath + "themes/");
    }
    _mainWindow.webContents.executeJavaScript('var themesupport2 = true');

    _fs.readdir(_dataPath + "plugins/", function(err, files) {
        if (err) {
            console.log(err);
            return;
        }
        _mainWindow.webContents.executeJavaScript('var bdplugins = {};');
        files.forEach(function(fileName) {
            var plugin = _fs.readFileSync(_dataPath + "plugins/" + fileName, 'utf8');
            var meta = plugin.split('\n')[0];
            if (meta.indexOf('META') < 0) {
                console.log('BetterDiscord: ERROR[Plugin META not found in file: ' + fileName + ']');
                return;
            }
            var pluginVar = meta.substring(meta.lastIndexOf('//META') + 6, meta.lastIndexOf('*//'));
            var parse = JSON.parse(pluginVar);
            var pluginName = parse['name'];
            console.log('BetterDiscord: Loading Plugin: ' + pluginName);
            _mainWindow.webContents.executeJavaScript(plugin);
            _mainWindow.webContents.executeJavaScript('(function() { var plugin = new ' + pluginName + '(); bdplugins[plugin.getName()] = { "plugin": plugin, "enabled": false } })();')
        });
    });

    _fs.readdir(_dataPath + 'themes/', function(err, files) {
        if (err) {
            console.log(err);
            return;
        }
        _mainWindow.webContents.executeJavaScript('var bdthemes = {};');
        files.forEach(function(fileName) {
            var theme = _fs.readFileSync(_dataPath + 'themes/' + fileName, 'utf8');
            var split = theme.split('\n');
            var meta = split[0];
            if (meta.indexOf('META') < 0) {
                console.log('BetterDiscord: ERROR[Theme META not found in file: ' + fileName + ']');
                return;
            }
            var themeVar = meta.substring(meta.lastIndexOf('//META') + 6, meta.lastIndexOf('*//'));
            var parse = JSON.parse(themeVar);
            var themeName = parse['name'];
            var themeAuthor = parse['author'];
            var themeDescription = parse['description'];
            var themeVersion = parse['version'];
            console.log('BetterDiscord: Loading Theme: ' + themeName);
            split.splice(0, 1);
            theme = split.join('\n');
            theme = theme.replace(/(\r\n|\n|\r)/gm, '');
            _mainWindow.webContents.executeJavaScript('(function() { bdthemes["' + themeName + '"] = { "enabled": false, "name": "' + themeName + '", "css": "' + escape(theme) + '", "description": "' + themeDescription + '", "author":"' + themeAuthor + '", "version":"' + themeVersion + '"  } })();');
        });
    });
};

BetterDiscord.prototype.getUtils = function() {
    return _utils;
};

BetterDiscord.prototype.createAndCheckData = function(callback) {

    this.getUtils().log("Checking Cache");

    //New data path
    //noinspection JSUnresolvedVariable
    _dataPath = _os == "win32" ? process.env.APPDATA : _os == 'darwin' ? process.env.HOME + '/Library/Preferences' : '/var/local';
    _dataPath += "/BetterDiscord";
    _userFile = _dataPath + "/user.json";

    try {
        //Create data path folder if it doesn't exist
        if (!_fs.existsSync(_dataPath)) {
            this.getUtils().log("Creating Data Folder @" + _dataPath);
            _fs.mkdirSync(_dataPath);
        }

        //Read user config if it exists
        if(_fs.existsSync(_userFile)) {
            _userConfig = JSON.parse(_fs.readFileSync(_userFile));
        }

        //Userfile doesn't exist
        if(_userConfig.cache == null) {
            _userConfig.cache = new Date();
        } else {
            var currentDate = new Date();
            var cacheDate = new Date(_userConfig.cache);
            //Check if cache is expired
            if(Math.abs(currentDate.getDate() - cacheDate.getDate()) > _cacheDays) {
                _userConfig.cache = currentDate;
            } else {
                _cacheExpired = false;
            }
        }

        //Write new cache date if expired
        if(_cacheExpired) {
            this.getUtils().log("Cache Expired or NULL");
            _fs.writeFileSync(_userFile, JSON.stringify(_userConfig));
        }

        callback();
    }catch(err) {
        //Exit BD
    }
};

BetterDiscord.prototype.init = function() {
    var self = this;

    this.getUtils().log("Initializing");

    this.getUtils().log("Getting latest hash");

    var branch = _beta ? "beta" : "master";

    this.getUtils().log("Using repo: " + _repo + " and branch: " + branch);

    //Get the latest commit hash
    this.getUtils().download("api.github.com", "/repos/" + _repo + "/BetterDiscordApp/commits/" + branch, function(data) {

        try {
            _hash = JSON.parse(data).sha;
            self.getUtils().execJs("var _hash = " + _hash + ";");
        }catch(err) {
            self.quit("Failed to load hash");
            return;
        }

        if(typeof(_hash) == "undefined") {
            self.quit("Failed to load hash");
            return;
        }

        self.getUtils().log("Hash: "+ _hash);

        //Download latest updater
        self.getUtils().download("raw.githubusercontent.com", "/" + _repo + "/BetterDiscordApp/" + _hash + "/data/updater.json", function(data) {

            try {
                _updater = JSON.parse(data);
            }catch(err) {
                self.quit("Failed to load updater data");
                return;
            }

            if(typeof(_updater) == "undefined") {
                self.quit("Failed to load updater data");
                return;
            }

            self.getUtils().log("Latest Versions: " + _updater.LatestVersion);
            self.getUtils().log("Using CDN: " + _updater.CDN);
            self.getUtils().log("Starting up");
            self.start();
        });

    });
};

BetterDiscord.prototype.start = function() {
    _this.getUtils().log("Hooking dom-ready");
    var webContents = _this.getUtils().getWebContents();
    webContents.on('dom-ready', function() { _this.domReady(); });
    webContents.on("did-finish-loading", function() { if(!_domHooked) { _this.getUtils().log("Failsafe"); _this.domReady(); } });
};

BetterDiscord.prototype.quit = function(reason) {
    console.log("BetterDiscord ERR: " + reason);
};

var ipcHooked = false;

var _domHooked = false;

BetterDiscord.prototype.domReady = function() {

    _domHooked = true;

    if(ipcHooked) {
        _this.load(true);
        return;
    }
    
    ipcHooked = true;
    _this.load(false);
};

BetterDiscord.prototype.load = function(reload) {
    _this.getUtils().log("Hooked dom-ready");

    _this.initLoaders();

    if(reload) {
        _this.getUtils().log("Reloading");
    }
    
    if(!reload) {
        if(_updater.LatestVersion > _version) {
            _this.getUtils().execJs('alert("An update for BetterDiscord is available(v'+ _updater.LatestVersion +')! Download the latest version from GitHub!")');
        }
    }
    
    //Create loading element
    _this.getUtils().execJs('var loadingNode = document.createElement("DIV");');
    _this.getUtils().execJs('loadingNode.innerHTML = \' <div style="height:30px;width:100%;background:#282B30;"><div style="padding-right:10px; float:right"> <span id="bd-status" style="line-height:30px;color:#E8E8E8;">BetterDiscord - Loading Libraries : </span><progress id="bd-pbar" value="10" max="100"></progress></div></div> \'');
    _this.getUtils().execJs('var flex = document.getElementsByClassName("flex-vertical flex-spacer")[0]; flex.appendChild(loadingNode);');
    
    //Create ipc
    _this.getUtils().execJs("var betterDiscordIPC = require('ipc');");
    
    
    if(!reload) {
        _this.getUtils().log("Hooking ipc async");
        _ipc.on('asynchronous-message', function(event, arg) { _this.ipcAsyncMessage(event, arg); });
        _this.getUtils().log("Hooked ipc async");
    }
    
    //Inject version
    _this.getUtils().execJs('var version = "'+_version+'"');
    //Inject cdn
    _this.getUtils().execJs('var bdcdn = "' + _updater.CDN + '";');
    //Load jQuery
    _this.getUtils().updateLoading("Loading Resources(jQuery)", 0, 100);
    _this.getUtils().injectJavaScriptSync("//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js", "load-jQueryUI");
    
};

var loadCount = 0;

BetterDiscord.prototype.ipcAsyncMessage = function(event, arg) {

    var libCount = 9;

    var loadUs = {
        'load-jQueryUI': {
            'type': 'javascript',
            'resource': 'jQueryUI',
            'domain': 'cdnjs.cloudflare.com',
            'url': '//cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.4.1/jquery.cookie.min.js',
            'localurl': null,
            'message': 'load-mainCSS',
            'cacheable': false,
            'variable': null
        },
        'load-mainCSS': {
            'type': 'css',
            'resource': 'Main CSS',
            'domain': _updater.CDN,
            'url': '//' + _updater.CDN + '/' + _repo + '/BetterDiscordApp/' + _hash + '/css/main.min.css',
            'localurl': _localServer + '/BetterDiscordApp/css/main.css',
            'message': 'load-mainJS',
            'cacheable': false,
            'variable': null
        },
        'load-mainJS': {
            'type': 'javascript',
            'resource': 'Main JS',
            'domain': _updater.CDN,
            'url': '//' + _updater.CDN + '/' + _repo + '/BetterDiscordApp/' + _hash + '/js/main.min.js',
            'localurl': _localServer + '/BetterDiscordApp/js/main.js',
            'message': 'load-publicServers',
            'cacheable': false,
            'variable': null
        },
        'load-publicServers': {
            'type': 'json',
            'resource': 'Public Servers',
            'domain': _updater.CDN,
            'url': '/' + _repo + '/BetterDiscordApp/' + _hash + '/data/serverlist.json',
            'localurl': null,
            'message': 'load-emoteData-twitchGlobal',
            'cacheable': false,
            'variable': 'publicServers'
        },
        'load-emoteData-twitchGlobal': {
            'type': 'emotedata',
            'resource': 'Twitch Global Emotedata',
            'domain': _updater.CDN,
            'url': '/' + _repo + '/BetterDiscordApp/' + _hash + '/data/emotedata_twitch_global.json',
            'localurl': null,
            'message': 'load-emoteData-twitchSub',
            'cacheable': true,
            'variable': 'emotesTwitch',
            'localpath': _dataPath + "/emotes_twitch_global.json",
            'encoding': "utf8",
            'https': true,
            'parse': true,
            'specialparser': 0
        },
        'load-emoteData-twitchSub': {
            'type': 'emotedata',
            'resource': 'Twitch Subscriber Emotedata',
            'domain': _updater.CDN,
            'url': '/' + _repo + '/BetterDiscordApp/' + _hash + '/data/emotedata_twitch_subscriber.json',
            'localurl': null,
            'message': 'load-emoteData-ffz',
            'cacheable': true,
            'variable': 'subEmotesTwitch',
            'localpath': _dataPath + "/emotes_twitch_subscriber.json",
            'encoding': "utf8",
            'https': true,
            'parse': true,
            'specialparser': 1
        },
        'load-emoteData-ffz': {
            'type': 'emotedata',
            'resource': 'FrankerFaceZ Emotedata',
            'domain': _updater.CDN,
            'url': '/' + _repo + '/BetterDiscordApp/' + _hash + '/data/emotedata_ffz.json',
            'localurl': null,
            'message': 'load-emoteData-bttv',
            'cacheable': true,
            'variable': 'emotesFfz',
            'localpath': _dataPath + "/emotes_ffz.json",
            'encoding': "utf8",
            'https': true,
            'parse': true,
            'specialparser': 2
        },
        'load-emoteData-bttv': {
            'type': 'emotedata',
            'resource': 'BTTV Emotedata',
            'domain': 'api.betterttv.net',
            'url': '/emotes',
            'localurl': null,
            'message': 'load-emoteData-bttv-2',
            'cacheable': true,
            'variable': 'emotesBTTV',
            'localpath': _dataPath + "/emotes_bttv.json",
            'encoding': "utf8",
            'https': true,
            'parse': false,
            'specialparser': 3
        },
        'load-emoteData-bttv-2': {
            'type': 'emotedata',
            'resource': 'BTTV Emotedata',
            'domain': _updater.CDN,
            'url': '/' + _repo + '/BetterDiscordApp/' + _hash + '/data/emotedata_bttv.json',
            'localurl': null,
            'message': 'start-bd',
            'cacheable': true,
            'variable': 'emotesBTTV2',
            'localpath': _dataPath + "/emotes_bttv_2.json",
            'encoding': "utf8",
            'https': true,
            'parse': false,
            'specialparser': 4
        }
    };

    

    if(loadUs.hasOwnProperty(arg)) {
        loadCount++;
        var loadMe = loadUs[arg];
        _this.getUtils().updateLoading("Loading Resources (" + loadMe.resource + ")", loadCount / libCount * 100, 100);

        var url = loadMe.url;
        if(_local && loadMe.localurl != null) {
            url = loadMe.localurl;
        }

        if(loadMe.type == 'javascript') {
            _this.getUtils().injectJavaScriptSync(url, loadMe.message);
        }else if(loadMe.type == 'css') {
            _this.getUtils().injectStylesheetSync(url, loadMe.message);
        }else if(loadMe.type == 'json') {
            _this.getUtils().download(loadMe.domain, loadMe.url, function(data) {
                _this.getUtils().execJs('var ' + loadMe.variable + ' = ' + data + ';');
                _this.getUtils().sendIcpAsync(loadMe.message);
            });
        }else if(loadMe.type == 'emotedata') {

            var exists = _fs.existsSync(loadMe.localpath);

            if(exists && !_cacheExpired && loadMe.cacheable) {
                _this.getUtils().log("Reading " + loadMe.resource + " from file");
                _this.injectEmoteData(loadMe, _fs.readFileSync(loadMe.localpath, loadMe.encoding));
            } else {
                _this.getUtils().log("Downloading " + loadMe.resource);

                if(loadMe.https) {
                    _this.getUtils().download(loadMe.domain, loadMe.url, function(data) {
                        var parsedEmoteData = _this.parseEmoteData(loadMe, data);
                        _this.saveEmoteData(loadMe, parsedEmoteData);
                        _this.injectEmoteData(loadMe, parsedEmoteData);
                    });

                } else {
                    _this.getUtils().downloadHttp(loadMe.url, function(data) {
                        var parsedEmoteData = _this.parseEmoteData(loadMe, data);
                        _this.saveEmoteData(loadMe, parsedEmoteData);
                        _this.injectEmoteData(loadMe, parsedEmoteData);
                    });
                }
            }


        }
    }

    if(arg == "start-bd") {
        _this.getUtils().updateLoading("Starting Up", 100, 100);
        _this.getUtils().execJs('var mainCore; var startBda = function() { mainCore = new Core(); mainCore.init(); }; startBda();');

        //Remove loading node
        setTimeout(function() {
            _this.getUtils().execJs('$("#bd-status").parent().parent().hide();');
        }, 2000);
    }
};

BetterDiscord.prototype.parseEmoteData = function(loadMe, emoteData) {

    _this.getUtils().log("Parsing: " + loadMe.resource);

    var returnData;

    switch(loadMe.specialparser) {

        case 0: //Twitch Global Emotes
            returnData = emoteData.replace(/\$/g, "\\$").replace(/'/g, "\\'").replace(/"/g, "\\\"");
            break;
        case 1: //Twitch Subscriber Emotes
            returnData = {};
            emoteData = JSON.parse(emoteData);
            var channels = emoteData["channels"];
            for(var channel in channels) {
                var emotes = channels[channel]["emotes"];
                for(var i = 0 ; i < emotes.length ; i++) {
                    var code = emotes[i]["code"];
                    var id = emotes[i]["image_id"];
                    returnData[code] = id;
                }
            }

            returnData = JSON.stringify(returnData);
            break;
        case 2: //FFZ Emotes
            returnData = emoteData;
            break;
        case 3: //BTTV Emotes
            returnData = {};
            emoteData = JSON.parse(emoteData);

            for(var emote in emoteData.emotes) {
                emote = emoteData.emotes[emote];
                var url = emote.url;
                var code = emote.regex;

                returnData[code] = url;
            }

            returnData = JSON.stringify(returnData);
            break;
        case 4: 
            returnData = emoteData;
            break;

    }

    return returnData;
};

BetterDiscord.prototype.saveEmoteData = function(loadMe, emoteData) {

    _fs.writeFileSync(loadMe.localpath, emoteData, loadMe.encoding);

};

BetterDiscord.prototype.injectEmoteData = function(loadMe, emoteData) {

    if(loadMe.parse) {
        _this.getUtils().execJs('var ' + loadMe.variable + ' = JSON.parse(\'' + emoteData + '\');');
    } else {
        _this.getUtils().execJs('var ' + loadMe.variable + ' = ' + emoteData + ';');
    }



    _this.getUtils().sendIcpAsync(loadMe.message);
};

exports.BetterDiscord = BetterDiscord;

/* BetterDiscordApp Entry
 * Version: 3.0
 * Author: Jiiks | http://jiiks.net
 * Date: 27/08/2015 - 15:51
 * Last Update: 06/05/2016
 * https://github.com/Jiiks/BetterDiscordApp
 */

'use strict';

var _fs = require("fs");
var _config = require("./config.json");
var _utils = require("./utils");
var _utils2;
var _bdIpc = require('electron').ipcMain;
var _error = false;

var _eol = require('os').EOL;

var _mainWindow;

var _cfg = {};
var _extData = {};

var bdStorage = {};
var bdPluginStorage = {};

bdStorage.defaults = {
    data: {}
};

bdPluginStorage.defaults = {
    data: {}
};

function initStorage() {
    if(!_fs.existsSync(_cfg.dataPath + "/bdstorage.json")) {
        bdStorage.data = bdStorage.defaults.data;
        _fs.writeFileSync(_cfg.dataPath + "/bdstorage.json", JSON.stringify(bdStorage, null, 4));
    } else {
        bdStorage.data = JSON.parse(_fs.readFileSync(_cfg.dataPath + "/bdStorage.json"));
    }
};


bdStorage.get = function(i, m, pn) {

    if(m) return bdStorage.data[i] || "";

    if(bdPluginStorage[pn] !== undefined) {
        return bdPluginStorage[pn][i] || undefined;
    }

    if(_fs.existsSync(_cfg.dataPath + "/plugins/" + pn + ".config.json")) {
        bdPluginStorage[pn] = JSON.parse(_fs.readFileSync(_cfg.dataPath + "/plugins/" + pn + ".config.json"));
        return bdPluginStorage[pn][i] || undefined;
    }

    return undefined;
};

bdStorage.set = function(i, v, m, pn) {
    if(m) {
        bdStorage.data[i] = v;
        _fs.writeFileSync(_cfg.dataPath + "/bdstorage.json", JSON.stringify(bdStorage.data, null, 4));
    } else {
        if(bdPluginStorage[pn] === undefined) bdPluginStorage[pn] = {};
        bdPluginStorage[pn][i] = v;
        _fs.writeFileSync(_cfg.dataPath + "/plugins/" + pn + ".config.json", JSON.stringify(bdPluginStorage[pn], null, 4));
    }
    return true;
};




function BetterDiscord(mainWindow) {
    _mainWindow = mainWindow;
    _cfg = _config.cfg;
    _cfg.version = _config.Core.Version;
    _cfg.os = process.platform;
    _utils2 = new _utils.Utils(mainWindow);
    hook();
    createAndCheckData();
}

function createAndCheckData() {
    getUtils().log("Checking data/cache");

    _cfg.dataPath = (_cfg.os == 'win32' ? process.env.APPDATA : _cfg.os == 'darwin' ? process.env.HOME + '/Library/Preferences' : '/var/local') + '/BetterDiscord/';
    _cfg.userFile = _cfg.dataPath + 'user.json';

    try {
        getUtils().mkdirSync(_cfg.dataPath);

        if(_fs.existsSync(_cfg.userFile)) {
            _cfg.userCfg = JSON.parse(_fs.readFileSync(_cfg.userFile));
        }

        if(_cfg.userCfg.cache == null) {
            _cfg.userCfg.cache = new Date();
        } else {
            var currentDate = new Date();
            var cacheDate = new Date(_cfg.userCfg.cache);
            //Check if cache is expired
            if(Math.abs(currentDate.getDate() - cacheDate.getDate()) > _cfg.cache.days) {
                _cfg.userCfg.cache = currentDate;
            } else {
                _cfg.cache.expired = false;
            }
        }

        //Write new cache date if expired
        if(_cfg.cache.expired) {
            getUtils().log("Cache expired or null");
            _fs.writeFileSync(_cfg.userFile, JSON.stringify(_cfg.userCfg));
        }

        init();
    } catch(err) {
        getUtils().err(err);
        exit(err.message);
    }
}

function init() {
    if(_cfg.branch == null) {
        _cfg.branch = _cfg.beta ? "beta" : "master";
    }

    if(_cfg.repo == null) {
        _cfg.repo = "Jiiks";
    }

    getUtils().log("Using repository: " + _cfg.repo + " and branch: " + _cfg.branch);

    getUtils().log("Getting latest hash");
    getUtils().attempt(getHash, 3, 0, "Failed to load hash", initUpdater, function() {
        exit("Failed to load hash after 3 attempts");
    });
    initStorage();
}

function getHash(callback) {
    getUtils().download("api.github.com", "/repos/" + _cfg.repo + "/BetterDiscordApp/commits/" + _cfg.branch, function(data) {
        try {
            _cfg.hash = JSON.parse(data).sha;
            getUtils().injectVar("_bdhash", _cfg.hash);
        }catch(err) {
            callback(false, err);
            return;
        }
        if(_cfg.hash == undefined) {
            callback(false, "_cfg.hash == undefined");
            return;
        }

        getUtils().log("Hash: " + _cfg.hash);

        callback(true);
    });
}

function initUpdater() {
    getUtils().log("Getting updater");
    getUtils().attempt(getUpdater, 3, 0, "Failed to load updater", waitForDom, function() {
        exit("Failed to load updater after 3 attempts.");
    });
}

function getUpdater(callback) {
    getUtils().download("raw.githubusercontent.com", "/" + _cfg.repo + "/BetterDiscordApp/" + _cfg.hash + "/data/updater.json", function(data) {
        try {
            _cfg.updater = JSON.parse(data);
        } catch(err) {
            callback(false, err);
            return;
        }

        if(_cfg.updater == undefined) {
            callback(false, "_cfg.updater == undefined");
            return;
        }

        if(_cfg.updater.LatestVersion == undefined) {
            callback(false, "_cfg.updater.LatestVersion == undefined");
            return;
        }

        if(_cfg.updater.CDN == undefined) {
            callback(false, "_cfg.updater.CDN == undefined");
            return;
        }

        getUtils().log("Latest Version: " + _cfg.updater.LatestVersion);
        getUtils().log("Using CDN: " + _cfg.updater.CDN);
        updateExtData();
        callback(true);
    });
}

function updateExtData() {
    getUtils().log("Updating ext data");

    _extData = {
        'load-jQueryCookie': {
            'type': 'javascript',
            'resource': 'jQueryCookie',
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
            'domain': _cfg.updater.CDN,
            'url': '//' + _cfg.updater.CDN + '/' + _cfg.repo + '/BetterDiscordApp/' + _cfg.hash + '/css/main.min.css',
            'localurl': _cfg.localServer + '/BetterDiscordApp/css/main.css',
            'message': 'load-mainJS',
            'cacheable': false,
            'variable': null
        },
        'load-mainJS': {
            'type': 'javascript',
            'resource': 'Main JS',
            'domain': _cfg.updater.CDN,
            'url': '//' + _cfg.updater.CDN + '/' + _cfg.repo + '/BetterDiscordApp/' + _cfg.hash + '/js/main.min.js',
            'localurl': _cfg.localServer + '/BetterDiscordApp/js/main.js?v=1.1',
            'message': 'load-emoteData-twitchGlobal',
            'cacheable': false,
            'variable': null
        },
        'load-publicServers': {
            'type': 'json',
            'resource': 'Public Servers',
            'domain': _cfg.updater.CDN,
            'url': '/' + _cfg.repo + '/BetterDiscordApp/' + _cfg.hash + '/data/serverlist.json',
            'localurl': null,
            'message': 'load-emoteData-twitchGlobal',
            'cacheable': false,
            'variable': 'publicServers'
        },
        'load-emoteData-twitchGlobal': {
            'type': 'emotedata',
            'resource': 'Twitch Global Emotedata',
            'domain': 'twitchemotes.com',
            'url': '/api_cache/v3/global.json',
            'localurl': null,
            'message': 'load-emoteData-twitchSub',
            'cacheable': true,
            'variable': 'emotesTwitch',
            'localpath': _cfg.dataPath + "/emotes_twitch_global.json",
            'encoding': "utf8",
            'https': true,
            'parse': false,
            'specialparser': 0,
            'fallback': 'load-emoteData-twitchGlobal-fallback',
            'self': 'load-emoteData-twitchGlobal'
        },
        'load-emoteData-twitchGlobal-fallback': {
            'type': 'emotedata',
            'resource': 'Twitch Global Emotedata',
            'domain': _cfg.updater.CDN,
            'url': '/' + _cfg.repo + '/BetterDiscordApp/' + _cfg.hash + '/data/emotedata_twitch_global.json',
            'localurl': null,
            'message': 'load-emoteData-twitchSub',
            'cacheable': true,
            'variable': 'emotesTwitch',
            'localpath': _cfg.dataPath + "/emotes_twitch_global.json",
            'encoding': "utf8",
            'https': true,
            'parse': false,
            'specialparser': 0,
            'fallback': 'load-emoteData-twitchSub',
            'self': 'load-emoteData-twitchGlobal-fallback'
        },
        'load-emoteData-twitchSub': {
            'type': 'emotedata',
            'resource': 'Twitch Subscriber Emotedata',
            'domain': 'twitchemotes.com',
            'url': '/api_cache/v3/subscriber.json',
            'localurl': null,
            'message': 'load-emoteData-ffz',
            'cacheable': true,
            'variable': 'subEmotesTwitch',
            'localpath': _cfg.dataPath + "/emotes_twitch_subscriber.json",
            'encoding': "utf8",
            'https': true,
            'parse': true,
            'specialparser': 1,
            'fallback': 'load-emoteData-twitchSub-fallback',
            'self': 'load-emoteData-twitchSub'
        },
        'load-emoteData-twitchSub-fallback': {
            'type': 'emotedata',
            'resource': 'Twitch Subscriber Emotedata',
            'domain': _cfg.updater.CDN,
            'url': '/' + _cfg.repo + '/BetterDiscordApp/' + _cfg.hash + '/data/emotedata_twitch_subscriber.json',
            'localurl': null,
            'message': 'load-emoteData-ffz',
            'cacheable': true,
            'variable': 'subEmotesTwitch',
            'localpath': _cfg.dataPath + "/emotes_twitch_subscriber.json",
            'encoding': "utf8",
            'https': true,
            'parse': true,
            'specialparser': 1,
            'fallback': 'load-emoteData-ffz',
            'self': 'load-emoteData-twitchSub-fallback'
        },
        'load-emoteData-ffz': {
            'type': 'emotedata',
            'resource': 'FrankerFaceZ Emotedata',
            'domain': _cfg.updater.CDN,
            'url': '/' + _cfg.repo + '/BetterDiscordApp/' + _cfg.hash + '/data/emotedata_ffz.json',
            'localurl': null,
            'message': 'load-emoteData-bttv',
            'cacheable': true,
            'variable': 'emotesFfz',
            'localpath': _cfg.dataPath + "/emotes_ffz.json",
            'encoding': "utf8",
            'https': true,
            'parse': true,
            'specialparser': 2,
            'fallback': 'load-emoteData-bttv',
            'self': 'load-emoteData-ffz'
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
            'localpath': _cfg.dataPath + "/emotes_bttv.json",
            'encoding': "utf8",
            'https': true,
            'parse': false,
            'specialparser': 3,
            'fallback': 'load-emoteData-bttv-2',
            'self': 'load-emoteData-bttv'
        },
        'load-emoteData-bttv-2': {
            'type': 'emotedata',
            'resource': 'BTTV Emotedata',
            'domain': _cfg.updater.CDN,
            'url': '/' + _cfg.repo + '/BetterDiscordApp/' + _cfg.hash + '/data/emotedata_bttv.json',
            'localurl': null,
            'message': 'start-bd',
            'cacheable': true,
            'variable': 'emotesBTTV2',
            'localpath': _cfg.dataPath + "/emotes_bttv_2.json",
            'encoding': "utf8",
            'https': true,
            'parse': false,
            'specialparser': 4,
            'fallback': 'start-bd',
            'self': 'load-emoteData-bttv-2'
        }
    };
}

function hook() {
    try {
        var webContents = getUtils().getWebContents();

        getUtils().log("Hooking dom-ready");
        webContents.on('dom-ready', domReady);

        webContents.on('did-finish-loading', function() {
            if(domReadyHooked) {
                return;
            }
            getUtils().log("Hooking did-finish-loading failsafe");
            domReady();
            getUtils().log("Hooked did-finish-loading failsafe");
        });

    }catch(err) {
        exit(err);
    }
}

function waitForDom() {
    if(!domReadyHooked) {
        setTimeout(waitForDom, 1000);
        return;
    }
    ipcHooked = true;
    load(false);
}

var domReadyHooked = false;
var ipcHooked = false;

function domReady() {
    getUtils().log("Hooked dom-ready");
    domReadyHooked = true;
    if(ipcHooked) {
        load(true);
    }
}

function load(reload) {
    getUtils().log(reload ? "Reloading" : "Loading");
    getUtils().execJs("var betterDiscordIPC = require('electron').ipcRenderer;");
    if(!reload) {
        if(_cfg.updater.LatestVersion > _cfg.version) {
            getUtils().alert("Update Available", "An update for BetterDiscord is available("+_cfg.updater.LatestVersion+")! <a href='https://betterdiscord.net' target='_blank'>BetterDiscord.net</a>");
        }
        getUtils().log("Hooking ipc async");
        _bdIpc.on('asynchronous-message', function(event, arg) { ipcAsyncMessage(event, arg); });
        _bdIpc.on('synchronous-message', function(event, arg) { ipcSyncMessage(event, arg); });
        getUtils().log("Hooked ipc async");
    }
    initLoaders();
}

function initLoaders() {
    try {
        getUtils().mkdirSync(_cfg.dataPath);
        getUtils().mkdirSync(_cfg.dataPath + "plugins/");
        getUtils().mkdirSync(_cfg.dataPath + "themes/");
        getUtils().execJs('var themesupport2 = true');

        loadPlugins();
        loadThemes();
        loadApp();
    }catch(err) {
        exit(err);
    }
}

function loadPlugins() {
    var pluginPath = _cfg.dataPath + "plugins/";
    _fs.readdir(pluginPath, function(err, files) {
        if(err) {
            getUtils().log(err);
            getUtils().alert(err);
            return;
        }

        var pluginErrors = [];

        getUtils().injectVarRaw("bdplugins", "{}");

        files.forEach(function(fileName) {
            if(!fileName.endsWith(".plugin.js")) {
                getUtils().log("Invalid plugin detected: " + fileName);
                return;
            }

            var plugin = _fs.readFileSync(pluginPath + fileName, 'utf8');
            var meta = plugin.split(_eol)[0];

            if (meta.indexOf('META') < 0) {
                getUtils().warn('Plugin META not found in file: ' + fileName);
                pluginErrors.push(fileName + " Reason: Plugin META not found");
                return;
            }
            var pluginVar = meta.substring(meta.lastIndexOf('//META') + 6, meta.lastIndexOf('*//'));
            var parse;
            try {
                parse = JSON.parse(pluginVar);
            }catch(err) {
                getUtils().warn("Failed to parse plugin META in file: " + fileName + "("+err+")");
                pluginErrors.push(fileName + " Reason: Failed to parse plugin META (" + err + ")");
                return;
            }

            if(parse["name"] == undefined) {
                getUtils().warn("Undefined plugin name in file: " + fileName);
                pluginErrors.push(fileName + " Reason: invalid plugin name");
                return;
            }

            getUtils().log("Loading plugin: " + parse["name"]);
            getUtils().execJs(plugin);
            getUtils().execJs('(function() { var plugin = new ' + parse["name"] + '(); bdplugins[plugin.getName()] = { "plugin": plugin, "enabled": false } })();')
        });

        if(pluginErrors.length > 0) {
            getUtils().alert("The following plugin(s) could not be loaded", pluginErrors.join("<br>"));
        }

    });
}

function loadThemes() {
    var themePath = _cfg.dataPath + "themes/";
    _fs.readdir(themePath, function(err, files) {
        if(err) {
            getUtils().log(err);
            getUtils().alert(err);
            return;
        }

        var themeErrors = [];  

        getUtils().injectVarRaw("bdthemes", "{}");

        files.forEach(function(fileName) {
            if(!fileName.endsWith(".theme.css")) {
                getUtils().log("Invalid theme detected " + fileName);
                return;
            }
            var theme = _fs.readFileSync(themePath + fileName, 'utf8');
            var split = theme.split("\n");
            var meta = split[0];
            if(meta.indexOf('META') < 0) {
                getUtils().warn("Theme META not found in file: " + fileName);
                themeErrors.push(fileName + " Reason: Theme META not found");
                return;
            }
            var themeVar = meta.substring(meta.lastIndexOf('//META') + 6, meta.lastIndexOf('*//'));
            var themeInfo;
            try {
                themeInfo = JSON.parse(themeVar);
            }catch(err) {
                getUtils().warn("Failed to parse theme META in file: " + fileName + "("+err+")");
                themeErrors.push(fileName + " Reason: Failed to parse theme META (" + err + ")");
                return;
            }
            
            if(themeInfo['name'] == undefined) {
                getUtils().warn("Missing theme name in file: " + fileName);
                themeErrors.push(fileName + " Reason: Missing theme name");
                return;
            }
            if(themeInfo['author'] == undefined) {
                themeInfo['author'] = "Unknown";
                getUtils().warn("Missing author name in file: " + fileName);
            }
            if(themeInfo['description'] == undefined) {
                themeInfo['description'] = "No_Description";
                getUtils().warn("Missing description in file: " + fileName);
            }
            if(themeInfo['version'] == undefined) {
                themeInfo['version'] = "Unknown";
                getUtils().warn("Missing version in file: " + fileName);
            }

            getUtils().log("Loading theme: " + themeInfo['name']);
            split.splice(0, 1);
            theme = split.join("\n");
            theme = theme.replace(/(\r\n|\n|\r)/gm, '');

            _mainWindow.webContents.executeJavaScript('(function() { bdthemes["' + themeInfo['name'] + '"] = { "enabled": false, "name": "' + themeInfo['name'] + '", "css": "' + escape(theme) + '", "description": "' + themeInfo['description'] + '", "author":"' + themeInfo['author'] + '", "version":"' + themeInfo['version'] + '"  } })();');
        });

        if(themeErrors.length > 0) {
            getUtils().alert("The following theme(s) could not be loaded", themeErrors.join("<br>"));
        }
    });
}

function loadApp() {
    getUtils().execJs('var loadingNode = document.createElement("DIV");');
    getUtils().execJs('loadingNode.innerHTML = \' <div style="height:30px;width:100%;background:#282B30;"><div style="padding-right:10px; float:right"> <span id="bd-status" style="line-height:30px;color:#E8E8E8;">BetterDiscord - Loading Libraries : </span><progress id="bd-pbar" value="10" max="100"></progress></div></div> \'');
    getUtils().execJs('var flex = document.getElementsByClassName("flex-vertical flex-spacer")[0]; flex.appendChild(loadingNode);');
    getUtils().injectVar('bdVersion', _cfg.version);
    getUtils().injectVar('bdCdn', _cfg.CDN);

    getUtils().updateLoading("Loading Resource (jQuery)", 0, 100);
    getUtils().injectJavaScriptSync("//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js", "load-jQueryCookie");
}

function ipcSyncMessage(event, arg) {
    if(typeof(arg) === "object") {
        switch(arg.arg) {
            case "storage":
                if(arg.cmd == "get") {
                    event.returnValue = bdStorage.get(arg.var, true);
                }
                if(arg.cmd == "set") {
                    bdStorage.set(arg.var, arg.data, true);
                    event.returnValue = "saved";
                }
            break;
            case "pluginstorage":
                if(arg.cmd == "get") {
                    event.returnValue = bdStorage.get(arg.var, false, arg.pn) || null;
                }
                if(arg.cmd == "set") {
                    bdStorage.set(arg.var, arg.data, false, arg.pn);
                    event.returnValue = "saved";
                }
            break;
        }
    }
}

function ipcAsyncMessage(event, arg) {
    if(typeof(arg) === "object") {
        switch(arg.arg) {
            case "opendir":
                if(arg.path == "plugindir") {
                    getUtils().openDir(_cfg.dataPath + "/plugins");
                    break;
                }
                if(arg.path == "themedir") {
                    getUtils().openDir(_cfg.dataPath + "/themes");
                    break;
                }
                if(arg.path == "datadir") {
                    getUtils().openDir(_cfg.dataPath);
                    break;
                }
                getUtils().openDir(arg.path);
            break;
            case "storage":
                if(arg.cmd == "set") {
                    bdStorage.set(arg.var, arg.data);
                    break;
                }
                if(arg.cmd == "get") {
                    var get = bdStorage.get(arg.var);
                    event.sender.send('asynchronous-reply', get);
                    break;
                }
            break;
        }
        return;
    }

    if(_extData.hasOwnProperty(arg)) {
        loadExtData(_extData[arg]);
    }

    if(arg == "start-bd") {
        getUtils().updateLoading("Starting Up", 100, 100);
        getUtils().execJs('var mainCore; var startBda = function() { mainCore = new Core(); mainCore.init(); }; startBda();');

        //Remove loading node
        setTimeout(function() {
            getUtils().execJs('$("#bd-status").parent().parent().hide();');
        }, 2000);
        getUtils().saveLogs(_cfg.dataPath);
    }
}

var loadCounter = 0;
function loadExtData(extData) {

    loadCounter++;

    getUtils().updateLoading("Loading Resource (" + extData.resource + ")", loadCounter / Object.keys(_extData).length * 100, 100);
    
    var url = (_cfg.local && extData.localurl != null) ? extData.localurl : extData.url;

    try {
        switch(extData.type) {
            case 'javascript':
                getUtils().injectJavaScriptSync(url, extData.message);
            break;
            case 'css':
                getUtils().injectStylesheetSync(url, extData.message);
            break;
            case 'json':
            getUtils().download(extData.domain, extData.url, function(data) {
                getUtils().injectVar(extData.variable, data);
                getUtils().sendIcpAsync(extData.message);
            });
            break;
            case 'emotedata':
                if(extData.variable != "emotesTwitch") {
                    getUtils().injectVarRaw(extData.variable, "{}");
                }
                var exists = _fs.existsSync(extData.localpath);
                if(exists && !_cfg.cache.expired && extData.cacheable) { 
                    loadEmoteData(extData, true);
                } else {
                    loadEmoteData(extData, false);
                }
            break;
        }
    }catch(err) {
        getUtils().warn(err);
        getUtils().alert("Something went wrong :( Attempting to run.", err);
        getUtils().sendIcpAsync(extData.message);
    }
}

function loadEmoteData(extData, local) {
    if(local) {
        getUtils().log("Reading " + extData.resource + " from file");
        var data = _fs.readFileSync(extData.localpath, extData.encoding);

        if(testJSON(extData, data)) {
            injectEmoteData(extData, data);
        } else {
            getUtils().log("Deleting cached file " + extData.resource);
            _fs.unlinkSync(extData.localpath);
            getUtils().sendIcpAsync(extData.self);
        }
        return;
    }

    if(extData.https) {
        getUtils().download(extData.domain, extData.url, function(data) {
            var parsedEmoteData = parseEmoteData(extData, data);
            if(parsedEmoteData == null) {
                getUtils().sendIcpAsync(extData.fallback);
                return true;
            }
            saveEmoteData(extData, parsedEmoteData);
            injectEmoteData(extData, parsedEmoteData);
        });
        return;
    }

    getUtils().downloadHttp(extData.url, function(data) {
        var parsedEmoteData = parseEmoteData(extData, data);
        if(parsedEmoteData == null) {
            getUtils().sendIcpAsync(extData.fallback);
            return true;
        }
        saveEmoteData(extData, parsedEmoteData);
        injectEmoteData(extData, parsedEmoteData);
    });
}

function testJSON(extData, data) {
    getUtils().log("Validating " + extData.resource);
    try {
        var json = JSON.parse(data);
        getUtils().log(extData.resource + " is valid");
        return true;
    }catch(err) {
        getUtils().warn(extData.resource + " is invalid");
        return false;
    }
    return false;
}

function injectEmoteData(extData, data) {
    if(data == null) {
        getUtils().sendIcpAsync(extData.message);
        return;
    }

    if(data.parse) {
        getUtils().injectVarRaw(extData.variable, 'JSON.parse(\'' + data + '\');');
    } else {
        getUtils().injectVarRaw(extData.variable, data);
    }

    getUtils().sendIcpAsync(extData.message);
}

function saveEmoteData(extData, data) {
    try {
        getUtils().log("Saving resource to file " + extData.resource);
        _fs.writeFileSync(extData.localpath, data, extData.encoding);
    } catch(err) {
        getUtils().err("Failed to save resource to file " + extData.resource);
    }
}

function parseEmoteData(extData, data) {
    getUtils().log("Parsing: " + extData.resource);

    var returnData;

    switch(extData.specialparser) {
        case 0: //Twitch Global Emotes
            return data;
            break;
        case 1: //Twitch Subscriber Emotes
            returnData = {};
            if(!testJSON(extData, data)) {
                return null;
            }

            data = JSON.parse(data);

            var channels = data;
            for(var channel in channels) {
                var emotes = channels[channel]["emotes"];
                for(var i = 0 ; i < emotes.length ; i++) {
                    var code = emotes[i]["code"];
                    var id = emotes[i]["id"];
                    returnData[code] = id;
                }
            }

            returnData = JSON.stringify(returnData);
            break;
        case 2: //FFZ Emotes
            returnData = data;
            break;
        case 3: //BTTV Emotes
            returnData = {};

            if(!testJSON(extData, data)) {
                return null;
            }

            data = JSON.parse(data);

            for(var emote in data.emotes) {
                emote = data.emotes[emote];
                var url = emote.url;
                var code = emote.regex;

                returnData[code] = url;
            }

            returnData = JSON.stringify(returnData);
            break;
        case 4: 
            returnData = data;
            break;
    }
    return returnData;
}

function getUtils() {
    return _utils2;
}

function exit(reason) {
    _error = true;
    getUtils().log("Exiting. Reason: " + reason);
    getUtils().saveLogs(_cfg.dataPath);
    getUtils().alert("Something went wrong :(", reason);
}

BetterDiscord.prototype.init = function() {}//Compatibility

exports.BetterDiscord = BetterDiscord;
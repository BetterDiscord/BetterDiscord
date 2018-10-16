/* BetterDiscordApp Entry
 * Version: 3.0
 * Author: Jiiks | http://jiiks.net
 * Date: 27/08/2015 - 15:51
 * Last Update: 06/05/2016
 * https://github.com/Jiiks/BetterDiscordApp
 */

'use strict';

var _fs = require("fs");
var _vm = require("vm")
var _config = require("./config.json");
var _utils = require("./Utils");
var utils;
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
	if (_fs.existsSync(_cfg.dataPath + "/bdStorage.json")) {
		_fs.renameSync(_cfg.dataPath + "/bdStorage.json", _cfg.dataPath + "/bdstorage.json");
	}
	
    if(!_fs.existsSync(_cfg.dataPath + "/bdstorage.json")) {
        bdStorage.data = bdStorage.defaults.data;
        _fs.writeFileSync(_cfg.dataPath + "/bdstorage.json", JSON.stringify(bdStorage, null, 4));
    } else {
        bdStorage.data = JSON.parse(_fs.readFileSync(_cfg.dataPath + "/bdstorage.json"));
    }
};


bdStorage.get = function(i, m, pn) {

    if (m) return bdStorage.data[i] || "";

    if (bdPluginStorage[pn] !== undefined) {
        return bdPluginStorage[pn][i] || undefined;
    }

    if (_fs.existsSync(_cfg.dataPath + "/plugins/" + pn + ".config.json")) {
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
    _mainWindow.webContents.session.webRequest.onHeadersReceived(function(details, callback) {
        if (!details.responseHeaders["content-security-policy-report-only"] && !details.responseHeaders["content-security-policy"]) return callback({cancel: false});
        delete details.responseHeaders["content-security-policy-report-only"];
        delete details.responseHeaders["content-security-policy"];
        callback({cancel: false, responseHeaders: details.responseHeaders})
    });
    _cfg = _config.cfg || _config;
    _cfg.os = process.platform;
    utils = new _utils.Utils(mainWindow);

    var startupPromise = init();

    var domReadyHooked = false;
    var isReload = false;

    var domReady = async function() {
        utils.log("Hooked dom-ready");
        domReadyHooked = true;
        await startupPromise;
        load(isReload);
        if (!isReload) isReload = true;
    }
    
    try {
        var webContents = utils.getWebContents();

        utils.log("Hooking dom-ready");
        webContents.on('dom-ready', domReady);

        webContents.on('did-finish-loading', function() {
            if(domReadyHooked) {
                return;
            }
            utils.log("Hooking did-finish-loading failsafe");
            domReady();
            utils.log("Hooked did-finish-loading failsafe");
        });

    } catch(err) {
        exit(err);
    }
}

async function init() {
    createAndCheckData();

    if(_cfg.branch == null) {
        _cfg.branch = _cfg.beta ? "beta" : "master";
    }

    if(_cfg.repo == null) {
        _cfg.repo = "rauenzi";
    }

    initStorage();

    utils.log("Using repository: " + _cfg.repo + " and branch: " + _cfg.branch);
    utils.log("Getting latest hash");
    await getHash();

    utils.log("Getting updater");
    await getUpdater();

    utils.log("Updating ext data");
    updateExtData();
}

function createAndCheckData() {
    utils.log("Checking data/cache");

    let linuxPath = process.env.XDG_CONFIG_HOME ? process.env.XDG_CONFIG_HOME : process.env.HOME + '/.config';
    _cfg.dataPath = (_cfg.os == 'win32' ? process.env.APPDATA : _cfg.os == 'darwin' ? process.env.HOME + '/Library/Preferences' :  linuxPath) + '/BetterDiscord/';
    _cfg.userFile = _cfg.dataPath + 'user.json';

    try {
        utils.mkdirSync(_cfg.dataPath);

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
            utils.log("Cache expired or null");
            _fs.writeFileSync(_cfg.userFile, JSON.stringify(_cfg.userCfg));
        }

        
    } catch(err) {
        utils.err(err);
        exit(err.message);
    }
}

function getHash() {
    return new Promise(resolve => {
        utils.getHash(_cfg.repo, _cfg.branch, function(hash) {
            if (!hash)  {
                utils.log("Could not load hash, using backup");
                hash = "4eeea4381e73cbd7f9a1e5337a978483210dcf49";
            }
            _cfg.hash = hash;
            utils.log("Hash: " + _cfg.hash);
            utils.injectVar("_bdhash", _cfg.hash);
            resolve();
        });
    });
}

function getUpdater() {
    return new Promise(resolve => {
        utils.getUpdater(_cfg.repo, _cfg.hash, function(updater) {
            if (!updater)  {
                utils.log("Could not load updater, using backup");
                updater = {
                    LatestVersion: "0.2.83",
                    CDN: "cdn.rawgit.com"
                };
            }
            _cfg.updater = updater;
            utils.log("Latest Version: " + _cfg.updater.LatestVersion);
            utils.log("Using CDN: " + _cfg.updater.CDN);
            resolve();
        });
    });
}

function updateExtData() {
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
            'message': 'start-bd',
            'cacheable': false,
            'variable': null
        }
    };
}

async function load(reload) {
    utils.log(reload ? "Reloading" : "Loading");
    utils.execJs("var betterDiscordIPC = require('electron').ipcRenderer;");
    if(!reload) {
        if(_cfg.updater.LatestVersion > _cfg.version) {
            utils.alert("Update Available", "An update for BandagedBD is available ("+_cfg.updater.LatestVersion+")!<br /><br /><a href='https://github.com/rauenzi/BetterDiscordApp/releases' target='_blank'>Download Installer</a>");
        }
        utils.log("Hooking ipc async");
        _bdIpc.on('asynchronous-message', function(event, arg) { ipcAsyncMessage(event, arg); });
        _bdIpc.on('synchronous-message', function(event, arg) { ipcSyncMessage(event, arg); });
        utils.log("Hooked ipc async");
    }
    try {
        utils.mkdirSync(_cfg.dataPath);
        utils.mkdirSync(_cfg.dataPath + "plugins/");
        utils.mkdirSync(_cfg.dataPath + "themes/");
		
		await utils.execJs(`
			(async() => {
				while (!window.webpackJsonp) await new Promise(r => setTimeout(r, 100));
				const req = webpackJsonp.push([[], {
					'__extra_id__': (module, exports, req) => module.exports = req
				}, [['__extra_id__']]]);
				delete req.m['__extra_id__'];
				delete req.c['__extra_id__'];
				while (Object.keys(req.c).length < 5000) await new Promise(r => setTimeout(r, 100));
			})();
		`);

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
            utils.log(err);
            utils.alert(err);
            return;
        }

        var pluginErrors = [];

        utils.injectVarRaw("bdplugins", "{}");
        utils.injectVarRaw("bdpluginErrors", "[]");

        files.forEach(function(fileName) {
            if (!_fs.statSync(pluginPath + fileName).isFile() || fileName.endsWith(".config.json")) return;
            if(!fileName.endsWith(".plugin.js")) {
                utils.log("Invalid plugin detected: " + fileName);
                return;
            }

            var plugin = _fs.readFileSync(pluginPath + fileName, 'utf8');
            var meta = plugin.split("\n")[0];

            if (meta.indexOf('META') < 0) {
                utils.warn('Plugin META not found in file: ' + fileName);
                pluginErrors.push({name: null, file: fileName, reason: "META not found.", error: null});
                return;
            }

            var pluginVar = meta.substring(meta.lastIndexOf('//META') + 6, meta.lastIndexOf('*//'));
            var parse;
            try { parse = JSON.parse(pluginVar); }
            catch(err) {
                utils.warn("Failed to parse plugin META in file: " + fileName + "("+err+")");
				pluginErrors.push({name: null, file: fileName, reason: "META could not be parsed.", error: {message: err.message, stack: err.stack}});
                return;
            }

            if(parse["name"] == undefined) {
                utils.warn("Undefined plugin name in file: " + fileName);
                pluginErrors.push({name: null, file: fileName, reason: "No name defined.", error: null});
                return;
            }

            utils.log("Loading plugin: " + parse["name"]);

            try { new _vm.Script(plugin, {displayErrors: true}); }
            catch(err) {
                pluginErrors.push({name: parse["name"], file: fileName, reason: "Plugin could not be compiled.", error: {message: err.message, stack: err.stack}});
                utils.execJs(`bdplugins["${parse["name"]}"] = {"plugin": {
                                        start: () => {},
                                        load: () => {},
                                        getName: () => {return "${parse["name"]}";},
                                        getAuthor: () => {return "???";},
                                        getDescription: () => {return "This plugin was unable to be loaded. Check the author's page for updates.";},
                                        getVersion: () => {return "???";}
                                    },
                                    "name": "${parse["name"]}",
                                    "filename": "${fileName}",
                                    "source": "${parse["source"] ? parse["source"] : ""}",
                                    "website": "${parse["website"] ? parse["website"] : ""}"
                                };`);
                return;
            }
        
            utils.execJs(plugin);

            try {new _vm.Script(`new ${parse["name"]}();`, {displayErrors: true});}
            catch(err) {
                pluginErrors.push({name: parse["name"], file: fileName, reason: "Plugin could not be constructed", error: {message: err.message, stack: err.stack}});
                utils.execJs(`bdplugins["${parse["name"]}"] = {"plugin": {
                                        start: () => {},
                                        load: () => {},
                                        getName: () => {return "${parse["name"]}";},
                                        getAuthor: () => {return "???";},
                                        getDescription: () => {return "This plugin was unable to be loaded. Check the author's page for updates.";},
                                        getVersion: () => {return "???";}
                                    },
                                    "name": "${parse["name"]}",
                                    "filename": "${fileName}",
                                    "source": "${parse["source"] ? parse["source"] : ""}",
                                    "website": "${parse["website"] ? parse["website"] : ""}"
                                };`);
                return;
            }

            utils.execJs(`(function() {
                                    try {
                                        var plugin = new ${parse["name"]}();
                                        bdplugins[plugin.getName()] = {"plugin": plugin, "name": "${parse["name"]}", "filename": "${fileName}", "source": "${parse["source"] ? parse["source"] : ""}", "website": "${parse["website"] ? parse["website"] : ""}" };
                                    }
                                    catch (e) {
                                        bdpluginErrors.push({name: "${parse["name"]}", file: "${fileName}", reason: "Plugin could not be constructed.", error: {message: e.message, stack: e.stack}})
                                        bdplugins["${parse["name"]}"] = {"plugin": {
                                                start: () => {},
                                                load: () => {},
                                                getName: () => {return "${parse["name"]}";},
                                                getAuthor: () => {return "???";},
                                                getDescription: () => {return "This plugin was unable to be loaded. Check the author's page for updates.";},
                                                getVersion: () => {return "???";}
                                            },
                                            "name": "${parse["name"]}",
                                            "filename": "${fileName}",
                                            "source": "${parse["source"] ? parse["source"] : ""}",
                                            "website": "${parse["website"] ? parse["website"] : ""}"
                                        };
                                    }
                                })();`)
        });

        for (var i = 0; i < pluginErrors.length; i++) {
            utils.execJs(`bdpluginErrors.push(${JSON.stringify(pluginErrors[i])});`);
        }

    });
}

function loadThemes() {
    var themePath = _cfg.dataPath + "themes/";
    _fs.readdir(themePath, function(err, files) {
        if(err) {
            utils.log(err);
            utils.alert(err);
            return;
        }

        var themeErrors = [];  

        utils.injectVarRaw("bdthemes", "{}");

        files.forEach(function(fileName) {
            if (!_fs.statSync(themePath + fileName).isFile()) return;
            if(!fileName.endsWith(".theme.css")) {
                utils.log("Invalid theme detected " + fileName);
                return;
            }
            var theme = _fs.readFileSync(themePath + fileName, 'utf8');
            var split = theme.split("\n");
            var meta = split[0];
            if(meta.indexOf('META') < 0) {
                utils.warn("Theme META not found in file: " + fileName);
                themeErrors.push({name: null, file: fileName, reason: "META not found.", error: null});
                return;
            }
            var themeVar = meta.substring(meta.lastIndexOf('//META') + 6, meta.lastIndexOf('*//'));
            var themeInfo;
            try {
                themeInfo = JSON.parse(themeVar);
            }
            catch(err) {
                utils.warn("Failed to parse theme META in file: " + fileName + "("+err+")");
                themeErrors.push({name: null, file: fileName, reason: "META could not be parsed.", error: {message: err.message, stack: err.stack}});
                return;
            }
            
            if(themeInfo['name'] == undefined) {
                utils.warn("Missing theme name in file: " + fileName);
                themeErrors.push({name: null, file: fileName, reason: "No name defined.", error: null});
                return;
            }
            if(themeInfo['author'] == undefined) {
                themeInfo['author'] = "Unknown";
                utils.warn("Missing author name in file: " + fileName);
            }
            if(themeInfo['description'] == undefined) {
                themeInfo['description'] = "No Description";
                utils.warn("Missing description in file: " + fileName);
            }
            if(themeInfo['version'] == undefined) {
                themeInfo['version'] = "Unknown";
                utils.warn("Missing version in file: " + fileName);
            }

            utils.log("Loading theme: " + themeInfo['name']);
            split.splice(0, 1);
            theme = split.join("\n");
            theme = theme.replace(/(\r\n|\n|\r)/gm, '');

            utils.execJs(`(function() {
                                    bdthemes["${themeInfo['name']}"] = {
                                        name: "${themeInfo['name']}",
                                        css: "${escape(theme)}",
                                        description: "${themeInfo['description']}",
                                        author:"${themeInfo['author']}",
                                        version:"${themeInfo['version']}",
                                        "source": "${themeInfo["source"] ? themeInfo["source"] : ""}",
                                        "website": "${themeInfo["website"] ? themeInfo["website"] : ""}"
                                    } 
                                })();`);
        });
        utils.injectVarRaw("bdthemeErrors", JSON.stringify(themeErrors));
    });
}

function loadApp() {
    utils.injectVar('bdVersion', _cfg.version);
    utils.injectVar('bdCdn', _cfg.CDN);

    utils.log("Loading Resource (jQuery)", 0, 100);
    utils.injectJavaScriptSync("//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js", "load-jQueryCookie");
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
                    utils.openDir(_cfg.dataPath + "/plugins");
                    break;
                }
                if(arg.path == "themedir") {
                    utils.openDir(_cfg.dataPath + "/themes");
                    break;
                }
                if(arg.path == "datadir") {
                    utils.openDir(_cfg.dataPath);
                    break;
                }
                utils.openDir(arg.path);
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
        utils.log("Starting Up", 100, 100);
        utils.execJs(`var mainCore; var startBda = function() { mainCore = new Core(${JSON.stringify(_cfg)}); mainCore.init(); }; startBda();`);
        utils.saveLogs(_cfg.dataPath);
    }
}

var loadCounter = 0;
function loadExtData(extData) {

    loadCounter++;

    utils.log("Loading Resource (" + extData.resource + ")", loadCounter / Object.keys(_extData).length * 100, 100);
    
    var url = (_cfg.local && extData.localurl != null) ? extData.localurl : extData.url;

    try {
        switch(extData.type) {
            case 'javascript':
                utils.injectJavaScriptSync(url, extData.message);
                break;
            case 'css':
                utils.injectStylesheetSync(url, extData.message);
                break;
            case 'json':
                utils.download(extData.domain, extData.url, function(data) {
                    utils.injectVar(extData.variable, data);
                    utils.sendIpcAsync(extData.message);
                });
                break;
        }
    }
    catch(err) {
        utils.warn(err);
        utils.alert("Something went wrong :( Attempting to run.", err);
        utils.sendIpcAsync(extData.message);
    }
}

function exit(reason) {
    _error = true;
    utils.log("Exiting. Reason: " + reason);
    utils.saveLogs(_cfg.dataPath);
    utils.alert("Something went wrong :(", reason);
}

BetterDiscord.prototype.init = function() {}//Compatibility

exports.BetterDiscord = BetterDiscord;

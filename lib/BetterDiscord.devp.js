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


function BetterDiscord(mainWindow) {
    _mainWindow = mainWindow;

    _cfg = _config.cfg;
    _cfg.version = _config.Core.Version;
    _cfg.os = process.platform;
    _utils2 = new _utils.Utils(mainWindow);

    createAndCheckData();
};

function createAndCheckData() {
    getUtils().log("Checking data/cache");

    _cfg.dataPath = (_cfg.os == 'win32' ? process.env.APPDATA : _cfg.os == 'darwin' ? process.env.HOME + '/Library/Preferences' : '/var/local') + '/BetterDiscordTest/';
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
};

function init() {
    getUtils().log("Initializing");
    getUtils().log("Getting latest hash");

    if(_cfg.branch == null) {
        _cfg.branch = _cfg.beta ? "beta" : "master";
    }
    getUtils().log("Using repo: " + _cfg.repo + " with branch: " + _cfg.branch);

    getUtils().download("api.github.com", "/repos/" + _cfg.repo + "/BetterDiscordApp/commits/" + _cfg.branch, function(data) {

        try {
            _cfg.hash = JSON.parse(data).sha;
            getUtils().injectVar("_bdhash", _cfg.hash);
        }catch(err) {
            getUtils().err(err);
            exit("Failed to load hash");
            return;
        }
        if(_cfg.hash == undefined) {
            exit("Failed to load hash");
            return;
        }

        getUtils().log("Hash: " + _cfg.hash);

        initUpdater();
        
    });
};

function initUpdater() {
    getUtils().log("Getting updater");

    getUtils().download("raw.githubusercontent.com", "/" + _cfg.repo + "/BetterDiscordApp/" + _cfg.hash + "/data/updater.json", function(data) {
        try {
            _cfg.updater = JSON.parse(data);
        } catch(err) {
            exit("Failed to load updater");
            return;
        }

        if(_cfg.updater == undefined) {
            exit("Failed to load updater");
            return;
        }

        if(_cfg.updater.LatestVersion == undefined || _cfg.updater.CDN == undefined) {
            exit("Failed to load updater");
            return;
        }

        getUtils().log("Latest Version: " + _cfg.updater.LatestVersion);
        getUtils().log("Using CDN: " + _cfg.updater.CDN);
        updateExtData();
        start();
    });
};

function updateExtData() {
    getUtils().log("Updating ext data");

    _extData = {
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
            'localurl': _cfg.localServer + '/BetterDiscordApp/js/main.js',
            'message': 'load-publicServers',
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
            'url': '/api_cache/v2/global.json',
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
            'url': '/api_cache/v2/subscriber.json',
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
};

function start() {
    getUtils().log("Starting up");
    try {
        var webContents = getUtils().getWebContents();
    
        getUtils().log("Hooking dom-ready");
        webContents.on('dom-ready', domReady);
        getUtils().log("Hooked dom-ready");

        webContents.on('did-finish-loading', function() {
            if(domReadyHooked)return;
            getUtils().log("Hooking did-finish-loading failsafe");
            domReady();
            getUtils().log("Hooked did-finish-loading failsafe");
        });

    }catch(err) {
        exit(err);
    }
};

var domReadyHooked = false;
var ipcHooked = false;

function domReady() {
    domReadyHooked = true;
    if(ipcHooked) {
        load(true);
        return;
    }
    ipcHooked = true;
    load(false);
};

function load(reload) {
    getUtils().log(reload ? "Reloading" : "Loading");
    initLoaders();


};

function initLoaders() {
    try {
        getUtils().mkdirSync(_cfg.dataPath);
        getUtils().mkdirSync(_cfg.dataPath + "plugins/");
        getUtils().mkdirSync(_cfg.dataPath + "themes/");
        getUtils().execJs('var themesupport2 = true');

        loadPlugins();
        loadThemes();


    }catch(err) {
        exit(err);
    }
};

function loadPlugins() {
    var pluginPath = _cfg.dataPath + "plugins/";
    _fs.readdir(pluginPath, function(err, files) {
        if(err) {
            getUtils().log(err);
            getUtils().alert(err);
            return;
        }

        var pluginErrors = [];

        getUtils().injectVar("bdplugins", "{}");
        files.forEach(function(fileName) {
            if(!fileName.endsWith(".plugin.js")) return;
            var plugin = _fs.readFileSync(pluginPath + fileName, 'utf8');
            var meta = plugin.split(_eol)[0];

            if (meta.indexOf('META') < 0) {
                getUtils().warn('Plugin META not found in file: ' + fileName);
                pluginErrors.push(fileName + " Reason: Plugin META not found");
                return;
            }
        });

        if(pluginErrors.length > 0) {
            getUtils().alert("The following plugins could not be loaded", pluginErrors.join("<br>"));
        }

    });
};

function loadThemes() {

};

function getUtils() {
    return _utils2;
};

function exit(reason) {
    error = true;
    getUtils().log("Exiting. Reason: " + reason);
    getUtils().saveLogs(_cfg.dataPath);
    getUtils().alert("Something went wrong :(", reason);
};

exports.BetterDiscord = BetterDiscord;
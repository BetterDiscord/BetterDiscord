/* BetterDiscordApp Core
 * Version: 2:1.0
 * Author: Jiiks | https://jiiks.net
 * Date: 31/10/2016
 * Last Update: 31/10/2016
 * Github: https://github.com/Jiiks/BetterDiscordApp
 * Git: https://github.com/Jiiks/BetterDiscordApp.git
 * License: MIT
 */
 
'use strict';

const
    _fs = require('fs'),
    _config = require('./config.json'),
    {_utils} = require('./utils'),
    {_logger} = require('./utils'),
    {EOL} = require('os'),
    _os = require('os');
    
const _startDate = new Date();

var _cfg;

//Default configs if for some reason we don't receive config params
const _defaults = {
    installPath:  (_os.platform() === 'win32' ? process.env.APPDATA : _os.platform() === 'darwin' ? `${process.env.HOME}/Library/Preferences`: `/var/local`) + '/BetterDiscord/lib/',
    dataPath: (_os.platform() === 'win32' ? process.env.APPDATA : _os.platform() === 'darwin' ? `${process.env.HOME}/Library/Preferences`: `/var/local`) + '/BetterDiscord/data/',
    emotesEnabled: true
};

class Core {
    
    constructor(args) {
        this.initConfig(args.cfg);
    }
    
    initConfig(args) {
        _cfg = _config.cfg;
        _cfg.installPath = args.installPath || _defaults.installPath;
        _cfg.dataPath = args.dataPath || _defaults.dataPath;
        _cfg.emotesEnabled = args.emotesEnabled || _defaults.emotesEnabled;
    }
    
}

exports.BetterDiscord = new Core({ cfg: { } });
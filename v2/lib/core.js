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
    {EOL} = require('os');
    
const _startDate = new Date();

var _cfg;

const _defaults = {};

class Core {
    
    constructor(args) {

    }
    
    initConfig(args) {
        
    }
    
}

exports.BetterDiscord = new Core(null);
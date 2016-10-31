/* BetterDiscordApp Utilities
 * Version: 2:1.0
 * Author: Jiiks | https://jiiks.net
 * Date: 31/10/2016
 * Last Update: 31/10/2016
 * Github: https://github.com/Jiiks/BetterDiscordApp
 * Git: https://github.com/Jiiks/BetterDiscordApp.git
 * License: MIT
 */
 
'use strict';

class Utils {
    
    //Returns a datestring: [DD/MM/YYYY - HH:MM:SS]
    get dateString() {
        var d = new Date();

        return `${("00" + (d.getDate() + 1)).slice(-2)}/`   +
               `${("00" + d.getMonth()).slice(-2)}/`        +
               `${d.getFullYear()} - `                      +
               `${("00" + d.getHours()).slice(-2)}:`        +
               `${("00" + d.getMinutes()).slice(-2)}:`      +
               `${("00" + d.getSeconds()).slice(-2)}`;
    }
    
}

class Logger {

    constructor() {
        this.logs = "";
    }
    
    log(msg, severity) {
        var l = `[BD|${this.severity(severity)}][${_utils.dateString}] >>> ${msg}`;
        console.log(l);
        this.logs += `${l}${EOL}`;
    }
    
    save() {
        try {
            _fs.writeFileSync('logs.log', this.logs);
        }catch(err) {
            this.log("Failed to save logs! " + err, 2);
        }
    }
    
    severity(severity) {
        return {
            0: "INF",
            1: "WRN",
            2: "ERR"
        }[severity||0];
    }

}

const _utils = new Utils(),
      _logger = new Logger(),
      _fs = require('fs'),
      {EOL} = require('os');
      
exports._utils = _utils;
exports._logger = _logger;
'use strict';

const 
    https = require('https'),
    fs = require('fs'),
    eol = require('os').EOL,
    platform = (process.platform !== "win32" && process.platform !== "darwin") ? "linux" : process.platform;

class Utils {
    
	constructor() {
		this.logs = "";
	}

	log(message) {
    	var d = new Date();
    	var ds = ("00" + (d.getDate() + 1)).slice(-2) + "/" + 
    	("00" + d.getMonth()).slice(-2) + "/" + 
    	d.getFullYear() + " " + 
    	("00" + d.getHours()).slice(-2) + ":" + 
    	("00" + d.getMinutes()).slice(-2) + ":" + 
    	("00" + d.getSeconds()).slice(-2);
    	console.log(`[${ds}] ${message}`);
    	this.logs += `[${ds}] ${message}${eol}`;
        this.saveLogs();
	}

	printLogs() {
		console.log(this.logs);
	}

	saveLogs() {
        fs.writeFileSync("logs.log", this.logs);
	}

	downloadResource(resource, callback, host) {
    	https.get({
    	    host: host || "raw.githubusercontent.com",
    	    path: resource,
    	    headers: { 'user-agent': 'Mozilla/5.0' }
    	},
    	(response) => {
    	    var data = "";
    	    response.on("data", (chunk) => {
    	        data += chunk;
    	    });
    	    response.on("end", () => {
    	        callback(false, data);
    	    });
    	    response.on("error", (e) => {
    	        callback(true, e);
    	    });
    	}).on('error', (e) => {
    	    callback(true, e);
    	});
	}

    installPath(lastKnownVersion) {

        return {
            "win32": () => {
                var hver = lastKnownVersion;
                var path = `${process.env.LOCALAPPDATA}/Discord/app-${lastKnownVersion}\\`;
                fs.readdirSync(`${process.env.LOCALAPPDATA}/Discord/`).filter(function(file) {
                    var tpath = `${process.env.LOCALAPPDATA}/Discord/${file}`;
                    if(!fs.statSync(tpath).isDirectory()) return;
                    
                    if(!file.startsWith("app-")) return;
                    var ver = file.replace("app-", "");
                    if(ver < hver) return;
                    hver = ver;
                    path = tpath;
                });
                return path;
            },
            "darwin": () => "/Applications/Discord.app/Contents",
            "linux": () => "/usr/share/discord-canary"
        }[platform]();

    }

    libPath() {
        return {
            "win32": () => {
                return `${process.env.APPDATA}/BetterDiscord/lib`;
            },
            "darwin": () => {
                return `${process.env.HOME}/.local/share/BetterDiscord`;
            },
            "linux": () => {
                // FIXME: for a non-root user, a path like OSX's makes more sense
                return "/usr/local/share/BetterDiscord";
            }
        }[platform]();
    }
}

module.exports = Utils;
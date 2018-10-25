const fs = require("fs");
const eol = require("os").EOL;
const request = require("request").defaults({headers: {"User-Agent": "BandagedBD"}});

/* eslint-disable no-console */

const dummyWindow = {
    webContents: {
        executeJavaScript: function(){}
    }
};

module.exports = class Utils {

    static get browserWindow() {return this._window || dummyWindow;}
    static setWindow(window) {this._window = window;}
    static get webContents() {return this.browserWindow.webContents;}

    static getFile(url) {
        return new Promise(resolve => {
            request.get(url, function(error, response, body) {
                if (error || 200 !== response.statusCode) return resolve(null);
				resolve(body);
            });
        });
    }

    static testJSON(data) {
        try {
            JSON.parse(data);
            return true;
        }
        catch (error) {
            return false;
        }
    }
	
	static async getCommitHash() {
		const data = await this.getFile("https://api.github.com/repos/rauenzi/BetterDiscordApp/commits");
		if (!this.testJSON(data)) return null;
        return JSON.parse(data)[0].sha;
	}

    static async getUpdater() {
        const data = await this.getFile(`https://rauenzi.github.io/BetterDiscordApp/data/updater.json`);
        if (!this.testJSON(data)) return null;
        return JSON.parse(data);
    }

    static runJS(js) {
        return this.webContents.executeJavaScript(js);
    }

    //Inject variable
    static injectVariable(variable, data) {
        this.runJS(`var ${variable} = ${JSON.stringify(data)}`);
    }

    static injectVariableRaw(variable, data) {
        this.runJS(`var ${variable} = ${data}`);
    }

    static injectStyle(url) {
        return this.runJS(`new Promise((resolve, reject) => {
            var link = document.createElement("link");
            link.rel = "stylesheet";
            link.onload = resolve;
            link.onerror = reject;
            link.href = "${url}";
            document.head.appendChild(link);
        });`);
    }

    static injectScript(url) {
        return this.runJS(`new Promise((resolve, reject) => {
            var script = document.createElement("script");
            script.type = "text/javascript";
            script.onload = resolve;
            script.onerror = reject;
            script.src = "${url}";
            document.body.appendChild(script);
        });`);
    }

    static makeFolder(path) {
        if (fs.existsSync(path)) return;
        this.log("Directory " + path + " does not exist. Creating");
        try {
            fs.mkdirSync(path);
        }
        catch (err) {
            Utils.error(err);
        }
    }
	
	static formatString(string, values) {
        for (let val in values) {
            string = string.replace(new RegExp(`{{${val}}}`, "g"), values[val]);
        }
        return string;
    }


    //Logger
    static log(message) {
        this._log(`[INF][${(new Date()).toLocaleString()}] ${message}${eol}`);
    }

    static error(err) {
        this._log(`[ERR][${(new Date()).toLocaleString()}] ${err.message}${eol}`);
    }

    static warn(message) {
        this._log(`[WRN][${(new Date()).toLocaleString()}] ${message}${eol}`);
    }

    static _log(message) {
        if (!this.logFile) return;
        this.logData += message;
    }

    static setLogFile(file) {
        this.logFile = file;
        this.logData = "";
        fs.writeFileSync(file, this.logData);
    }

    static saveLogs() {
        fs.writeFileSync(this.logFile, this.logData);
    }
};
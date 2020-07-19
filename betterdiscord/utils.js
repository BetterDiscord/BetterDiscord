const fs = require("fs");
const eol = require("os").EOL;
const request = require("request").defaults({headers: {"User-Agent": "BandagedBD"}});

const dummyWindow = {webContents: {executeJavaScript: function(){}}};
module.exports = class Utils {

    static get browserWindow() {return this._window || dummyWindow;}
    static setWindow(window) {this._window = window;}
    static get webContents() {return this.browserWindow.webContents;}

    static getFile(url) {
        return new Promise(resolve => {
            request.get(url, function(error, response, body) {
                if (error || response.statusCode !== 200) return resolve(null);
                resolve(body);
            });
        });
    }

    static testJSON(data) {
        try {return JSON.parse(data);}
        catch (error) {return false;}
    }

    static async getCommitHash(repo, branch) {
        const url = this.formatString("https://api.github.com/repos/{{repo}}/BetterDiscordApp/commits/{{branch}}", {repo, branch});
        this.log("Getting hash from: " + url);
        const data = await this.getFile(url);
        const parsed = this.testJSON(data);
        if (!parsed) return null;
        return parsed.sha;
    }

    static async getUpdater(repo, branch) {
        let hash = await this.getCommitHash(repo, branch);
        if (!hash) hash = "injector";
        const url = this.formatString("https://cdn.statically.io/gh/{{repo}}/BetterDiscordApp/{{hash}}/betterdiscord/config.json", {repo, hash});
        this.log("Getting version from: " + url);
        const data = await this.getFile(url);
        const parsed = this.testJSON(data);
        if (!parsed) return null;
        return parsed;
    }

    static runJS(js) {
        return this.webContents.executeJavaScript(js);
    }

    static injectScript(url) {
        return this.runJS(`new Promise((resolve, reject) => {
            var script = document.createElement("script");
            script.type = "text/javascript";
            script.onload = () => resolve();
            script.onerror = () => reject();
            script.src = "${url}";
            document.body.appendChild(script);
        });`);
    }

    static makeFolder(path) {
        if (fs.existsSync(path)) return;
        this.log("Directory " + path + " does not exist. Creating");
        try {fs.mkdirSync(path);}
        catch (err) {this.error(err);}
    }

    static formatString(string, values) {
        for (const val in values) string = string.replace(new RegExp(`{{${val}}}`, "g"), values[val]);
        return string;
    }


    //Logger
    static log(message) {this._log(`[INF][${(new Date()).toLocaleString()}] ${message}${eol}`);}
    static error(err) {this._log(`[ERR][${(new Date()).toLocaleString()}] ${err.message}${eol}`);}
    static warn(message) {this._log(`[WRN][${(new Date()).toLocaleString()}] ${message}${eol}`);}

    static _log(message) {
        console.log("[BetterDiscord]" + message);
        if (!this.logFile) return;
        this.appendLog(message);
    }

    static setLogFile(file) {
        this.logFile = file;
        fs.writeFileSync(file, "");
    }

    static appendLog(message) {
        if (!this.logFile) return;
        try {fs.appendFileSync(this.logFile, message);}
        catch {console.log("[BetterDiscord] Could not append log file.");}
    }
};
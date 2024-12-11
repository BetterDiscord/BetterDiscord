import electron from "electron";

export default class {
    static block() {
        electron.session.defaultSession.webRequest.onBeforeRequest({urls: ["*://discord.com/assets/sentry*"]}, function(details, callback) {
            callback({cancel: true});
        });

        // const M = require("module");
        // const originalRequire = M.prototype.require;
        // M.prototype.require = function(id) {
        //     if (id.toLowerCase().includes("sentry")) return null;
        //     return originalRequire.apply(this, arguments);
        // };
    }
}
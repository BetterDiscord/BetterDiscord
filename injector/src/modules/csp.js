const electron = require("electron");

export default class {
    static remove() {
        electron.session.defaultSession.webRequest.onHeadersReceived(function(details, callback) {
            if (!details.responseHeaders["content-security-policy-report-only"] && !details.responseHeaders["content-security-policy"]) return callback({cancel: false});
            delete details.responseHeaders["content-security-policy-report-only"];
            delete details.responseHeaders["content-security-policy"];
            callback({cancel: false, responseHeaders: details.responseHeaders});
        });
    }
}
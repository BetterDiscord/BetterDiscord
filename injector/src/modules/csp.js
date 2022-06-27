import electron from "electron";

export default class {
    static remove() {
        electron.session.defaultSession.webRequest.onHeadersReceived(function(details, callback) {
            const headers = Object.keys(details.responseHeaders);
            for (let h = 0; h < headers.length; h++) {
                const key = headers[h];
                if (key.toLowerCase().indexOf("content-security-policy") !== 0) continue;
                delete details.responseHeaders[key];
            }
            callback({cancel: false, responseHeaders: details.responseHeaders});
        });
    }
}
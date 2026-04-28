import electron from "electron";

export default class {
    static _onHeadersReceived: electron.WebRequest["onHeadersReceived"] | null = null;

    static get onHeadersReceived() {
        return this._onHeadersReceived ??= electron.session.fromPartition(`bd:${Date.now()}:${Math.random()}`).webRequest.onHeadersReceived;
    }

    static remove() {
        // electron.session.defaultSession.webRequest.onHeadersReceived may be redefined
        this.onHeadersReceived.call(electron.session.defaultSession.webRequest, (details, callback) => {
            if (!details.responseHeaders) return callback({cancel: false});

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
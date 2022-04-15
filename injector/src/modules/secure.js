const {session} = require("electron");

export default class Secure {
    static blockWebhooks() {
        console.info("[Secure] Blocking webhook requests");
        session.defaultSession.webRequest.onBeforeRequest(
            {
                urls: ["*://*/*"]
            },
            async (details, cb) => {
                cb({cancel: details.url.includes("api/webhooks")});
            }
        );
    }
}

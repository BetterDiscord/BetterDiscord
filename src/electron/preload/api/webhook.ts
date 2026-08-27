/**
 * First line of defense against low-effort attackers trying to scrape Discord tokens to webhooks.
 *
 * BdApi.Net.fetch and the native https module run in the Node context over Node's http/https and
 * do not inherit the origin/referrer of Discord.com which Discord uses to block requests to
 * webhooks by default. Callers should check per hop so a redirect into a webhook URL is caught too.
 */
export function isWebhookUrl(uri: string): boolean {
    try {
        const {pathname} = new URL(uri);
        // URL.pathname preserves percent-encoding (e.g. %2F), so decode before matching.
        const decoded = (() => {
            try {return decodeURIComponent(pathname);}
            catch {return pathname;}
        })().toLowerCase();
        // Optional version segment: /api/webhooks and /api/v10/webhooks both hit the webhook handler.
        return /(^|\/)api\/(?:v\d+\/)?webhooks(\/|$)/.test(decoded);
    }
    catch {
        // Best-effort fallback for non-URL inputs: cover both raw and encoded separators.
        const lower = uri.toLowerCase();
        return /(?:\/|%2f)api(?:\/|%2f)(?:v\d+(?:\/|%2f))?webhooks/.test(lower) || lower.includes("api/webhooks");
    }
}

import Remote from "../polyfill/remote";

const redirects = new Set(["manual", "follow"]);
const methods = new Set(["GET", "PUT", "POST", "DELETE", "PATCH", "OPTIONS", "HEAD", "CONNECT", "TRACE"]);
const bodylessStatusCodes = new Set([101, 204, 205, 304]);

class FetchResponse extends Response {
    constructor(options) {
        super(bodylessStatusCodes.has(options.status) ? null : options.content, {
            headers: new Headers(options.headers),
            method: options.method ?? "GET",
            body: options.content,
            ...options
        });

        this._options = options;
    }

    get url() {return this._options.url;}
    get redirected() {return this._options.redirected;}
}

const convertSignal = signal => {
    const listeners = new Set();

    signal.addEventListener("abort", () => {
        listeners.forEach(l => l());
    });

    return {
        addEventListener(_, listener) {
            listeners.add(listener);
        }
    };
};

/**
 * @typedef {Object} FetchOptions
 * @property {"GET" | "PUT" | "POST" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD" | "CONNECT" | "TRACE"} [method] - Request method.
 * @property {Record<string, string>} [headers] - Request headers.
 * @property {"manual" | "follow"} [redirect] - Whether to follow redirects.
 * @property {number} [maxRedirects] - Maximum amount of redirects to be followed.
 * @property {AbortSignal} [signal] - Signal to abruptly cancel the request
 * @property {Uint8Array | string} [body] - Defines a request body. Data must be serializable.
 * @property {number} [timeout] - Request timeout time.
 */

/**
 * @param {string} url
 * @param {FetchOptions} options
 * @returns {Promise<FetchResponse>}
 */
export default function fetch(url, options = {}) {
    return new Promise((resolve, reject) => {
        const data = {};

        if (typeof options.headers === "object") {
            data.headers = options.headers instanceof Headers ? Object.fromEntries(options.headers.entries()) : options.headers;
        }

        if (typeof options.redirect === "string" && redirects.has(options.redirect)) data.redirect = options.redirect;
        if (typeof options.body === "string" || options.body instanceof Uint8Array) data.body = options.body;
        if (typeof options.method === "string" && methods.has(options.method)) data.method = options.method;
        if (typeof options.maxRedirects === "number") data.maxRedirects = options.maxRedirects;
        if (typeof options.timeout === "number") data.timeout = options.timeout;

        if (options.signal instanceof AbortSignal) data.signal = convertSignal(options.signal);

        let ctx;
        try {
            ctx = Remote.nativeFetch(url, data);
        }
        catch (error) {
            return reject(error);
        }

        ctx.onError(error => {
            reject(error);
        });

        ctx.onComplete(() => {
            try {
                const resultData = ctx.readData();

                const req = new FetchResponse({
                    method: options.method ?? "GET",
                    status: resultData.statusCode,
                    ...options,
                    ...resultData
                });

                resolve(req);
            }
            catch (error) {
                reject(error);
            }
        });
    });
}

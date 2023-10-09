import Remote from "../../polyfill/remote";

const methods = new Set(["GET", "PUT", "POST", "DELETE"]);

class FetchResponse extends Response {
    constructor(options) {
        super(options.content, {
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
 * @property {"GET" | "PUT" | "POST" | "DELETE"} [method] - Request method.
 * @property {Record<string, string>} [headers] - Request headers.
 * @property {"manual" | "follow"} [redirect] - Whether to follow redirects.
 * @property {number} [maxRedirects] - Maximum amount of redirects to be followed.
 * @property {AbortSignal} [signal] - Signal to abruptly cancel the request
 * @property {Uint8Array | string} [body] - Defines a request body. Data must be serializable. 
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

        if (typeof options.body === "string" || options.body instanceof Uint8Array) data.body = options.body;
        if (typeof options.method === "string" && methods.has(options.method)) data.method = options.method;
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
                const data = ctx.readData();

                const req = new FetchResponse({
                    method: options.method ?? "GET",
                    status: data.statusCode,
                    ...options,
                    ...data
                });

                resolve(req);
            }
            catch (error) {
                reject(error);
            }
        });
    });
}

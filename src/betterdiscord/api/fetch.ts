import Remote from "../polyfill/remote";

const redirects = new Set(["manual", "follow"]);
const methods = new Set(["GET", "PUT", "POST", "DELETE", "PATCH", "OPTIONS", "HEAD", "CONNECT", "TRACE"]);
const bodylessStatusCodes = new Set([101, 204, 205, 304]);


class FetchResponse extends Response {

    private _options: Partial<FetchData & {status?: number;}>;

    constructor(options: Partial<FetchData & {status?: number;}>) {
        super(bodylessStatusCodes.has(options.status ?? 0) ? null : options.content as any, {
            headers: new Headers(options.headers),
            method: options.method ?? "GET",
            body: options.content,
            ...options
        });

        this._options = options;
    }

    get url() {return this._options.url!;}
    get redirected() {return this._options.redirected!;}
}

const convertSignal = (signal: AbortSignal) => {
    const listeners = new Set<() => void>();

    signal.addEventListener("abort", () => {
        listeners.forEach(l => l());
    });

    return {
        addEventListener(_: any, listener: () => void) {
            listeners.add(listener);
        }
    } as AbortSignal;
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

// TODO: de-dup with preload and make @common/types
interface FetchOptions {
    method: "GET" | "PUT" | "POST" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD" | "CONNECT" | "TRACE";
    headers: Record<string, string>;
    redirect: "manual" | "follow";
    maxRedirects: number;
    signal: AbortSignal;
    body: Uint8Array | string;
    timeout: number;
}

interface FetchData extends FetchOptions {
    content: Buffer[] | Buffer;
    headers: Record<string, any>;
    statusCode: number;
    url: string;
    statusText: string;
    redirected: boolean;
    signal: AbortSignal;
}


/**
 * @param {string} url
 * @param {FetchOptions} options
 * @returns {Promise<FetchResponse>}
 */
export default function fetch(url: string, options: Partial<FetchOptions> = {}) {
    return new Promise((resolve, reject) => {
        const data: Partial<FetchData> = {};

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
                    status: resultData?.statusCode,
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

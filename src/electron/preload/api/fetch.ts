import * as https from "https";
import * as http from "http";

const MAX_DEFAULT_REDIRECTS = 20;
const redirectCodes = new Set([301, 302, 307, 308]);

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

interface FetchOptions {
    method: "GET" | "PUT" | "POST" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD" | "CONNECT" | "TRACE";
    headers: Record<string, string>;
    redirect: "manual" | "follow";
    maxRedirects: number;
    signal: AbortSignal;
    body: Uint8Array | string;
    timeout: number;
}

interface FetchData {
    content: Buffer[] | Buffer;
    headers?: Record<string, any>;
    statusCode?: number;
    url: string;
    statusText?: string;
    redirected: boolean;
}

/**
 * @param {string} requestedUrl
 * @param {FetchOptions} fetchOptions
 */
export function nativeFetch(requestedUrl: string, fetchOptions: Partial<FetchOptions>) {
    let state = "PENDING";
    const data: FetchData = {content: [], headers: undefined, statusCode: undefined, url: requestedUrl, statusText: "", redirected: false};
    const finishListeners = new Set<() => void>();
    const errorListeners = new Set<(e: Error) => void>();

    /** * @param {URL} url */
    const execute = (url: URL, options: https.RequestOptions & Partial<FetchOptions>, redirectCount = 0) => {
        const Module = url.protocol === "http:" ? http : https;

        const req = Module.request(url.href, {
            headers: options.headers ?? {},
            method: options.method ?? "GET",
            timeout: options.timeout ?? 3000
        }, res => {
            if (redirectCodes.has(res.statusCode ?? 0) && res.headers.location && options.redirect !== "manual") {
                redirectCount++;

                if (redirectCount >= (options.maxRedirects ?? MAX_DEFAULT_REDIRECTS)) {
                    state = "ABORTED";
                    const error = new Error(`Maximum amount of redirects reached (${options.maxRedirects ?? MAX_DEFAULT_REDIRECTS})`);
                    errorListeners.forEach(e => e(error));

                    return;
                }

                let final;
                try {
                    final = new URL(res.headers.location);
                }
                catch (error) {
                    state = "ABORTED";
                    errorListeners.forEach(e => e(error as Error));
                    return;
                }

                for (const [key, value] of new URL(url).searchParams.entries()) {
                    final.searchParams.set(key, value);
                }

                return execute(final, options, redirectCount);
            }

            res.on("data", (chunk: Buffer) => (data.content as Buffer[]).push(chunk));
            res.on("end", () => {
                data.content = Buffer.concat(data.content as Buffer[]);
                data.headers = res.headers;
                data.statusCode = res.statusCode;
                data.url = url.toString();
                data.statusText = res.statusMessage;
                data.redirected = redirectCount > 0;
                state = "DONE";

                finishListeners.forEach(listener => listener());
            });
            res.on("error", error => {
                state = "ABORTED";
                errorListeners.forEach(e => e(error));
            });
        });

        req.on("timeout", () => {
            const error = new Error("Request timed out");
            req.destroy(error);
        });

        req.on("error", error => {
            state = "ABORTED";
            errorListeners.forEach(e => e(error));
        });

        if (options.body) {
            try {req.write(options.body);}
            catch (error) {
                state = "ABORTED";
                errorListeners.forEach(e => e(error as Error));
            }
            finally {
                req.end();
            }
        }
        else {
            req.end();
        }

        if (options.signal) {
            options.signal.addEventListener("abort", () => {
                req.end();
                state = "ABORTED";
            });
        }
    };

    /**
     * Obviously parsing a URL may throw an error, but this is
     * actually intended here. The caller should handle this
     * gracefully.
     *
     * Reasoning: at this point the caller does not have a
     * reference to the object below so they have no way of
     * listening to the error through onError.
     */
    const parsed = new URL(requestedUrl, location.href);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        throw new Error(`Unsupported protocol: ${parsed.protocol}`);
    }
    execute(parsed, fetchOptions);

    return {
        onComplete(listener: () => void) {
            finishListeners.add(listener);
        },
        onError(listener: (e: Error) => void) {
            errorListeners.add(listener);
        },
        readData() {
            switch (state) {
                case "PENDING":
                    throw new Error("Cannot read data before request is done!");
                case "ABORTED":
                    throw new Error("Request was aborted.");
                case "DONE":
                    return data;
            }
        }
    };
}

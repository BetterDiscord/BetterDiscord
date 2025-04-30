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

/**
 * @param {string} requestedUrl
 * @param {FetchOptions} fetchOptions
 */
export function nativeFetch(requestedUrl, fetchOptions) {
    let state = "PENDING";
    const data = {content: [], headers: null, statusCode: null, url: requestedUrl, statusText: "", redirected: false};
    const listeners = new Set();
    const errors = new Set();

    /** * @param {URL} url */
    const execute = (url, options, redirectCount = 0) => {
        const Module = url.protocol === "http:" ? http : https;

        const req = Module.request(url.href, {
            headers: options.headers ?? {},
            method: options.method ?? "GET",
            timeout: options.timeout ?? 3000
        }, res => {
            if (redirectCodes.has(res.statusCode) && res.headers.location && options.redirect !== "manual") {
                redirectCount++;

                if (redirectCount >= (options.maxRedirects ?? MAX_DEFAULT_REDIRECTS)) {
                    state = "ABORTED";
                    const error = new Error(`Maximum amount of redirects reached (${options.maxRedirects ?? MAX_DEFAULT_REDIRECTS})`);
                    errors.forEach(e => e(error));

                    return;
                }

                let final;
                try {
                    final = new URL(res.headers.location);
                }
                catch (error) {
                    state = "ABORTED";
                    errors.forEach(e => e(error));
                    return;
                }

                for (const [key, value] of new URL(url).searchParams.entries()) {
                    final.searchParams.set(key, value);
                }

                return execute(final, options, redirectCount);
            }

            res.on("data", chunk => data.content.push(chunk));
            res.on("end", () => {
                data.content = Buffer.concat(data.content);
                data.headers = res.headers;
                data.statusCode = res.statusCode;
                data.url = url.toString();
                data.statusText = res.statusMessage;
                data.redirected = redirectCount > 0;
                state = "DONE";

                listeners.forEach(listener => listener());
            });
            res.on("error", error => {
                state = "ABORTED";
                errors.forEach(e => e(error));
            });
        });

        req.on("timeout", () => {
            const error = new Error("Request timed out");
            req.destroy(error);
        });

        req.on("error", error => {
            state = "ABORTED";
            errors.forEach(e => e(error));
        });

        if (options.body) {
            try {req.write(options.body);}
            catch (error) {
                state = "ABORTED";
                errors.forEach(e => e(error));
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
    const parsed = new URL(requestedUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        throw new Error(`Unsupported protocol: ${parsed.protocol}`);
    }
    execute(parsed, fetchOptions);

    return {
        onComplete(listener) {
            listeners.add(listener);
        },
        onError(listener) {
            errors.add(listener);
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

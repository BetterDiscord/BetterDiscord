import * as https from "https";
import * as http from "http";

const redirectCodes = new Set([301, 302, 307, 308]);

export function nativeFetch(url, options) {
    let state = "PENDING";
    const data = {content: [], headers: null, statusCode: null, url: url, statusText: "", redirected: false};
    const listeners = new Set();
    const errors = new Set();

    /** * @param {URL} url */
    const execute = (url, options, redirect = false) => {
        const Module = url.protocol === "http" ? http : https;
        
        const req = Module.request(url.href, {
            headers: options.headers ?? {},
            method: options.method ?? "GET"
        }, res => {
            if (redirectCodes.has(res.statusCode) && res.headers.location && options.redirect !== "manual") {
                const final = new URL(res.headers.location);

                for (const [key, value] of new URL(url).searchParams.entries()) {
                    final.searchParams.set(key, value);
                }

                return execute(final, options, true);
            }

            res.on("data", chunk => data.content.push(chunk));
            res.on("end", () => {
                data.content = Buffer.concat(data.content);
                data.headers = res.headers;
                data.statusCode = res.statusCode;
                data.url = url.toString();
                data.statusText = res.statusMessage;
                data.redirected = redirect;
                state = "DONE";

                listeners.forEach(listener => listener());
            });
            res.on("error", error => {
                state = "ABORTED";
                errors.forEach(e => e(error));
            });
        });

        if (options.body) {
            try {req.write(options.body)}
            catch (error) {
                state = "ABORTED";
                errors.forEach(e => e(error));
            } finally {
                req.end();
            }
        } else {
            req.end();
        }

        if (options.signal) {
            options.signal.addEventListener("abort", () => {
                req.end();
                state = "ABORTED";
            });
        }
    };

    execute(new URL(url), options);

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

import https from "https";
import http from "http";
import {hydrateReadableStream, dryReadableStream, type DriedRequest, type DriedResponse} from "@common/native-fetch";

const redirectCodes = new Set([301, 302, 307, 308]);
const bodylessStatusCodes = new Set([101, 204, 205, 304]);

export function nativeFetch({url, signal: dryAbortSignal, body: dryBody, ...init}: DriedRequest) {
    const {promise, resolve, reject} = Promise.withResolvers<DriedResponse>();

    const maxRedirects = init.maxRedirects ?? 20;

    const body = dryBody ? hydrateReadableStream(dryBody) : null;

    let redirectCount = 0;

    function out(uri: string, res: http.IncomingMessage): DriedResponse {
        const status = res.statusCode ?? 0;

        let stream: ReadableStream | null = null;

        if (!bodylessStatusCodes.has(status)) {
            stream = new ReadableStream({
                start(controller) {
                    res.on("data", (data) => controller.enqueue(data));
                    res.on("error", (err) => controller.error(err));
                    res.once("end", () => controller.close());
                },
                type: "bytes"
            });
        }

        return {
            body: stream ? dryReadableStream(stream) : null,
            url: uri,
            headers: res.headers as Record<string, string>,
            status: status,
            statusText: res.statusMessage || "",
            redirected: redirectCount !== 0
        };
    }

    // If null or infinite no timeout | undefined or finite then timeout
    const timeout = ((t) => init.timeout === null && !isFinite(t) ? undefined : t)(init.timeout ?? 3000);

    async function execute(uri: string) {
        const httpModule = uri.startsWith("http:") ? http : uri.startsWith("https:") ? https : null;
        if (!httpModule) {
            reject(new Error(`Unsupported protocol: ${uri.slice(0, uri.indexOf(":"))}:`));
            return;
        }

        const request = httpModule.request(uri, {
            headers: init.headers,
            method: init.method,
            timeout,
            rejectUnauthorized: init.rejectUnauthorized
        }, (res) => {
            if (redirectCodes.has(res.statusCode!)) {
                if (init.redirect === "error") {
                    request.destroy(new Error("Failed to fetch"));
                    return;
                }
                if (init.redirect === "manual") {
                    resolve(out(uri, res));
                    return;
                }
                if (redirectCount >= maxRedirects) {
                    reject(new Error(`Maximum amount of redirects reached (${maxRedirects})`));
                    return;
                }

                if (res.headers.location) {
                    let final;
                    try {
                        final = new URL(res.headers.location);
                    }
                    catch (error) {
                        reject(error);
                        return;
                    }

                    for (const [key, value] of new URL(uri).searchParams) {
                        final.searchParams.set(key, value);
                    }

                    redirectCount++;

                    return execute(final.href);
                }
            }

            resolve(out(uri, res));
        });

        request.shouldKeepAlive = init.keepalive;

        if (dryAbortSignal) {
            const undo = dryAbortSignal.addListener(() => {
                request.destroy(dryAbortSignal.reason() || new Error("Request was aborted"));
            });

            request.once("close", () => undo());
        }

        request.once("timeout", () => request.destroy(new Error("Request timed out")));

        request.once("error", (err) => reject(err));

        if (body) {
            try {
                for await (const value of body) {
                    request.write(value);
                }

                request.end();
            }
            catch (error) {
                request.destroy(error as Error);
            }
        }
        else {request.end();}
    }

    execute(url);

    return promise;
}
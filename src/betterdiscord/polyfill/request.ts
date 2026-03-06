import Logger from "@common/logger";
import Remote from "./remote";
import type {OutgoingHttpHeader, RequestOptions} from "node:http";


const methods = ["get", "put", "post", "delete", "head"];
const aliases = {del: "delete"};

function parseArguments(...args: any) {
    let url, options, callback;

    for (const arg of args) {
        switch (typeof arg) {
            case (arg !== null && "object"):
                options = arg;
                if ("url" in options) {
                    url = options.url;
                }
                break;

            case (!url && "string"):
                url = arg;
                break;

            case (!callback && "function"):
                callback = arg;
                break;
        }
    }

    return {url, options, callback};
}


function validUrl(url: unknown): url is string {
    return typeof url === "string";
}

function validCallback(callback: unknown): callback is ((...a: any[]) => any) {
    return typeof callback === "function";
}

function isArrayHeaders(headers: unknown): headers is readonly string[] {
    return Array.isArray(headers);
}

function fixBuffer(options: RequestOptions & {formData?: Buffer | string;}, callback: (e: Error, h?: Record<string, any>, d?: Buffer | string) => void) {
    return (error: Error, res?: Record<string, any>, body?: Buffer | string) => {
        try {
            let contentType: OutgoingHttpHeader | undefined;

            if (options.headers) {
                if (isArrayHeaders(options.headers)) {
                    contentType = options.headers.find(([k]) => k.toLowerCase() === "content-type")?.[1];
                }
                else {
                    const key = Object.keys(options.headers).find(k => k.toLowerCase() === "content-type");
                    contentType = key ? options.headers[key] : undefined;
                }
            }

            if (String(contentType) !== "text/plain") {
                body = Buffer.from(body!);
            }
            else {
                body = Buffer.from(body!).toString();
            }
        }
        catch (err) {
            Logger.debug("BetterDiscordPreload", "Failed to convert response body to buffer", {
                catchError: err,
                options,
                error,
                res,
                body
            });
        }
        finally {
            callback(error, res, body);
        }
    };
}

export default function request(this: any, ...args: any[]) {
    const {url, options = {}, callback} = parseArguments.apply(this, args);

    if (!validUrl(url) || !validCallback(callback)) return null;

    if ("method" in options && methods.indexOf(options.method.toLowerCase()) >= 0) {
        // @ts-expect-error TODO: either fix or wait for polyfill remove
        return Remote.https[options.method](url, options, fixBuffer(options, callback));
    }

    return Remote.https.request(url, options, fixBuffer(options, callback));
}

Object.assign(request, Object.fromEntries(
    methods.concat(Object.keys(aliases)).map(method => [method, function (this: any, ...args: any[]) {
        const {url, options = {}, callback} = parseArguments.apply(this, args);

        if (!validUrl(url) || !validCallback(callback)) return null;

        // @ts-expect-error TODO: either fix or wait for polyfill remove
        return Remote.https[aliases[method] || method](url, options, fixBuffer(options, callback));
    }])
));

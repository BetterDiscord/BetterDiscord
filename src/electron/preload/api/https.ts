import * as fs from "fs";
import * as https from "https";
import * as http from "http";
import type {RequestCallback, RequestOptions} from "@common/types/ipc";


const methods = ["get", "put", "post", "delete", "head"] as const;
const redirectCodes = new Set([301, 302, 307, 308]);
const dataToClone: Array<keyof http.IncomingMessage> = ["statusCode", "statusMessage", "url", "headers", "method", "aborted", "complete", "rawHeaders"];

type SetReq = (res: http.IncomingMessage, req: http.ClientRequest) => void;

const MAX_REDIRECTS = 20;

const makeRequest = (url: string, options: RequestOptions, callback: RequestCallback, setReq: SetReq, redirectCount = 0) => {
    // A failure can surface on both the request and the response objects; only ever call back once
    let done = false;
    const doCallback: RequestCallback = (...args) => {
        if (done) return;
        done = true;
        callback(...args);
    };

    const req = https.request(url, Object.assign({method: "GET"}, options), res => {
        if (redirectCodes.has(res.statusCode ?? 0) && res.headers.location) {
            if (redirectCount >= MAX_REDIRECTS) {
                return doCallback(new Error(`Maximum amount of redirects reached (${MAX_REDIRECTS})`));
            }

            // Location headers may be relative to the requested url
            const final = new URL(res.headers.location, url);

            for (const [key, value] of new URL(url).searchParams.entries()) {
                final.searchParams.set(key, value);
            }

            // The recursive call owns the callback from here on
            done = true;
            return makeRequest(final.toString(), options, callback, setReq, redirectCount + 1);
        }

        const chunks: Buffer[] = [];

        setReq(res, req);

        res.addListener("error", err => doCallback(err));

        res.addListener("data", chunk => {
            chunks.push(chunk);
        });

        res.addListener("end", () => {
            if (done) return;
            const data = Object.fromEntries(dataToClone.map(h => [h, res[h]]));

            doCallback(null as unknown as Error, data, Buffer.concat(chunks));
            req.end();
        });
    });

    if (options.formData) {
        // Make sure to close the socket.
        try {req.write(options.formData);}
        finally {req.end();}
    }
    else {
        req.end();
    }

    req.on("error", (error) => doCallback(error));
};

const request = function (url: string, options: RequestOptions, callback: RequestCallback) {
    let responseObject: http.IncomingMessage | null = null;
    let reqObject: http.ClientRequest | null = null;
    let pipe: NodeJS.WritableStream | null = null;

    makeRequest(url, options, callback, (res, req) => {
        reqObject = req;
        responseObject = res;

        if (pipe) {
            res.pipe(pipe);
        }
    });

    return {
        end() {reqObject?.end();},
        pipe(fsStream: fs.WriteStream) {
            if (!responseObject) {
                pipe = fsStream;
            }
            else {
                responseObject.pipe(fsStream);
            }
        }
    };
};

type HttpsModule = { request: typeof request } & {
    [M in typeof methods[number]]: typeof request;
}

export default Object.assign({request},
    Object.fromEntries(methods.map(method => [
        method,
        function (this: HttpsModule, ...args: any[]) {
            args[1] ??= {};
            args[1].method ??= method.toUpperCase();

            return Reflect.apply(request, this, args);
        }
    ]))
) as HttpsModule;

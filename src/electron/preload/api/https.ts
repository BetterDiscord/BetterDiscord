import * as fs from "fs";
import * as https from "https";
import * as http from "http";
import type {RequestCallback, RequestOptions} from "@common/types/ipc";
import {isWebhookUrl} from "./webhook";


const methods = ["get", "put", "post", "delete", "head"] as const;
const redirectCodes = new Set([301, 302, 307, 308]);
const dataToClone: Array<keyof http.IncomingMessage> = ["statusCode", "statusMessage", "url", "headers", "method", "aborted", "complete", "rawHeaders"];

type SetReq = (res: http.IncomingMessage, req: http.ClientRequest) => void;

const makeRequest = (url: string, options: RequestOptions, callback: RequestCallback, setReq: SetReq) => {
    // Checked per hop (makeRequest recurses on redirects) so a redirect into a webhook URL is caught too.
    if (isWebhookUrl(url)) {
        callback(new Error("Failed to fetch"));
        return;
    }

    const req = https.request(url, Object.assign({method: "GET"}, options), res => {
        if (redirectCodes.has(res.statusCode ?? 0) && res.headers.location) {
            const final = new URL(res.headers.location);

            for (const [key, value] of new URL(url).searchParams.entries()) {
                final.searchParams.set(key, value);
            }

            return makeRequest(final.toString(), options, callback, setReq);
        }

        const chunks: Buffer[] = [];
        let error: Error | null = null;

        setReq(res, req);

        res.on("error", err => {error = err;});

        res.on("data", chunk => {
            chunks.push(chunk);
        });

        res.on("end", () => {
            const data = Object.fromEntries(dataToClone.map(h => [h, res[h]]));

            callback(error as Error, data, Buffer.concat(chunks));
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

    req.on("error", (error) => callback(error));
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

type HttpsModule = {request: typeof request;} & {
    [M in typeof methods[number]]: typeof request;
};

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

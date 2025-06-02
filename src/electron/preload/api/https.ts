import * as fs from "fs";
import * as https from "https";
import * as http from "http";


const methods = ["get", "put", "post", "delete", "head"];
const redirectCodes = new Set([301, 302, 307, 308]);
const dataToClone: Array<keyof http.IncomingMessage> = ["statusCode", "statusMessage", "url", "headers", "method", "aborted", "complete", "rawHeaders"];

type RequestOptions = https.RequestOptions & {formData?: Buffer | string;};
type RequestCallback = (e: Error, h?: Record<string, any>, d?: Buffer | string) => void;
type SetReq = (res: http.IncomingMessage, req: http.ClientRequest) => void;

const makeRequest = (url: string, options: RequestOptions, callback: RequestCallback, setReq: SetReq) => {
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

        res.addListener("error", err => {error = err;});

        res.addListener("data", chunk => {
            chunks.push(chunk);
        });

        res.addListener("end", () => {
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

export default Object.assign({request},
    Object.fromEntries(methods.map(method => [
        method,
        function (this: typeof https["get"], ...args: any[]) {
            args[1] ??= {};

            args[1].method ??= method.toUpperCase();

            return Reflect.apply(request, this, args);
        }
    ]))
);

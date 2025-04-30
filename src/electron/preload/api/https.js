import * as https from "https";

const methods = ["get", "put", "post", "delete", "head"];
const redirectCodes = new Set([301, 302, 307, 308]);
const headersToClone = ["statusCode", "statusMessage", "url", "headers", "method", "aborted", "complete", "rawHeaders", "end"];

const makeRequest = (url, options, callback, setReq) => {
    const req = https.request(url, Object.assign({method: "GET"}, options), res => {
        if (redirectCodes.has(res.statusCode) && res.headers.location) {
            const final = new URL(res.headers.location);

            for (const [key, value] of new URL(url).searchParams.entries()) {
                final.searchParams.set(key, value);
            }

            return makeRequest(final.toString(), options, callback, setReq);
        }

        const chunks = [];
        let error = null;

        setReq(res, req);

        res.addListener("error", err => {error = err;});

        res.addListener("data", chunk => {
            chunks.push(chunk);
        });

        res.addListener("end", () => {
            const headers = Object.fromEntries(headersToClone.map(h => [h, res[h]]));

            callback(error, headers, Buffer.concat(chunks));
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

const request = function (url, options, callback) {
    let responseObject = null;
    let reqObject = null;
    let pipe = null;

    makeRequest(url, options, callback, (req, res) => {
        reqObject = req;
        responseObject = res;

        if (pipe) {
            res.pipe(pipe);
        }
    });

    return {
        end() {reqObject?.end();},
        pipe(fsStream) {
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
        function () {
            arguments[1] ??= {};

            arguments[1].method ??= method.toUpperCase();

            return Reflect.apply(request, this, arguments);
        }
    ]))
);

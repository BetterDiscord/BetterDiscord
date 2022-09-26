import * as https from "https";

const methods = ["get", "put", "post", "delete"];
const headersToClone = ["statusCode", "statusMessage", "url", "headers", "method", "aborted", "complete", "rawHeaders", "end"];

const request = function (url, options, callback) {
    let responseObject = undefined;
    let pipe = undefined;
    
    const req = https.request(url, Object.assign({method: "GET"}, options), res => {
        const chunks = [];
        let error = null;

        responseObject = res;

        if (pipe) {
            res.pipe(pipe);
        }

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

    req.end();

    return {
        end() {req.end();},
        pipe(fsStream) {
            if (!responseObject) {
                pipe = fsStream;
            } else {
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

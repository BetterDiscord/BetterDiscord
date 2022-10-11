import Remote from "./remote";

const methods = ["get", "put", "post", "delete", "head"];
const aliases = {del: "delete"};

function parseArguments() {
    let url, options, callback;

    for (const arg of arguments) {
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

function validOptions(url, callback) {
    return typeof url === "string" && typeof callback === "function";
}

function fixBuffer(options, callback) {
    return (error, res, body) => {
        if ("Content-Type" in Object(options.headers) && options.headers["Content-Type"] !== "text/plain") {
            body = Buffer.from(body);
        }
        else {
            body = Buffer.from(body).toString();
        }

        callback(error, res, body);
    };
}

export default function request() {
    const {url, options = {}, callback} = parseArguments.apply(this, arguments);

    if (!validOptions(url, callback)) return null;

    if ("method" in options && methods.indexOf(options.method.toLowerCase()) >= 0) {
        return Remote.https[options.method](url, options, fixBuffer(options, callback));
    }

    return Remote.https.request(url, options, fixBuffer(options, callback));
}

Object.assign(request, Object.fromEntries(
    methods.concat(Object.keys(aliases)).map(method => [method, function () {
        const {url, options = {}, callback} = parseArguments.apply(this, arguments);

        if (!validOptions(url, callback)) return null;

        return Remote.https[aliases[method] || method](url, options, fixBuffer(options, callback));
    }])
));

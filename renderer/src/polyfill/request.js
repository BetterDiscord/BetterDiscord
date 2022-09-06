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

export default function request() {
    const {url, options = {}, callback} = parseArguments.apply(this, arguments);

    if (!validOptions(url, callback)) return null;

    if ("method" in options && methods.indexOf(options.method.toLowerCase()) >= 0) {
        return Remote.https[options.method](url, options, callback);
    }

    return Remote.https.default(url, options, callback);
}

Object.assign(request, Object.fromEntries(
    methods.concat(Object.keys(aliases)).map(method => [method, function () {
        const {url, options = {}, callback} = parseArguments.apply(this, arguments);

        if (!validOptions(url, callback)) return null;

        return Remote.https[aliases[method] || method](url, options, callback);
    }])
));
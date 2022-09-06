import Logger from "common/logger";

let request;

const req = function (url, options, callback) {
    if (!request) request = __non_webpack_require__("request");
    
    return request(url, options, (error, res, body) => {
        try {
            Reflect.apply(callback, null, [error, res, body]);
        }
        catch (err) {
            Logger.stacktrace("https", "Failed request", err);
        }
    });
};

export const get = function (url, options, callback) {
    if (!request) request = __non_webpack_require__("request");
    
    return request.get(url, options, (error, res, body) => {
        try {
            Reflect.apply(callback, null, [error, res, body]);
        }
        catch (err) {
            Logger.stacktrace("https", "Failed get request", err);
        }
    });
};

export const put = function (url, options, callback) {
    if (!request) request = __non_webpack_require__("request");

    return request.put(url, options, (error, res, body) => {
        try {
            Reflect.apply(callback, null, [error, res, body]);
        }
        catch (err) {
            Logger.stacktrace("https", "Failed put request", err);
        }
    });
};

export const post = function (url, options, callback) {
    if (!request) request = __non_webpack_require__("request");

    return request.post(url, options, (error, res, body) => {
        try {
            Reflect.apply(callback, null, [error, res, body]);
        }
        catch (err) {
            Logger.stacktrace("https", "Failed post request", err);
        }
    });
};

const del = function (url, options, callback) {
    if (!request) request = __non_webpack_require__("request");

    return request.delete(url, options, (error, res, body) => {
        try {
            Reflect.apply(callback, null, [error, res, body]);
        }
        catch (err) {
            Logger.stacktrace("https", "Failed delete request", err);
        }
    });
};

const head = function (url, options, callback) {
    if (!request) request = __non_webpack_require__("request");

    return request.head(url, options, (error, res, body) => {
        try {
            Reflect.apply(callback, null, [error, res, body]);
        }
        catch (err) {
            Logger.stacktrace("https", "Failed head request", err);
        }
    });
};

export default req;
    
Object.assign(req, {
    get,
    put,
    post,
    head,
    delete: del // eslint-disable-line quote-props
});
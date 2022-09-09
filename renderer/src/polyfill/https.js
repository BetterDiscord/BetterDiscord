import EventEmitter from "common/events";
import Remote from "./remote";

export function get(url, options = {}, callback) {
    if (typeof(options) === "function") {
        callback = options;
        options = {};
    }

    const emitter = new EventEmitter();

    callback(emitter);

    if(options && !options.encoding)
        options.encoding = "binary";

    Remote.https.get(url, options, (error, res, body) => {
        if (error) return emitter.emit("error", error);
        emitter.emit("data", options && options.encoding === "binary" ? new Buffer(Buffer.from(body, "binary")) : body);
        emitter.emit("end", res);
    });

    return emitter;
}

export default {get};
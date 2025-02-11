import EventEmitter from "@common/events";

import Remote from "./remote";


export function get(url, options = {}, callback) {
    if (typeof (options) === "function") {
        callback = options;
        options = null;
    }

    const emitter = new EventEmitter();

    callback(emitter);

    Remote.https.get(url, options, (error, res, body) => {
        if (error) return emitter.emit("error", error);
        emitter.emit("data", body);
        emitter.emit("end", res);
    });

    return emitter;
}

export default {get};
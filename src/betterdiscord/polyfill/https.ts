import EventEmitter from "@common/events";
import type {RequestOptions} from "@common/types/ipc";

import Remote from "./remote";


export function get(url: string, options: null | RequestOptions | ((e: EventEmitter) => void) = {}, callback: (e: EventEmitter) => void) {
    if (typeof (options) === "function") {
        callback = options;
        options = null;
    }

    const emitter = new EventEmitter();

    callback(emitter);

    Remote.https.get(url, options ?? {}, (error: Error, res?: Record<string, any>, body?: Buffer | string) => {
        if (error) return emitter.emit("error", error);
        emitter.emit("data", body);
        emitter.emit("end", res);
    });

    return emitter;
}

export default {get};
import type {NativeRequestInit} from "@common/native-fetch";
import {fetch} from "@modules/net";

class Net {
    /** @ignore */
    constructor() {};

    async fetch(input: string | URL | Request, init?: NativeRequestInit) {
        return fetch(input, init);
    }
}

Object.freeze(Net);
Object.freeze(Net.prototype);

export default Net;
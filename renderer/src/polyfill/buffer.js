import WebpackModules from "../modules/webpackmodules";

Object.defineProperty(window, "Buffer", {
    get() {return Buffer.getBuffer().Buffer;},
    configurable: true,
    enumerable: false
});

export default class Buffer {
    static getBuffer() {
        if (this.cached) return this.cached;

        this.cached = WebpackModules.getByProps("Buffer", "SlowBuffer");

        return this.cached;
    }
}
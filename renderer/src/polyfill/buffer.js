import Events from "../modules/emitter";
import WebpackModules from "../modules/webpackmodules";

Events.addListener("CLIENT_READY", () => {
    Object.defineProperty(window, "Buffer", {
        get() {return Buffer.getBuffer().Buffer;},
        configurable: true,
        enumerable: false
    });
});

export default class Buffer {
    static getBuffer() {
        if (this.cached) return this.cached;

        this.cached = WebpackModules.getByProps("INSPECT_MAX_BYTES");

        return this.cached;
    }
}

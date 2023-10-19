import Logger from "@common/logger";


Object.defineProperty(window, "Buffer", {
    get() {
        Logger.warn("Deprecated", `Usage of the Buffer global is deprecated. Consider using web standards such as Uint8Array and TextDecoder/TextEncoder.`);
        return Buffer;
    },
    configurable: true,
    enumerable: false
});

export default Buffer;
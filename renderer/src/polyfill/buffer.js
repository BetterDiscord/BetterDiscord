Object.defineProperty(window, "Buffer", {
    get() {return Buffer;},
    configurable: true,
    enumerable: false
});

export default Buffer;
const crypto = (() => {
    let cache = null;

    return () => {
        if (cache) return cache;

        return cache = __non_webpack_require__("crypto");
    };
})();

export function createHash(type) {
    const hash = crypto().createHash(type);

    const ctx = {
        update(data) {
            hash.update(data);

            return ctx;
        },
        digest(encoding) {return hash.digest(encoding);}
    };

    return ctx;
}

export function randomBytes(length) {
    return crypto().randomBytes(length);
}
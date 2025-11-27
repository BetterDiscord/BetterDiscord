import type {BinaryLike, BinaryToTextEncoding} from "crypto";

const crypto: () => typeof import("crypto") = (() => {
    let cache: typeof import("crypto") | null = null;

    return () => {
        if (cache) return cache;

        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return cache = require("crypto");
    };
})();

export function createHash(type: string) {
    const hash = crypto().createHash(type);

    const ctx = {
        update(data: BinaryLike) {
            hash.update(data);

            return ctx;
        },
        digest(encoding: BinaryToTextEncoding) {return hash.digest(encoding);}
    };

    return ctx;
}

export function randomBytes(length: number) {
    return crypto().randomBytes(length);
}
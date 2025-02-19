function cloneArray(array: any[]): any[] {
    const clone = [];
    for (let a = 0; a < array.length; a++) {
        const element = array[a];

        if (typeof (element) !== "object" || element === null) {
            clone[a] = element;
        }
        else if (Array.isArray(element)) {
            clone[a] = cloneArray(element);
        }
        else {
            clone[a] = extend({}, element);
        }
    }
    return clone;
}

function shouldSkip(obj: any) {
    if (typeof (obj) !== "object") return true;
    if (obj === null) return true;
    if (Array.isArray(obj)) return true;
}

/**
 * Deep extends an object with a set of other objects. Objects later in the list
 * of `extenders` have priority, that is to say if one sets a key to be a primitive,
 * it will be overwritten with the next one with the same key. If it is an object,
 * and the keys match, the object is extended. This happens recursively.
 * @param target target object for extension
 * @param extenders series of objects to use for extension
 */
export default function extend(target: object, ...extenders: object[]): object;
export default function extend<T extends Record<string | number | symbol, any>>(target: T, ...extenders: object[]): T {
    if (extenders.length < 1) throw new Error("Needs at least 1 extenders");

    for (let e = 0; e < extenders.length; e++) {
        const ext = extenders[e];
        if (shouldSkip(ext)) continue;

        for (const key in ext) {
            if (!(key in ext)) continue;

            const source = target[key];
            const value = ext[key as keyof typeof ext];

            if (value === target) continue;

            if (typeof (value) !== "object" || value === null) {
                target[key as keyof T] = value;
            }
            else if (Array.isArray(value)) {
                target[key as keyof T] = cloneArray(value) as T[keyof T];
            }
            else if (typeof (source) !== "object" || source === null || Array.isArray(source)) {
                target[key as keyof T] = extend({}, value) as T[keyof T];
            }
            else {
                target[key as keyof T] = extend(source, value) as T[keyof T];
            }
        }
    }

    return target;
}
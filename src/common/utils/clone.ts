export function getKeys<T extends Record<string|number|symbol, unknown>>(object: T) {
    const keys: Array<keyof typeof object> = [];

    for (const key in object) keys.push(key);

    return keys;
}

export default function cloneObject<T extends Record<string|number|symbol, unknown>>(target: T, newObject: Partial<T> = {}, keys?: Array<keyof T>) {
    if (!Array.isArray(keys)) keys = getKeys(target);

    return keys.reduce((clone, key) => {
        if (typeof (target[key]) === "object" && !Array.isArray(target[key]) && target[key] !== null) clone[key] = cloneObject(target[key] as T, {}) as T[keyof T];
        else if (typeof (target[key]) === "function") clone[key] = target[key].bind(target);
        else clone[key] = target[key];

        return clone;
    }, newObject);
}
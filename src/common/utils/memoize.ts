/**
 * Generates an automatically memoizing version of an object.
 * @param object - object to memoize
 * @returns the proxy to the object that memoizes properties
 */
export default function memoizeObject<T extends Record<string|number|symbol, any>>(object: T) {
    const proxy = new Proxy(object, {
        get: function(obj, mod) {
            if (typeof (mod) === "symbol") return null;
            if (!obj.hasOwnProperty(mod)) return undefined;
            if (Object.getOwnPropertyDescriptor(obj, mod)?.get) {
                const value = obj[mod];
                delete obj[mod];
                obj[mod as keyof typeof obj] = value;
            }
            return obj[mod];
        },
        set: function(obj, mod, value) {
            if (typeof (mod) === "symbol") return false;
            if (obj.hasOwnProperty(mod)) return false;
            obj[mod as keyof typeof obj] = value;
            return true;
        }
    });

    Object.defineProperty(proxy, "hasOwnProperty", {value: function(prop: string) {
        return this[prop] !== undefined;
    }});

    return proxy;
}
/**
 * Generates an automatically memoizing version of an object.
 * @param {Object} object - object to memoize
 * @returns {Proxy} the proxy to the object that memoizes properties
 */
export default function memoizeObject(object: ObjectLiteral) {
    const proxy = new Proxy(object, {
        get: function(obj, mod) {
            if (typeof(mod) === "symbol") return null;
            if (!obj.hasOwnProperty(mod)) return undefined;
            if (Object.getOwnPropertyDescriptor(obj, mod)?.get) {
                const value = obj[mod];
                delete obj[mod];
                obj[mod] = value;
            }
            return obj[mod];
        },
        set: function(obj, mod, value) {
            if (typeof(mod) === "symbol") return false;
            if (obj.hasOwnProperty(mod)) return false;
            obj[mod] = value;
            return true;
        }
    });

    Object.defineProperty(proxy, "hasOwnProperty", {value: function(prop: string) {
        return this[prop] !== undefined;
    }});

    return proxy;
}
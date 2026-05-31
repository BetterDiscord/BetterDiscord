export interface Cache<T> {
    /**
     * Calls the factory function
     * If only the value hasn't been set or if the call count is over
     */
    (): T,
    /**
     * Just a getter form of accessing the data
     */
    readonly get: T,
    /**
     * Checks to see if a value has been cached
     */
    hasValue(): boolean,
    /**
     * Completly resets the cache factory
     *
     * @example
     * const foo = cache(() => console.log("Called"));
     *
     * foo(); // LOG: Called
     * foo(); // No log
     *
     * foo.reset();
     *
     * foo(); // LOG: Called
     * foo(); // No log
     */
    reset(): void,
    /**
     * Sets the call limit until it resets
     *
     * @example
     * const foo = cache(() => console.log("Called"));
     * foo.CALL_LIMIT = 2;
     *
     * foo(); // LOG: Called
     * foo(); // No log
     * foo(); // LOG: Called
     */
    CALL_LIMIT: number;
}

export default function cache<T>(factory: () => T): Cache<T> {
    const value = {count: 0} as {current: T, count: number;} | {count: number;};

    const cacher: Cache<T> = () => {
        if (value.count++ > (limit - 1)) cacher.reset();
        if ("current" in value) return value.current;

        const current = factory();
        (value as {current: T, count: number;}).current = current;

        return current;
    };

    cacher.hasValue = () => "current" in value;

    cacher.reset = () => {
        // @ts-expect-error Types are annoying
        if ("current" in value) delete value.current;
        value.count = 0;
    };

    let limit = Infinity;
    cacher.CALL_LIMIT = limit;
    Object.defineProperty(cacher, "CALL_LIMIT", {
        get: () => limit,
        set: (v) => {
            if (typeof v !== "number" || isNaN(v) || v <= 0 || Math.round(v) !== v) {
                throw new Error("Unable to set max call threshould. Value is not a positive int");
            }

            limit = v;
            cacher.reset();
        }
    });

    // @ts-expect-error Types are annoying
    cacher.get = undefined as T;
    Object.defineProperty(cacher, "get", {
        get: () => cacher()
    });

    return cacher;
}

cache.proxy = <T extends object>(factory: () => T, typeofIsObject: boolean = false, CALL_LIMIT: number = Infinity): T => {
    const handlers: ProxyHandler<T> = {};

    const cFactory = cache(factory);
    cFactory.CALL_LIMIT = CALL_LIMIT;

    const cacheFactory = () => {
        if (!cFactory.hasValue()) return cFactory();
        if (cFactory() instanceof Object) return cFactory();
        // Attempt to hopefully have the results be a instance of Object
        cFactory.reset();
        return cFactory();
    };

    for (const key of Object.getOwnPropertyNames(Reflect) as Array<keyof typeof Reflect>) {
        const handler = Reflect[key];

        if (key === "get") {
            handlers.get = (_, prop, r) => {
                if (prop === "prototype") return (cacheFactory() as any).prototype ?? Function.prototype;
                if (prop === Symbol.for("betterdiscord.cache.proxy")) return cFactory;
                return Reflect.get(cacheFactory(), prop, r);
            };
            continue;
        }
        if (key === "ownKeys") {
            handlers.ownKeys = () => {
                const keys = Reflect.ownKeys(cacheFactory());
                if (!typeofIsObject && !keys.includes("prototype")) keys.push("prototype");
                return keys;
            };
            continue;
        }

        // @ts-expect-error Types are annoying
        handlers[key] = function (target, ...args) {
            // @ts-expect-error Types are annoying
            return handler.apply(this, [cacheFactory(), ...args]);
        };
    }

    const proxy = new Proxy(Object.assign(typeofIsObject ? {} : function () {}, {
        [Symbol.for("betterdiscord.cache.proxy")]: cFactory
    }) as T, handlers);

    return proxy;
};
import BasePatcher, {
    type Options,
    type AfterCallback, type BeforeCallback, type InsteadCallback,
    type FunctionType, type KeysMatching
} from "@modules/patcher";

type Args<B extends boolean, T extends unknown[]> =
    (B extends true ? [...T] : [callerName: string, ...T]);

type Falsey = false | 0 | "" | null | undefined | void;
type IsTruthy<T> = T extends Falsey ? false : true;

function isModuleInvalid(moduleToPatch: any): boolean {
    return typeof moduleToPatch !== "object" && typeof moduleToPatch !== "function" && moduleToPatch !== null;
}

class Patcher<CN extends string | undefined = undefined, Bounded extends IsTruthy<CN> = IsTruthy<CN>> {
    readonly #callerName: CN;

    constructor(callerName?: CN);
    constructor(callerName: CN) {
        this.#callerName = callerName;
    }

    #args<T extends unknown[]>(args: unknown[]): [callerName: string, data: T] {
        if (this.#callerName) {
            return [this.#callerName, args as unknown as T];
        }

        return [args.shift() as unknown as string, args as unknown as T];
    }

    public before<
        M extends Record<PropertyKey, any>,
        K extends KeysMatching<M, F>,
        F extends boolean
    >(...args: Args<Bounded, [module: M, key: K, callback: BeforeCallback<M[K]>, options?: Options<F>]>) {
        const [callerName, [module, key, callback, options]] = this.#args<[module: M, key: K, callback: BeforeCallback<M[K]>, options?: Options]>(args);

        if (this.#callerName) {
            if (typeof callback !== "function") throw new Error("3rd parameter should be function");
            if (typeof key !== "string") throw new Error("2nd parameter should be function name");
            if (isModuleInvalid(module)) throw new Error("1st parameter should be module");
        }
        else {
            if (typeof callback !== "function") throw new Error("4th parameter should be function");
            if (typeof key !== "string") throw new Error("3rd parameter should be function name");
            if (isModuleInvalid(module)) throw new Error("2nd parameter should be module");
            if (typeof callerName !== "string") throw new Error("1st parameter should be string");
        }

        return BasePatcher.before(callerName, module, key, callback, options);
    }
    public instead<
        M extends Record<PropertyKey, any>,
        K extends KeysMatching<M, F>,
        F extends boolean
    >(...args: Args<Bounded, [module: M, key: K, callback: InsteadCallback<M[K]>, options?: Options<F>]>) {
        const [callerName, [module, key, callback, options]] = this.#args<[module: M, key: K, callback: InsteadCallback<M[K]>, options?: Options]>(args);

        if (this.#callerName) {
            if (typeof callback !== "function") throw new Error("3rd parameter should be function");
            if (typeof key !== "string") throw new Error("2nd parameter should be function name");
            if (isModuleInvalid(module)) throw new Error("1st parameter should be module");
        }
        else {
            if (typeof callback !== "function") throw new Error("4th parameter should be function");
            if (typeof key !== "string") throw new Error("3rd parameter should be function name");
            if (isModuleInvalid(module)) throw new Error("2nd parameter should be module");
            if (typeof callerName !== "string") throw new Error("1st parameter should be string");
        }

        return BasePatcher.instead(callerName, module, key, callback, options);
    }
    public after<
        M extends Record<PropertyKey, any>,
        K extends KeysMatching<M, F>,
        F extends boolean
    >(...args: Args<Bounded, [module: M, key: K, callback: AfterCallback<M[K]>, options?: Options<F>]>) {
        const [callerName, [module, key, callback, options]] = this.#args<[module: M, key: K, callback: AfterCallback<M[K]>, options?: Options]>(args);

        if (this.#callerName) {
            if (typeof callback !== "function") throw new Error("3rd parameter should be function");
            if (typeof key !== "string") throw new Error("2nd parameter should be function name");
            if (isModuleInvalid(module)) throw new Error("1st parameter should be module");
        }
        else {
            if (typeof callback !== "function") throw new Error("4th parameter should be function");
            if (typeof key !== "string") throw new Error("3rd parameter should be function name");
            if (isModuleInvalid(module)) throw new Error("2nd parameter should be module");
            if (typeof callerName !== "string") throw new Error("1st parameter should be string");
        }

        return BasePatcher.after(callerName, module, key, callback, options);
    }

    public unpatchAll(...args: Args<Bounded, []>) {
        const [callerName] = this.#args(args);

        return BasePatcher.unpatchAll(callerName);
    }

    public getPatchesByCaller(...args: Args<Bounded, []>) {
        const [callerName] = this.#args(args);

        return BasePatcher.getPatchesByCaller(callerName);
    }

    public getOriginal<T extends FunctionType>(fn: T): T {
        return BasePatcher.getOriginal(fn);
    }
}

Object.freeze(Patcher);
Object.freeze(Patcher.prototype);

export default Patcher;
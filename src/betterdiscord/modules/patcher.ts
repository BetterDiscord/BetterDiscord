import Logger from "@common/logger";

export type KeysMatching<T, ForcePatch extends boolean = true> = ForcePatch extends true ? {
    [K in keyof T]-?: NonNullable<T[K]> extends FunctionType ? K : never
}[keyof T] : {
    [K in keyof T]-?: T[K] extends FunctionType ? K : never
}[keyof T];

export type FunctionType = ((this: any, ...args: any) => any) | ((...args: any) => any);
type FunctionReturnType<T extends FunctionType> = T extends (this: any, ...args: any) => infer P ? P : never;
type FunctionParameters<T extends FunctionType> = T extends (this: any, ...args: infer P) => any ? P : T extends (...args: infer P) => any ? P : never;
type FunctionThisParameterType<T extends FunctionType> = T extends (this: infer P, ...args: any) => any ? P : never;

export interface Options<ForcePatch extends boolean = true> {
    once?: boolean;
    forcePatch?: ForcePatch;
    displayName?: string;
    priority?: number;
    detached?: boolean;
}

function adaptOptions<
    ForcePatch extends boolean = false
>(options: Options<ForcePatch> | undefined | null, displayName: string): Required<Options<ForcePatch>> {
    if (!options) {
        options = {};
    }

    return {
        once: typeof options.once === "boolean" ? options.once : false,
        forcePatch: (typeof options.forcePatch === "boolean" ? options.forcePatch : true) as ForcePatch,
        displayName: typeof options.displayName === "string" ? options.displayName : displayName,
        priority: typeof options.priority === "number" ? isNaN(options.priority) ? 0 : options.priority : 0,
        detached: typeof options.detached === "boolean" ? options.detached : false
    };
}

export type AfterCallback<F extends FunctionType> = (that: FunctionThisParameterType<F>, args: FunctionParameters<F>, result: FunctionReturnType<F>) => void | FunctionReturnType<F>;
export type InsteadCallback<F extends FunctionType> = (that: FunctionThisParameterType<F>, args: FunctionParameters<F>, original: F) => FunctionReturnType<F>;
export type BeforeCallback<F extends FunctionType> = (that: FunctionThisParameterType<F>, args: FunctionParameters<F>) => void;

const map = new WeakMap<FunctionType, WeakMap<FunctionType, FunctionType>>();
const originals = new WeakMap<FunctionType, FunctionType>();

const BD_PATCHER_KEY = "betterdiscord.patcher";

function createReplacer<T extends FunctionType>(fn: T, apply: (target: T, thisArg: FunctionThisParameterType<T>, argsArray: FunctionParameters<T>) => FunctionReturnType<T>, hook?: Hook<T>) {
    const replacer = new Proxy(fn, {
        apply(target, thisArg, argsArray) {
            return apply(target, thisArg, argsArray as FunctionParameters<T>);
        },
        get(target, p, receiver) {
            if (typeof hook === "object" && p === Symbol.for(BD_PATCHER_KEY)) {
                return hook;
            }

            const $value = Reflect.get(target, p, receiver);

            if (typeof $value === "function") {
                const value = $value as FunctionType;

                let sub = map.get(target);
                if (typeof sub === "undefined") {
                    sub = new WeakMap();
                    map.set(target, sub);
                }

                if (sub.has(value)) {
                    return sub.get(value);
                }

                const childReplacer = createReplacer(value, (func, thisArg, argsArray) => {
                    switch (func) {
                        case Function.prototype.apply:
                        case Function.prototype.call:
                        case Function.prototype.bind:
                            return Reflect.apply(func, thisArg, argsArray);
                    }

                    if (originals.get(thisArg)) {
                        thisArg = originals.get(thisArg);
                    }

                    return Reflect.apply(func, thisArg, argsArray);
                });

                sub.set(value, childReplacer);

                return childReplacer;
            }

            return $value;
        },
        [Symbol.for(BD_PATCHER_KEY)]: hook
    });

    originals.set(replacer, fn);

    return replacer;
}

type PatchType = "before" | "instead" | "after";
type Undo = () => void;

interface Patch<T extends PatchType = PatchType, F extends FunctionType = FunctionType> {
    readonly type: T;
    readonly callerName: string;
    readonly undo: Undo;
    readonly callback: T extends "before" ? BeforeCallback<F> : T extends "instead" ? InsteadCallback<F> : AfterCallback<F>;
    readonly options: Required<Options>;
}
interface Hook<T extends FunctionType> {
    readonly original: T;
    readonly before: Array<Patch<"before", T>>;
    readonly instead: Array<Patch<"instead", T>>;
    readonly after: Array<Patch<"after", T>>;
    readonly callers: Record<string, Patch[]>;
}

const hooks = new WeakMap<FunctionType, Hook<FunctionType>>();

function createHook<
    M extends Record<PropertyKey, any>,
    K extends KeysMatching<M>,
    T extends M[K]
>(module: M, key: K, forcePatch: boolean): Hook<T> | null {
    let original: T = module?.[key];
    if (!original && forcePatch) {
        original = (() => {}) as T;
    }

    if (!((original as any) instanceof Function)) return null;

    if (hooks.has(original)) {
        return hooks.get(original) as unknown as Hook<T>;
    }

    const hook: Hook<T> = {
        before: [],
        instead: [],
        after: [],
        original,
        get callers() {
            const callers: Record<string, Patch[]> = {};

            for (const type of ["before", "instead", "after"] as const) {
                for (const patch of this[type]) {
                    (callers[patch.callerName] ??= []).push(patch as Patch);
                }
            }

            return callers;
        }
    };

    const replacer = module[key] = createReplacer(original, (target, thisArg, argsArray) => {
        for (let index = 0; index < hook.before.length; index++) {
            const patch = hook.before[index];

            try {
                patch.callback(thisArg, argsArray);
            }
            catch (err) {
                Logger.err("Patcher", `Could not fire before callback ${patch.options.displayName} for ${patch.callerName}`, err);
            }
            finally {
                if (patch.options.once) {
                    patch.undo();
                }
            }
        }

        let returnValue: FunctionReturnType<T>;

        if (hook.instead.length) {
            const insteadPatches: Array<(this: FunctionThisParameterType<T>, ...args: FunctionParameters<T>) => FunctionReturnType<T>> = [];

            for (let index = 0; index < hook.instead.length; index++) {
                const patch = hook.instead[index];

                insteadPatches.push(function (this: FunctionThisParameterType<T>, ...args: FunctionParameters<T>): FunctionReturnType<T> {
                    try {
                        const nextPatch = insteadPatches[index + 1];

                        if (typeof nextPatch === "function") {
                            return patch.callback(this, args, createReplacer(original, (_target, thisArg, args) => nextPatch.apply(thisArg, args)));
                        }

                        return patch.callback(this, args, original);
                    }
                    catch (err) {
                        Logger.err("Patcher", `Could not fire instead callback ${patch.options.displayName} for ${patch.callerName}`, err);
                        return undefined as FunctionReturnType<T>;
                    }
                    finally {
                        if (patch.options.once) {
                            patch.undo();
                        }
                    }

                });
            }

            returnValue = insteadPatches[0].apply(thisArg, argsArray);
        }
        else {
            returnValue = Reflect.apply(target, thisArg, argsArray) as FunctionReturnType<T>;
        }

        for (let index = 0; index < hook.after.length; index++) {
            const patch = hook.after[index];

            try {
                const ret = patch.callback(thisArg, argsArray, returnValue);

                if (typeof ret !== "undefined") {
                    returnValue = ret;
                }
            }
            catch (err) {
                Logger.err("Patcher", `Could not fire after callback ${patch.options.displayName} for ${patch.callerName}`, err);
            }
            finally {
                if (patch.options.once) {
                    patch.undo();
                }
            }
        }

        return returnValue;
    }, hook);

    hooks.set(replacer, hook as unknown as Hook<FunctionType>);

    return hook;
}
const patches: Record<string, Patch[]> = {};
class BasePatcher {
    private addPatch<
        T extends PatchType,
        M extends Record<PropertyKey, any>,
        K extends KeysMatching<M>
    >(type: T, callerName: string, module: M, key: K, callback: T extends "before" ? BeforeCallback<M[K]> : T extends "instead" ? InsteadCallback<M[K]> : AfterCallback<M[K]>, options?: Options) {
        const adaptedOptions = adaptOptions(options, module?.[key]?.name || "Anonymous");

        const hook = createHook(module, key, adaptedOptions.forcePatch);
        if (!hook) return () => {};

        const patch: Patch<T, M[K]> = {
            callback,
            options: adaptedOptions,
            callerName,
            type,
            undo: () => {
                if (patches[callerName]) {
                    const index = patches[callerName].indexOf(patch as unknown as Patch);

                    if (index !== -1) {
                        patches[callerName]!.splice(index, 1);
                    }
                }

                const index = hook[type].indexOf(patch as any);

                if (index === -1) {
                    return;
                }

                hook[type].splice(index, 1);
            }
        };

        if (!adaptedOptions.detached) {
            (patches[callerName] ??= []).push(patch as unknown as Patch);
        }

        hook[type].push(patch as any);

        hook[type].sort((a, b) => {
            if (b.options.priority > a.options.priority) return 1;
            if (b.options.priority < a.options.priority) return -1;
            return 0;
        });

        return patch.undo;
    }

    public before<
        M extends Record<PropertyKey, any>,
        K extends KeysMatching<M>
    >(callerName: string, module: M, key: K, callback: BeforeCallback<M[K]>, options?: Options) {
        return this.addPatch("before", callerName, module, key, callback, options);
    }
    public instead<
        M extends Record<PropertyKey, any>,
        K extends KeysMatching<M>
    >(callerName: string, module: M, key: K, callback: InsteadCallback<M[K]>, options?: Options) {
        return this.addPatch("instead", callerName, module, key, callback, options);
    }
    public after<
        M extends Record<PropertyKey, any>,
        K extends KeysMatching<M>
    >(callerName: string, module: M, key: K, callback: AfterCallback<M[K]>, options?: Options) {
        return this.addPatch("after", callerName, module, key, callback, options);
    }

    public unpatchAll(callerName: string) {
        const $patches = patches[callerName];

        if (!$patches) return;

        while ($patches.length) {
            $patches[0]!.undo();
        }

        delete patches[callerName];
    }

    public getPatchesByCaller(callerName: string) {
        return patches[callerName] || [];
    }

    public getOriginal<T extends FunctionType>(fn: T): T {
        return (originals.get(fn) || fn) as T;
    }
}

export default new BasePatcher();
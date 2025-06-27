import Logger from "@common/logger";

import {default as MainPatcher, type AfterCallback, type BeforeCallback, type InsteadCallback} from "@modules/patcher";

type BeforeArguments<Bounded extends boolean, M extends object, K extends Extract<keyof M, string>> = [
    ...(Bounded extends false ? [caller: string] : []),
    moduleToPatch: M,
    functionName: K,
    callback: M[K] extends (...a: any[]) => any ? BeforeCallback<M[K]> : never
];
type InsteadArguments<Bounded extends boolean, M extends object, K extends Extract<keyof M, string>> = [
    ...(Bounded extends false ? [caller: string] : []),
    moduleToPatch: M,
    functionName: K,
    callback: M[K] extends (...a: any[]) => any ? InsteadCallback<M[K]> : never
];
type AfterArguments<Bounded extends boolean, M extends object, K extends Extract<keyof M, string>> = [
    ...(Bounded extends false ? [caller: string] : []),
    moduleToPatch: M,
    functionName: K,
    callback: M[K] extends (...a: any[]) => any ? AfterCallback<M[K]> : never
];

function isModuleInvalid(moduleToPatch: any): boolean {
    return typeof moduleToPatch !== "object" && typeof moduleToPatch !== "function" && moduleToPatch !== null;
}

/**
 * `Patcher` is a utility class for modifying existing functions. Instance is accessible through the {@link BdApi}.
 * This is extremely useful for modifying the internals of Discord by adjusting return value or React renders, or arguments of internal functions.
 * @type Patcher
 * @summary {@link Patcher} is a utility class for modifying existing functions.
 * @name Patcher
 */
class Patcher<Bounded extends boolean> {
    #callerName = "";
    constructor(callerName?: string) {
        if (!callerName) return;
        this.#callerName = callerName;
    }

    /**
     * This method patches onto another function, allowing your code to run beforehand.
     * Using this, you are also able to modify the incoming arguments before the original method is run.
     *
     * @param {string} caller Name of the caller of the patch function
     * @param {object} moduleToPatch Object with the function to be patched. Can also be an object's prototype.
     * @param {string} functionName Name of the function to be patched
     * @param {function} callback Function to run before the original method. The function is given the `this` context and the `arguments` of the original function.
     * @returns {function} Function that cancels the original patch
     */
    before<M extends object, K extends Extract<keyof M, string>>(...args: BeforeArguments<Bounded, M, K>): (() => void) | null {
        if (!this.#callerName && !args[3]) throw new Error("Trying to use shorthand without a bound api");

        if (this.#callerName) {
            const [moduleToPatch, functionName, callback] = args as unknown as BeforeArguments<true, M, K>;

            if (typeof callback !== "function") throw new Error("3rd parameter should be function");
            if (typeof functionName !== "string") throw new Error("2nd parameter should be function name");
            if (isModuleInvalid(moduleToPatch)) throw new Error("1st parameter should be module");

            return MainPatcher.pushChildPatch(this.#callerName, moduleToPatch, functionName, callback, {type: "before"});
        }

        const [caller, moduleToPatch, functionName, callback] = args as unknown as BeforeArguments<false, M, K>;
        if (typeof callback !== "function") throw new Error("4th parameter should be function");
        if (typeof functionName !== "string") throw new Error("3rd parameter should be function name");
        if (isModuleInvalid(moduleToPatch)) throw new Error("2nd parameter should be module");
        if (typeof caller !== "string") throw new Error("1st parameter should be string");


        return MainPatcher.pushChildPatch(caller, moduleToPatch, functionName, callback, {type: "before"});
    }

    /**
     * This method patches onto another function, allowing your code to run instead.
     * Using this, you are able to replace the original completely. You can still call the original manually if needed.
     *
     * @param {string} caller Name of the caller of the patch function
     * @param {object} moduleToPatch Object with the function to be patched. Can also be an object's prototype.
     * @param {string} functionName Name of the function to be patched
     * @param {function} callback Function to run before the original method. The function is given the `this` context, `arguments` of the original function, and also the original function.
     * @returns {function} Function that cancels the original patch
     */
    instead<M extends object, K extends Extract<keyof M, string>>(...args: InsteadArguments<Bounded, M, K>): (() => void) | null {
        if (!this.#callerName && !args[3]) throw new Error("Trying to use shorthand without a bound api");

        if (this.#callerName) {
            const [moduleToPatch, functionName, callback] = args as unknown as InsteadArguments<true, M, K>;

            if (typeof callback !== "function") throw new Error("3rd parameter should be function");
            if (typeof functionName !== "string") throw new Error("2nd parameter should be function name");
            if (isModuleInvalid(moduleToPatch)) throw new Error("1st parameter should be module");

            return MainPatcher.pushChildPatch(this.#callerName, moduleToPatch, functionName, callback, {type: "instead"});
        }

        const [caller, moduleToPatch, functionName, callback] = args as unknown as InsteadArguments<false, M, K>;
        if (typeof callback !== "function") throw new Error("4th parameter should be function");
        if (typeof functionName !== "string") throw new Error("3rd parameter should be function name");
        if (isModuleInvalid(moduleToPatch)) throw new Error("2nd parameter should be module");
        if (typeof caller !== "string") throw new Error("1st parameter should be string");


        return MainPatcher.pushChildPatch(caller, moduleToPatch, functionName, callback, {type: "instead"});
    }

    /**
     * This method patches onto another function, allowing your code to run afterwards.
     * Using this, you are able to modify the return value after the original method is run.
     *
     * @param {string} caller Name of the caller of the patch function
     * @param {object} moduleToPatch Object with the function to be patched. Can also be an object's prototype.
     * @param {string} functionName Name of the function to be patched
     * @param {function} callback Function to run after the original method. The function is given the `this` context, the `arguments` of the original function, and the `return` value of the original function.
     * @returns {function} Function that cancels the original patch
     */
    after<M extends object, K extends Extract<keyof M, string>>(...args: AfterArguments<Bounded, M, K>): (() => void) | null {
        if (!this.#callerName && !args[3]) throw new Error("Trying to use shorthand without a bound api");

        if (this.#callerName) {
            const [moduleToPatch, functionName, callback] = args as unknown as AfterArguments<true, M, K>;

            if (typeof callback !== "function") throw new Error("3rd parameter should be function");
            if (typeof functionName !== "string") throw new Error("2nd parameter should be function name");
            if (isModuleInvalid(moduleToPatch)) throw new Error("1st parameter should be module");

            return MainPatcher.pushChildPatch(this.#callerName, moduleToPatch, functionName, callback, {type: "after"});
        }

        const [caller, moduleToPatch, functionName, callback] = args as unknown as AfterArguments<false, M, K>;
        if (typeof callback !== "function") throw new Error("4th parameter should be function");
        if (typeof functionName !== "string") throw new Error("3rd parameter should be function name");
        if (isModuleInvalid(moduleToPatch)) throw new Error("2nd parameter should be module");
        if (typeof caller !== "string") throw new Error("1st parameter should be string");


        return MainPatcher.pushChildPatch(caller, moduleToPatch, functionName, callback, {type: "after"});
    }

    /**
     * Returns all patches by a particular caller. The patches all have an `unpatch()` method.
     *
     * @param {string} caller ID of the original patches
     * @returns {Array<function>} Array of all the patch objects
     */
    getPatchesByCaller(caller: string) {
        if (this.#callerName) caller = this.#callerName;
        if (typeof (caller) !== "string") return Logger.err("BdApi.Patcher", "Parameter 0 of getPatchesByCaller must be a string representing the caller");
        return MainPatcher.getPatchesByCaller(caller);
    }

    /**
     * Automatically cancels all patches created with a specific ID.
     *
     * @param {string} caller ID of the original patches
     */
    unpatchAll(caller: string) {
        if (this.#callerName) caller = this.#callerName;
        if (typeof (caller) !== "string") return Logger.err("BdApi.Patcher", "Parameter 0 of unpatchAll must be a string representing the caller");
        MainPatcher.unpatchAll(caller);
    }
}

Object.freeze(Patcher);
Object.freeze(Patcher.prototype);
export default Patcher;
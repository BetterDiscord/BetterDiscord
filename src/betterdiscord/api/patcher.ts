import Logger from "@common/logger";

import {default as MainPatcher, type AfterCallback, type BeforeCallback, type InsteadCallback} from "@modules/patcher";
import type {StringKeys} from "@typed/util";

type AsBeforeCallback<M extends object, K extends StringKeys<M>> = M[K] extends (...a: any[]) => any ? BeforeCallback<M[K]> : never;
type AsAfterCallback<M extends object, K extends StringKeys<M>> = M[K] extends (...a: any[]) => any ? AfterCallback<M[K]> : never;
type AsInsteadCallback<M extends object, K extends StringKeys<M>> = M[K] extends (...a: any[]) => any ? InsteadCallback<M[K]> : never;

function isModuleInvalid(moduleToPatch: any): boolean {
    return typeof moduleToPatch !== "object" && typeof moduleToPatch !== "function" && moduleToPatch !== null;
}

/**
 * `Patcher` is a utility class for modifying existing functions. An instance is available on {@link BdApi}.
 * This is extremely useful for modifying the internals of Discord by adjusting return values of React renders, or arguments of internal functions.
 */
class Patcher {
    /** @ignore */
    constructor() {};

    /**
     * This method patches onto another function, allowing your code to run beforehand.
     * Using this, you are also able to modify the incoming arguments before the original method is run.
     *
     * @param caller Name of the caller of the patch function
     * @param moduleToPatch Object with the function to be patched. Can also be an object's prototype.
     * @param functionName Name of the function to be patched
     * @param callback Function to run before the original method. The function is given the `this` context and the `arguments` of the original function.
     * @returns Function that cancels the original patch
     */
    before<M extends object, K extends StringKeys<M>>(caller: string, moduleToPatch: M, functionName: K, callback: AsBeforeCallback<M, K>) {
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
     * @param caller Name of the caller of the patch function
     * @param moduleToPatch Object with the function to be patched. Can also be an object's prototype.
     * @param functionName Name of the function to be patched
     * @param callback Function to run before the original method. The function is given the `this` context, `arguments` of the original function, and also the original function.
     * @returns Function that cancels the original patch
     */
    instead<M extends object, K extends StringKeys<M>>(caller: string, moduleToPatch: M, functionName: K, callback: AsInsteadCallback<M, K>) {
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
     * @param caller Name of the caller of the patch function
     * @param moduleToPatch Object with the function to be patched. Can also be an object's prototype.
     * @param functionName Name of the function to be patched
     * @param callback Function to run after the original method. The function is given the `this` context, the `arguments` of the original function, and the `return` value of the original function.
     * @returns Function that cancels the original patch
     */
    after<M extends object, K extends StringKeys<M>>(caller: string, moduleToPatch: M, functionName: K, callback: AsAfterCallback<M, K>) {
        if (typeof callback !== "function") throw new Error("4th parameter should be function");
        if (typeof functionName !== "string") throw new Error("3rd parameter should be function name");
        if (isModuleInvalid(moduleToPatch)) throw new Error("2nd parameter should be module");
        if (typeof caller !== "string") throw new Error("1st parameter should be string");

        return MainPatcher.pushChildPatch(caller, moduleToPatch, functionName, callback, {type: "after"});
    }

    /**
     * Returns all patches by a particular caller. The patches all have an `unpatch()` method.
     *
     * @param caller ID of the original patches
     * @returns Array of all the patch objects
     */
    getPatchesByCaller(caller: string) {
        if (typeof (caller) !== "string") return Logger.err("BdApi.Patcher", "Parameter 0 of getPatchesByCaller must be a string representing the caller");
        return MainPatcher.getPatchesByCaller(caller);
    }

    /**
     * Automatically cancels all patches created with a specific ID.
     *
     * @param caller ID of the original patches
     */
    unpatchAll(caller: string) {
        if (typeof (caller) !== "string") return Logger.err("BdApi.Patcher", "Parameter 0 of unpatchAll must be a string representing the caller");
        MainPatcher.unpatchAll(caller);
    }
}

/**
 * `BoundPatcher` is a utility class for modifying existing functions, with plugin scoping automatically supplied.
 * An instance is available on instances of {@link BdApi}.
 * This is extremely useful for modifying the internals of Discord by adjusting return values of React renders, or arguments of internal functions.
 */
class BoundPatcher {
    #callerName: string;

    /** @ignore */
    constructor(callerName: string) {
        this.#callerName = callerName;
    }

    /**
     * This method patches onto another function, allowing your code to run beforehand.
     * Using this, you are also able to modify the incoming arguments before the original method is run.
     *
     * @param moduleToPatch Object with the function to be patched. Can also be an object's prototype.
     * @param functionName Name of the function to be patched
     * @param callback Function to run before the original method. The function is given the `this` context and the `arguments` of the original function.
     * @returns Function that cancels the original patch
     */
    before<M extends object, K extends StringKeys<M>>(moduleToPatch: M, functionName: K, callback: AsBeforeCallback<M, K>) {
        if (typeof callback !== "function") throw new Error("3rd parameter should be function");
        if (typeof functionName !== "string") throw new Error("2nd parameter should be function name");
        if (isModuleInvalid(moduleToPatch)) throw new Error("1st parameter should be module");

        return MainPatcher.pushChildPatch(this.#callerName, moduleToPatch, functionName, callback, {type: "before"});
    }

    /**
     * This method patches onto another function, allowing your code to run instead.
     * Using this, you are able to replace the original completely. You can still call the original manually if needed.
     *
     * @param moduleToPatch Object with the function to be patched. Can also be an object's prototype.
     * @param functionName Name of the function to be patched
     * @param callback Function to run before the original method. The function is given the `this` context, `arguments` of the original function, and also the original function.
     * @returns Function that cancels the original patch
     */
    instead<M extends object, K extends StringKeys<M>>(moduleToPatch: M, functionName: K, callback: AsInsteadCallback<M, K>) {
        if (typeof callback !== "function") throw new Error("3rd parameter should be function");
        if (typeof functionName !== "string") throw new Error("2nd parameter should be function name");
        if (isModuleInvalid(moduleToPatch)) throw new Error("1st parameter should be module");

        return MainPatcher.pushChildPatch(this.#callerName, moduleToPatch, functionName, callback, {type: "instead"});
    }

    /**
     * This method patches onto another function, allowing your code to run afterwards.
     * Using this, you are able to modify the return value after the original method is run.
     *
     * @param moduleToPatch Object with the function to be patched. Can also be an object's prototype.
     * @param functionName Name of the function to be patched
     * @param callback Function to run after the original method. The function is given the `this` context, the `arguments` of the original function, and the `return` value of the original function.
     * @returns Function that cancels the original patch
     */
    after<M extends object, K extends StringKeys<M>>(moduleToPatch: M, functionName: K, callback: AsAfterCallback<M, K>) {
        if (typeof callback !== "function") throw new Error("3rd parameter should be function");
        if (typeof functionName !== "string") throw new Error("2nd parameter should be function name");
        if (isModuleInvalid(moduleToPatch)) throw new Error("1st parameter should be module");

        return MainPatcher.pushChildPatch(this.#callerName, moduleToPatch, functionName, callback, {type: "after"});
    }

    /**
     * Returns all patches by this bound api. The patches all have an `unpatch()` method.
     * @returns Array of all the patch objects
     */
    getPatchesByCaller() {
        return MainPatcher.getPatchesByCaller(this.#callerName);
    }

    /**
     * Automatically cancels all patches created by this bound api
     */
    unpatchAll() {
        MainPatcher.unpatchAll(this.#callerName);
    }
}

Object.freeze(Patcher);
Object.freeze(Patcher.prototype);
Object.freeze(BoundPatcher);
Object.freeze(BoundPatcher.prototype);

export {Patcher, BoundPatcher};
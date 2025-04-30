import Logger from "@common/logger";

import {default as MainPatcher} from "@modules/patcher";


/**
 * `Patcher` is a utility class for modifying existing functions. Instance is accessible through the {@link BdApi}.
 * This is extremely useful for modifying the internals of Discord by adjusting return value or React renders, or arguments of internal functions.
 * @type Patcher
 * @summary {@link Patcher} is a utility class for modifying existing functions.
 * @name Patcher
 */
class Patcher {

    #callerName = "";
    constructor(callerName) {
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
    before(caller, moduleToPatch, functionName, callback) {
        if (this.#callerName) {
            callback = functionName;
            functionName = moduleToPatch;
            moduleToPatch = caller;
            caller = this.#callerName;
        }
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
    instead(caller, moduleToPatch, functionName, callback) {
        if (this.#callerName) {
            callback = functionName;
            functionName = moduleToPatch;
            moduleToPatch = caller;
            caller = this.#callerName;
        }
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
    after(caller, moduleToPatch, functionName, callback) {
        if (this.#callerName) {
            callback = functionName;
            functionName = moduleToPatch;
            moduleToPatch = caller;
            caller = this.#callerName;
        }
        return MainPatcher.pushChildPatch(caller, moduleToPatch, functionName, callback, {type: "after"});
    }

    /**
     * Returns all patches by a particular caller. The patches all have an `unpatch()` method.
     *
     * @param {string} caller ID of the original patches
     * @returns {Array<function>} Array of all the patch objects
     */
    getPatchesByCaller(caller) {
        if (this.#callerName) caller = this.#callerName;
        if (typeof (caller) !== "string") return Logger.err("BdApi.Patcher", "Parameter 0 of getPatchesByCaller must be a string representing the caller");
        return MainPatcher.getPatchesByCaller(caller);
    }

    /**
     * Automatically cancels all patches created with a specific ID.
     *
     * @param {string} caller ID of the original patches
     */
    unpatchAll(caller) {
        if (this.#callerName) caller = this.#callerName;
        if (typeof (caller) !== "string") return Logger.err("BdApi.Patcher", "Parameter 0 of unpatchAll must be a string representing the caller");
        MainPatcher.unpatchAll(caller);
    }
}

Object.freeze(Patcher);
Object.freeze(Patcher.prototype);
export default Patcher;
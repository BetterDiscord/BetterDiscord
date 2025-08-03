/**
 * Patcher that can patch other functions allowing you to run code before, after or
 * instead of the original function. Can also alter arguments and return values.
 */

import Logger from "@common/logger";

import DiscordModules from "./discordmodules";
import {getByKeys} from "@webpack";


export interface GenericPatch {
    name: string;
    module: object;
    functionName: string;
    originalFunction: (...a: any[]) => any;
    proxyFunction?: any;
    revert: () => void;
    counter: number;
    children: GenericChildPatch[];
}

export interface Patch<M extends object, K extends Extract<keyof M, string>> extends GenericPatch {
    module: M;
    functionName: K;
    originalFunction: M[K] extends (...a: any[]) => any ? M[K] : never;
}

export interface GenericChildPatch {
    caller: string;
    type: "before" | "instead" | "after";
    id: number;
    callback: (...a: any[]) => any;
    unpatch: () => void;
}

// interface ChildPatch<T extends PatchCallback<any> = PatchCallback> extends GenericChildPatch {
//     callback: T;
// }

export type BeforeCallback<F extends (...a: any[]) => any = (...a: any[]) => any> = (thisObject: ThisType<F>, args: Parameters<F>) => void;
export type InsteadCallback<F extends (...a: any[]) => any = (...a: any[]) => any> = (thisObject: ThisType<F>, args: Parameters<F>, originalFunction: F) => any;
export type AfterCallback<F extends (...a: any[]) => any = (...a: any[]) => any> = (thisObject: ThisType<F>, args: Parameters<F>, returnValue: ReturnType<F>) => any;
export type PatchCallback<F extends (...a: any[]) => any = (...a: any[]) => any> = BeforeCallback<F> | InsteadCallback<F> | AfterCallback<F>;

export interface PatchOptions {
    displayName?: string;
    forcePatch?: boolean;
    type?: "before" | "instead" | "after";
}

export interface PatchOptions {
    displayName?: string;
    forcePatch?: boolean;
    type?: "before" | "instead" | "after";
}

export default class Patcher {

    private static _patches: GenericPatch[] = [];
    static get patches() {return this._patches || (this._patches = []);}

    /**
     * Returns all the patches done by a specific caller
     * @param {string} name - Name of the patch caller
     * @method
     */
    static getPatchesByCaller(name: string) {
        if (!name) return [];
        const patches = [];
        for (const patch of this.patches) {
            for (const childPatch of patch.children) {
                if (childPatch.caller === name) patches.push(childPatch);
            }
        }
        return patches;
    }

    /**
     * Unpatches all patches passed, or when a string is passed unpatches all
     * patches done by that specific caller.
     * @param {Array|string} patches - Either an array of patches to unpatch or a caller name
     */
    static unpatchAll(patches: string | GenericChildPatch[]) {
        if (typeof patches === "string") patches = this.getPatchesByCaller(patches);

        for (const patch of patches) {
            patch.unpatch();
        }
    }

    static resolveModule<M>(module: object | ((...a: any) => any) | string[]): M | null {
        if (!module || typeof (module) === "function" || (typeof (module) === "object" && !Array.isArray(module))) return module as M;
        if (typeof module === "string") return DiscordModules[module];
        if (Array.isArray(module)) return getByKeys(module) as M;
        return null;
    }

    static makeOverride<M extends object, K extends Extract<keyof M, string>>(patch: Patch<M, K>) {
        return function BDPatcher(this: any, ...args: any[]) {
            let returnValue;
            if (!patch.children || !patch.children.length) return patch.originalFunction.apply(this, args);
            for (const superPatch of patch.children.filter(c => c.type === "before")) {
                try {
                    superPatch.callback(this, args);
                }
                catch (err) {
                    Logger.err("Patcher", `Could not fire before callback of ${patch.functionName} for ${superPatch.caller}`, err);
                }
            }

            const insteads = patch.children.filter(c => c.type === "instead");
            if (!insteads.length) {returnValue = patch.originalFunction.apply(this, args);}
            else {
                for (const insteadPatch of insteads) {
                    try {
                        const tempReturn = insteadPatch.callback(this, args, patch.originalFunction.bind(this));
                        if (typeof (tempReturn) !== "undefined") returnValue = tempReturn;
                    }
                    catch (err) {
                        Logger.err("Patcher", `Could not fire instead callback of ${patch.functionName} for ${insteadPatch.caller}`, err);
                    }
                }
            }

            for (const slavePatch of patch.children.filter(c => c.type === "after")) {
                try {
                    const tempReturn = slavePatch.callback(this, args, returnValue);
                    if (typeof (tempReturn) !== "undefined") returnValue = tempReturn;
                }
                catch (err) {
                    Logger.err("Patcher", `Could not fire after callback of ${patch.functionName} for ${slavePatch.caller}`, err);
                }
            }
            return returnValue;
        };
    }

    static rePatch<M extends object, K extends Extract<keyof M, string>>(patch: Patch<M, K>) {
        const override = this.makeOverride(patch) as M[K];
        patch.proxyFunction = override;
        patch.module[patch.functionName] = override;
    }

    static makePatch<M extends object, K extends Extract<keyof M, string>>(module: M, functionName: K, name: string) {
        const patch: Patch<M, K> = {
            name,
            module,
            functionName,
            originalFunction: module[functionName] as M[K] extends (...a: any[]) => any ? M[K] : never,
            proxyFunction: undefined,
            revert: () => { // Calling revert will destroy any patches added to the same module after this
                patch.module[patch.functionName] = patch.originalFunction;
                patch.proxyFunction = undefined;
                patch.children = [];
            },
            counter: 0,
            children: []
        };
        patch.proxyFunction = module[functionName] = this.makeOverride(patch) as M[K];
        Object.assign(module[functionName] as any, patch.originalFunction);
        (module[functionName] as any).__originalFunction = patch.originalFunction;
        (module[functionName] as any).toString = () => patch.originalFunction.toString();
        this.patches.push(patch);
        return patch;
    }

    /**
     * Function with no arguments and no return value that may be called to revert changes made by {@link module:Patcher}, restoring (unpatching) original method.
     * @callback module:Patcher~unpatch
     */

    /**
     * A callback that modifies method logic. This callback is called on each call of the original method and is provided all data about original call. Any of the data can be modified if necessary, but do so wisely.
     *
     * The third argument for the callback will be `undefined` for `before` patches. `originalFunction` for `instead` patches and `returnValue` for `after` patches.
     *
     * @callback module:Patcher~patchCallback
     * @param {object} thisObject - `this` in the context of the original function.
     * @param {arguments} args - The original arguments of the original function.
     * @param {(function|*)} extraValue - For `instead` patches, this is the original function from the module. For `after` patches, this is the return value of the function.
     * @return {*} Makes sense only when using an `instead` or `after` patch. If something other than `undefined` is returned, the returned value replaces the value of `returnValue`. If used for `before` the return value is ignored.
     */

    /**
     * This method patches onto another function, allowing your code to run beforehand.
     * Using this, you are also able to modify the incoming arguments before the original method is run.
     *
     * @param {string} caller - Name of the caller of the patch function. Using this you can undo all patches with the same name using {@link module:Patcher.unpatchAll}. Use `""` if you don't care.
     * @param {object} moduleToPatch - Object with the function to be patched. Can also patch an object's prototype.
     * @param {string} functionName - Name of the method to be patched
     * @param {module:Patcher~patchCallback} callback - Function to run before the original method
     * @param {object} options - Object used to pass additional options.
     * @param {string} [options.displayName] You can provide meaningful name for class/object provided in `what` param for logging purposes. By default, this function will try to determine name automatically.
     * @param {boolean} [options.forcePatch=true] Set to `true` to patch even if the function doesnt exist. (Adds noop function in place).
     * @return {module:Patcher~unpatch} Function with no arguments and no return value that should be called to cancel (unpatch) this patch. You should save and run it when your plugin is stopped.
     */
    static before<M extends object, K extends Extract<keyof M, string>>(
        caller: string,
        moduleToPatch: M,
        functionName: K,
        callback: M[K] extends (...a: any[]) => any ? BeforeCallback<M[K]> : never,
        options: PatchOptions = {}
    ) {
        return this.pushChildPatch(caller, moduleToPatch, functionName, callback, Object.assign(options, {type: "before"}));
    }

    /**
     * This method patches onto another function, allowing your code to run after.
     * Using this, you are also able to modify the return value, using the return of your code instead.
     *
     * @param {string} caller - Name of the caller of the patch function. Using this you can undo all patches with the same name using {@link module:Patcher.unpatchAll}. Use `""` if you don't care.
     * @param {object} moduleToPatch - Object with the function to be patched. Can also patch an object's prototype.
     * @param {string} functionName - Name of the method to be patched
     * @param {module:Patcher~patchCallback} callback - Function to run instead of the original method
     * @param {object} options - Object used to pass additional options.
     * @param {string} [options.displayName] You can provide meaningful name for class/object provided in `what` param for logging purposes. By default, this function will try to determine name automatically.
     * @param {boolean} [options.forcePatch=true] Set to `true` to patch even if the function doesnt exist. (Adds noop function in place).
     * @return {module:Patcher~unpatch} Function with no arguments and no return value that should be called to cancel (unpatch) this patch. You should save and run it when your plugin is stopped.
     */
    static after<M extends object, K extends Extract<keyof M, string>>(caller: string,
        moduleToPatch: M,
        functionName: K,
        callback: M[K] extends (...a: any[]) => any ? AfterCallback<M[K]> : never,
        options: PatchOptions = {}
    ) {
        return this.pushChildPatch(caller, moduleToPatch, functionName, callback, Object.assign(options, {type: "after"}));
    }

    /**
     * This method patches onto another function, allowing your code to run instead.
     * Using this, you are also able to modify the return value, using the return of your code instead.
     *
     * @param {string} caller - Name of the caller of the patch function. Using this you can undo all patches with the same name using {@link module:Patcher.unpatchAll}. Use `""` if you don't care.
     * @param {object} moduleToPatch - Object with the function to be patched. Can also patch an object's prototype.
     * @param {string} functionName - Name of the method to be patched
     * @param {module:Patcher~patchCallback} callback - Function to run after the original method
     * @param {object} options - Object used to pass additional options.
     * @param {string} [options.displayName] You can provide meaningful name for class/object provided in `what` param for logging purposes. By default, this function will try to determine name automatically.
     * @param {boolean} [options.forcePatch=true] Set to `true` to patch even if the function doesnt exist. (Adds noop function in place).
     * @return {module:Patcher~unpatch} Function with no arguments and no return value that should be called to cancel (unpatch) this patch. You should save and run it when your plugin is stopped.
     */
    static instead<M extends object, K extends Extract<keyof M, string>>(
        caller: string,
        moduleToPatch: M,
        functionName: K,
        callback: M[K] extends (...a: any[]) => any ? InsteadCallback<M[K]> : never,
        options: PatchOptions = {}
    ) {
        return this.pushChildPatch(caller, moduleToPatch, functionName, callback, Object.assign(options, {type: "instead"}));
    }

    /**
     * This method patches onto another function, allowing your code to run before, instead or after the original function.
     * Using this you are able to modify the incoming arguments before the original function is run as well as the return
     * value before the original function actually returns.
     *
     * @param {string} caller - Name of the caller of the patch function. Using this you can undo all patches with the same name using {@link module:Patcher.unpatchAll}. Use `""` if you don't care.
     * @param {object} moduleToPatch - Object with the function to be patched. Can also patch an object's prototype.
     * @param {string} functionName - Name of the method to be patched
     * @param {module:Patcher~patchCallback} callback - Function to run after the original method
     * @param {object} options - Object used to pass additional options.
     * @param {string} [options.type=after] - Determines whether to run the function `before`, `instead`, or `after` the original.
     * @param {string} [options.displayName] You can provide meaningful name for class/object provided in `what` param for logging purposes. By default, this function will try to determine name automatically.
     * @param {boolean} [options.forcePatch=true] Set to `true` to patch even if the function doesnt exist. (Adds noop function in place).
     * @return {module:Patcher~unpatch} Function with no arguments and no return value that should be called to cancel (unpatch) this patch. You should save and run it when your plugin is stopped.
     */
    static pushChildPatch<M extends object, K extends Extract<keyof M, string>>(
        caller: string,
        moduleToPatch: M,
        functionName: K,
        callback: M[K] extends (...a: any[]) => any ? PatchCallback<M[K]> : never,
        options: PatchOptions = {}
    ) {
        const {type = "after", forcePatch = true} = options;
        const module = this.resolveModule<M>(moduleToPatch);
        if (!module) return null;
        if (!module[functionName] && forcePatch) module[functionName] = (function () {}) as M[K];
        if (!(module[functionName] instanceof Function)) return null;

        if (typeof moduleToPatch === "string") options.displayName = moduleToPatch;
        const displayName = options.displayName || (module as any).displayName || (module as any).name || (module.constructor as any).displayName || module.constructor.name;

        const patchId = `${displayName}.${functionName}`;
        const patch: Patch<M, K> = (this.patches.find(p => p.module == module && p.functionName == functionName) || this.makePatch(module, functionName, patchId)) as Patch<M, K>;
        if (!patch.proxyFunction) this.rePatch<M, K>(patch);
        const child: GenericChildPatch = {
            caller,
            type,
            id: patch.counter,
            callback,
            unpatch: () => {
                patch.children.splice(patch.children.findIndex(cpatch => cpatch.id === child.id && cpatch.type === type), 1);
                if (patch.children.length <= 0) {
                    const patchNum = this.patches.findIndex(p => p.module == module && p.functionName == functionName);
                    if (patchNum < 0) return;
                    this.patches[patchNum].revert();
                    this.patches.splice(patchNum, 1);
                }
            }
        };
        patch.children.push(child);
        patch.counter++;
        return child.unpatch;
    }

}

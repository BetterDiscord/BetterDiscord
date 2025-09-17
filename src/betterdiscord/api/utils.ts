import clsx from "clsx";
import {comparator} from "@structs/semver";
import {debounce, extend, findInTree, getNestedProp} from "@common/utils";
import {forceLoad} from "@webpack";
import Store from "@stores/base";


/**
 * `Utils` is a utility containing commonly reused functions. Instance is accessible through the {@link BdApi}.
 * @summary {@link Utils} is a utility class for interacting with React internals.
 * @name Utils
 */
const Utils = {
    /**
     * Finds a value, subobject, or array from a tree that matches a specific filter. This is a DFS.
     *
     * @param {object} tree Tree that should be walked
     * @param {callable} searchFilter Filter to check against each object and subobject
     * @param {object} options Additional options to customize the search
     * @param {Array<string>|null} [options.walkable=null] Array of strings to use as keys that are allowed to be walked on. `null` indicates all keys are walkable.
     * @param {Array<string>} [options.ignore=[]] Array of strings to use as keys to exclude from the search. Most helpful when `walkable = null`.
    */
    findInTree: findInTree,

    /**
     * Loads the module ids within a chunk
     *
     * @param {number | string} id module with the chunk id.
     * @returns {Promise<object>} resolved chunk module
     */
    forceLoad: forceLoad,

    /**
     * Deep extends an object with a set of other objects. Objects later in the list
     * of `extenders` have priority, that is to say if one sets a key to be a primitive,
     * it will be overwritten with the next one with the same key. If it is an object,
     * and the keys match, the object is extended. This happens recursively.
     *
     * @param {object} extendee Object to be extended
     * @param {...object} extenders Objects to extend with
     * @returns {object} A reference to `extendee`
     */
    extend: extend,

    /**
     * Returns a function, that, as long as it continues to be invoked, will not
     * be triggered. The function will be called after it stops being called for
     * `delay` milliseconds. It is called at the end of the sequence (trailing edge).
     *
     * Adapted from the version by David Walsh (https://davidwalsh.name/javascript-debounce-function)
     *
     * @param {function} executor The function to be debounced
     * @param {number} delay Number of ms to delay calls
     * @return {function} A debounced version of the function
     */
    debounce: debounce,

    /**
     * Takes a string of HTML and escapes it using the browser's own escaping mechanism.
     *
     * @param {string} html HTML to be escaped
     * @return {string} Escaped HTML string
     */
    escapeHTML(html: string): string {
        const textNode = document.createTextNode("");
        const spanElement = document.createElement("span");
        spanElement.append(textNode);
        textNode.nodeValue = html;
        return spanElement.innerHTML;
    },

    /**
     * Builds a classname string from any number of arguments. This includes arrays and objects.
     * When given an array all values from the array are added to the list.
     * When given an object they keys are added as the classnames if the value is truthy.
     * Copyright (c) Luke Edwards <luke.edwards05@gmail.com> (lukeed.com)
     *
     * @param {...any} argument Anything that should be used to add classnames
     * @returns {string} Joined classname
     */
    className: clsx,
    /**
     * Gets a nested value (if it exists) of an object safely. keyPath should be something like `key.key2.key3`.
     * Numbers can be used for arrays as well like `key.key2.array.0.id`.
     * @param {object} obj - object to get nested value from
     * @param {string} keyPath - key path to the desired value
     */
    getNestedValue<T extends Record<string | number | symbol, unknown>, R = any>(object: T, path: string): R {
        return getNestedProp(object, path);
    },

    /**
     * This works on semantic versioning e.g. "1.0.0".
     *
     * @param {string} currentVersion
     * @param {string} newVersion
     * @returns {number} 0 indicates equal, -1 indicates left hand greater, 1 indicates right hand greater
     */
    semverCompare: comparator,

    Store
} as const;

// https://stackoverflow.com/questions/58434389/typescript-deep-keyof-of-a-nested-object/58436959#58436959
// type Path<T> = T extends object ? {[K in keyof T]:
//     `${Exclude<K, symbol>}${"" | `.${Path<T[K]>}`}`
// }[keyof T] : never;

// https://github.com/nestjs/config/blob/master/lib/types/path-value.type.ts
// type PathValue<
//     T,
//     P extends Path<T>,
// > = P extends `${infer Key}.${infer Rest}`
//     ? Key extends keyof T
//     ? Rest extends Path<T[Key]>
//     ? PathValue<T[Key], Rest>
//     : never
//     : never
//     : P extends keyof T
//     ? T[P]
//     : never;

Object.freeze(Utils);

export default Utils;
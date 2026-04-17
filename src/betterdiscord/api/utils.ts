import clsx from "clsx";
import {comparator} from "@structs/semver";
import {debounce, extend, findInTree, getNestedProp} from "@common/utils";
import {forceLoad} from "@webpack";
import Store from "@stores/base";


/**
 * `Utils` is a utility containing commonly reused functions. Instance is accessible through the {@link BdApi}.
 * @summary {@link Utils} is a utility class for interacting with React internals.
 */
const Utils = {
    /**
     * Finds a value, subobject, or array from a tree that matches a specific filter. This is a DFS.
     *
     * @param tree Tree that should be walked
     * @param searchFilter Filter to check against each object and subobject
     * @param options Additional options to customize the search
     * @param [options.walkable=null] Array of strings to use as keys that are allowed to be walked on. `null` indicates all keys are walkable.
     * @param [options.ignore=[]] Array of strings to use as keys to exclude from the search. Most helpful when `walkable = null`.
     */
    findInTree: findInTree,

    /**
     * Loads the module ids within a chunk
     *
     * @param id Module with the chunk id.
     * @returns Resolved chunk module
     */
    forceLoad: forceLoad,

    /**
     * Deep extends an object with a set of other objects. Objects later in the list
     * of `extenders` have priority, that is to say if one sets a key to be a primitive,
     * it will be overwritten with the next one with the same key. If it is an object,
     * and the keys match, the object is extended. This happens recursively.
     *
     * @param extendee Object to be extended
     * @param extenders Objects to extend with
     * @returns A reference to `extendee`
     */
    extend: extend,

    /**
     * Returns a function, that, as long as it continues to be invoked, will not
     * be triggered. The function will be called after it stops being called for
     * `delay` milliseconds. It is called at the end of the sequence (trailing edge).
     *
     * Adapted from the version by David Walsh (https://davidwalsh.name/javascript-debounce-function)
     *
     * @param executor The function to be debounced
     * @param delay Number of ms to delay calls
     * @returns A debounced version of the function
     */
    debounce: debounce,

    /**
     * Takes a string of HTML and escapes it using the browser's own escaping mechanism.
     *
     * @param html HTML to be escaped
     * @returns Escaped HTML string
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
     * @param argument Anything that should be used to add classnames
     * @returns Joined classname
     */
    className: clsx,

    /**
     * Gets a nested value (if it exists) of an object safely. keyPath should be something like `key.key2.key3`.
     * Numbers can be used for arrays as well like `key.key2.array.0.id`.
     * @param obj Object to get nested value from
     * @param keyPath Key path to the desired value
     */
    getNestedValue<T extends Record<string | number | symbol, unknown>, R = any>(object: T, path: string): R {
        return getNestedProp(object, path);
    },

    /**
     * This works on semantic versioning e.g. "1.0.0".
     *
     * @param currentVersion
     * @param newVersion
     * @returns 0 indicates equal, -1 indicates left hand greater, 1 indicates right hand greater
     */
    semverCompare: comparator,

    /**
     * A store which can have listeners attached to it. When the store emits a change, all listeners will be called.
     * This is most useful with `Hooks.useStateFromStores` to create reactive values.
     */
    Store
} as const;

Object.freeze(Utils);

export default Utils;
import Utilities from "@modules/utilities";


/**
 * `Utils` is a utility containing commonly reused functions. Instance is accessible through the {@link BdApi}.
 * @type Utils
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
    findInTree(tree, searchFilter, options = {}) {
        return Utilities.findInTree(tree, searchFilter, options);
    },

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
    extend(extendee, ...extenders) {
        return Utilities.extend(extendee, ...extenders);
    },

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
    debounce(executor, delay) {
        return Utilities.debounce(executor, delay);
    },

    /**
     * Takes a string of HTML and escapes it using the browser's own escaping mechanism.
     * 
     * @param {string} html HTML to be escaped
     * @return {string} Escaped HTML string
     */
    escapeHTML(html) {
        return Utilities.escapeHTML(html);
    },

    /**
     * Builds a classname string from any number of arguments. This includes arrays and objects.
     * When given an array all values from the array are added to the list.
     * When given an object they keys are added as the classnames if the value is truthy.
     * Copyright (c) 2018 Jed Watson https://github.com/JedWatson/classnames MIT License
     * 
     * @param {...any} argument Anything that should be used to add classnames
     * @returns {string} Joined classname
     */
    className() {
        return Utilities.className(...arguments);
    }
};

Object.freeze(Utils);

export default Utils;
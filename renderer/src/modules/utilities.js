import {Config} from "data";
import Logger from "common/logger";
import DOM from "./domtools";

export default class Utilities {

    static repoUrl(path) {
        return `https://cdn.staticaly.com/gh/BetterDiscord/BetterDiscord/${Config.hash}/${path}`;
    }

    /**
     * Parses a string of HTML and returns the results. If the second parameter is true,
     * the parsed HTML will be returned as a document fragment {@see https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment}.
     * This is extremely useful if you have a list of elements at the top level, they can then be appended all at once to another node.
     *
     * If the second parameter is false, then the return value will be the list of parsed
     * nodes and there were multiple top level nodes, otherwise the single node is returned.
     * @param {string} html - HTML to be parsed
     * @param {boolean} [fragment=false] - Whether or not the return should be the raw `DocumentFragment`
     * @returns {(DocumentFragment|NodeList|HTMLElement)} - The result of HTML parsing
     */
    static parseHTML(html, fragment = false) {
        const template = document.createElement("template");
        template.innerHTML = html;
        const node = template.content.cloneNode(true);
        if (fragment) return node;
        return node.childNodes.length > 1 ? node.childNodes : node.childNodes[0];
    }

    static getTextArea() {
        return DOM.query(".channelTextArea-1LDbYG textarea");
    }

    static insertText(textarea, text) {
        textarea.focus();
        textarea.selectionStart = 0;
        textarea.selectionEnd = textarea.value.length;
        document.execCommand("insertText", false, text);
    }

    static escape(s) {
        return s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    }

    static testJSON(data) {
        try {
            return JSON.parse(data);
        }
        catch (err) {
            return false;
        }
    }

    static suppressErrors(method, message) {
        return (...params) => {
            try {return method(...params);}
            catch (e) {Logger.stacktrace("SuppressedError", "Error occurred in " + message, e);}
        };
    }

    static occurrences(source, substring) {
        const regex = new RegExp(substring, "g");
        return (source.match(regex) || []).length;
    }

    static onRemoved(node, callback) {
        const observer = new MutationObserver((mutations) => {
            for (let m = 0; m < mutations.length; m++) {
                const mutation = mutations[m];
                const nodes = Array.from(mutation.removedNodes);
                const directMatch = nodes.indexOf(node) > -1;
                const parentMatch = nodes.some(parent => parent.contains(node));
                if (directMatch || parentMatch) {
                    observer.disconnect();
                    callback();
                }
            }
        });

        observer.observe(document.body, {subtree: true, childList: true});
    }

    static onAdded(selector, callback) {
        if (document.body.querySelector(selector)) return callback(document.body.querySelector(selector));

        const observer = new MutationObserver((mutations) => {
            for (let m = 0; m < mutations.length; m++) {
                for (let i = 0; i < mutations[m].addedNodes.length; i++) {
                    const mutation = mutations[m].addedNodes[i];
                    if (mutation.nodeType === 3) continue; // ignore text
                    const directMatch = mutation.matches(selector) && mutation;
                    const childrenMatch = mutation.querySelector(selector);
                    if (directMatch || childrenMatch) {
                        observer.disconnect();
                        return callback(directMatch ?? childrenMatch);
                    }
                }
            }
        });

        observer.observe(document.body, {subtree: true, childList: true});

        return () => {observer.disconnect();};
    }

    static isEmpty(obj) {
        if (obj === null || typeof(undefined) === "undefined" || obj === "") return true;
        if (typeof(obj) !== "object") return false;
        if (Array.isArray(obj)) return obj.length == 0;
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) return false;
        }
        return true;
    }

    static isClass(obj) {
        return typeof(obj) === "function" && /^\s*class\s+/.test(obj.toString());
    }

    /**
     * Generates an automatically memoizing version of an object.
     * @author Zerebos
     * @param {Object} object - object to memoize
     * @returns {Proxy} the proxy to the object that memoizes properties
     */
    static memoizeObject(object) {
        const proxy = new Proxy(object, {
            get: function(obj, mod) {
                if (!obj.hasOwnProperty(mod)) return undefined;
                if (Object.getOwnPropertyDescriptor(obj, mod).get) {
                    const value = obj[mod];
                    delete obj[mod];
                    obj[mod] = value;
                }
                return obj[mod];
            },
            set: function(obj, mod, value) {
                if (obj.hasOwnProperty(mod)) return Logger.error("MemoizedObject", "Trying to overwrite existing property");
                obj[mod] = value;
                return obj[mod];
            }
        });

        Object.defineProperty(proxy, "hasOwnProperty", {value: function(prop) {
            return this[prop] !== undefined;
        }});

        return proxy;
    }

    /**
     * Protects prototypes from external assignment.
     * 
     * Needs some work before full usage
     * @param {Class} Component - component with prototype to protect
     */
    static protectPrototype(Component) {
        const descriptors = Object.getOwnPropertyDescriptors(Component.prototype);
        for (const name in descriptors) {
            const descriptor = descriptors[name];
            descriptor.configurable = false;
            descriptor.enumerable = false;
            if (Object.prototype.hasOwnProperty.call(descriptor, "get")) descriptor.set = () => Logger.warn("protectPrototype", "Addon policy for plugins #5 https://github.com/BetterDiscord/BetterDiscord/wiki/Addon-Policies#plugins");
            if (Object.prototype.hasOwnProperty.call(descriptor, "value") && typeof(descriptor.value) === "function") descriptor.value.bind(Component.prototype);
            if (Object.prototype.hasOwnProperty.call(descriptor, "writable")) descriptor.writable = false;
        }
        Object.defineProperties(Component.prototype, descriptors);
    }

    /**
     * Deep extends an object with a set of other objects. Objects later in the list
     * of `extenders` have priority, that is to say if one sets a key to be a primitive,
     * it will be overwritten with the next one with the same key. If it is an object,
     * and the keys match, the object is extended. This happens recursively.
     * @param {object} extendee - Object to be extended
     * @param {...object} extenders - Objects to extend with
     * @returns {object} - A reference to `extendee`
     */
    static extend(extendee, ...extenders) {
        for (let i = 0; i < extenders.length; i++) {
            for (const key in extenders[i]) {
                if (extenders[i].hasOwnProperty(key)) {
                    if (typeof extendee[key] === "object" && typeof extenders[i][key] === "object") {
                        this.extend(extendee[key], extenders[i][key]);
                    }
                    else if (typeof extenders[i][key] === "object") {
                        extendee[key] = {};
                        this.extend(extendee[key], extenders[i][key]);
                    }
                    else {
                        extendee[key] = extenders[i][key];
                    }
                }
            }
        }
        return extendee;
    }

    /**
     * Deep extends an object with a set of other objects. Objects later in the list
     * of `extenders` have priority, that is to say if one sets a key to be a primitive,
     * it will be overwritten with the next one with the same key. If it is an object,
     * and the keys match, the object is extended. This happens recursively.
     * @param {object} extendee - Object to be extended
     * @param {...object} extenders - Objects to extend with
     * @returns {object} - A reference to `extendee`
     */
    static extendTruthy(extendee, ...extenders) {
        for (let i = 0; i < extenders.length; i++) {
            for (const key in extenders[i]) {
                if (extenders[i].hasOwnProperty(key)) {
                    if (typeof extendee[key] === "object" && typeof extenders[i][key] === "object") {
                        this.extendTruthy(extendee[key], extenders[i][key]);
                    }
                    else if (typeof extenders[i][key] === "object") {
                        extendee[key] = {};
                        this.extendTruthy(extendee[key], extenders[i][key]);
                    }
                    else if (extenders[i][key]) {
                        extendee[key] = extenders[i][key];
                    }
                }
            }
        }
        return extendee;
    }

    /**
     * Format strings with placeholders (`{{placeholder}}`) into full strings.
     * Quick example: `PluginUtilities.formatString("Hello, {{user}}", {user: "Zerebos"})`
     * would return "Hello, Zerebos".
     * @param {string} string - string to format
     * @param {object} values - object literal of placeholders to replacements
     * @returns {string} the properly formatted string
     */
    static formatString(string, values) {
        for (const val in values) {
            let replacement = values[val];
            if (Array.isArray(replacement)) replacement = JSON.stringify(replacement);
            if (typeof(replacement) === "object" && replacement !== null) replacement = replacement.toString();
            string = string.replace(new RegExp(`{{${val}}}`, "g"), replacement);
        }
        return string;
    }

    /**
     * Finds a value, subobject, or array from a tree that matches a specific filter.
     * @param {object} tree Tree that should be walked
     * @param {callable} searchFilter Filter to check against each object and subobject
     * @param {object} options Additional options to customize the search
     * @param {Array<string>|null} [options.walkable=null] Array of strings to use as keys that are allowed to be walked on. Null value indicates all keys are walkable
     * @param {Array<string>} [options.ignore=[]] Array of strings to use as keys to exclude from the search, most helpful when `walkable = null`.
     */
    static findInTree(tree, searchFilter, {walkable = null, ignore = []} = {}) {
        if (typeof searchFilter === "string") {
            if (tree.hasOwnProperty(searchFilter)) return tree[searchFilter];
        }
        else if (searchFilter(tree)) {
            return tree;
        }

        if (typeof tree !== "object" || tree == null) return undefined;

        let tempReturn;
        if (tree instanceof Array) {
            for (const value of tree) {
                tempReturn = this.findInTree(value, searchFilter, {walkable, ignore});
                if (typeof tempReturn != "undefined") return tempReturn;
            }
        }
        else {
            const toWalk = walkable == null ? Object.keys(tree) : walkable;
            for (const key of toWalk) {
                if (typeof(tree[key]) == "undefined" || ignore.includes(key)) continue;
                tempReturn = this.findInTree(tree[key], searchFilter, {walkable, ignore});
                if (typeof tempReturn != "undefined") return tempReturn;
            }
        }
        return tempReturn;
    }

    /**
     * Gets a nested property (if it exists) safely. Path should be something like `prop.prop2.prop3`.
     * Numbers can be used for arrays as well like `prop.prop2.array.0.id`.
     * @param {Object} obj - object to get nested property of
     * @param {string} path - representation of the property to obtain
     */
    static getNestedProp(obj, path) {
        return path.split(/\s?\.\s?/).reduce(function(currentObj, prop) {
            return currentObj && currentObj[prop];
        }, obj);
    }

    /**
     * Finds a value, subobject, or array from a tree that matches a specific filter. Great for patching render functions.
     * @param {object} tree React tree to look through. Can be a rendered object or an internal instance.
     * @param {callable} searchFilter Filter function to check subobjects against.
     */
    static findInRenderTree(tree, searchFilter, {walkable = ["props", "children", "child", "sibling"], ignore = []} = {}) {
        return this.findInTree(tree, searchFilter, {walkable, ignore});
    }

    /**
     * Finds a value, subobject, or array from a tree that matches a specific filter. Great for patching render functions.
     * @param {object} tree React tree to look through. Can be a rendered object or an internal instance.
     * @param {callable} searchFilter Filter function to check subobjects against.
     */
    static findInReactTree(tree, searchFilter) {
        return this.findInTree(tree, searchFilter, {walkable: ["props", "children", "return", "stateNode"]});
    }

    static getReactInstance(node) {
        if (node.__reactInternalInstance$) return node.__reactInternalInstance$;
        return node[Object.keys(node).find(k => k.startsWith("__reactInternalInstance") || k.startsWith("__reactFiber"))] || null;
    }

    /**
     * Grabs a value from the react internal instance. Allows you to grab
     * long depth values safely without accessing no longer valid properties.
     * @param {HTMLElement} node - node to obtain react instance of
     * @param {object} options - options for the search
     * @param {array} [options.include] - list of items to include from the search
     * @param {array} [options.exclude=["Popout", "Tooltip", "Scroller", "BackgroundFlash"]] - list of items to exclude from the search
     * @param {callable} [options.filter=_=>_] - filter to check the current instance with (should return a boolean)
     * @return {(*|null)} the owner instance or undefined if not found.
     */
    static getOwnerInstance(node, {include, exclude = ["Popout", "Tooltip", "Scroller", "BackgroundFlash"], filter = _ => _} = {}) {
        if (node === undefined) return undefined;
        const excluding = include === undefined;
        const nameFilter = excluding ? exclude : include;
        function getDisplayName(owner) {
            const type = owner.type;
            if (!type) return null;
            return type.displayName || type.name || null;
        }
        function classFilter(owner) {
            const name = getDisplayName(owner);
            return (name !== null && !!(nameFilter.includes(name) ^ excluding));
        }

        let curr = this.getReactInstance(node);
        for (curr = curr && curr.return; curr !== null; curr = curr.return) {
            const owner = curr.stateNode;
            if (!(owner instanceof HTMLElement) && classFilter(curr) && filter(owner)) return owner;
        }

        return null;
    }
}
/**
 * Allows for grabbing and searching through Discord's webpacked modules.
 * TODO: please for the love of god refactor and/or rewrite
 * @module WebpackModules
 * @version 0.0.2
 */
import Logger from "@common/logger";

/**
 * Checks if a given module matches a set of parameters.
 * @callback module:WebpackModules.Filters~filter
 * @param {*} module - module to check
 * @returns {boolean} - True if the module matches the filter, false otherwise
 */

/**
 * Filters for use with {@link module:WebpackModules} but may prove useful elsewhere.
 */
export class Filters {
    /**
     * Generates a {@link module:WebpackModules.Filters~filter} that filters by a set of properties.
     * @param {Array<string>} props - Array of property names
     * @param {module:WebpackModules.Filters~filter} filter - Additional filter
     * @returns {module:WebpackModules.Filters~filter} - A filter that checks for a set of properties
     */
    static byKeys(props, filter = m => m) {
        return module => {
            if (!module) return false;
            if (typeof(module) !== "object" && typeof(module) !== "function") return false;
            const component = filter(module);
            if (!component) return false;
            for (let p = 0; p < props.length; p++) {
                if (!(props[p] in component)) return false;
            }
            return true;
        };
    }

    /**
     * Generates a {@link module:WebpackModules.Filters~filter} that filters by a set of properties on the object's prototype.
     * @param {Array<string>} fields - Array of property names
     * @param {module:WebpackModules.Filters~filter} filter - Additional filter
     * @returns {module:WebpackModules.Filters~filter} - A filter that checks for a set of properties on the object's prototype
     */
    static byPrototypeKeys(fields, filter = m => m) {
        return module => {
            if (!module) return false;
            if (typeof(module) !== "object" && typeof(module) !== "function") return false;
            const component = filter(module);
            if (!component) return false;
            if (!component.prototype) return false;
            for (let f = 0; f < fields.length; f++) {
                if (!(fields[f] in component.prototype)) return false;
            }
            return true;
        };
    }

    /**
     * Generates a {@link module:WebpackModules.Filters~filter} that filters by a regex.
     * @param {RegExp} search - A RegExp to check on the module
     * @param {module:WebpackModules.Filters~filter} filter - Additional filter
     * @returns {module:WebpackModules.Filters~filter} - A filter that checks for a set of properties
     */
    static byRegex(search, filter = m => m) {
        return module => {
            const method = filter(module);
            if (!method) return false;
            let methodString = "";
            try {methodString = method.toString([]);}
            catch (err) {methodString = method.toString();}
            return methodString.search(search) !== -1;
        };
    }

    /**
     * Generates a {@link module:WebpackModules.Filters~filter} that filters by source code content.
     * @param {...(string|RegExp)} searches - Strings or RegExps to match against the module's source
     * @returns {module:WebpackModules.Filters~filter} - A filter that checks module source
     */
    static bySource(...searches) {
        return (exports, module) => {
            if (!module?.id) return false;
            let source = "";
            try {
                source = WebpackModules.require.m[module.id].toString();
            }
            catch (err) {
                return false;
            }
            if (!source) return false;

            return searches.every(search => {
                if (typeof search === "string") return source.includes(search);
                return Boolean(source.match(search));
            });
        };
    }

    /**
     * Generates a {@link module:WebpackModules.Filters~filter} that filters by strings.
     * @param {...String} search - A RegExp to check on the module
     * @returns {module:WebpackModules.Filters~filter} - A filter that checks for a set of strings
     */
    static byStrings(...strings) {
        return module => {
            if (!module?.toString || typeof(module?.toString) !== "function") return; // Not stringable
            let moduleString = "";
            try {moduleString = module?.toString([]);}
            catch (err) {moduleString = module?.toString();}
            if (!moduleString) return false; // Could not create string
            for (const s of strings) {
                if (!moduleString.includes(s)) return false;
            }
            return true;
        };
    }

    /**
     * Generates a {@link module:WebpackModules.Filters~filter} that filters by a set of properties.
     * @param {string} name - Name the module should have
     * @returns {module:WebpackModules.Filters~filter} - A filter that checks for a set of properties
     */
    static byDisplayName(name) {
        return module => {
            return module && module.displayName === name;
        };
    }

    /**
     * Generates a {@link module:WebpackModules.Filters~filter} that filters by a set of properties.
     * @param {string} name - Name the store should have (usually includes the word Store)
     * @returns {module:WebpackModules.Filters~filter} - A filter that checks for a set of properties
     */
    static byStoreName(name) {
        return module => {
            return module?._dispatchToken && module?.getName?.() === name;
        };
    }

    /**
     * Generates a combined {@link module:WebpackModules.Filters~filter} from a list of filters.
     * @param {...module:WebpackModules.Filters~filter} filters - A list of filters
     * @returns {module:WebpackModules.Filters~filter} - Combinatory filter of all arguments
     */
    static combine(...filters) {
        return (exports, module, id) => {
            return filters.every(filter => filter(exports, module, id));
        };
    }
}


const hasThrown = new WeakSet();

const wrapFilter = filter => (exports, module, moduleId) => {
    try {
        if (exports instanceof Window) return false;
        if (exports?.default?.remove && exports?.default?.set && exports?.default?.clear && exports?.default?.get && !exports?.default?.sort) return false;
        if (exports.remove && exports.set && exports.clear && exports.get && !exports.sort) return false;
        if (exports?.default?.getToken || exports?.default?.getEmail || exports?.default?.showToken) return false;
        if (exports.getToken || exports.getEmail || exports.showToken) return false;
        return filter(exports, module, moduleId);
    }
    catch (error) {
        if (!hasThrown.has(filter)) Logger.warn("WebpackModules~getModule", "Module filter threw an exception.", error, {filter, module});
        hasThrown.add(filter);
        return false;
    }
};

const TypedArray = Object.getPrototypeOf(Uint8Array);
function shouldSkipModule(exports) {
    if (!exports) return true;
    if (exports.TypedArray) return true;
    if (exports === window) return true;
    if (exports === document.documentElement) return true;
    if (exports[Symbol.toStringTag] === "DOMTokenList") return true;
    if (exports === Symbol) return true;
    if (exports instanceof Window) return true;
    if (exports instanceof TypedArray) return true;
    return false;
}

export default class WebpackModules {

    static find(filter, first = true) {return this.getModule(filter, {first});}
    static findAll(filter) {return this.getModule(filter, {first: false});}
    static findByUniqueProperties(props, first = true) {return first ? this.getByProps(...props) : this.getAllByProps(...props);}
    static findByDisplayName(name) {return this.getByDisplayName(name);}

    /**
     * A Proxy that returns the module source by ID.
     */
    static modules = new Proxy({}, {
        ownKeys() {return Object.keys(WebpackModules.require.m);},
        getOwnPropertyDescriptor() {
            return {
                enumerable: true,
                configurable: true, // Not actually
            };
        },
        get(_, k) {
            return WebpackModules.require.m[k];
        },
        set() {
            throw new Error("[WebpackModules~modules] Setting modules is not allowed.");
        }
    });

    /**
     * Finds a module using a filter function.
     * @param {function} filter A function to use to filter modules
     * @param {object} [options] Set of options to customize the search
     * @param {Boolean} [options.first=true] Whether to return only the first matching module
     * @param {Boolean} [options.defaultExport=true] Whether to return default export when matching the default export
     * @param {Boolean} [options.searchExports=false] Whether to execute the filter on webpack export getters.
     * @param {Boolean} [options.raw=false] Whether to return the whole Module object when matching exports
     * @return {Any}
     */
    static getModule(filter, options = {}) {
        const {first = true, defaultExport = true, searchExports = false, raw = false} = options;
        const wrappedFilter = wrapFilter(filter);

        const modules = this.getAllModules();
        const rm = [];
        const indices = Object.keys(modules);
        for (let i = 0; i < indices.length; i++) {
            const index = indices[i];
            if (!modules.hasOwnProperty(index)) continue;

            let module = null;
            try {module = modules[index];}
            catch {continue;}

            const {exports} = module;
            if (shouldSkipModule(exports)) continue;

            if (typeof(exports) === "object" && searchExports && !exports.TypedArray) {
                for (const key in exports) {
                    let foundModule = null;
                    let wrappedExport = null;
                    try {wrappedExport = exports[key];}
                    catch {continue;}

                    if (!wrappedExport) continue;
                    if (wrappedFilter(wrappedExport, module, index)) foundModule = wrappedExport;
                    if (!foundModule) continue;
                    if (raw) foundModule = module;
                    if (first) return foundModule;
                    rm.push(foundModule);
                }
            }
            else {
                let foundModule = null;
                if (exports.Z && wrappedFilter(exports.Z, module, index)) foundModule = defaultExport ? exports.Z : exports;
                if (exports.ZP && wrappedFilter(exports.ZP, module, index)) foundModule = defaultExport ? exports.ZP : exports;
                if (exports.__esModule && exports.default && wrappedFilter(exports.default, module, index)) foundModule = defaultExport ? exports.default : exports;
                if (wrappedFilter(exports, module, index)) foundModule = exports;
                if (!foundModule) continue;
                if (raw) foundModule = module;
                if (first) return foundModule;
                rm.push(foundModule);
            }


        }

        return first || rm.length == 0 ? undefined : rm;
    }

    /**
     * Finds multiple modules using multiple filters.
     *
     * @param {...object} queries Whether to return only the first matching module
     * @param {Function} queries.filter A function to use to filter modules
     * @param {Boolean} [queries.first=true] Whether to return only the first matching module
     * @param {Boolean} [queries.defaultExport=true] Whether to return default export when matching the default export
     * @param {Boolean} [queries.searchExports=false] Whether to execute the filter on webpack export getters.
     * @param {Boolean} [queries.raw=false] Whether to return the whole Module object when matching exports
     * @return {Any}
     */
    static getBulk(...queries) {
        const modules = this.getAllModules();
        const returnedModules = Array(queries.length);
        const indices = Object.keys(modules);
        for (let i = 0; i < indices.length; i++) {
            const index = indices[i];
            if (!modules.hasOwnProperty(index)) continue;
            const module = modules[index];
            const {exports} = module;
            if (shouldSkipModule(exports)) continue;

            for (let q = 0; q < queries.length; q++) {
                const query = queries[q];
                const {filter, first = true, defaultExport = true, searchExports = false, raw = false} = query;
                if (first && returnedModules[q]) continue; // If they only want the first, and we already found it, move on
                if (!first && !returnedModules[q]) returnedModules[q] = []; // If they want multiple and we haven't setup the subarry, do it now

                const wrappedFilter = wrapFilter(filter);

                if (typeof(exports) === "object" && searchExports && !exports.TypedArray) {
                    for (const key in exports) {
                        let foundModule = null;
                        const wrappedExport = exports[key];
                        if (!wrappedExport) continue;
                        if (wrappedFilter(wrappedExport, module, index)) foundModule = wrappedExport;
                        if (!foundModule) continue;
                        if (raw) foundModule = module;
                        if (first) returnedModules[q] = foundModule;
                        else returnedModules[q].push(foundModule);
                    }
                }
                else {
                    let foundModule = null;
                    if (exports.Z && wrappedFilter(exports.Z, module, index)) foundModule = defaultExport ? exports.Z : exports;
                    if (exports.ZP && wrappedFilter(exports.ZP, module, index)) foundModule = defaultExport ? exports.ZP : exports;
                    if (exports.__esModule && exports.default && wrappedFilter(exports.default, module, index)) foundModule = defaultExport ? exports.default : exports;
                    if (wrappedFilter(exports, module, index)) foundModule = exports;
                    if (!foundModule) continue;
                    if (raw) foundModule = module;
                    if (first) returnedModules[q] = foundModule;
                    else returnedModules[q].push(foundModule);
                }
            }
        }

        return returnedModules;
    }

    /**
     * Searches for a module by value, returns module & matched key. Useful in combination with the Patcher.
     * @param {(value: any, index: number, array: any[]) => boolean} filter A function to use to filter the module
     * @param {object} [options] Set of options to customize the search
     * @param {any} [options.target=null] Optional module target to look inside.
     * @param {Boolean} [options.defaultExport=true] Whether to return default export when matching the default export
     * @param {Boolean} [options.searchExports=false] Whether to execute the filter on webpack export getters.
     * @param {Boolean} [options.raw=false] Whether to return the whole Module object when matching exports
     * @return {[Any, string]}
     */
    static *getWithKey(filter, {target = null, ...rest} = {}) {
        yield target ??= this.getModule(exports =>
            Object.values(exports).some(filter),
            rest
        );

        yield target && Object.keys(target).find(k => filter(target[k]));
    }

    /**
     * Gets a module's mangled properties by mapping them to friendly names.
     * @template T The type of the resulting object with friendly property names.
     * @memberof Webpack
     * @param  {(exports: any, module: any, id: any) => boolean | string | RegExp} filter Filter to find the module. Can be a filter function, string, or RegExp for source matching.
     * @param {Record<keyof T, (prop: any) => boolean>} mangled Object mapping desired property names to their filter functions.
     * @param {object} [options] Options to configure the search.
     * @param {boolean} [options.defaultExport=true] Whether to return default export when matching the default export.
     * @param {boolean} [options.searchExports=false] Whether to execute the filter on webpack exports.
     * @param {boolean} [options.raw=false] Whether to return the whole Module object when matching exports
     * @returns {T} Object containing the mangled properties with friendly names.
     */
    static getMangled(filter, mangled, options = {}) {
        const {defaultExport = false, searchExports = false, raw = false} = options;

        if (typeof filter === "string" || filter instanceof RegExp) {
            filter = Filters.bySource(filter);
        }

        const returnValue = {};
        let module = this.getModule(
            (exports, moduleInstance, id) => {
                if (!(exports instanceof Object)) return false;
                return filter(exports, moduleInstance, id);
            },
            {defaultExport, searchExports, raw}
        );

        if (!module) return returnValue;
        if (raw) module = module.exports;

        const mangledEntries = Object.entries(mangled);

        for (const searchKey in module) {
            if (!Object.prototype.hasOwnProperty.call(module, searchKey)) continue;

            for (const [key, propertyFilter] of mangledEntries) {
                if (key in returnValue) continue;

                if (propertyFilter(module[searchKey])) {
                    Object.defineProperty(returnValue, key, {
                        get() {
                            return module[searchKey];
                        },
                        set(value) {
                            module[searchKey] = value;
                        },
                        enumerable: true,
                        configurable: false,
                    });
                }
            }
        }

        return returnValue;
    }

    /**
     * Finds all modules matching a filter function.
     * @param {Function} filter A function to use to filter modules
     */
    static getModules(filter) {return this.getModule(filter, {first: false});}

    /**
     * Finds a module by its display name.
     * @param {String} name The display name of the module
     * @return {Any}
     */
    static getByDisplayName(name) {
        return this.getModule(Filters.byDisplayName(name));
    }

    /**
     * Finds a module using its code.
     * @param {RegEx} regex A regular expression to use to filter modules
     * @param {Boolean} first Whether to return the only the first matching module
     * @return {Any}
     */
    static getByRegex(regex, first = true) {
        return this.getModule(Filters.byRegex(regex), {first});
    }

    /**
     * Finds a single module using properties on its prototype.
     * @param {...string} prototypes Properties to use to filter modules
     * @return {Any}
     */
    static getByPrototypes(...prototypes) {
        return this.getModule(Filters.byPrototypeKeys(prototypes));
    }

    /**
     * Finds all modules with a set of properties of its prototype.
     * @param {...string} prototypes Properties to use to filter modules
     * @return {Any}
     */
    static getAllByPrototypes(...prototypes) {
        return this.getModule(Filters.byPrototypeKeys(prototypes), {first: false});
    }

    /**
     * Finds a single module using its own properties.
     * @param {...string} props Properties to use to filter modules
     * @return {Any}
     */
    static getByProps(...props) {
        return this.getModule(Filters.byKeys(props));
    }

    /**
     * Finds all modules with a set of properties.
     * @param {...string} props Properties to use to filter modules
     * @return {Any}
     */
    static getAllByProps(...props) {
        return this.getModule(Filters.byKeys(props), {first: false});
    }

    /**
     * Finds a single module using a set of strings.
     * @param {...String} props Strings to use to filter modules
     * @return {Any}
     */
    static getByString(...strings) {
        return this.getModule(Filters.byStrings(...strings));
    }

    /**
     * Finds a module using its source code.
     * @param {String|RegExp} match String or regular expression to use to filter modules
     * @param {Boolean} first Whether to return only the first matching module
     * @return {Any}
     */
    static getBySource(match, first = true) {
        return this.getModule(Filters.bySource(match), {first});
    }

    /**
     * Finds all modules matching source code content.
     * @param {String|RegExp} match String or regular expression to use to filter modules
     * @return {Any}
     */
    static getAllBySource(match) {
        return this.getModule(Filters.bySource(match), {first: false});
    }

    /**
     * Finds all modules with a set of strings.
     * @param {...String} strings Strings to use to filter modules
     * @return {Any}
     */
    static getAllByString(...strings) {
        return this.getModule(Filters.byStrings(...strings), {first: false});
    }

    /**
     * Finds a module that lazily loaded.
     * @param {(m) => boolean} filter A function to use to filter modules.
     * @param {object} [options] Set of options to customize the search
     * @param {AbortSignal} [options.signal] AbortSignal of an AbortController to cancel the promise
     * @param {Boolean} [options.defaultExport=true] Whether to return default export when matching the default export
     * @param {Boolean} [options.searchExports=false] Whether to execute the filter on webpack export getters.
     * @param {Boolean} [options.raw=false] Whether to return the whole Module object when matching exports
     * @returns {Promise<any>}
     */
    static getLazy(filter, options = {}) {
        const {signal: abortSignal, defaultExport = true, searchExports = false, raw = false} = options;
        const fromCache = this.getModule(filter, {defaultExport, searchExports});
        if (fromCache) return Promise.resolve(fromCache);

        const wrappedFilter = wrapFilter(filter);

        return new Promise((resolve) => {
            const cancel = () => this.removeListener(listener);
            const listener = function(exports, module, id) {
                if (shouldSkipModule(exports)) return;

                let foundModule = null;
                if (typeof(exports) === "object" && searchExports && !exports.TypedArray) {
                    for (const key in exports) {
                        foundModule = null;
                        const wrappedExport = exports[key];
                        if (!wrappedExport) continue;
                        if (wrappedFilter(wrappedExport, module, id)) foundModule = wrappedExport;
                    }
                }
                else {
                    if (exports.Z && wrappedFilter(exports.Z, module, id)) foundModule = defaultExport ? exports.Z : exports;
                    if (exports.ZP && wrappedFilter(exports.ZP, module, id)) foundModule = defaultExport ? exports.ZP : exports;
                    if (exports.__esModule && exports.default && wrappedFilter(exports.default, module, id)) foundModule = defaultExport ? exports.default : exports;
                    if (wrappedFilter(exports, module, id)) foundModule = exports;

                }

                if (!foundModule) return;
                if (raw) foundModule = module;
                cancel();
                resolve(foundModule);
            };

            this.addListener(listener);
            abortSignal?.addEventListener("abort", () => {
                cancel();
                resolve();
            });
        });
    }

    /**
     * Discord's __webpack_require__ function.
     */
    static get require() {
        if (this._require) return this._require;
        const id = Symbol("BetterDiscord");
        let __discord_webpack_require__;

        if (typeof(window[this.chunkName]) !== "undefined") {
            window[this.chunkName].push([[id],
                {},
                __internal_require__ => {
                    if ("b" in __internal_require__) {
                        __discord_webpack_require__ = __internal_require__;
                        listenToModules(__discord_webpack_require__.m);
                    }
                }
            ]);
        }

        delete __discord_webpack_require__.m[id];
        delete __discord_webpack_require__.c[id];
        return this._require = __discord_webpack_require__;
    }

    /**
     * Returns all loaded modules.
     * @return {Array}
     */
    static getAllModules() {
        return this.require.c;
    }

    // Webpack Chunk Observing
    static get chunkName() {return "webpackChunkdiscord_app";}

    static initialize() {
        this.handlePush = this.handlePush.bind(this);
        this.listeners = new Set();

        this.__ORIGINAL_PUSH__ = window[this.chunkName].push;
        Object.defineProperty(window[this.chunkName], "push", {
            configurable: true,
            get: () => this.handlePush,
            set: (newPush) => {
                this.__ORIGINAL_PUSH__ = newPush;

                Object.defineProperty(window[this.chunkName], "push", {
                    value: this.handlePush,
                    configurable: true,
                    writable: true
                });
            }
        });
    }

    /**
     * Adds a listener for when discord loaded a chunk. Useful for subscribing to lazy loaded modules.
     * @param {Function} listener - Function to subscribe for chunks
     * @returns {Function} A cancelling function
     */
     static addListener(listener) {
        this.listeners.add(listener);
        return this.removeListener.bind(this, listener);
    }

    /**
     * Removes a listener for when discord loaded a chunk.
     * @param {Function} listener
     * @returns {boolean}
     */
    static removeListener(listener) {return this.listeners.delete(listener);}

    static handlePush(chunk) {
        const [, modules] = chunk;

        listenToModules(modules);

        return Reflect.apply(this.__ORIGINAL_PUSH__, window[this.chunkName], [chunk]);
    }
}

function listenToModules(modules) {
    for (const moduleId in modules) {
        const originalModule = modules[moduleId];

        modules[moduleId] = (module, exports, require) => {
            try {
                Reflect.apply(originalModule, null, [module, exports, require]);

                const listeners = [...WebpackModules.listeners];
                for (let i = 0; i < listeners.length; i++) {
                    try {listeners[i](exports, module, module.id);}
                    catch (error) {
                        Logger.stacktrace("WebpackModules", "Could not fire callback listener:", error);
                    }
                }
            }
            catch (error) {
                Logger.stacktrace("WebpackModules", "Could not patch pushed module", error);
            }
            finally {
                require.m[moduleId] = originalModule;
            }
        };

        Object.assign(modules[moduleId], originalModule, {
            toString: () => originalModule.toString()
        });
    }
}

WebpackModules.initialize();

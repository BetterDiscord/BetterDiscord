/**
 * Allows for grabbing and searching through Discord's webpacked modules.
 * @module WebpackModules
 * @version 0.0.2
 */
import Logger from "../../../common/logger";

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
    static byProps(props, filter = m => m) {
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
    static byPrototypeFields(fields, filter = m => m) {
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
     * @param {module:WebpackModules.Filters~filter} filter - Additional filter
     * @returns {module:WebpackModules.Filters~filter} - A filter that checks for a set of properties
     */
    static byDisplayName(name) {
        return module => {
            return module && module.displayName === name;
        };
    }

    /**
     * Generates a combined {@link module:WebpackModules.Filters~filter} from a list of filters.
     * @param {...module:WebpackModules.Filters~filter} filters - A list of filters
     * @returns {module:WebpackModules.Filters~filter} - Combinatory filter of all arguments
     */
    static combine(...filters) {
        return module => {
            return filters.every(filter => filter(module));
        };
    }
}


const hasThrown = new WeakSet();

const wrapFilter = filter => (exports, module, moduleId) => {
    try {
        if (exports?.default?.remove && exports?.default?.set && exports?.default?.clear && exports?.default?.get && !exports?.default?.sort) return false;
        if (exports.remove && exports.set && exports.clear && exports.get && !exports.sort) return false;
        if (exports?.default?.getToken || exports?.default?.getEmail || exports?.default?.showToken) return false;
        if (exports.getToken || exports.getEmail || exports.showToken) return false;
        return filter(exports, module, moduleId);
    }
    catch (err) {
        if (!hasThrown.has(filter)) Logger.warn("WebpackModules~getModule", "Module filter threw an exception.", filter, err);
        hasThrown.add(filter);
        return false;
    }
};

export default class WebpackModules {

    static find(filter, first = true) {return this.getModule(filter, {first});}
    static findAll(filter) {return this.getModule(filter, {first: false});}
    static findByUniqueProperties(props, first = true) {return first ? this.getByProps(...props) : this.getAllByProps(...props);}
    static findByDisplayName(name) {return this.getByDisplayName(name);}

    /**
     * Finds a module using a filter function.
     * @param {function} filter A function to use to filter modules
     * @param {object} [options] Set of options to customize the search
     * @param {Boolean} [options.first=true] Whether to return only the first matching module
     * @param {Boolean} [options.defaultExport=true] Whether to return default export when matching the default export
     * @param {Boolean} [options.searchExports=false] Whether to execute the filter on webpack export getters.
     * @return {Any}
     */
    static getModule(filter, options = {}) {
        const {first = true, defaultExport = true, searchExports = false} = options;
        const wrappedFilter = wrapFilter(filter);

        const modules = this.getAllModules();
        const rm = [];
        const indices = Object.keys(modules);
        for (let i = 0; i < indices.length; i++) {
            const index = indices[i];
            if (!modules.hasOwnProperty(index)) continue;
            const module = modules[index];
            const {exports} = module;
            if (!exports || exports === window || exports === document.documentElement) continue;
            
            if (typeof(exports) === "object" && searchExports) {
                for (const key in exports) {
                    let foundModule = null;
                    const wrappedExport = exports[key];
                    if (!wrappedExport) continue;
                    if (wrappedFilter(wrappedExport, module, index)) foundModule = wrappedExport;
                    if (!foundModule) continue;
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
            if (!exports || exports === window || exports === document.documentElement) continue;

            for (let q = 0; q < queries.length; q++) {
                const query = queries[q];
                const {filter, first = true, defaultExport = true, searchExports = false} = query;
                if (first && returnedModules[q]) continue; // If they only want the first, and we already found it, move on
                if (!first && !returnedModules[q]) returnedModules[q] = []; // If they want multiple and we haven't setup the subarry, do it now

                const wrappedFilter = wrapFilter(filter);

                if (typeof(exports) === "object" && searchExports) {
                    for (const key in exports) {
                        let foundModule = null;
                        const wrappedExport = exports[key];
                        if (!wrappedExport) continue;
                        if (wrappedFilter(wrappedExport, module, index)) foundModule = wrappedExport;
                        if (!foundModule) continue;
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
                    if (first) returnedModules[q] = foundModule;
                    else returnedModules[q].push(foundModule);
                }
            }
        }
        
        return returnedModules;
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
        return this.getModule(Filters.byPrototypeFields(prototypes));
    }

    /**
     * Finds all modules with a set of properties of its prototype.
     * @param {...string} prototypes Properties to use to filter modules
     * @return {Any}
     */
    static getAllByPrototypes(...prototypes) {
        return this.getModule(Filters.byPrototypeFields(prototypes), {first: false});
    }

    /**
     * Finds a single module using its own properties.
     * @param {...string} props Properties to use to filter modules
     * @return {Any}
     */
    static getByProps(...props) {
        return this.getModule(Filters.byProps(props));
    }

    /**
     * Finds all modules with a set of properties.
     * @param {...string} props Properties to use to filter modules
     * @return {Any}
     */
    static getAllByProps(...props) {
        return this.getModule(Filters.byProps(props), {first: false});
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
     * @returns {Promise<any>}
     */
    static getLazy(filter, options = {}) {
        const {signal: abortSignal, defaultExport = true, searchExports = false} = options;
        const fromCache = this.getModule(filter, {defaultExport, searchExports});
        if (fromCache) return Promise.resolve(fromCache);

        const wrappedFilter = wrapFilter(filter);

        return new Promise((resolve) => {
            const cancel = () => this.removeListener(listener);
            const listener = function(exports) {
                if (!exports || exports === window || exports === document.documentElement) return;

                let foundModule = null;
                if (typeof(exports) === "object" && searchExports) {
                    for (const key in exports) {
                        foundModule = null;
                        const wrappedExport = exports[key];
                        if (!wrappedExport) continue;
                        if (wrappedFilter(wrappedExport)) foundModule = wrappedExport;
                    }
                }
                else {
                    if (exports.Z && wrappedFilter(exports.Z)) foundModule = defaultExport ? exports.Z : exports;
                    if (exports.ZP && wrappedFilter(exports.ZP)) foundModule = defaultExport ? exports.ZP : exports;
                    if (exports.__esModule && exports.default && wrappedFilter(exports.default)) foundModule = defaultExport ? exports.default : exports;
                    if (wrappedFilter(exports)) foundModule = exports;

                }
                
                if (!foundModule) return;
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
        const id = "bd-webpackmodules";
        let __discord_webpack_require__;
        if (typeof(webpackJsonp) !== "undefined") {
            __discord_webpack_require__ = window.webpackJsonp.push([[], {
                [id]: (module, exports, __internal_require__) => module.exports = __internal_require__
            }, [[id]]]);
        }
        else if (typeof(window[this.chunkName]) !== "undefined") {
            window[this.chunkName].push([[id], 
                {},
                __internal_require__ => __discord_webpack_require__ = __internal_require__
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

        for (const moduleId in modules) {
            const originalModule = modules[moduleId];

            modules[moduleId] = (module, exports, require) => {
                try {
                    Reflect.apply(originalModule, null, [module, exports, require]);

                    const listeners = [...this.listeners];
                    for (let i = 0; i < listeners.length; i++) {
                        try {listeners[i](exports);}
                        catch (error) {
                            Logger.stacktrace("WebpackModules", "Could not fire callback listener:", error);
                        }
                    }
                }
                catch (error) {
                    Logger.stacktrace("WebpackModules", "Could not patch pushed module", error);
                }
            };

            Object.assign(modules[moduleId], originalModule, {
                toString: () => originalModule.toString()
            });
        }

        return Reflect.apply(this.__ORIGINAL_PUSH__, window[this.chunkName], [chunk]);
    }
}

WebpackModules.initialize();
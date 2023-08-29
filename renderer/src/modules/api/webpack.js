import Logger from "@common/logger";

import WebpackModules, {Filters} from "@modules/webpackmodules";


const getOptions = (args, defaultOptions = {}) => {
    if (args.length > 1 &&
        typeof(args[args.length - 1]) === "object" &&
        !Array.isArray(args[args.length - 1]) &&
        args[args.length - 1] !== null
    ) {
        Object.assign(defaultOptions, args.pop());
    }

    return defaultOptions;
};

/**
 * `Webpack` is a utility class for getting internal webpack modules. Instance is accessible through the {@link BdApi}.
 * This is extremely useful for interacting with the internals of Discord.
 * @type Webpack
 * @summary {@link Webpack} is a utility class for getting internal webpack modules.
 * @name Webpack
 */
const Webpack = {
    /**
     * A Proxy that returns the module source by ID.
     */
    modules: WebpackModules.modules,

    /**
     * Series of {@link Filters} to be used for finding webpack modules.
     * @type Filters
     * @memberof Webpack
     */
    Filters: {
        /**
         * @deprecated
         */
        byProps(...props) {return Filters.byKeys(props);},

        /**
         * Generates a function that filters by a set of properties.
         * @param {...string} keys List of property names
         * @returns {function} A filter that checks for a set of properties
         */
        byKeys(...keys) {return Filters.byKeys(keys);},

        /**
         * @deprecated
         */
        byPrototypeFields(...props) {return Filters.byPrototypeKeys(props);},

        /**
         * Generates a function that filters by a set of properties on the object's prototype.
         * @param {...string} props List of property names
         * @returns {function} A filter that checks for a set of properties on the object's prototype.
         */
        byPrototypeKeys(...props) {return Filters.byPrototypeKeys(props);},

        /**
         * Generates a function that filters by a regex.
         * @param {RegExp} search A RegExp to check on the module
         * @param {function} filter Additional filter
         * @returns {function} A filter that checks for a regex match
         */
        byRegex(regex) {return Filters.byRegex(regex);},

        /**
         * Generates a function that filters by strings.
         * @param {...string} strings A list of strings
         * @returns {function} A filter that checks for a set of strings
         */
        byStrings(...strings) {return Filters.byStrings(...strings);},

        /**
         * Generates a function that filters by the `displayName` property.
         * @param {string} name Name the module should have
         * @returns {function} A filter that checks for a `displayName` match
         */
        byDisplayName(name) {return Filters.byDisplayName(name);},

        /**
         * Generates a function that filters by a specific internal Store name.
         * @param {string} name Name the store should have
         * @returns {function} A filter that checks for a Store name match
         */
        byStoreName(name) {return Filters.byStoreName(name);},

        /**
         * Generates a combined function from a list of filters.
         * @param {...function} filters A list of filters
         * @returns {function} Combinatory filter of all arguments
         */
        combine(...filters) {return Filters.combine(...filters);},
    },

    /**
     * Searches for a module by value, returns module & matched key. Useful in combination with the Patcher. 
     * @param {(value: any, index: number, array: any[]) => boolean} filter A function to use to filter the module
     * @param {object} [options] Set of options to customize the search
     * @param {any} [options.target=null] Optional module target to look inside.
     * @param {Boolean} [options.defaultExport=true] Whether to return default export when matching the default export
     * @param {Boolean} [options.searchExports=false] Whether to execute the filter on webpack export getters. 
     * @return {[Any, string]}
     */
    getWithKey(filter, options = {}) {
        if (("first" in options)) return Logger.error("BdApi.Webpack~getWithKey", "Unsupported option first.");
        if (("defaultExport" in options) && typeof(options.defaultExport) !== "boolean") return Logger.error("BdApi.Webpack~getWithKey", "Unsupported type used for options.defaultExport", options.defaultExport, "boolean expected.");
        if (("searchExports" in options) && typeof(options.searchExports) !== "boolean") return Logger.error("BdApi.Webpack~getWithKey", "Unsupported type used for options.searchExports", options.searchExports, "boolean expected.");
        return WebpackModules.getWithKey(filter, options);
    },

    /**
     * Finds a module using a filter function.
     * @memberof Webpack
     * @param {function} filter A function to use to filter modules. It is given exports, module, and moduleID. Return `true` to signify match.
     * @param {object} [options] Options to configure the search
     * @param {boolean} [options.first=true] Whether to return only the first matching module
     * @param {boolean} [options.defaultExport=true] Whether to return default export when matching the default export
     * @param {boolean} [options.searchExports=false] Whether to execute the filter on webpack exports
     * @return {any}
     */
    getModule(filter, options = {}) {
        if (("first" in options) && typeof(options.first) !== "boolean") return Logger.error("BdApi.Webpack~get", "Unsupported type used for options.first", options.first, "boolean expected.");
        if (("defaultExport" in options) && typeof(options.defaultExport) !== "boolean") return Logger.error("BdApi.Webpack~getModule", "Unsupported type used for options.defaultExport", options.defaultExport, "boolean expected.");
        if (("searchExports" in options) && typeof(options.searchExports) !== "boolean") return Logger.error("BdApi.Webpack~getModule", "Unsupported type used for options.searchExports", options.searchExports, "boolean expected.");
        return WebpackModules.getModule(filter, options);
    },

    /**
     * Finds all modules matching a filter function.
     * @param {Function} filter A function to use to filter modules
     * @param {object} [options] Options to configure the search
     * @param {Boolean} [options.defaultExport=true] Whether to return default export when matching the default export
     * @param {Boolean} [options.searchExports=false] Whether to execute the filter on webpack exports
     * @return {any[]}
     */
    getModules(filter, options = {}) {
        if (("defaultExport" in options) && typeof(options.defaultExport) !== "boolean") return Logger.error("BdApi.Webpack~getModules", "Unsupported type used for options.defaultExport", options.defaultExport, "boolean expected.");
        if (("searchExports" in options) && typeof(options.searchExports) !== "boolean") return Logger.error("BdApi.Webpack~getModules", "Unsupported type used for options.searchExports", options.searchExports, "boolean expected.");
        return WebpackModules.getModule(filter, Object.assign(options, {first: false}));
    },

    /**
     * Finds multiple modules using multiple filters.
     * @memberof Webpack
     * @param {...object} queries Object representing the query to perform
     * @param {function} queries.filter A function to use to filter modules
     * @param {boolean} [queries.first=true] Whether to return only the first matching module
     * @param {boolean} [queries.defaultExport=true] Whether to return default export when matching the default export
     * @param {boolean} [queries.searchExports=false] Whether to execute the filter on webpack exports
     * @return {any}
     */
    getBulk(...queries) {return WebpackModules.getBulk(...queries);},

    /**
     * Finds a module that is lazily loaded.
     * @memberof Webpack
     * @param {function} filter A function to use to filter modules. It is given exports. Return `true` to signify match.
     * @param {object} [options] Options for configuring the listener
     * @param {AbortSignal} [options.signal] AbortSignal of an AbortController to cancel the promise
     * @param {boolean} [options.defaultExport=true] Whether to return default export when matching the default export
     * @param {boolean} [options.searchExports=false] Whether to execute the filter on webpack exports
     * @returns {Promise<any>}
     */
    waitForModule(filter, options = {}) {
        if (("defaultExport" in options) && typeof(options.defaultExport) !== "boolean") return Logger.error("BdApi.Webpack~waitForModule", "Unsupported type used for options.defaultExport", options.defaultExport, "boolean expected.");
        if (("signal" in options) && !(options.signal instanceof AbortSignal)) return Logger.error("BdApi.Webpack~waitForModule", "Unsupported type used for options.signal", options.signal, "AbortSignal expected.");
        if (("searchExports" in options) && typeof(options.searchExports) !== "boolean") return Logger.error("BdApi.Webpack~waitForModule", "Unsupported type used for options.searchExports", options.searchExports, "boolean expected.");
        return WebpackModules.getLazy(filter, options);
    },

    /**
     * Finds a module using its code.
     * @param {RegEx} regex A regular expression to use to filter modules
     * @param {object} [options] Options to configure the search
     * @param {Boolean} [options.defaultExport=true] Whether to return default export when matching the default export
     * @param {Boolean} [options.searchExports=false] Whether to execute the filter on webpack exports
     * @return {Any}
     */
    getByRegex(regex, options = {}) {
        return WebpackModules.getModule(Filters.byRegex(regex), options);
    },

    /**
     * Finds all modules using its code.
     * @param {RegEx} regex A regular expression to use to filter modules
     * @param {object} [options] Options to configure the search
     * @param {Boolean} [options.defaultExport=true] Whether to return default export when matching the default export
     * @param {Boolean} [options.searchExports=false] Whether to execute the filter on webpack exports
     * @return {Any[]}
     */
    getAllByRegex(regex, options = {}) {
        return WebpackModules.getModule(Filters.byRegex(regex), Object.assign({}, options, {first: true}));
    },

    /**
     * Finds a single module using properties on its prototype.
     * @param {...string} prototypes Properties to use to filter modules
     * @return {Any}
     */
    getByPrototypeKeys(...prototypes) {
        const options = getOptions(prototypes);

        return WebpackModules.getModule(Filters.byPrototypeKeys(prototypes), options);
    },

    /**
     * Finds all modules with a set of properties of its prototype.
     * @param {...string} prototypes Properties to use to filter modules
     * @return {Any[]}
     */
    getAllByPrototypeKeys(...prototypes) {
        const options = getOptions(prototypes, {first: false});

        return WebpackModules.getModule(Filters.byPrototypeKeys(prototypes), options);
    },

    /**
     * Finds a single module using its own properties.
     * @param {...string} props Properties to use to filter modules
     * @return {Any}
     */
    getByKeys(...props) {
        const options = getOptions(props);

        return WebpackModules.getModule(Filters.byKeys(props), options);
    },

    /**
     * Finds all modules with a set of properties.
     * @param {...string} props Properties to use to filter modules
     * @return {Any[]}
     */
    getAllByKeys(...props) {
        const options = getOptions(props, {first: false});

        return WebpackModules.getModule(Filters.byKeys(props), options);
    },

    /**
     * Finds a single module using a set of strings.
     * @param {...String} props Strings to use to filter modules
     * @return {Any}
     */
    getByStrings(...strings) {
        const options = getOptions(strings);

        return WebpackModules.getModule(Filters.byStrings(...strings), options);
    },

    /**
     * Finds all modules with a set of strings.
     * @param {...String} strings Strings to use to filter modules
     * @return {Any[]}
     */
    getAllByStrings(...strings) {
        const options = getOptions(strings, {first: false});

        return WebpackModules.getModule(Filters.byStrings(...strings), options);
    },

    /**
     * Finds an internal Store module using the name.
     * @param {String} name Name of the store to find (usually includes "Store")
     * @return {Any}
     */
    getStore(name) {return WebpackModules.getModule(Filters.byStoreName(name));},
};

Object.freeze(Webpack);
Object.freeze(Webpack.Filters);

export default Webpack;

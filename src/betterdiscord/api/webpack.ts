import type {Options, Filter, WithKeyOptions, ExportedOnlyFilter, BulkQueries, LazyOptions} from "discord/webpack";
import Logger from "@common/logger";
import {Filters, getAllModules, getBulk, getLazy, getMangled, getModule, getStore, getWithKey, modules, Stores} from "@webpack";

type WithOptions<T, B extends WebpackOptions> = [...T[], B] | T[];

const getOptions = <T, B extends Options>(args: WithOptions<T, B>, defaultOptions: B = {} as B): [ T[], B ] => {
    if (args.length > 1
        && typeof (args[args.length - 1]) === "object"
        && !Array.isArray(args[args.length - 1])
        && args[args.length - 1] !== null) {
        Object.assign(defaultOptions, args.pop());
    }

    return [ args as T[], defaultOptions ];
};

interface WebpackOptions extends Options {
    first?: boolean
}

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
    modules: modules,

    Stores: Stores,

    /**
     * Series of {@link Filters} to be used for finding webpack modules.
     * @type Filters
     * @memberof Webpack
     */
    Filters: {
        /**
         * @deprecated
         */
        byProps(...props: string[]) {return Filters.byKeys(props);},
        /** Generates a function that filters by a set of properties. */
        byKeys(...keys: string[]) {return Filters.byKeys(keys);},

        /**
         * @deprecated
         */
        byPrototypeFields(...props: string[]) {return Filters.byPrototypeKeys(props);},

        /** Generates a function that filters by a set of properties on the object's prototype. */
        byPrototypeKeys(...props: string[]) {return Filters.byPrototypeKeys(props);},

        /** Generates a function that filters by a regex. */
        byRegex(regex: RegExp) {return Filters.byRegex(regex);},

        /** Generates a function that filters by source code content. */
        bySource(...searches: Array<RegExp | string>) {return Filters.bySource(...searches);},

        /** Generates a function that filters by strings. */
        byStrings(...strings: string[]) {return Filters.byStrings(...strings);},

        /** Generates a function that filters by the `displayName` property. */
        byDisplayName(name: string) {return Filters.byDisplayName(name);},

        /** Generates a function that filters by a specific internal Store name. */
        byStoreName(name: string) {return Filters.byStoreName(name);},

        /** Generates a combined function from a list of filters. */
        combine(...filters: Filter[]): Filter {return Filters.combine(...filters);},
    },

    getWithKey(filter: ExportedOnlyFilter, options: WithKeyOptions = {}) {
        if (("first" in options)) return Logger.error("BdApi.Webpack~getWithKey", "Unsupported option first.");
        if (("defaultExport" in options) && typeof (options.defaultExport) !== "boolean") return Logger.error("BdApi.Webpack~getWithKey", "Invalid type for options.defaultExport", options.defaultExport, "Expected: boolean");
        if (("searchExports" in options) && typeof (options.searchExports) !== "boolean") return Logger.error("BdApi.Webpack~getWithKey", "Invalid type for options.searchExports", options.searchExports, "Expected: boolean");
        if (("raw" in options) && typeof (options.raw) !== "boolean") return Logger.error("BdApi.Webpack~getWithKey", "Invalid type for options.raw", options.raw, "Expected: boolean");
        return getWithKey(filter, options);
    },

    getModule<T extends any>(filter: Filter, options: WebpackOptions = {}) {
        if (("first" in options) && typeof (options.first) !== "boolean") return Logger.error("BdApi.Webpack~get", "Invalid type for options.first", options.first, "Expected: boolean");
        if (("defaultExport" in options) && typeof (options.defaultExport) !== "boolean") return Logger.error("BdApi.Webpack~getModule", "Invalid type for options.defaultExport", options.defaultExport, "Expected: boolean");
        if (("searchExports" in options) && typeof (options.searchExports) !== "boolean") return Logger.error("BdApi.Webpack~getModule", "Invalid type for options.searchExports", options.searchExports, "Expected: boolean");
        if (("raw" in options) && typeof (options.raw) !== "boolean") return Logger.error("BdApi.Webpack~getModule", "Invalid type for options.raw", options.raw, "Expected: boolean");

        if (options.first === false) return getAllModules(filter, options) as T;
        return getModule<T>(filter, options);
    },

    getModules<T extends any[]>(filter: Filter, options: WebpackOptions = {}) {
        if (("defaultExport" in options) && typeof (options.defaultExport) !== "boolean") return Logger.error("BdApi.Webpack~getModules", "Invalid type for options.defaultExport", options.defaultExport, "Expected: boolean");
        if (("searchExports" in options) && typeof (options.searchExports) !== "boolean") return Logger.error("BdApi.Webpack~getModules", "Invalid type for options.searchExports", options.searchExports, "Expected: boolean");
        if (("raw" in options) && typeof (options.raw) !== "boolean") return Logger.error("BdApi.Webpack~getModules", "Invalid type for options.raw", options.raw, "Expected: boolean");
        return getAllModules<T>(filter, options);
    },

    getBulk<T extends any[]>(...queries: BulkQueries[]) {return getBulk<T>(...queries);},

    waitForModule<T>(filter: Filter, options: LazyOptions = {}) {
        if (("defaultExport" in options) && typeof (options.defaultExport) !== "boolean") return Logger.error("BdApi.Webpack~waitForModule", "Invalid type for options.defaultExport", options.defaultExport, "Expected: boolean");
        if (("signal" in options) && !(options.signal instanceof AbortSignal)) return Logger.error("BdApi.Webpack~waitForModule", "Invalid type for options.signal", options.signal, "AbortSignal expected.");
        if (("searchExports" in options) && typeof (options.searchExports) !== "boolean") return Logger.error("BdApi.Webpack~waitForModule", "Invalid type for options.searchExports", options.searchExports, "Expected: boolean");
        if (("raw" in options) && typeof (options.raw) !== "boolean") return Logger.error("BdApi.Webpack~waitForModule", "Invalid type for options.raw", options.raw, "Expected: boolean");
        return getLazy<T>(filter, options);
    },

    getByRegex<T>(regex: RegExp, options: WebpackOptions = {}) {
        return Webpack.getModule<T>(Filters.byRegex(regex), options);
    },

    getAllByRegex<T extends any[]>(regex: RegExp, options: WebpackOptions = {}) {
        return Webpack.getModule<T>(Filters.byRegex(regex), Object.assign({}, options, {first: false}));
    },

    getMangled<T extends object>(filter: Filter | string | RegExp, mangled: Record<keyof T, ExportedOnlyFilter>, options: Options = {}) {
        const {defaultExport = false, searchExports = false, raw = false} = options;
        if (typeof (defaultExport) !== "boolean") return Logger.error("BdApi.Webpack~getMangled", "Invalid type for options.defaultExport", defaultExport, "Expected: boolean");
        if (typeof (searchExports) !== "boolean") return Logger.error("BdApi.Webpack~getMangled", "Invalid type for options.searchExports", searchExports, "Expected: boolean");
        if (typeof (raw) !== "boolean") return Logger.error("BdApi.Webpack~getMangled", "Invalid type for options.raw", raw, "Expected: boolean");
        return getMangled<T>(filter, mangled, options);
    },

    getByPrototypeKeys<T>(...prototypes: WithOptions<string, WebpackOptions>) {
        const [keys, options] = getOptions(prototypes);

        return Webpack.getModule<T>(Filters.byPrototypeKeys(keys), options);
    },
    getAllByPrototypeKeys<T extends any[]>(...prototypes: WithOptions<string, WebpackOptions>) {
        const [keys, options] = getOptions(prototypes);

        return Webpack.getModule<T>(Filters.byPrototypeKeys(keys), Object.assign({}, options, {first: false}));
    },

    getByKeys<T>(...props: WithOptions<string, WebpackOptions>) {
        const [keys, options] = getOptions(props);

        return Webpack.getModule<T>(Filters.byKeys(keys), options);
    },
    getAllByKeys<T extends any[]>(...props: WithOptions<string, WebpackOptions>) {
        const [keys, options] = getOptions(props);

        return Webpack.getModule<T>(Filters.byKeys(keys), Object.assign({}, options, {first: false}));
    },

    getByStrings<T>(...strings: WithOptions<string, WebpackOptions>) {
        const [keys, options] = getOptions(strings);

        return Webpack.getModule<T>(Filters.byStrings(...keys), options);
    },
    getAllByStrings<T extends any[]>(...strings: WithOptions<string, WebpackOptions>) {
        const [keys, options] = getOptions(strings);

        return Webpack.getModule<T>(Filters.byStrings(...keys), Object.assign({}, options, {first: false}));
    },

    getBySource<T>(...searches: WithOptions<string | RegExp, WebpackOptions>) {
        const [keys, options] = getOptions(searches);

        return Webpack.getModule<T>(Filters.bySource(...keys), options);
    },

    getAllBySource<T extends object[]>(...searches: WithOptions<string | RegExp, WebpackOptions>) {
        const [keys, options] = getOptions(searches);

        return Webpack.getModule<T>(Filters.bySource(...keys), Object.assign({}, options, {first: false}));
    },

    getStore(name: string) {return getStore(name);},
};

Object.freeze(Webpack);
Object.freeze(Filters);

export default Webpack;

/* eslint-disable no-labels */

import type {Webpack} from "discord";
import {bySource} from "./filter";
import {getModule} from "./searching";
import {getDefaultKey, makeException, shouldSkipModule, wrapFilter} from "./shared";
import {webpackRequire} from "./require";
import WebpackCache from "./cache";

export function* getWithKey(filter: Webpack.ExportedOnlyFilter, {target = null, ...rest}: Webpack.WithKeyOptions = {}) {
    yield target ??= getModule(exports =>
        Object.values(exports).some(filter),
        rest
    );

    yield target && Object.keys(target).find(k => filter(target[k]));
}

export function getById<T extends object>(id: PropertyKey, options: Webpack.Options = {}): T | undefined {
    const {raw, fatal} = options;

    const module = webpackRequire.c[id];

    if (!shouldSkipModule(module?.exports)) {
        return raw ? module as T : module.exports;
    }

    if (fatal) {
        throw makeException();
    }

    return undefined;
}

function mapObject<T extends object>(module: any, mappers: Record<keyof T, Webpack.ExportedOnlyFilter>): T {
    const mapped = {} as Partial<T>;

    const moduleKeys = Object.keys(module);
    const mapperKeys = Object.keys(mappers) as Array<keyof T>;

    for (let i = 0; i < moduleKeys.length; i++) {
        const searchKey = moduleKeys[i];
        if (!Object.prototype.hasOwnProperty.call(module, searchKey)) continue;

        for (let j = 0; j < mapperKeys.length; j++) {
            const key = mapperKeys[j];
            if (!Object.prototype.hasOwnProperty.call(mappers, key)) continue;
            if (Object.prototype.hasOwnProperty.call(mapped, key)) continue;

            if (mappers[key](module[searchKey])) {
                Object.defineProperty(mapped, key, {
                    get() {
                        return module[searchKey];
                    },
                    set(value) {
                        module[searchKey] = value;
                    },
                    enumerable: true,
                    configurable: false
                });
            }
        }
    }

    for (let i = 0; i < mapperKeys.length; i++) {
        const key = mapperKeys[i];
        if (!Object.prototype.hasOwnProperty.call(mapped, key)) {
            Object.defineProperty(mapped, key, {
                value: undefined,
                enumerable: true,
                configurable: false
            });
        }
    }

    Object.defineProperty(mapped, Symbol("betterdiscord.getMangled"), {
        value: module,
        configurable: false
    });

    return mapped as T;
}

export function getMangled<T extends object>(
    filter: Webpack.Filter | string | RegExp | number,
    mappers: Record<keyof T, Webpack.ExportedOnlyFilter>,
    options: Webpack.Options = {}
): T {
    if (typeof filter === "string" || filter instanceof RegExp) {
        filter = bySource(filter);
    }

    let module = typeof filter === "number" ? getById(filter, options) : getModule<any>(filter, options);
    if (!module) return {} as T;
    if (options.raw) module = module.exports;

    return mapObject(module, mappers);
}

export function bulkGetMatched<T>(module: Webpack.Module<any>, options: Webpack.BulkQueries): T | undefined {
    const {filter, defaultExport = true, searchExports = false, searchDefault = true, raw = false, map} = options;

    if (filter(module.exports, module, module.id)) {
        const trueItem = map ? mapObject(module.exports, map) : raw ? module : module.exports;
        return trueItem;
    }

    let defaultKey: string | undefined;
    const exportKeys: string[] = [];
    if (searchExports) exportKeys.push(...Object.keys(module.exports));
    else if (searchDefault && (defaultKey = getDefaultKey(module))) exportKeys.push(defaultKey);

    for (const key of exportKeys) {
        const exported = module.exports[key];

        if (shouldSkipModule(exported)) continue;

        if (filter(exported, module, module.id)) {
            let value: any;

            if (!defaultExport && defaultKey === key) {
                value = map ? mapObject(module.exports, map) : raw ? module : module.exports;
            }
            else {
                value = map ? mapObject(raw ? module.exports : exported, map) : raw ? module : exported;
            }

            return value;
        }
    }
}

export function getBulk<T extends any[]>(...queries: Webpack.BulkQueries[]): T {
    const returnedModules = Array(queries.length) as T;
    if (queries.length === 0) return returnedModules;

    queries = queries.map((query, i) => ({
        ...query,
        filter: wrapFilter(query.filter),
        cacheId: query.cacheId || (query.cacheId === null ? undefined : WebpackCache.getIdFromStack(i))
    }));

    const shouldExitEarly = queries.every((m) => !m.all);
    const shouldExit = () => shouldExitEarly && queries.every((_, index) => index in returnedModules);

    // Check the firstId for each query
    for (let i = 0; i < queries.length; i++) {
        const {firstId} = queries[i];
        if (!firstId) continue;

        const module = webpackRequire.c[firstId];
        if (!module) continue;

        const matched = bulkGetMatched(module, queries[i]);
        if (matched) returnedModules[i] = matched;
    }

    if (shouldExit()) return returnedModules;

    // Check if modules are cached
    for (let i = 0; i < queries.length; i++) {
        const {all, cacheId} = queries[i];
        if (all || !cacheId) continue;

        const id = WebpackCache.get(cacheId);
        if (!id) continue;

        const module = webpackRequire.c[id];
        if (!module) continue;

        const matched = bulkGetMatched(module, queries[i]);
        if (matched) returnedModules[i] = matched;
    }

    if (shouldExit()) return returnedModules;

    const keys = Object.keys(webpackRequire.c);
    webpack: for (let i = 0; i < keys.length; i++) {
        const module = webpackRequire.c[keys[i]];
        if (shouldSkipModule(module.exports)) continue;

        for (let index = 0; index < queries.length; index++) {
            const {all = false, cacheId} = queries[index];
            if (!all && index in returnedModules) {
                continue;
            }

            const matched = bulkGetMatched(module, queries[index]);
            if (!matched) continue;

            if (!all) {
                returnedModules[index] = matched;
                if (cacheId) WebpackCache.set(cacheId, keys[i]);

                if (shouldExit()) break webpack;
                continue;
            }

            returnedModules[index] ??= [];
            returnedModules[index].push(matched);
        }
    }

    for (let index = 0; index < queries.length; index++) {
        const query = queries[index];
        const exists = index in returnedModules;

        if (query.fatal) {
            if (query.all && (!Array.isArray(returnedModules[index]) || returnedModules[index].length === 0)) {
                throw makeException();
            }

            if (!exists) throw makeException();
        }

        if (query.map && !exists) {
            returnedModules[index] = {};
        }
    }

    return returnedModules;
}

export function getBulkKeyed<T extends object>(queries: Record<keyof T, Webpack.BulkQueries>): T {
    const modules = getBulk(...Object.values(queries) as Webpack.BulkQueries[]);
    return Object.fromEntries(
        Object.keys(queries).map((key, index) => [key, modules[index]])
    ) as T;
}
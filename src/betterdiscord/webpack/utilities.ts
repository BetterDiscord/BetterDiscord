/* eslint-disable no-labels */

import type {Webpack} from "@typed/discord";
import {bySource} from "./filter";
import {getMatched, getModule} from "./searching";
import {makeException, shouldSkipModule, wrapModuleFilter} from "./shared";
import {webpackRequire} from "./require";
import WebpackCache from "./cache";
import {mapObject} from "@utils/object";
import {getLazy, isFromLazySearch} from "./lazy";
import cache from "@common/utils/cache";

/** @deprecated 10/07/26 use the withKey option instead */
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

/** @deprecated 10/07/26 use the map option instead */
export function getMangled<T extends object>(
    filter: Webpack.ModuleFilter | string | RegExp | Array<string | RegExp> | number,
    mappers: Record<keyof T, Webpack.ExportedOnlyFilter>,
    options: Webpack.MangledOptions = {}
): T {
    if (typeof filter === "string" || filter instanceof RegExp) {
        filter = bySource(filter);
    }
    else if (Array.isArray(filter)) {
        filter = bySource(...filter);
    }

    options.raw ??= options.mapDeclarations ?? false;

    let module = typeof filter === "number" ? getById(filter, options) : getModule<any>(filter, options);
    if (!module) return {} as T;

    if (options.raw) module = module[options.mapDeclarations ? "declarations" : "exports"];

    return mapObject(module, mappers);
}

/** @deprecated 10/07/26 use the map option instead */
export async function getMangledLazy<T extends object>(
    filter: Webpack.ModuleFilter | string | RegExp | Array<string | RegExp>,
    mappers: Record<keyof T, Webpack.ExportedOnlyFilter>,
    options: Webpack.LazyMangledOptions = {}
): Promise<T> {
    if (typeof filter === "string" || filter instanceof RegExp) {
        filter = bySource(filter);
    }
    else if (Array.isArray(filter)) {
        filter = bySource(...filter);
    }

    options.raw ??= options.mapDeclarations ?? false;

    let module = await getLazy<any>(filter, options);
    if (!module) return {} as T;

    if (options.raw) module = module[options.mapDeclarations ? "declarations" : "exports"];

    return mapObject(module, mappers);
}

export function getBulk<T extends any[]>(...queries: Webpack.BulkQueries[]): T {
    const returnedModules = Array(queries.length) as T;
    if (queries.length === 0) return returnedModules;

    let shouldExitEarly = true;
    queries = queries.map((query, i) => {
        if (query.all) shouldExitEarly = false;

        return {
            ...query,
            filter: wrapModuleFilter(query.filter),
            cacheId: query.cacheId || (query.cacheId === null ? undefined : WebpackCache.getIdFromStack(i))
        };
    });

    let count = 0;
    const shouldExit = () => shouldExitEarly && count === queries.length;

    // Check the firstId for each query
    for (let i = 0; i < queries.length; i++) {
        const {firstId, filter} = queries[i];
        if (!firstId) continue;

        const module = webpackRequire.c[firstId];
        if (!module) continue;

        const matched = getMatched(module, filter, queries[i]);
        if (matched) {
            count++;
            returnedModules[i] = matched;
        }
    }

    if (shouldExit()) return returnedModules;

    // Check if modules are cached
    for (let i = 0; i < queries.length; i++) {
        if (i in returnedModules) continue;

        const {all, cacheId, filter} = queries[i];
        if (all || !cacheId) continue;

        const id = WebpackCache.get(cacheId);
        if (!id) continue;

        const module = webpackRequire.c[id];
        if (!module) continue;

        const matched = getMatched(module, filter, queries[i]);
        if (matched) {
            count++;
            returnedModules[i] = matched;
        }
    }

    if (shouldExit()) return returnedModules;

    const keys = Object.keys(webpackRequire.c);
    webpack: for (let i = 0; i < keys.length; i++) {
        const module = webpackRequire.c[keys[i]];
        if (shouldSkipModule(module.exports)) continue;

        for (let index = 0; index < queries.length; index++) {
            const {all = false, cacheId, filter} = queries[index];
            if (!all && index in returnedModules) {
                continue;
            }

            const matched = getMatched(module, filter, queries[index]);
            if (!matched) continue;

            if (!all) {
                count++;
                returnedModules[index] = matched;
                if (cacheId) WebpackCache.set(cacheId, keys[i]);

                if (shouldExit()) break webpack;
                continue;
            }

            returnedModules[index] ??= [];
            returnedModules[index].push(matched);
        }
    }

    if (!isFromLazySearch()) {
        for (let index = 0; index < queries.length; index++) {
            const query = queries[index];
            const exists = index in returnedModules;

            if (query.map) {
                if (!exists) {
                    if (query.fatal) throw makeException();

                    returnedModules[index] = {};
                }
            }
            else if (query.all) {
                if ((!exists || returnedModules[index].length === 0) && query.fatal) {
                    throw makeException();
                }

                if (!exists) {
                    returnedModules[index] = [];
                }
            }
            else if (!exists && query.fatal) {
                throw makeException();
            }
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

export function getProxy<T extends object>(filter: Webpack.ModuleFilter, options: Webpack.ProxyOptions = {}): T {
    return cache.proxy(() => getModule<T>(filter, {...options, fatal: true})!, options.typeofIsObject);
}

/** @deprecated 10/07/26 use the map option instead */
export function getMangledProxy<T extends object>(
    filter: Webpack.ModuleFilter | string | RegExp | Array<string | RegExp> | number,
    mappers: Record<keyof T, Webpack.ExportedOnlyFilter>,
    options: Webpack.MangledOptions = {}
): T {
    return cache.proxy(() => getMangled<T>(filter, mappers, {...options, fatal: true}));
}
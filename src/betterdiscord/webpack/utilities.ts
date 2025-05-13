/* eslint-disable no-labels */
/* eslint-disable no-label-var */
import type {Webpack} from "discord";
import {bySource} from "./filter";
import {getModule} from "./searching";
import {getDefaultKey, shouldSkipModule, wrapFilter} from "./shared";
import {webpackRequire} from "./require";

export function* getWithKey(filter: Webpack.ExportedOnlyFilter, {target = null, ...rest}: Webpack.WithKeyOptions = {}) {
    yield target ??= getModule(exports =>
        Object.values(exports).some(filter),
        rest
    );

    yield target && Object.keys(target).find(k => filter(target[k]));
}

export function getMangled<T extends object>(
    filter: Webpack.Filter | string | RegExp,
    mappers: Record<keyof T, Webpack.ExportedOnlyFilter>,
    options: Webpack.Options = {}
): T {
    const {raw = false, ...rest} = options;
    const mapped = {} as Partial<T>;

    if (typeof filter === "string" || filter instanceof RegExp) {
        filter = bySource(filter);
    }

    let module = getModule<any>(filter, {raw, ...rest});
    if (!module) return mapped as T;
    if (raw) module = module.exports;

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

export function getBulk<T extends any[]>(...queries: Webpack.BulkQueries[]): T {
    const returnedModules = Array(queries.length) as T;

    queries = queries.map((query) => ({
        ...query,
        filter: wrapFilter(query.filter)
    }));


    const webpackModules = Object.values(webpackRequire.c);
    for (let i = 0; i < webpackModules.length; i++) {
        const module = webpackModules[i];

        if (shouldSkipModule(module.exports)) continue;

        queries: for (let index = 0; index < queries.length; index++) {
            const {filter, all = false, defaultExport = true, searchExports = false, searchDefault = true, raw = false} = queries[index];

            if (!all && index in returnedModules) {
                continue;
            }

            if (filter(module.exports, module, module.id)) {
                if (!all) {
                    returnedModules[index] = raw ? module : module.exports;
                    continue;
                }

                returnedModules[index] ??= [];
                returnedModules[index].push(raw ? module : module.exports);
            }

            let defaultKey: string | undefined;
            const exportKeys: string[] = [];
            if (searchExports) exportKeys.push(...Object.keys(module.exports));
            else if (searchDefault && (defaultKey = getDefaultKey(module))) exportKeys.push(defaultKey);

            for (const key of exportKeys) {
                const exported = module.exports[key];

                if (shouldSkipModule(exported)) continue;

                if (filter(exported, module, module.id)) {
                    let value = raw ? module : exported;

                    if (!defaultExport && defaultKey === key) {
                        value = raw ? module : module.exports;
                    }

                    if (!all) {
                        returnedModules[index] = value;
                        continue queries;
                    }

                    returnedModules[index] ??= [];
                    returnedModules[index].push(value);
                }
            }
        }
    }

    return returnedModules;
}

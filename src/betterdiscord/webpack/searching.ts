import type {Webpack} from "discord";
import {getDefaultKey, makeException, shouldSkipModule, wrapFilter} from "./shared";
import {webpackRequire} from "./require";
import WebpackCache from "./cache";

export function getMatched<T>(module: Webpack.Module<any>, filter: Webpack.Filter, options: Webpack.Options): T | undefined {
    const {defaultExport = true, searchExports = false, searchDefault = true, raw = false} = options;

    if (shouldSkipModule(module.exports)) return;

    if (filter(module.exports, module, module.id)) {
        return raw ? module as T : module.exports;
    }

    if (!searchExports && !searchDefault) return;

    let defaultKey: string | undefined;
    const searchKeys: string[] = [];
    if (searchExports) searchKeys.push(...Object.keys(module.exports));
    else if (searchDefault && (defaultKey = getDefaultKey(module))) searchKeys.push(defaultKey);

    for (let i = 0; i < searchKeys.length; i++) {
        const key = searchKeys[i];
        const exported = module.exports[key];

        if (shouldSkipModule(exported)) continue;

        if (filter(exported, module, module.id)) {
            if (!defaultExport && defaultKey === key) {
                return module.exports;
            }

            if (raw) return module as T;
            return exported;
        }
    }
}

export function getModule<T>(filter: Webpack.Filter, options: Webpack.Options = {}): T | undefined {
    filter = wrapFilter(filter);

    if (options.firstId) {
        const module = webpackRequire.c[options.firstId];
        if (module) {
            const matched = getMatched<T>(module, filter, options);
            if (matched) return matched;
        }
    }

    let cacheId = options.cacheId;
    if (!cacheId && cacheId !== null) cacheId = WebpackCache.getIdFromStack();

    if (cacheId) {
        const id = WebpackCache.get(cacheId);
        const module = webpackRequire.c[id];

        if (module) {
            const matched = getMatched<T>(module, filter, options);
            if (matched) return matched;
        }
    }

    const keys = Object.keys(webpackRequire.c);
    for (let i = 0; i < keys.length; i++) {
        const module = webpackRequire.c[keys[i]];
        const matched = getMatched<T>(module, filter, options);

        if (matched) {
            if (cacheId) WebpackCache.set(cacheId, keys[i]);
            return matched;
        }
    }

    if (options.fatal) throw makeException();
    return undefined;
}

export function getAllModules<T extends unknown[]>(filter: Webpack.Filter, options: Webpack.Options = {}): T {
    const {defaultExport = true, searchExports = false, searchDefault = true, raw = false, fatal = false} = options;

    filter = wrapFilter(filter);
    const modules = [] as unknown as T;

    const webpackModules = Object.values(webpackRequire.c);
    for (let i = 0; i < webpackModules.length; i++) {
        const module = webpackModules[i];

        if (shouldSkipModule(module.exports)) continue;

        if (filter(module.exports, module, module.id)) {
            modules.push(raw ? module : module.exports);
        }

        if (!searchExports && !searchDefault) continue;

        let defaultKey: string | undefined;
        const searchKeys: string[] = [];
        if (searchExports) searchKeys.push(...Object.keys(module.exports));
        else if (searchDefault && (defaultKey = getDefaultKey(module))) searchKeys.push(defaultKey);

        for (let j = 0; j < searchKeys.length; j++) {
            const key = searchKeys[j];
            const exported = module.exports[key];

            if (shouldSkipModule(exported)) continue;

            if (filter(exported, module, module.id)) {
                if (!defaultExport && defaultKey === key) {
                    modules.push(module.exports);
                    continue;
                }

                modules.push(raw ? module : exported);
            }
        }
    }

    if (fatal && modules.length === 0) throw makeException();
    return modules;
}
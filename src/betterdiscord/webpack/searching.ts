import type {Webpack} from "discord";
import {webpackRequire} from "./require";
import {getDefaultKey, shouldSkipModule, wrapFilter} from "./shared";

export function getModule<T>(filter: Webpack.Filter, options: Webpack.Options = {}): T | undefined {
    const {defaultExport = true, searchExports = false, searchDefault = true, raw = false} = options;

    filter = wrapFilter(filter);

    const keys = Object.keys(webpackRequire.c);
    for (let i = 0; i < keys.length; i++) {
        const module = webpackRequire.c[keys[i]];

        if (shouldSkipModule(module.exports)) continue;

        if (filter(module.exports, module, module.id)) {
            return raw ? module as T : module.exports;
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
                    return module.exports;
                }

                if (raw) return module as T;
                return exported;
            }
        }
    }

    return undefined;
}

export function getAllModules<T extends unknown[]>(filter: Webpack.Filter, options: Webpack.Options = {}): T {
    const {defaultExport = true, searchExports = false, searchDefault = true, raw = false} = options;

    filter = wrapFilter(filter);
    const modules = [] as unknown as T;

    const keys = Object.keys(webpackRequire.c);
    for (let i = 0; i < keys.length; i++) {
        const module = webpackRequire.c[keys[i]];

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

    return modules;
}
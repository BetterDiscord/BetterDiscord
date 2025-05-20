import type {Webpack} from "discord";
import {getDefaultKey, shouldSkipModule, wrapFilter} from "./shared";
import {webpackExportsSymbol, webpackRequire} from "./require";

export function getModule<T>(filter: Webpack.Filter, options: Webpack.Options = {}): T | undefined {
    const {defaultExport = true, searchExports = false, searchDefault = true, raw = false} = options;

    filter = wrapFilter(filter);

    const webpackModules = Object.values(webpackRequire.c);
    for (let i = 0; i < webpackModules.length; i++) {
        const module = webpackModules[i];

        let exports = module.exports;
        if (exports instanceof Promise && webpackExportsSymbol in exports) {
            // @ts-expect-error Not typing this
            exports = exports[webpackExportsSymbol];
        }

        if (shouldSkipModule(exports)) continue;

        if (filter(exports, module, module.id)) {
            return raw ? module as T : exports;
        }

        if (!searchExports && !searchDefault) continue;

        let defaultKey: string | undefined;
        const searchKeys: string[] = [];
        if (searchExports) searchKeys.push(...Object.keys(exports));
        else if (searchDefault && (defaultKey = getDefaultKey(exports))) searchKeys.push(defaultKey);

        for (let j = 0; j < searchKeys.length; j++) {
            const key = searchKeys[j];
            const exported = exports[key];

            if (shouldSkipModule(exported)) continue;

            if (filter(exported, module, module.id)) {
                if (!defaultExport && defaultKey === key) {
                    return exports;
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

    const webpackModules = Object.values(webpackRequire.c);
    for (let i = 0; i < webpackModules.length; i++) {
        const module = webpackModules[i];

        let exports = module.exports;
        if (exports instanceof Promise && webpackExportsSymbol in exports) {
            // @ts-expect-error Not typing this
            exports = exports[webpackExportsSymbol];
        }

        if (shouldSkipModule(exports)) continue;

        if (filter(exports, module, module.id)) {
            modules.push(raw ? module : exports);
        }

        if (!searchExports && !searchDefault) continue;

        let defaultKey: string | undefined;
        const searchKeys: string[] = [];
        if (searchExports) searchKeys.push(...Object.keys(exports));
        else if (searchDefault && (defaultKey = getDefaultKey(exports))) searchKeys.push(defaultKey);

        for (let j = 0; j < searchKeys.length; j++) {
            const key = searchKeys[j];
            const exported = exports[key];

            if (shouldSkipModule(exported)) continue;

            if (filter(exported, module, module.id)) {
                if (!defaultExport && defaultKey === key) {
                    modules.push(exports);
                    continue;
                }

                modules.push(raw ? module : exported);
            }
        }
    }

    return modules;
}
import { webpackRequire } from "./require";
import { getDefaultKey, shouldSkipModule, wrapFilter } from "./shared";

export function getModule<T>(filter: Webpack.Filter, options: Webpack.Options = {}): T | undefined {
    const {defaultExport = true, searchExports = false, searchDefault = true, raw = false} = options;

    filter = wrapFilter(filter);

    for (const key in webpackRequire.c) {
        if (Object.prototype.hasOwnProperty.call(webpackRequire.c, key)) {
            const module = webpackRequire.c[key];

            if (shouldSkipModule(module.exports)) continue;
            
            // Possibly have it for when defaultExport is false and searchDefault is true
            // Make it only search inside of default

            // if (!defaultExport && searchDefault) {
            //     const defaultKey = getDefaultKey(module);
            //     if (!defaultKey) continue;

            //     const defaultExport = module.exports[defaultKey];
            //     if (shouldSkipModule(defaultExport)) continue;

            //     if (filter(defaultExport, module, module.id)) {
            //         if (raw) return module;
            //         return module.exports;
            //     }

            //     continue;
            // }

            if (filter(module.exports, module, module.id)) {
                if (raw) return module as T;
                return module.exports;
            }

            let defaultKey: string | undefined;
            const keys: string[] = [];
            if (searchExports) keys.push(...Object.keys(module.exports));
            else if (searchDefault && (defaultKey = getDefaultKey(module))) keys.push(defaultKey);

            for (const key of keys) {
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
    }
}

export function getAllModules<T extends any[]>(filter: Webpack.Filter, options: Webpack.Options = {}): T {
    const {defaultExport = true, searchExports = false, searchDefault = true, raw = false} = options;

    filter = wrapFilter(filter);

    const modules = [] as unknown as T;

    for (const key in webpackRequire.c) {
        if (Object.prototype.hasOwnProperty.call(webpackRequire.c, key)) {
            const module = webpackRequire.c[key];

            if (shouldSkipModule(module.exports)) continue;

            if (filter(module.exports, module, module.id)) {
                modules.push(raw ? module : module.exports);
            }

            let defaultKey: string | undefined;
            const keys: string[] = [];
            if (searchExports) keys.push(...Object.keys(module.exports));
            else if (searchDefault && (defaultKey = getDefaultKey(module))) keys.push(defaultKey);

            for (const key of keys) {
                const exported = module.exports[key];

                if (shouldSkipModule(exported)) continue;

                if (filter(exported, module, module.id)) {
                    if (!defaultExport && defaultKey === key) {
                        modules.push(raw ? module : module.exports);
                        continue;
                    }

                    modules.push(raw ? module : exported);
                }
            }
        }
    }

    return modules;
}
import DataStore from "@modules/datastore";
import {webpackRequire} from "./require";
import {getDefaultKey, shouldSkipModule, wrapFilter} from "./shared";

// eslint-disable-next-line no-useless-escape
const stackPluginRegex = /\/([^\/]+)\.plugin\.js:(\d+):(\d+)/g;

function getIdFromStack() {
    const stack = new Error().stack!;

    const matches = stack.matchAll(stackPluginRegex);
    let prev = null;
    let plugin = null;
    let discriminator = 0;

    // find the earliest plugin to be in the call stack 
    for (const match of matches) {
        if (match[1] != prev) {
            prev = match[1];
            plugin = match[1];
        }

        // adapted from https://gist.github.com/jlevy/c246006675becc446360a798e2b2d781
        discriminator = (discriminator << 5) - discriminator + parseInt(match[2]);
        discriminator = (discriminator << 5) - discriminator + parseInt(match[3]);
    }

    if (!plugin) return;
    return `${plugin}:${discriminator >>> 0}`;
}

const cache = DataStore.getWebpackCache();

function getMatched<T>(module: Webpack.Module<any>, filter: Webpack.Filter, options: Webpack.SingleOptions): T | undefined {
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

        if (shouldSkipModule(exported)) return;

        if (filter(exported, module, module.id)) {
            if (!defaultExport && defaultKey === key) {
                return module.exports;
            }

            if (raw) return module as T;
            return exported;
        }
    }
}

export function getModule<T>(filter: Webpack.Filter, options: Webpack.SingleOptions = {}): T | undefined {
    let cacheId = options.cacheId;
    if(!cacheId) cacheId = getIdFromStack();

    filter = wrapFilter(filter);

    // check whether the cached id works
    if(cacheId && cache[cacheId]) {
        const id = cache[cacheId];
        const module = webpackRequire.c[id];
        
        const matched = getMatched<T>(module, filter, options);
        if(matched) return matched;
    }

    const keys = Object.keys(webpackRequire.c);    
    for (let i = 0; i < keys.length; i++) {
        const module = webpackRequire.c[keys[i]];
        
        const matched = getMatched<T>(module, filter, options);
        if(matched) {
            if(cacheId) {
                cache[cacheId] = keys[i];
                DataStore.setWebpackCache(cache);
            }   
            return matched;
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

        for (let i = 0; i < searchKeys.length; i++) {
            const key = searchKeys[i];
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
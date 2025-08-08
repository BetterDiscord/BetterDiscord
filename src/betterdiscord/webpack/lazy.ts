import type {Webpack} from "discord";
import {getModule} from "./searching";
import {lazyListeners, webpackRequire} from "./require";
import {shouldSkipModule, getDefaultKey, wrapFilter} from "./shared";

const ChunkIdRegex = /n\.e\("(\d+)"\)/g;
const FinalModuleIdRegex = /n\.bind\(n,\s*(\d+)\s*\)/;
const CreatePromiseId = /createPromise:\s*\(\)\s*=>\s*([^}]+)\.then\(n\.bind\(n,\s*(\d+)\)\)/g;

export function getLazy<T>(filter: Webpack.Filter, options: Webpack.LazyOptions = {}): Promise<T | undefined> {
    const cached = getModule<T>(filter, options);
    if (cached) return Promise.resolve(cached);

    const {signal: abortSignal, defaultExport = true, searchDefault = true, searchExports = false, raw = false} = options;
    filter = wrapFilter(filter);

    return new Promise((resolve) => {
        const cancel = () => void lazyListeners.delete(listener);

        const listener: Webpack.Filter = (_, module) => {
            if (shouldSkipModule(module.exports)) return;

            if (filter(module.exports, module, module.id)) {
                resolve(raw ? module : module.exports);
                cancel();
                return;
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
                        resolve(raw ? module : module.exports);
                        cancel();
                        return;
                    }

                    resolve(raw ? module : exported);
                    cancel();
                }
            }
        };

        lazyListeners.add(listener);
        abortSignal?.addEventListener("abort", () => {
            cancel();
            resolve(undefined);
        });
    });
}

export async function forceLoad(id: string | number): Promise<any> {
    const text = String(webpackRequire.m[id]);
    const loadedModules = [];

    let match;
    let hasCreatePromise = false;

    while ((match = CreatePromiseId.exec(text)) !== null) {
        hasCreatePromise = true;
        const promiseBody = match[1];
        const bindId = match[2];

        const chunkIds = [];
        const chunkMatches = promiseBody.matchAll(ChunkIdRegex);
        for (const chunkMatch of chunkMatches) {
            chunkIds.push(chunkMatch[1]);
        }

        const finalId = parseInt(bindId, 10);
        await Promise.all(chunkIds.map((cid) => webpackRequire.e(cid)));
        const loadedModule = webpackRequire(finalId);
        loadedModules.push(loadedModule);
    }

    if (hasCreatePromise) {
        return loadedModules.length === 1 ? loadedModules[0] : loadedModules;
    }

    const chunkIds = [];
    let chunkMatch;

    while ((chunkMatch = ChunkIdRegex.exec(text)) !== null) {
        chunkIds.push(chunkMatch[1]);
    }

    const bindMatch = text.match(FinalModuleIdRegex);
    if (!bindMatch) return;

    const finalId = parseInt(bindMatch[1], 10);
    await Promise.all(chunkIds.map((cid) => webpackRequire.e(cid)));
    return webpackRequire(finalId);
}
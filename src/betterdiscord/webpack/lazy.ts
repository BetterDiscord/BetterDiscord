import type {Webpack} from "discord";
import {getModule} from "./searching";
import {lazyListeners, webpackRequire} from "./require";
import {getDefaultKey, makeException, shouldSkipModule, wrapFilter} from "./shared";

const ChunkIdRegex = /.{1,2}\.e\("(\d+)"\)/g;
const FinalModuleIdRegex = /.{1,2}\.bind\(.{1,2},\s*(\d+)\s*\)/g;
const CreatePromiseId = /createPromise:\s*\(\)\s*=>\s*([^}]+)\.then\(.{1,2}\.bind\(.{1,2},\s*(\d+)\)\)/g;

export function getLazy<T>(filter: Webpack.Filter, options: Webpack.LazyOptions = {}): Promise<T | undefined> {
    const {signal: abortSignal, defaultExport = true, searchDefault = true, searchExports = false, raw = false, fatal = false} = options;
    if (!options.cacheId) options.cacheId = null;

    if (abortSignal?.aborted) {
        if (fatal) return Promise.reject(makeException());
        return Promise.resolve(undefined);
    }

    const cached = getModule<T>(filter, options);
    if (cached) return Promise.resolve(cached);

    filter = wrapFilter(filter);

    return new Promise((resolve, reject) => {
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
            if (fatal) reject(makeException());
            else resolve(undefined);
        });
    });
}

type ForceLoadId = string | number | Array<string | number>

export async function forceLoad(startId: ForceLoadId): Promise<Record<any, any>> {
    const loadedModules: Record<number | string, any> = {};

    async function startLoad(id: string | number) {
        const text = String(webpackRequire.m[id]);
        let match;

        while ((match = CreatePromiseId.exec(text)) !== null) {
            const promiseBody = match[1];
            const bindId = match[2];
            const chunkIds = [];
            const chunkMatches = promiseBody.matchAll(ChunkIdRegex);
            for (const chunkMatch of chunkMatches) {
                chunkIds.push(chunkMatch[1]);
            }
            const finalId = parseInt(bindId, 10);
            await Promise.all(chunkIds.map((cid) => webpackRequire.e(cid)));
            loadedModules[id] = webpackRequire(finalId);
        }

        const chunkIds = [];
        let chunkMatch;
        while ((chunkMatch = ChunkIdRegex.exec(text)) !== null) {
            chunkIds.push(chunkMatch[1]);
        }

        const bindMatches = text.matchAll(FinalModuleIdRegex);
        for (const bindMatch of bindMatches) {
            await Promise.all(chunkIds.map((cid) => webpackRequire.e(cid)));
            const loadedModule = webpackRequire(bindMatch[1]);
            loadedModules[id] = loadedModule; // bindMatch[1]
        }

        return loadedModules;
    }

    if (typeof startId === "string" || typeof startId === "number") {
        await startLoad(startId);
    }
    else {
        await Promise.all([...startId].map(startLoad));
    }

    return loadedModules;
}
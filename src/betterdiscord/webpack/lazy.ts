import type {Webpack} from "discord";
import {lazyListeners, webpackRequire} from "./require";
import {shouldSkipModule, getDefaultKey, wrapModuleFilter, makeException, getDeclaration} from "./shared";
import {getBulk} from "./utilities";

const ChunkIdRegex = /.{1}\.e\("(\d+)"\)/g;
const FinalModuleIdRegex = /.{1}\.bind\(.{1},\s*(\d+)\s*\)/g;
const CreatePromiseId = /createPromise:\s*\(\)\s*=>\s*([^}]+)\.then\(.{1}\.bind\(.{1},\s*(\d+)\)\)/g;

interface LazyQueue<T = any> {
    query: Webpack.BulkQueries;
    resolve(value?: T): void;
}

const queue = {
    _inQueue: false,
    _queue: <LazyQueue[]>[],
    enqueue<T>(filter: Webpack.ModuleFilter, options?: Webpack.LazyOptions | undefined | null | void) {
        if (options?.signal?.aborted) {
            if (options?.fatal) return Promise.reject(makeException());
            return Promise.resolve(undefined);
        }

        const {promise, resolve, reject} = Promise.withResolvers<T>();

        const lazyQueue: LazyQueue = {
            query: {
                ...options,
                filter
            },
            resolve
        };

        this._queue.push(lazyQueue);

        const onAbort = () => {
            if (options?.fatal) reject(options!.signal!.reason);
            else resolve(undefined);

            const index = this._queue.indexOf(lazyQueue);
            if (index !== -1) this._queue.splice(index, 1);
        };

        options?.signal?.addEventListener("abort", onAbort);

        if (!this._inQueue) {
            this._inQueue = true;

            queueMicrotask(() => {
                const result = getBulk(...this._queue.map((x) => x.query));

                for (let index = 0; index < this._queue.length; index++) {
                    this._queue[index].resolve(result[index]);
                }

                this._queue.length = 0;
                this._inQueue = false;
            });
        }

        return promise;
    }
};

export async function getLazy<T>(filter: Webpack.ModuleFilter, options: Webpack.LazyOptions = {}): Promise<T | undefined> {
    const {signal: abortSignal, defaultExport = true, searchDefault = true, searchExports = false, raw = false, fatal = false, declarationFilter} = options;
    if (!options.cacheId) options.cacheId = null;

    const result = await queue.enqueue<T>(filter, options);
    if (result) return result;

    filter = wrapModuleFilter(filter);

    return new Promise((resolve, reject) => {
        const cancel = () => void lazyListeners.delete(listener);

        const onAbort = () => {
            cancel();
            abortSignal?.removeEventListener("abort", onAbort);
            if (fatal) reject(makeException());
            else resolve(undefined);
        };

        const listener: Webpack.ModuleFilter = (_, module) => {
            if (shouldSkipModule(module.exports)) return;

            if (filter(module.exports, module, module.id)) {
                if (declarationFilter) resolve(getDeclaration(module, declarationFilter));
                else resolve(raw ? module : module.exports);

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
                        if (declarationFilter) resolve(getDeclaration(module, declarationFilter));
                        else resolve(raw ? module : module.exports);

                        cancel();
                        return;
                    }

                    if (declarationFilter) resolve(getDeclaration(module, declarationFilter));
                    else resolve(raw ? module : exported);

                    cancel();
                }
            }
        };

        lazyListeners.add(listener);
        abortSignal?.addEventListener("abort", onAbort);
    });
}

export async function forceLoad(id: string | number): Promise<any[]> {
    if (typeof webpackRequire.m[id] === "undefined") {
        return [];
    }
    const text = String(webpackRequire.m[id]);
    const loadedModules = [];
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
        const loadedModule = webpackRequire(finalId);
        loadedModules.push(loadedModule);
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
        loadedModules.push(loadedModule);
    }

    return loadedModules;
}
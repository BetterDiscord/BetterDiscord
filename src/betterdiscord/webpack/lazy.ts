import type {Webpack} from "@typed/discord";
import {getModule} from "./searching";
import {lazyListeners, webpackRequire} from "./require";
import {shouldSkipModule, getDefaultKey, wrapModuleFilter, makeException, getDeclaration} from "./shared";
import {getBulk} from "./utilities";

const ChunkIdRegex = /.{1}\.e\("(\d+)"\)/g;
const FinalModuleIdRegex = /.{1}\.bind\(.{1},\s*(\d+)\s*\)/g;
const CreatePromiseId = /createPromise:\s*\(\)\s*=>\s*([^}]+)\.then\(.{1}\.bind\(.{1},\s*(\d+)\)\)/g;

interface LazyQueue<T = any> {
    query: Webpack.BulkQueries;
    resolve(value: QueueResolvedState<T>): void;
}

type QueueResolvedState<T> = {state: "aborted";} | {state: "resolved", value: T;};

const queue = {
    /** @private */
    _scheduled: false,
    /** @private */
    _queue: <LazyQueue[]>[],
    /** @private */
    _flushSync() {
        // Should make it faster?
        if (this._queue.length === 0) {
            this._scheduled = false;
            return;
        }
        if (this._queue.length === 1) {
            const [{resolve, query: {filter, ...options}}] = this._queue;

            resolve({state: "resolved", value: getModule<any>(filter, options)});

            this._queue.length = 0;
            this._scheduled = false;

            return;
        }

        const result = getBulk(...this._queue.map((x) => x.query));

        for (let index = 0; index < this._queue.length; index++) {
            this._queue[index].resolve({
                state: "resolved",
                value: result[index]
            });
        }

        this._queue.length = 0;
        this._scheduled = false;
    },
    /** @private */
    _scheduleFlush() {
        if (this._scheduled) return;

        this._scheduled = true;

        queueMicrotask(() => this._flushSync());
    },
    enqueue<T>(filter: Webpack.ModuleFilter, options?: Webpack.LazyOptions | undefined | null | void): Promise<QueueResolvedState<T>> {
        if (options?.signal?.aborted) {
            if (options?.fatal) return Promise.reject(makeException());
            return Promise.resolve({state: "aborted"});
        }

        const {promise, resolve, reject} = Promise.withResolvers<QueueResolvedState<T>>();

        const onAbort = () => {
            if (options?.fatal) reject(makeException());
            else resolve({state: "aborted"});

            options!.signal!.removeEventListener("abort", onAbort);

            const index = this._queue.indexOf(lazyQueue);
            if (index !== -1) this._queue.splice(index, 1);
        };

        options?.signal?.addEventListener("abort", onAbort);

        const lazyQueue: LazyQueue<T> = {
            query: {
                ...options,
                fatal: false,
                filter
            },
            resolve: (value) => {
                options?.signal?.removeEventListener("abort", onAbort);
                resolve(value);
            }
        };

        this._queue.push(lazyQueue);

        this._scheduleFlush();

        return promise;
    }
};

export async function getLazy<T>(filter: Webpack.ModuleFilter, options: Webpack.LazyOptions = {}): Promise<T | undefined> {
    const {signal: abortSignal, defaultExport = true, searchDefault = true, searchExports = false, raw = false, fatal = false, declarationFilter} = options;
    if (!options.cacheId) options.cacheId = null;

    const state = await queue.enqueue<T>(filter, options);
    if (state.state === "resolved" && typeof state.value !== "undefined") return state.value;
    if (state.state === "aborted") return undefined;

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
import type {Webpack} from "@typed/discord";
import {getModule} from "./searching";
import {lazyListeners, webpackRequire} from "./require";
import {shouldSkipModule, getDefaultKey, wrapModuleFilter, makeException, getDeclaration} from "./shared";
import {getBulk} from "./utilities";

// Sources only — instantiate per use so shared `lastIndex` state can't leak across (possibly concurrent) calls
const ChunkIdRegexSource = /.{1}\.e\("(\d+)"\)/.source;
const FinalModuleIdRegexSource = /.{1}\.bind\(.{1},\s*(\d+)\s*\)/.source;
const CreatePromiseIdSource = /createPromise:\s*\(\)\s*=>\s*([^}]+)\.then\(.{1}\.bind\(.{1},\s*(\d+)\)\)/.source;

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
        try {
            // Should make it faster?
            if (this._queue.length === 0) {
                return;
            }
            if (this._queue.length === 1) {
                const [{resolve, query: {filter, ...options}}] = this._queue;

                resolve({state: "resolved", value: getModule<any>(filter, options)});

                return;
            }

            const result = getBulk(...this._queue.map((x) => x.query));

            for (let index = 0; index < this._queue.length; index++) {
                this._queue[index].resolve({
                    state: "resolved",
                    value: result[index]
                });
            }
        }
        catch (error) {
            // Settle whatever is left so callers fall back to lazy listeners instead of hanging
            for (const item of this._queue) {
                item.resolve({state: "resolved", value: undefined});
            }
            throw error;
        }
        finally {
            // Always reset state so one bad search can't wedge the queue permanently
            this._queue.length = 0;
            this._scheduled = false;
        }
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
        const cancel = () => {
            lazyListeners.delete(listener);
            abortSignal?.removeEventListener("abort", onAbort);
        };

        const onAbort = () => {
            cancel();
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

    const createPromiseId = new RegExp(CreatePromiseIdSource, "g");
    while ((match = createPromiseId.exec(text)) !== null) {
        const promiseBody = match[1];
        const bindId = match[2];
        const chunkIds = [];
        const chunkMatches = promiseBody.matchAll(new RegExp(ChunkIdRegexSource, "g"));
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
    const chunkIdRegex = new RegExp(ChunkIdRegexSource, "g");
    while ((chunkMatch = chunkIdRegex.exec(text)) !== null) {
        chunkIds.push(chunkMatch[1]);
    }

    const bindMatches = text.matchAll(new RegExp(FinalModuleIdRegexSource, "g"));
    for (const bindMatch of bindMatches) {
        await Promise.all(chunkIds.map((cid) => webpackRequire.e(cid)));
        const loadedModule = webpackRequire(bindMatch[1]);
        loadedModules.push(loadedModule);
    }

    return loadedModules;
}
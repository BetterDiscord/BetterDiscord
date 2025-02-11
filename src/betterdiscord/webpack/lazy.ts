import type {Webpack} from "discord";
import {getModule} from "./searching";
import {lazyListeners} from "./require";
import {shouldSkipModule, getDefaultKey, wrapFilter} from "./shared";

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
                        resolve(raw ? module : exported);
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
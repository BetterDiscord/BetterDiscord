import { getModule } from "./get-module";
import { lazyListeners } from "./require";
import { shouldSkipModule, getDefaultKey, wrapFilter } from "./shared";

export function getLazy<T>(filter: Webpack.Filter, options: Webpack.LazyOptions = {}): Promise<T | undefined> {
    const cached = getModule<T>(filter, options);
    if (cached) return Promise.resolve(cached);

    const {signal: abortSignal, defaultExport = true, searchDefault, searchExports = false, raw = false} = options;
    filter = wrapFilter(filter);

    return new Promise((resolve) => {
        const cancel = () => void lazyListeners.delete(listener);

        const listener: Webpack.Filter = (module) => {
            if (shouldSkipModule(module.exports)) return;

            if (filter(module.exports, module, module.id)) {
                resolve(raw ? module : module.exports);
                cancel();
                return;
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
                        resolve(module.exports);
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
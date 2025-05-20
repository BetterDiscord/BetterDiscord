import type {Webpack} from "discord";
import {getModule} from "./searching";
import {lazyListeners, webpackExportsSymbol, webpackRequire} from "./require";
import {shouldSkipModule, getDefaultKey, wrapFilter} from "./shared";

export function getLazy<T>(filter: Webpack.Filter, options: Webpack.LazyOptions = {}): Promise<T | undefined> {
    const cached = getModule<T>(filter, options);
    if (cached) return Promise.resolve(cached);

    const {signal: abortSignal, defaultExport = true, searchDefault = true, searchExports = false, raw = false} = options;
    filter = wrapFilter(filter);

    return new Promise((_resolve) => {
        let isDead = false;
        const cancel = () => {
            isDead = true;
            lazyListeners.delete(listener);
        };
        const resolve = (value: any) => {
            isDead = true;
            lazyListeners.delete(listener);
            _resolve(value);
        };

        const search = (exports: any, module: Webpack.Module) => {
            if (shouldSkipModule(exports)) return;

            if (filter(exports, module, module.id)) {
                resolve(raw ? module : exports);
                return;
            }

            if (!searchExports && !searchDefault) return;

            let defaultKey: string | undefined;
            const searchKeys: string[] = [];
            if (searchExports) searchKeys.push(...Object.keys(exports));
            else if (searchDefault && (defaultKey = getDefaultKey(exports))) searchKeys.push(defaultKey);

            for (let i = 0; i < searchKeys.length; i++) {
                const key = searchKeys[i];
                const exported = exports[key];

                if (shouldSkipModule(exported)) continue;

                if (filter(exported, module, module.id)) {
                    if (!defaultExport && defaultKey === key) {
                        resolve(raw ? module : exports);
                        return;
                    }

                    resolve(raw ? module : exported);
                }
            }
        };

        const listener: Webpack.Filter = (_, module) => {
            const _exports = module.exports;
            if (_exports instanceof Promise && webpackExportsSymbol in _exports) {
                _exports.then((exports) => {
                    if (isDead) return;

                    search(exports, module);
                });

                return;
            }

            search(_exports, module);
        };

        const webpackModules = Object.values(webpackRequire.c);
        for (let index = 0; index < webpackModules.length; index++) {
            const module = webpackModules[index];
            const _exports = module.exports;

            if (_exports instanceof Promise && webpackExportsSymbol in _exports) {
                _exports.then((exports) => {
                    if (isDead) return;

                    search(exports, module);
                });
            }
        }

        lazyListeners.add(listener);
        abortSignal?.addEventListener("abort", () => {
            cancel();
            resolve(undefined);
        });
    });
}
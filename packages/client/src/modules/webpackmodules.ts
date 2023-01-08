import {EventEmitter, Logger, predefine} from "@betterdiscord/common";

/*TODO: WebpackModules
 * Type webpack internal stuff.
 * Add getByProps() etc. aliases
 */

type ModuleFilter<O> = ((module: any, id: number) => boolean) & {options: O};

export type DefaultOptions = {
    all?: boolean,
    searchExports?: boolean,
    defaultExport?: boolean,
    process?: (module: any, id: number) => any
}

namespace Utilities {
    export const extractOptions = (args: any[], defaultOptions?: any) => {
        if (typeof(args[args.length - 1]) === "object" && args[args.length - 1].constructor === Object) {
            return args.pop() ?? defaultOptions;
        }
    
        return defaultOptions;
    };

    const hasThrown = new WeakSet();

    export const wrapFilter = (filter: ModuleFilter<any>) => (exports: any, moduleId: number) => {
        try {
            if (exports?.default?.remove && exports?.default?.set && exports?.default?.clear && exports?.default?.get && !exports?.default?.sort) return false;
            if (exports?.remove && exports?.set && exports?.clear && exports?.get && !exports?.sort) return false;
            if (exports?.default?.getToken || exports?.default?.getEmail || exports?.default?.showToken) return false;
            if (exports?.getToken || exports?.getEmail || exports?.showToken) return false;
            return filter(exports, moduleId);
        } catch (err) {
            debugger;
            if (!hasThrown.has(filter)) {
                Logger.warn("WebpackModules~getModule", "Module filter threw an exception.", filter as any, err as string);
                hasThrown.add(filter);
            }

            return false;
        }
    };
}


export namespace Filters {
    export function ReturnValue(process: DefaultOptions["process"]): ModuleFilter<DefaultOptions> {
        return Object.assign(() => true, {options: {process: process!}});
    }

    export function byModuleSource<O extends Omit<DefaultOptions, "defaultExport">>(
        ...stringOrRegex: [...(string | RegExp)[], O | string | RegExp]): ModuleFilter<O>
    {
        return Object.assign((_: any, id: number) => {
            const raw = WebpackModules.instance.m[id];
            if (typeof(raw) !== "function") return false;

            const string = raw.toString();
            
            for (let i = 0; i < stringOrRegex.length; i++) {
                const filter = stringOrRegex[i];
                let matches;

                if (typeof (filter) === "string") matches = string.includes(filter);
                if (filter instanceof RegExp) matches = filter.test(string);
                if (!matches) return false;
            }

            return true;
        }, {
            options: Utilities.extractOptions(stringOrRegex, {
                all: false,
                searchExports: false,
                defaultExport: false
            })
        });
    }

    export function byProps(...props: [...string[], DefaultOptions | string]): ModuleFilter<DefaultOptions> {
        return Object.assign((module: any) => {
            if (typeof(module) === "undefined") return false;

            for (let i = 0; i < props.length; i++) {
                if (module[<string>props[i]] === undefined) return false;
            }

            return true;
        }, {
            options: Utilities.extractOptions(props, {
                all: false,
                searchExports: false
            })
        });
    }

    export function byPrototypeFields(...props: [...string[], DefaultOptions | string]): ModuleFilter<DefaultOptions> {
        return Object.assign((module: any) => {
            if (typeof(module) !== "function" || !module.prototype) return false;

            for (let i = 0; i < props.length; i++) {
                if (<string>props[i] in module.prototype) continue;

                return false;
            }

            return true;
        }, {
            options: Utilities.extractOptions(props, {
                all: false,
                searchExports: false
            })
        });
    }

    export function byStrings(...strings: [...string[], DefaultOptions | string]): ModuleFilter<DefaultOptions> {
        return Object.assign((module: any) => {
            if (typeof(module) === "undefined") return false;
            const string = module.toString?.();

            for (let i = 0; i < strings.length; i++) {
                if (!string.includes(strings[i])) return false;
            }

            return true;
        }, {
            options: Utilities.extractOptions(strings, {
                all: false,
                searchExports: false
            })
        });
    }

    export function byRegex(...regex: [...RegExp[], DefaultOptions | RegExp]): ModuleFilter<DefaultOptions> {
        return Object.assign((module: any) => {
            if (typeof(module) === "undefined") return false;
            const string = module.toString?.();

            for (let i = 0; i < regex.length; i++) {
                if (!(<RegExp>regex[i]).test(string)) return false;
            }

            return true;
        }, {
            options: Utilities.extractOptions(regex, {
                all: false,
                searchExports: false
            })
        });
    }

    export function combine<O extends DefaultOptions>(...filters: ModuleFilter<DefaultOptions>[]): ModuleFilter<O> {
        const options = Object.assign({}, ...filters.map(f => f.options));

        return Object.assign((module: any, id: number) => {
            if (typeof(module) === "undefined") return false;

            for (let i = 0; i < filters.length; i++) {
                if (!filters[i](module, id)) return false;
            }

            return true;
        }, {options});
    }
}

const WebpackModules = new class Webpack extends EventEmitter {
    constructor() {
        super();

        this.getModule = this.getModule.bind(this);
        this.getLazy = this.getLazy.bind(this);
        this.getBulk = this.getBulk.bind(this);
    }

    public chunkName = "webpackChunkdiscord_app";
    public originalPush: null | typeof Array.prototype.push = null;
    public instance: any;
    public Filters = Filters;

    public globalReady: Promise<void> & {resolved?: boolean} = (async () => {
        if (!(this.chunkName in window)) {
            await new Promise<void>(resolve => {
                predefine(window, this.chunkName, (instance: any) => {
                    this.#patchExportsDefine(instance);
                    resolve();
                });
            });
            this.globalReady.resolved = true;
        }
    })();

    #patchPush(array: any) {
        const originalPush = this.originalPush = array.push;

        array.push = function ([, modules]: [void, any]) {
            for (const moduleId in modules) {
                const originalModule = modules[moduleId];

                modules[moduleId] = (module: any, exports: any, require: any) => {
                    try {
                        originalModule(module, exports, require);

                        WebpackModules.emit("module-loaded", exports, moduleId);
                    } catch (error) {
                        Logger.stacktrace("WebpackModules", `Could not patch pushed module ${moduleId}:`, error as Error);
                    }
                }

                Object.defineProperties(modules[moduleId], {
                    ...Object.getOwnPropertyDescriptors(originalModule),
                    __originalFn: {value: originalModule},
                    toString: {value: () => originalModule.toString()}
                });
            }

            return originalPush?.apply(this, arguments);
        };
    }

    #patchExportsDefine(array: any[]): void {
        predefine(array, "push", () => {
            array.push([[Symbol("BD Exports Patch")], {}, (require: any) => {
                this.instance = require;
                require.d = (target: any, exports: any) => {
                    for (const key in exports) {
                        if (!Reflect.has(exports, key) || target[key]) continue;
    
                        Object.defineProperty(target, key, {
                            get: () => exports[key](),
                            set: v => {exports[key] = () => v;},
                            enumerable: true,
                            configurable: true
                        });
                    }
                };
            }]);

            array.pop();

            this.#patchPush(array);
        });
    }

    public getModule<O extends DefaultOptions>(filter: ModuleFilter<O>, options?: O) {
        if (!this.globalReady.resolved) return false;

        const {all = false, searchExports = false, defaultExport = true, process = _ => _} = Object.assign({}, filter.options, options) as O;
        const wrappedFilter = Utilities.wrapFilter(filter);

        const modules = this.instance.c;
        const indices = Object.keys(modules);
        const result: any[] = [];

        for (let i = 0; i < indices.length; i++) {
            const id = Number(indices[i]);
            if (!(id in modules)) continue;

            const module = modules[id];
            const {exports} = module;

            if (!exports || exports === window || exports === document || exports === document.documentElement) continue;

            if (typeof (exports) === "object" && searchExports) {
                for (const key in exports) {
                    let foundModule = null;
                    const mangledExport = exports[key];
                    if (!mangledExport) continue;
                    if (wrappedFilter(mangledExport, id)) foundModule = mangledExport;
                    if (!foundModule) continue;
                    if (!all) return process(foundModule, id);
                    result.push(process(foundModule, id));
                }
            } else {
                let foundModule = all ? [] as any : null;

                const add = (mod: any) => {
                    if (all) foundModule.push(process(mod, id));
                    else foundModule = mod;
                };

                if (exports.Z && wrappedFilter(exports.Z, id)) add(defaultExport ? exports.Z : exports);
                if (exports.ZP && wrappedFilter(exports.ZP, id)) add(defaultExport ? exports.ZP : exports);
                if (exports.__esModule && exports.default && wrappedFilter(exports.default, id)) add(defaultExport ? exports.default : exports);
                if (wrappedFilter(exports, id)) add(exports);
                if (!(all ? foundModule.length : foundModule)) continue;

                if (!all) return process(foundModule, id);
                result.push(...foundModule);
            }
        }

        return !all || result.length === 0 ? undefined : result;
    }

    public getModules<O extends DefaultOptions>(filter: ModuleFilter<O>, options?: O) {
        return this.getModule(filter, Object.assign({}, options, {all: true}));
    }

    public getLazy<O extends Omit<DefaultOptions, "all"> & {signal?: AbortSignal}>(filter: ModuleFilter<O>, options?: O) {
        const {signal: abortSignal, defaultExport = true, searchExports = false, process = _ => _} = Object.assign({}, filter.options, options) as O;
        const fromCache = this.getModule(filter, options);
        if (fromCache) return Promise.resolve(fromCache);

        const wrappedFilter = Utilities.wrapFilter(filter);

        return new Promise<any>(resolve => {
            const cancel = () => this.off("module-loaded", listener);
            const listener = (exports: any, id: number) => {
                if (!exports || exports === window || exports === document || exports === document.documentElement) return;

                let foundModule = null;
                if (typeof(exports) === "object" && searchExports) {
                    for (const key in exports) {
                        foundModule = null;
                        const mangledExport = exports[key];
                        if (!mangledExport) continue;
                        if (wrappedFilter(mangledExport, id)) foundModule = mangledExport;
                    }
                } else {
                    if (exports.Z && wrappedFilter(exports.Z, id)) foundModule = defaultExport ? exports.Z : exports;
                    else if (exports.ZP && wrappedFilter(exports.ZP, id)) foundModule = defaultExport ? exports.ZP : exports;
                    else if (exports.__esModule && exports.default && wrappedFilter(exports.default, id)) foundModule = defaultExport ? exports.default : exports;
                    else if (wrappedFilter(exports, id)) foundModule = exports;
                }

                if (!foundModule) return;

                cancel();
                resolve(process(foundModule, id));
            };

            this.on("module-loaded", listener);
            abortSignal?.addEventListener("abort", () => {
                cancel();
                resolve(undefined);
            }, {once: true});
        });
    }

    public getBulk<T>(...filters: ModuleFilter<DefaultOptions>[]): T {
        const modules = this.instance.c;
        const indices = Object.keys(modules);
        const result = Array(filters.length) as any;
        
        for (let i = 0; i < indices.length; i++) {
            const id = Number(indices[i]);
            if (!(id in modules)) continue;

            const module = modules[id];
            const {exports} = module;

            if (!exports || exports === window || exports === document || exports === document.documentElement) continue;

            for (let f = 0; f < filters.length; f++) {
                const filter = Utilities.wrapFilter(filters[f]) as ModuleFilter<DefaultOptions>;
                const {all = false, searchExports = false, defaultExport = true, process = _ => _} = Object.assign({}, filters[f].options) as DefaultOptions;
                
                if (!all && result[f]) continue;
                if (all && !result[f]) result[f] = [];

                if (typeof (exports) === "object" && searchExports) {
                    for (const key in exports) {
                        const mangledExport = exports[key];
                        if (!mangledExport) continue;

                        if (filter(mangledExport, id)) {
                            if (all) result[f].push(process(mangledExport, id));
                            else {
                                result[f] = process(mangledExport, id);
                                break;
                            }
                        }
                    }
                } else {
                    let foundModule = all ? [] as any : null;

                    const add = (mod: any) => {
                        mod = process(mod, id);

                        if (all) foundModule.push(mod);
                        else foundModule = mod;
                    };

                    if (exports.Z && filter(exports.Z, id)) add(defaultExport ? exports.Z : exports);
                    if (exports.ZP && filter(exports.ZP, id)) add(defaultExport ? exports.ZP : exports);
                    if (exports.__esModule && exports.default && filter(exports.default, id)) add(defaultExport ? exports.default : exports);
                    if (filter(exports, id)) add(exports);

                    if (!(all ? foundModule.length : foundModule)) continue;
                    if (all) result[f].push(...foundModule);
                    else result[f] = foundModule;
                }
            }
        }

        return result as T;
    }

    public initialize(): void {
        
    }
}

export default WebpackModules;

// export namespace Webpack {
    export interface Require {
        <T = any>(id: PropertyKey): T;
        d(target: object, exports: Record<string, () => any>): void;
        /**
         * AsyncModuleRuntimeModule
         * {@link https://github.com/webpack/webpack/blob/ea3ba3dfcc118aa6dfd4fa2d86927ea1d47cbe81/lib/runtime/AsyncModuleRuntimeModule.js#L77}
         */
        a<T extends any>(
            target: Module<Promise<T>>,
            body: (
                deps: (items: any[]) => any[] | Promise<() => any[]>,
                resolveOrReject: (value?: any) => void
            ) => void | Promise<void>,
            hasAwait?: boolean
        ): void;
        c: Record<PropertyKey, Module>;
        m: Record<PropertyKey, RawModule>;
        e(id: PropertyKey): Promise<unknown>;
    }

    export interface Module<T extends any = any> {
        id: PropertyKey,
        exports: T,
        loaded: boolean;
    }

    export type RawModule = (module: Module, exports: object, require: Require) => void;

    export type Filter = (exported: any, module: Module, id: PropertyKey) => any;
    export type ExportedOnlyFilter = (exported: any) => any;

    export type Options = {
        searchExports?: boolean,
        defaultExport?: boolean,
        searchDefault?: boolean,
        raw?: boolean;
    };

    export type BulkQueries = Options & {
        filter: Filter,
        all?: boolean;
    };
    export type WithKeyOptions = Options & {
        target?: any;
    };

    export type LazyOptions = Options & {signal?: AbortSignal;};

    export type ModuleWithEffect = [
        any[],
        Record<PropertyKey, RawModule>,
        (require: Require) => void
    ];
    export type ModuleWithoutEffect = [
        any[],
        Record<PropertyKey, RawModule>
    ];

    export type DefaultKey = "default" | "Z" | "ZP";
// }
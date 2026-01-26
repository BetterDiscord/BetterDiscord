// export namespace Webpack {
export interface Require {
    <T = any>(id: PropertyKey): T;
    d(target: object, exports: Record<string, () => any>): void;
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
    fatal?: boolean;
};

export type BulkQueries = Options & {
    filter: Filter,
    all?: boolean,
    map?: Record<string, ExportedOnlyFilter>;
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

export type DefaultKey = "default" | "A" | "Ay";
// }
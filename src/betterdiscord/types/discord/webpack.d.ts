// export namespace Webpack {
export interface Require {
    <T = any>(id: PropertyKey): T;
    d(target: object, exports: Record<string, () => any>): void;
    c: Record<PropertyKey, Module>;
    m: Record<PropertyKey, RawModule>;
    e(id: PropertyKey): Promise<unknown>;
    l(url: string, onLoad: (event: Event) => void, key: string, id: string): void;
}

export interface Module<T extends any = any> {
    id: PropertyKey,
    exports: T,
    declarations: Record<string, any>;
    loaded: boolean;
}

export type RawModule = ((module: Module, exports: object, require: Require) => void) & {
    // BD specific properties
    __BD__?: {
        runListeners: (module: Module, exports: object, require: Require) => void;
        originalModule: RawModule;
    };
    __early_patched__?: boolean;
    __raw_module__?: () => RawModule;
};

export type ModuleFilter = (exported: any, module: Module, id: PropertyKey) => any;
export type ExportedOnlyFilter = (exported: any) => any;

export type Options = {
    searchExports?: boolean,
    defaultExport?: boolean,
    searchDefault?: boolean,
    raw?: boolean;
    fatal?: boolean;
    firstId?: PropertyKey;
    cacheId?: string | null;
    declarationFilter?: ExportedOnlyFilter;
};

export type MangledOptions = Options & {
    mapDeclarations?: boolean;
};

export type BulkQueries = Options & {
    filter: ModuleFilter,
    all?: boolean,
    map?: Record<string, ExportedOnlyFilter>;
    mapDeclarations?: boolean;
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
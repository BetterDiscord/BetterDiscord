declare namespace Webpack {
    interface Require {
        <T = any>(id: PropertyKey): T;
        d(target: object, exports: Record<string, () => any>): void;
        c: Record<PropertyKey, Module>;
        m: Record<PropertyKey, RawModule>;
        e(id: PropertyKey): Promise<unknown>;
    }

    interface Module<T extends any = any> {
        id: PropertyKey,
        exports: T,
        loaded: boolean
    }

    type RawModule = (module: Module, exports: object, require: Require) => void;

    type Filter = (exported: any, module: Module, id: PropertyKey) => any;
    type ExportedOnlyFilter = (exported: any) => any;

    type Options = {
        searchExports?: boolean,
        defaultExport?: boolean,
        searchDefault?: boolean,
        raw?: boolean
    };

    type BulkQueries = Options & {
        filter: Filter,
        all?: boolean
    };
    type WithKeyOptions = Options & {
        target?: any
    };

    type LazyOptions = Options & { signal?: AbortSignal };

    type ModuleWithEffect = [
        any[],
        Record<PropertyKey, RawModule>,
        (require: Require) => void
    ];
    type ModuleWithoutEffect = [
        any[],
        Record<PropertyKey, RawModule>
    ];

    type DefaultKey = "default" | "Z" | "ZP";
}

interface DiscordWindow  {
    webpackChunkdiscord_app: Array<Webpack.ModuleWithoutEffect | Webpack.ModuleWithEffect>;
}
declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Window extends DiscordWindow {};
}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface Window extends DiscordWindow {};
import data from "../webpack/modules.json" with {type: "json"};
import {Filters, getBulkKeyed} from "@webpack";
import Store from "@stores/base.ts";
import request from "@polyfill/request.ts";
import config from "@stores/config.ts";

type FilterType = "byKeys" | "byStrings" | "bySource";

interface ModuleMapEntry {
    type: Exclude<FilterType, "bySource">;
    properties: string[];
}

interface ModuleEntry {
    type: FilterType;
    properties: string[];
    space?: string;
    searchExports?: boolean;
    searchDefault?: boolean;
    map?: Record<string, ModuleMapEntry>;
}

type ModuleDefinition = Record<string, ModuleEntry>;
type ModuleData = ModuleDefinition[];

type BuiltQuery = ModuleEntry & {
    filter: unknown;
    map?: Record<string, unknown>;
};

type BuiltQueries = Record<string, BuiltQuery>;
type BulkResult = Record<string, unknown>;
type OrganizedModules = Record<string, Record<string, unknown>>;

const ModuleStore = new class ModuleStoreClass extends Store {
    private _modules: OrganizedModules | null = null;
    private _eTag: string | null = null;

    get modules(): OrganizedModules | null {
        return this._modules;
    }

    set modules(modules: OrganizedModules) {
        this._modules = modules;
        this.emitChange();
    }

    get eTag(): string | null {
        return this._eTag;
    }

    set eTag(etag: string) {
        this._eTag = etag;
        this.emitChange();
    }
}();

class CommonModules {
    constructor() {
        this.build(data as unknown as ModuleData);

        if (config.isCanary) {
            (window as any).BetterDiscordCommonModules = {
                Modules: ModuleStore.modules,
                refetch: this.refetch.bind(this),
                hasUndefined: this.hasUndefined.bind(this),
                ModuleStore
            };
        }
    }

    private buildQueries(modules: ModuleData): BuiltQueries {
        const queries: BuiltQueries = {};
        for (const module of modules) {
            for (const [key, value] of Object.entries(module)) {
                queries[key] = {
                    ...value,
                    filter: value.type === "byKeys"
                        ? Filters.byKeys(value.properties)
                        : Filters.byStrings(...value.properties),
                    map: value.map && Object.fromEntries(
                        Object.entries(value.map).map(([k, v]) => [
                            k,
                            v.type === "byKeys"
                                ? Filters.byKeys(v.properties)
                                : Filters.byStrings(...v.properties)
                        ])
                    )
                };
            }
        }
        return queries;
    }

    private organize(modules: ModuleData, result: BulkResult): OrganizedModules {
        const out: OrganizedModules = {};
        for (const module of modules) {
            for (const [key, value] of Object.entries(module)) {
                if (!value.space) continue;
                out[value.space] ??= {};
                out[value.space][key] = result[key];
            }
        }
        return out;
    }

    private _hasUndefined(value: unknown, seen: Set<unknown> = new Set<unknown>()): boolean {
        if (value === undefined) return true;
        if (value === null || typeof value !== "object") return false;
        if (seen.has(value)) return false;
        seen.add(value);
        if (Array.isArray(value)) return value.some(v => this._hasUndefined(v, seen));
        return Object.keys(value as object).some(
            k => this._hasUndefined((value as Record<string, unknown>)[k], seen)
        );
    }

    hasUndefined(): boolean {
        return this._hasUndefined(ModuleStore.modules);
    }

    private build(modules: ModuleData): OrganizedModules {
        const result = getBulkKeyed(this.buildQueries(modules)) as BulkResult;
        const organized = this.organize(modules, result);

        const target = ModuleStore.modules ?? {};
        for (const key in target) delete target[key];
        Object.assign(target, organized);

        ModuleStore.modules = target;
        return target;
    }

    async refetch(url: string): Promise<boolean> {
        const res = await new Promise<{ res: any; body: string }>((resolve, reject) => {
            request(url, {}, (err, res, body) => {
                if (err) return reject(err);
                resolve({res, body});
            });
        });

        let etag: string | undefined = res.res.headers.etag;

        if (etag?.startsWith("W/")) etag = etag.replace(/^W\//, "");

        if (etag && etag === ModuleStore.eTag) return false;

        const fetched = JSON.parse(res.body) as ModuleData;
        const next = this.build(fetched);

        if (this._hasUndefined(next)) ModuleStore.modules = next;

        if (etag) ModuleStore.eTag = etag;

        return true;
    }

    get CommonModules(): OrganizedModules {
        return ModuleStore.modules as OrganizedModules;
    }
}

export default new CommonModules();
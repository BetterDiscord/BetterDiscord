import type {FluxStore, FluxStoreConstructor, CommonlyUsedStores} from "discord/modules";
import {Filters, getModule} from ".";


type StoreNameType = CommonlyUsedStores | string & {_name_?: "";};

let Flux: {Store: FluxStoreConstructor;} | undefined;
export function getStore(name: StoreNameType): FluxStore | undefined {
    if (!Flux) Flux = getModule(m => m.Store?.getAll);
    if (!Flux) return getModule<FluxStore>(Filters.byStoreName(name))!;

    return Flux.Store.getAll().find((store: any) => store.getName() === name);
}

export const Stores = new Proxy({} as Record<StoreNameType, FluxStore>, {
    ownKeys() {
        if (!Flux) Flux = getModule(m => m.Store?.getAll);
        if (!Flux) return [];
        return [...new Set(Flux.Store.getAll().map((store: any) => store.getName()).filter(m => m.length > 3))] as string[];
    },
    getOwnPropertyDescriptor() {
        return {
            enumerable: true,
            configurable: true, // Not actually
        };
    },
    get(target, key: StoreNameType) {
        if (typeof target[key] === "undefined") return target[key] = getStore(key)!;
        return target[key];
    },
    set() {
        throw new Error("[WebpackModules~Stores] Setting stores is not allowed.");
    }
});

// Populate the object
Object.entries(Stores);
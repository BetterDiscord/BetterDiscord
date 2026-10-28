import {useInsertionEffect, useMemo, useReducer, useRef} from "react";
import type Store from "../stores/base";
import {shallowEqual} from "fast-equals";
import type {FluxStore} from "@typed/discord/modules";

type StoreType = Store | FluxStore;

export function useStateFromStores<T>(stores: StoreType | StoreType[], factory: () => T, deps?: React.DependencyList, isStateEqual: true | ((oldState: T, newState: T) => boolean) = (oldState, newState) => oldState === newState): T {
    const [, forceUpdate] = useForceUpdate();
    const state = useRef(undefined as T);
    const factoryRef = useRef(undefined as unknown as () => T);

    const compareStates = useRef(null as unknown as (oldState: T, newState: T) => boolean);
    compareStates.current = isStateEqual === true ? shallowEqual : isStateEqual;

    if (factoryRef.current === undefined) {
        factoryRef.current = factory;
        state.current = factory();
    }

    const prevDeps = useRef<React.DependencyList | undefined>(undefined);
    if (deps && prevDeps.current) {
        if (deps.length !== prevDeps.current.length) {
            throw new Error("Dependency List Size Changed!");
        }

        for (let index = 0; index < deps.length; index++) {
            if (Object.is(deps[index], prevDeps.current[index])) {
                continue;
            }

            factoryRef.current = factory;

            const newState = factory();

            if (!compareStates.current(state.current, newState)) {
                state.current = newState;
            }

            break;
        }
    }
    else {
        // If no deps update factory always
        factoryRef.current = factory;
    }

    prevDeps.current = deps;

    useInsertionEffect(() => {
        const $stores = Array.isArray(stores) ? stores : [stores];
        function listener() {
            const newState = factoryRef.current();
            if (!compareStates.current(state.current, newState)) {
                state.current = newState;
                forceUpdate();
            }
        }

        for (const store of $stores) {
            store.addChangeListener(listener);
        }

        return () => {
            for (const store of $stores) {
                store.removeChangeListener(listener);
            }
        };
    }, []);

    return state.current;
}

export function useForceUpdate() {
    return useReducer<number, any>((num) => num + 1, 0);
}

type AnyFN = (...args: any[]) => any;

export function useCallbackRef<T extends AnyFN>(callback: T): T {
    const ref = useRef(callback);

    ref.current = callback;

    return useMemo(() => {
        const handler: ProxyHandler<typeof ref.current> = {
            get [Symbol.for("callback")]() {
                return ref.current;
            }
        };

        for (const key of Reflect.ownKeys(Reflect) as Array<keyof typeof Reflect>) {
            if (typeof Reflect[key] !== "function") continue;

            // @ts-expect-error TS Sucks
            handler[key] = (_, ...args) => Reflect[key](ref.current, ...args);
        }

        return new Proxy(ref.current, handler);
    }, []);
};

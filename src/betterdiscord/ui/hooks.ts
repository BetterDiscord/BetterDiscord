import {useInsertionEffect, useReducer, useRef} from "@modules/react";
import type Store from "../stores/base";
import type React from "react";

export function useInternalStore<T>(stores: Store | Store[], factory: () => T, deps?: React.DependencyList, areStateEqual: (oldState: T, newState: T) => boolean = (oldState, newState) => oldState === newState): T {
    const [, forceUpdate] = useForceUpdate();
    const state = useRef(undefined as T);
    const factoryRef = useRef(undefined as unknown as () => T);

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

            if (!areStateEqual(state.current, newState)) {
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
            if (!areStateEqual(state.current, newState)) {
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
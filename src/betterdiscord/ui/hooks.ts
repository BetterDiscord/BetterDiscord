import {useInsertionEffect, useReducer, useRef} from "@modules/react";
import type Store from "../stores/base";
import type React from "react";


const empty = Symbol("betterdiscord.empty");

export function useInternalStore<T>(stores: Store | Store[], factory: () => T, deps?: React.DependencyList, areStateEqual: (oldState: T, newState: T) => boolean = (oldState, newState) => oldState === newState): T {
    const [, forceUpdate] = useForceUpdate();
    const state = useRef(empty as T);

    if (state.current === empty) {
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

            const newState = factory();

            if (!areStateEqual(state.current, newState)) {
                state.current = newState;
            }

            break;
        }
    }

    prevDeps.current = deps;

    useInsertionEffect(() => {
        const $stores = Array.isArray(stores) ? stores : [stores];
        function listener() {
            const newState = factory();
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
    return useReducer<(num: number) => number>((num) => num + 1, 0);
}
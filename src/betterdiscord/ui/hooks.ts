import {useEffect, useReducer, useState} from "@modules/react";
import type Store from "../stores/base";

export function useInternalStore<T>(store: Store, factory: () => T): T {
    const [, forceUpdate] = useForceUpdate();
    const [state, setState] = useState(factory);

    useEffect(() => {
        setState(factory);
        const listener = () => {
            setState(factory);
            forceUpdate();
        };
        return store.addChangeListener(listener);
    }, [factory, store, forceUpdate]);

    return state;
}


export function useForceUpdate() {
    return useReducer<(num: number) => number>((num) => num + 1, 0);
}
import JsonStore from "@stores/json";
import {useForceUpdate, useStateFromStores} from "@ui/hooks";

class BaseHooks {
    /** @ignore */
    constructor() {};

    /**
     * Subscribes to one or more stores and re-computes a value when they change, causing a re-render.
     * A store is anything with an `addChangeListener` and `removeChangeListener` method,
     * such as Discord's Flux stores or BdApi.Utils.Store.
     *
     * @param stores The store(s) to subscribe to
     * @param factory A function that computes the value to return when stores change
     * @param deps An optional dependency list that controls when the factory function is updated
     * @param isStateEqual An optional function that allows for skipping re-renders if the state hasn't changed
     */
    public useStateFromStores = useStateFromStores;

    /**
     * Creates a hook that forces a re-render when called.
     */
    public useForceUpdate = useForceUpdate;
}

/**
 * `Hooks` is a utility class for React hooks. An instance is available on {@link BdApi}.
 */
class Hooks extends BaseHooks {
    /** @ignore */
    constructor() {super();};

    /**
     * Retrieves data from storage and automatically re-renders when it changes.
     *
     * @param caller The name of the plugin to use data from
     * @param key The key of the data to retrieve
     * @returns The current value of the data with the given key, or undefined if it doesn't exist
     */
    public useData<T>(caller: string, key: string) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return JsonStore.useData<T>(caller, key);
    }
}

/**
 * `BoundHooks` is a utility class for React hooks, with plugin scoping automatically supplied.
 * An instance is available on instances of {@link BdApi}.
 */
class BoundHooks extends BaseHooks {
    #callerName: string;

    /** @ignore */
    constructor(callerName: string) {
        super();
        this.#callerName = callerName;
    }

    /**
     * Retrieves data from storage and automatically re-renders when it changes.
     *
     * @param key The key of the data to retrieve
     * @returns The current value of the data with the given key, or undefined if it doesn't exist
     */
    public useData<T>(key: string) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return JsonStore.useData<T>(this.#callerName, key);
    }
}

Object.freeze(Hooks);
Object.freeze(Hooks.prototype);

export {Hooks, BoundHooks};
import JsonStore from "@stores/json";
import {useForceUpdate, useStateFromStores} from "@ui/hooks";

type Falsey = false | 0 | "" | null | undefined | void;
type IsTruthy<T> = T extends Falsey ? false : true;

type UseDataArgs<Bounded extends boolean> = [
    ...(Bounded extends false ? [pluginName: string] : []),
    key: string
];

class Hooks<CN extends string | undefined = undefined, Bounded extends IsTruthy<CN> = IsTruthy<CN>> {
    readonly #callerName: CN;

    constructor(callerName?: CN);
    constructor(callerName: CN) {
        this.#callerName = callerName;
    }

    /**
     * Subscribes to one or more stores and re-computes a value when they change, causing a re-render.
     * A store is anything with an `addChangeListener` and `removeChangeListener` method,
     * such as Discord's Flux stores or BdApi.Utils.Store.
     *
     * @param stores The store(s) to subscribe to
     * @param factory A function that computes the value to return when stores change
     * @param deps An optional dependency list that controls when the factory function is updated
     * @param isStateEqual An optional function that allows for skipping re-renders if the state hasn't changed, or `true` to use a shallow equality check
     */
    public useStateFromStores = useStateFromStores;

    /**
     * Creates a hook that forces a re-render when called.
     */
    public useForceUpdate = useForceUpdate;

    /**
     * Retrieves data from storage and automatically re-renders when it changes.
     *
     * @param key The key of the data to retrieve
     * @returns The current value of the data with the given key, or undefined if it doesn't exist
     */
    public useData<T>(...args: UseDataArgs<Bounded>) {
        const callerName = this.#callerName || args.shift();

        // eslint-disable-next-line react-hooks/rules-of-hooks
        return JsonStore.useData<T>(callerName!, args[0]);
    }
}

Object.freeze(Hooks);
Object.freeze(Hooks.prototype);

export default Hooks;
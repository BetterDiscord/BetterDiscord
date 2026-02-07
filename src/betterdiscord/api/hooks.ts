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

    public useStateFromStores = useStateFromStores;
    public useForceUpdate = useForceUpdate;

    public useData<T>(...args: UseDataArgs<Bounded>) {
        const callerName = this.#callerName || args.shift();

        // eslint-disable-next-line react-hooks/rules-of-hooks
        return JsonStore.useData<T>(callerName!, args[0]);
    }
}

Object.freeze(Hooks);
Object.freeze(Hooks.prototype);

export default Hooks;
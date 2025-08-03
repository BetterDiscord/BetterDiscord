import JsonStore from "@stores/json";

type BaseArgs<Bounded extends boolean> = [
    ...(Bounded extends false ? [pluginName: string] : []),
    key: string
];


type SaveArgs<Bounded extends boolean, T> = [
    ...BaseArgs<Bounded>,
    data: T
];

/**
 * `Data` is a simple utility class for the management of plugin data. An instance is available on {@link BdApi}.
 * @type Data
 * @summary {@link Data} is a simple utility class for the management of plugin data.
 * @name Data
 */
class Data<Bounded extends boolean> {

    #callerName = "";

    constructor(callerName?: string) {
        if (!callerName) return;
        this.#callerName = callerName;
    }

    /**
     * Saves JSON-serializable data.
     *
     * @param {string} pluginName Name of the plugin saving data
     * @param {string} key Which piece of data to store
     * @param {any} data The data to be saved
     */
    save<T>(...args: SaveArgs<Bounded, T>) {
        if (this.#callerName) {
            return JsonStore.setData(this.#callerName, ...(args as unknown as SaveArgs<true, T>));
        }

        return JsonStore.setData(...(args as unknown as SaveArgs<false, T>));
    }

    /**
     * Loads previously stored data.
     *
     * @param {string} pluginName Name of the plugin loading data
     * @param {string} key Which piece of data to load
     * @returns {any} The stored data
     */
    load<T>(...args: BaseArgs<Bounded>): T {
        if (this.#callerName) {
            return JsonStore.getData(this.#callerName, args[0]);
        }

        return JsonStore.getData(args[0], args[1]);
    }

    /**
     * Deletes a piece of stored data. This is different than saving `null` or `undefined`.
     *
     * @param {string} pluginName Name of the plugin deleting data
     * @param {string} key Which piece of data to delete.
     */
    delete(...args: BaseArgs<Bounded>) {
        if (this.#callerName) {
            return JsonStore.deleteData(this.#callerName, args[0]);
        }

        return JsonStore.deleteData(args[0], args[1]);
    }

}

Object.freeze(Data);
Object.freeze(Data.prototype);
export default Data;
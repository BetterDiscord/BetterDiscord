import JsonStore from "@stores/json";

type BaseArgs<Bounded extends boolean> = [
    ...(Bounded extends false ? [pluginName: string] : []),
    key: string
];

type SaveArgs<Bounded extends boolean, T> = [
    ...BaseArgs<Bounded>,
    data: T
];

// type OnChangeArgs<Bounded extends boolean, T> = [
//     ...(Bounded extends false ? [pluginName: string] : []),
//     key: string,
//     onChange: (value?: T) => void
// ] | [
//     ...(Bounded extends false ? [pluginName: string] : []),
//     onChange: (key: string, value?: T) => void
// ];

/**
 * `Data` is a simple utility class for the management of plugin data. An instance is available on {@link BdApi}.
 * @type Data
 * @summary {@link Data} is a simple utility class for the management of plugin data.
 * @name Data
 */
class Data<Bounded extends boolean> {
    #pluginName = "";

    constructor(pluginName?: string) {
        if (!pluginName) return;
        this.#pluginName = pluginName;
    }

    /**
     * Saves JSON-serializable data.
     *
     * @param {string} pluginName Name of the plugin saving data
     * @param {string} key Which piece of data to store
     * @param {any} data The data to be saved
     */
    public save<T>(...args: SaveArgs<Bounded, T>) {
        if (this.#pluginName) {
            return JsonStore.setData(this.#pluginName, ...(args as unknown as SaveArgs<true, T>));
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
    public load<T>(...args: BaseArgs<Bounded>): T {
        if (this.#pluginName) {
            return JsonStore.getData(this.#pluginName, args[0]);
        }

        return JsonStore.getData(args[0], args[1]);
    }

    /**
     * Recaches JSON-serializable save file.
     *
     * @param {string} pluginName Name of the plugin saving data
     * @return {boolean} success Did the data recache
     *
     * @warning ⚠️ **Use of the recaching is discouraged!**
     *
     * Recache loads can block the filesystem and significantly degrade performance.
     * Use this method only for **debugging or testing purposes**. Avoid frequent recaching in production environments.
     */
    public async recache(...args: Bounded extends true ? [] : [pluginName: string]) {
        const pluginName = this.#pluginName || args[0];
        return JsonStore.recache(pluginName!);
    }

    /**
     * Deletes a piece of stored data. This is different than saving `null` or `undefined`.
     *
     * @param {string} pluginName Name of the plugin deleting data
     * @param {string} key Which piece of data to delete.
     */
    public delete(...args: BaseArgs<Bounded>) {
        if (this.#pluginName) {
            return JsonStore.deleteData(this.#pluginName, args[0]);
        }

        return JsonStore.deleteData(args[0], args[1]);
    }

    // public on<T>(...args: OnChangeArgs<Bounded, T>) {
    //     if (this.#pluginName) {
    //         if (typeof args[0] === "function") {
    //             return JsonStore.addPluginChangeListener(this.#pluginName, args[0]);
    //         }

    //         return JsonStore.addPluginChangeListener(this.#pluginName, args[1], args[0]);
    //     }

    //     if (typeof args[1] === "function") {
    //         return JsonStore.addPluginChangeListener(args[0] as string, args[1]);
    //     }

    //     return JsonStore.addPluginChangeListener(args[0] as string, args[2], args[1]);
    // }

    // public off(...args: OnChangeArgs<Bounded, unknown>) {
    //     if (this.#pluginName) {
    //         if (typeof args[0] === "function") {
    //             return JsonStore.removePluginChangeListener(this.#pluginName, args[0]);
    //         }

    //         return JsonStore.removePluginChangeListener(this.#pluginName, args[1], args[0]);
    //     }

    //     if (typeof args[1] === "function") {
    //         return JsonStore.removePluginChangeListener(args[0] as string, args[1]);
    //     }

    //     return JsonStore.removePluginChangeListener(args[0] as string, args[2], args[1]);
    // }
}

Object.freeze(Data);
Object.freeze(Data.prototype);

export default Data;
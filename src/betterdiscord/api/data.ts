import JsonStore from "@stores/json";

/**
 * `Data` is a simple utility class for the management of plugin data. An instance is available on {@link BdApi}.
 */
class Data {
    /**
     * Saves JSON-serializable data.
     *
     * @param pluginName Name of the plugin saving data
     * @param key Which piece of data to store
     * @param data The data to be saved
     */
    public save(pluginName: string, key: string, data: any) {
        JsonStore.setData(pluginName, key, data);
    }

    /**
     * Loads previously stored data.
     *
     * @param pluginName Name of the plugin loading data
     * @param key Which piece of data to load
     * @returns The stored data
     */
    public load(pluginName: string, key: string) {
        return JsonStore.getData(pluginName, key);
    }

    /**
     * Recaches JSON-serializable save file.
     *
     * @param pluginName Name of the plugin saving data
     * @returns Whether the data successfully recached
     *
     * ⚠️ **Use of recaching is discouraged!**
     *
     * Recache loads can block the filesystem and significantly degrade performance.
     * Use this method only for **debugging or testing purposes**. Avoid frequent recaching in production environments.
     */
    public async recache(pluginName: string) {
        return JsonStore.recache(pluginName);
    }

    /**
     * Deletes a piece of stored data. This is different than saving `null` or `undefined`.
     *
     * @param pluginName Name of the plugin deleting data
     * @param key Which piece of data to delete.
     */
    public delete(pluginName: string, key: string) {
        JsonStore.deleteData(pluginName, key);
    }
}

/**
 * `Data` is a simple utility class for the management of plugin data. An instance is available on {@link BdApi}.
 */
class BoundData {
    #pluginName: string;

    constructor(pluginName: string) {
        this.#pluginName = pluginName;
    }

    /**
     * Saves JSON-serializable data.
     *
     * @param key Which piece of data to store
     * @param data The data to be saved
     */
    public save(key: string, data: any) {
        JsonStore.setData(this.#pluginName, key, data);
    }

    /**
     * Loads previously stored data.
     *
     * @param key Which piece of data to load
     * @returns The stored data
     */
    public load<T>(key: string): T {
        return JsonStore.getData(this.#pluginName, key);
    }

    /**
     * Recaches JSON-serializable save file.
     *
     * @returns Whether the data successfully recached
     *
     * @warning ⚠️ **Use of recaching is discouraged!**
     *
     * Recache loads can block the filesystem and significantly degrade performance.
     * Use this method only for **debugging or testing purposes**. Avoid frequent recaching in production environments.
     */
    public async recache() {
        return JsonStore.recache(this.#pluginName);
    }

    /**
     * Deletes a piece of stored data. This is different than saving `null` or `undefined`.
     *
     * @param key Which piece of data to delete.
     */
    public delete(key: string) {
        return JsonStore.deleteData(this.#pluginName, key);
    }
}

Object.freeze(Data);
Object.freeze(Data.prototype);
export { Data, BoundData };
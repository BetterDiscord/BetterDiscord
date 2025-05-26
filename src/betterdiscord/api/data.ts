import JsonStore from "@stores/json";


/**
 * `Data` is a simple utility class for the management of plugin data. An instance is available on {@link BdApi}.
 * @type Data
 * @summary {@link Data} is a simple utility class for the management of plugin data.
 * @name Data
 */
class Data {

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
    save<T>(pluginName: string, key: string, data: T) {
        if (this.#callerName) {
            data = key as T;
            key = pluginName;
            pluginName = this.#callerName;
        }
        return JsonStore.setData(pluginName, key, data);
    }

    /**
     * Loads previously stored data.
     *
     * @param {string} pluginName Name of the plugin loading data
     * @param {string} key Which piece of data to load
     * @returns {any} The stored data
     */
    load<T>(pluginName: string, key: string): T {
        if (this.#callerName) {
            key = pluginName;
            pluginName = this.#callerName;
        }
        return JsonStore.getData(pluginName, key);
    }

    /**
     * Deletes a piece of stored data. This is different than saving `null` or `undefined`.
     *
     * @param {string} pluginName Name of the plugin deleting data
     * @param {string} key Which piece of data to delete.
     */
    delete(pluginName: string, key: string) {
        if (this.#callerName) {
            key = pluginName;
            pluginName = this.#callerName;
        }
        return JsonStore.deleteData(pluginName, key);
    }

}

Object.freeze(Data);
Object.freeze(Data.prototype);
export default Data;
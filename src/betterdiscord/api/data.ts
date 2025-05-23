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
    save(pluginName: string, key: string, data: unknown) {
        if (this.#callerName) {
            data = key;
            key = pluginName;
            pluginName = this.#callerName;
        }
        return JsonStore.setData(pluginName, key, data);
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
    recache(pluginName: string) {
        if (this.#callerName) {
            pluginName = this.#callerName;
        }
        return JsonStore.recache(pluginName);
    }

    /**
     * Loads previously stored data.
     *
     * @param {string} pluginName Name of the plugin loading data
     * @param {string} key Which piece of data to load
     * @param {boolean} uncached uncaches the last returned data if true
     * @returns {any} The stored data
     *
     * @warning ⚠️ **Use of the `uncached` parameter is discouraged!**
     *
     * Uncached loads can block the filesystem and significantly degrade performance.
     * Use `uncached` only for **debugging or testing purposes**. Avoid frequent recaching in production environments.
     */

    load(pluginName: string, key: string, uncached: boolean = false) {
        if (this.#callerName) {
            key = pluginName;
            pluginName = this.#callerName;
        }
        return JsonStore.getData(pluginName, key, uncached);
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
import DataStore from "../datastore";

/**
 * `Data` is a simple utility class for the management of plugin data. An instance is available on {@link BdApi}.
 * @type Data
 * @summary {@link Data} is a simple utility class for the management of plugin data.
 * @name Data
 */
class Data {

    #callerName = "";

    constructor(callerName) {
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
    save(pluginName, key, data) {
        if (this.#callerName) {
            data = key;
            key = pluginName;
            pluginName = this.#callerName;
        }
        return DataStore.setPluginData(pluginName, key, data);
    }

    /**
     * Loads previously stored data.
     * 
     * @param {string} pluginName Name of the plugin loading data
     * @param {string} key Which piece of data to load
     * @returns {any} The stored data
     */
    load(pluginName, key) {
        if (this.#callerName) {
            key = pluginName;
            pluginName = this.#callerName;
        }
        return DataStore.getPluginData(pluginName, key);
    }

    /**
     * Deletes a piece of stored data, this is different than saving as null or undefined.
     * 
     * @param {string} pluginName Name of the plugin deleting data
     * @param {string} key Which piece of data to delete
     */
    delete(pluginName, key) {
        if (this.#callerName) {
            key = pluginName;
            pluginName = this.#callerName;
        }
        return DataStore.deletePluginData(pluginName, key);
    }

}

Object.freeze(Data);
Object.freeze(Data.prototype);
export default Data;
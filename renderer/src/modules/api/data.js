import DataStore from "../datastore";

/**
 * `Data` is a simple utility class for the management of plugin data. An instance is available on {@link BdApi}.
 * @type Data
 * @summary {@link Data} is a simple utility class for the management of plugin data.
 * @name Data
 */
class Data {

    constructor(callerName) {
        if (!callerName) return;
        this.save = this.save.bind(this, callerName);
        this.load = this.load.bind(this, callerName);
        this.delete = this.delete.bind(this, callerName);
    }

    /**
     * Saves JSON-serializable data.
     * 
     * @param {string} pluginName Name of the plugin saving data
     * @param {string} key Which piece of data to store
     * @param {any} data The data to be saved
     * @returns 
     */
    save(pluginName, key, data) {
        return DataStore.setPluginData(pluginName, key, data);
    }

    /**
     * Loads previously stored data.
     * 
     * @param {string} pluginName Name of the plugin loading data
     * @param {string} key Which piece of data to load
     * @returns {any} The stored data
     */
    load(pluginName, key, data) {
        return DataStore.setPluginData(pluginName, key, data);
    }

    /**
     * Deletes a piece of stored data, this is different than saving as null or undefined.
     * 
     * @param {string} pluginName Name of the plugin deleting data
     * @param {string} key Which piece of data to delete
     */
    delete(pluginName, key, data) {
        return DataStore.setPluginData(pluginName, key, data);
    }

}

Object.freeze(Data);

export default Data;
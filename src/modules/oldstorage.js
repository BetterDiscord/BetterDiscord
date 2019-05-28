import Utilities from "./utilities";
import DataStore from "./datastore";

export class bdStorage {
    static get(key) {
        Utilities.warn("Deprecation Notice", "Please use BdApi.getBDData(). bdStorage may be removed in future versions.");
        return DataStore.getBDData(key);
    }

    static set(key, data) {
        Utilities.warn("Deprecation Notice", "Please use BdApi.setBDData(). bdStorage may be removed in future versions.");
        DataStore.setBDData(key, data);
    }
}

export class bdPluginStorage {
    static get(pluginName, key) {
        Utilities.warn("Deprecation Notice", `${pluginName}, please use BdApi.loadData() or BdApi.getData(). bdPluginStorage may be removed in future versions.`);
        return DataStore.getPluginData(pluginName, key) || null;
    }

    static set(pluginName, key, data) {
        Utilities.warn("Deprecation Notice", `${pluginName}, please use BdApi.saveData() or BdApi.setData(). bdPluginStorage may be removed in future versions.`);
        if (typeof(data) === "undefined") return Utilities.warn("Deprecation Notice", "Trying to set undefined value in plugin " + pluginName);
        DataStore.setPluginData(pluginName, key, data);
    }

    static delete(pluginName, key) {
        Utilities.warn("Deprecation Notice", `${pluginName}, please use BdApi.deleteData(). bdPluginStorage may be removed in future versions.`);
        DataStore.deletePluginData(pluginName, key);
    }
}
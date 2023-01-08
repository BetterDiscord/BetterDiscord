// @ts-nocheck
import {Logger} from "@betterdiscord/common";
import DataStore from "./datastore";
import WebpackModules from "./webpackmodules";
import DOMManager from "./dommanager";

if (process.env.DEVELOPMENT) {
    Object.assign(window, {DataStore, WebpackModules});
}

export default class Core {
    static async initialize() {
        Logger.log("Core", "Initializing DataStore.");
        const start = Date.now();
        await DataStore.initialize();

        Logger.log("DataStore", "Initialization took " + (Date.now() - start).toFixed(0) + "ms");
    }
}

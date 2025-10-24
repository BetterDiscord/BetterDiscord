import Logger from "@common/logger";

import SettingsConfig from "@data/settings";

import DataStore from "./datastore";
import Events from "./emitter";
import DiscordModules from "./discordmodules";
import Strings from "./strings";


export default new class SettingsManager {

    constructor() {
        this.state = {};
        this.collections = [];
        this.panels = [];
    }

    initialize() {
        this.registerCollection("settings", "Settings", SettingsConfig);
    }

    registerCollection(id, name, settings, button = null) {
        if (this.collections.find(c => c.id == id)) return Logger.error("Settings", "Already have a collection with id " + id);
        this.collections.push({
            type: "collection",
            id: id,
            name: name,
            settings: settings,
            button: button
        });
        this.setupCollection(id);
        this.loadCollection(id);
    }

    removeCollection(id) {
        const location = this.collections.findIndex(c => c.id == id);
        if (location < 0) return Logger.error("Settings", "No collection with id " + id);
        this.collections.splice(location, 1);
    }

    // TODO: Move this to SettingsRenderer and also add a registerContentPanel
    registerPanel(id, name, options) {
        if (this.panels.find(p => p.id == id)) return Logger.error("Settings", "Already have a panel with id " + id);
        const {element, onClick, order = 1, icon} = options;
        const section = {
            id,
            order,
            get label() {return Strings.Panels[id].toString() || name;},
            section: id,
            get searchableTitles() {
                const {searchableTitles} = options;
                
                return Array.isArray(searchableTitles) && searchableTitles.every((item) => typeof item === "string") ? searchableTitles : [];
            },
            icon
        };
        if (onClick) section.clickListener = onClick;
        if (element) section.element = element instanceof DiscordModules.React.Component ? () => DiscordModules.React.createElement(element, {}) : typeof(element) == "function" ? element : () => element;
        this.panels.push(section);
    }

    removePanel(id) {
        const location = this.panels.findIndex(c => c.id == id);
        if (location < 0) return Logger.error("Settings", "No collection with id " + id);
        this.panels.splice(location, 1);
    }

    getPath(path, collectionId = "", categoryId = "") {
        const collection = path.length == 3 ? path[0] : collectionId;
        const category = path.length == 3 ? path[1] : path.length == 2 ? path[0] : categoryId;
        const setting = path[path.length - 1];
        return {collection, category, setting};
    }

    setupCollection(id) {
        const collection = this.collections.find(c => c.id == id);
        if (!collection) return;

        // Initialize state for collection
        if (!this.state[collection.id]) this.state[collection.id] = {};

        // Use a getter so the collection name auto translates
        const collectionName = collection.name;
        Object.defineProperty(collection, "name", {
            enumerable: true,
            get: () => Strings.Collections[collection.id]?.name?.toString() || collectionName
        });

        const categories = collection.settings;
        
        for (let cc = 0; cc < categories.length; cc++) {
            const category = categories[cc];

            // Initialize state for this category in this collection
            if (!this.state[collection.id].hasOwnProperty(category.id)) this.state[collection.id][category.id] = {};

            // Use a getter so category name auto translates
            const categoryName = category.name;
            Object.defineProperty(category, "name", {
                enumerable: true,
                get: () => Strings.Collections[collection.id]?.[category.id]?.name?.toString() || categoryName
            });

            
            for (let s = 0; s < category.settings.length; s++) {
                const setting = category.settings[s];

                // Set initial state as the initial value for this setting
                if (!this.state[collection.id][category.id].hasOwnProperty(setting.id)) this.state[collection.id][category.id][setting.id] = setting.value;

                // Move value to defaultValue for internal use
                setting.defaultValue = setting.value;

                // Use a getter so the setting name and note auto translate
                const settingName = setting.name;
                const settingNote = setting.note;
                Object.defineProperties(setting, {
                    name: {
                        enumerable: true,
                        get: () => Strings.Collections[collection.id]?.[category.id]?.[setting.id]?.name?.toString() || settingName
                    },
                    note: {
                        enumerable: true,
                        get: () => Strings.Collections[collection.id]?.[category.id]?.[setting.id]?.note?.toString() || settingNote
                    }
                });

                // Use a getter for option labels to auto translate
                if (setting.options) {
                    for (const opt of setting.options) {
                        const optLabel = opt.label;
                        Object.defineProperty(opt, "label", {
                            enumerable: true,
                            get: () => {
                                const translations = Strings.Collections[collection.id]?.[category.id]?.[setting.id]?.options;
                                return translations?.[opt.id]?.toString() || translations?.[opt.value]?.toString() || optLabel;
                            }
                        });
                    }
                }

                // If the setting doesn't use enableWith XOR disableWith then move on
                if (setting.hasOwnProperty("disabled")) continue;
                if (!setting.enableWith && !setting.disableWith) continue;
                const pathString = setting.enableWith || setting.disableWith;
                const path = this.getPath(pathString.split("."), collection.id, category.id);
                Object.defineProperty(setting, "disabled", {
                    enumerable: true,
                    get: () => {
                        const other = this.state[path.collection][path.category][path.setting];
                        return setting.enableWith ? !other : other;
                    }
                });
            }
        }
    }

    saveSettings() {
        for (const collection in this.state) this.saveCollection(collection);
    }

    loadSettings() {
        for (const collection in this.state) this.loadCollection(collection);
    }

    saveCollection(collection) {
        DataStore.setData(collection, this.state[collection]);
    }

    loadCollection(id) {
        const previousState = DataStore.getData(id);
        if (!previousState) return this.saveCollection(id);
        for (const category in this.state[id]) {
            if (!previousState[category]) Object.assign(previousState, {[category]: this.state[id][category]});
            for (const setting in this.state[id][category]) {
                if (previousState[category][setting] == undefined) continue;
                const settingObj = this.getSetting(id, category, setting);
                switch (settingObj.type) {
                    case "radio":
                    case "dropdown": {
                        const exists = settingObj.options.some(o => o.value == previousState[category][setting]);
                        if (exists) this.state[id][category][setting] = previousState[category][setting];
                        break;
                    }
                    default: {
                        this.state[id][category][setting] = previousState[category][setting];
                    }
                }
            }
        }

        this.saveCollection(id); // in case new things were added
    }

    resetCollection(id) {
        const collection = this.collections.find(c => c.id == id);
        if (!collection) return;
        const categories = collection.settings;
        for (let cc = 0; cc < categories.length; cc++) {
            const category = categories[cc];
            if (category.type != "category") {
                // console.log("cat", collection.id, category.id, this.get(collection.id, category.id), category.value);
                if (this.get(collection.id, category.id) == category.defaultValue) continue;
                this.set(collection.id, category.id, category.defaultValue);
            }
            else {
                for (let s = 0; s < category.settings.length; s++) {
                    const setting = category.settings[s];
                    // console.log("setting", collection.id, category.id, setting.id, this.get(collection.id, category.id, setting.id), setting.defaultValue);
                    if (this.get(collection.id, category.id, setting.id) == setting.defaultValue) continue;
                    this.set(collection.id, category.id, setting.id, setting.defaultValue);
                }
            }
        }
    }

    onSettingChange(collection, category, id, value) {
        this.state[collection][category][id] = value;
        Events.dispatch("setting-updated", collection, category, id, value);
        this.saveCollection(collection);
    }

    getSetting(collection, category, id) {
        if (arguments.length == 2) return this.collections[0].find(c => c.id == arguments[0]).settings.find(s => s.id == arguments[1]);
        return this.collections.find(c => c.id == collection).settings.find(c => c.id == category).settings.find(s => s.id == id);
    }

    get(collection, category, id) {
        if (arguments.length == 2) {
            id = category;
            category = collection;
            collection = "settings";
        }
        if (!this.state[collection] || !this.state[collection][category]) return false;
        return this.state[collection][category][id];
    }

    set(collection, category, id, value) {
        if (arguments.length == 3) {
            value = id;
            id = category;
            category = collection;
            collection = "settings";
        }
        return this.onSettingChange(collection, category, id, value);
    }

    on(collection, category, identifier, callback) {
        const handler = (col, cat, id, value) => {
            if (col !== collection || cat !== category || id !== identifier) return;
            callback(value);
        };
        Events.on("setting-updated", handler);
        return () => {Events.off("setting-updated", handler);};
    }
};
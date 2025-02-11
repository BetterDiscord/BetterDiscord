import Logger from "@common/logger";

import SettingsConfig, {type DropdownSetting, type SettingsCategory} from "@data/settings";

import DataStore from "@modules/datastore";
import Events from "@modules/emitter";
import DiscordModules from "@modules/discordmodules";
import Strings from "@modules/strings";
import Store from "./base";
import type {ComponentType} from "react";
import type AddonManager from "@modules/addonmanager";


export interface SettingsCollection {
    type: "collection";
    id: string;
    name: string;
    settings: SettingsCategory[];
}

export interface SettingsPanel {
    id: string;
    order: number;
    className?: string;
    label: string;
    section: string;
    clickListener?: (thisObject: unknown) => void;
    onClick?: (event: MouseEvent) => void;
    element?: ComponentType;
    type?: "addon" | "settings";
    manager?: AddonManager;
}

type State = Record<string, Record<string, any>>;

export default new class SettingsManager extends Store {

    state: State = {};
    collections: SettingsCollection[] = [];
    panels: SettingsPanel[] = [];

    initialize() {
        this.registerCollection("settings", "Settings", SettingsConfig);
    }

    registerCollection(id: string, name: string, settings: SettingsCategory[]) {
        if (this.collections.find(c => c.id == id)) return Logger.error("Settings", "Already have a collection with id " + id);
        this.collections.push({
            type: "collection",
            id: id,
            name: name,
            settings: settings
        });
        this.setupCollection(id);
        this.loadCollection(id);
    }

    removeCollection(id: string) {
        const location = this.collections.findIndex(c => c.id == id);
        if (location < 0) return Logger.error("Settings", "No collection with id " + id);
        this.collections.splice(location, 1);
    }

    registerPanel(id: string, name: string, options: {onClick?: () => void; element?: ComponentType; order: number; type?: "addon" | "settings"; manager?: AddonManager;}) {
        if (this.panels.find(p => p.id == id)) return Logger.error("Settings", "Already have a panel with id " + id);
        const {element, onClick, order = 1, type = "settings"} = options;
        const section: SettingsPanel = {
            id,
            type,
            order,
            get label() {return Strings.Panels[id as keyof typeof Strings.Panels].toString() || name;},
            section: id
        };
        if (options.manager) section.manager = options.manager;
        if (onClick) section.clickListener = onClick;
        if (element) section.element = element instanceof DiscordModules.React.Component ? () => DiscordModules.React.createElement(element, {}) : typeof (element) == "function" ? element : () => element;
        this.panels.push(section);
    }

    registerAddonPanel(manager: AddonManager) {
        const plural = manager.prefix + "s";
        const title = Strings.Panels[plural as keyof typeof Strings.Panels];
        this.registerPanel(plural, title, {order: manager.order, type: "addon", manager: manager});
    }

    removePanel(id: string) {
        const location = this.panels.findIndex(c => c.id == id);
        if (location < 0) return Logger.error("Settings", "No collection with id " + id);
        this.panels.splice(location, 1);
    }

    getPath(path: string[], collectionId = "", categoryId = "") {
        const collection = path.length == 3 ? path[0] : collectionId;
        const category = path.length == 3 ? path[1] : path.length == 2 ? path[0] : categoryId;
        const setting = path[path.length - 1];
        return {collection, category, setting};
    }

    setupCollection(id: string) {
        const collection = this.collections.find(c => c.id == id);
        if (!collection) return;

        // Initialize state for collection
        if (!this.state[collection.id]) this.state[collection.id] = {};

        // Use a getter so the collection name auto translates
        const collectionName = collection.name;
        Object.defineProperty(collection, "name", {
            enumerable: true,
            get: () => Strings.Collections[collection.id as keyof typeof Strings.Collections]?.name?.toString() || collectionName
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
                // @ts-expect-error Cannot handle generic strings via proxy. This will be fixed with the new i18n system.
                get: () => Strings.Collections[collection.id as keyof typeof Strings.Collections]?.[category.id]?.name?.toString() || categoryName
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
                        // @ts-expect-error Cannot handle generic strings via proxy. This will be fixed with the new i18n system.
                        get: () => Strings.Collections[collection.id as keyof typeof Strings.Collections]?.[category.id]?.[setting.id]?.name?.toString() || settingName
                    },
                    note: {
                        enumerable: true,
                        // @ts-expect-error Cannot handle generic strings via proxy. This will be fixed with the new i18n system.
                        get: () => Strings.Collections[collection.id as keyof typeof Strings.Collections]?.[category.id]?.[setting.id]?.note?.toString() || settingNote
                    }
                });

                // Use a getter for option labels to auto translate
                if ((setting as DropdownSetting<unknown>).options) {
                    for (const opt of (setting as DropdownSetting<unknown>).options) {
                        const optLabel = opt.label;
                        Object.defineProperty(opt, "label", {
                            enumerable: true,
                            get: () => {
                                // @ts-expect-error Cannot handle generic strings via proxy. This will be fixed with the new i18n system.
                                const translations = Strings.Collections[collection.id as keyof typeof Strings.Collections]?.[category.id]?.[setting.id]?.options;
                                return translations?.[opt.id]?.toString() || translations?.[opt.value]?.toString() || optLabel;
                            }
                        });
                    }
                }

                // If the setting doesn't use enableWith XOR disableWith then move on
                if (setting.hasOwnProperty("disabled")) continue;
                if (!setting.enableWith && !setting.disableWith) continue;
                const pathString = setting.enableWith ?? setting.disableWith;
                const path = this.getPath(pathString!.split("."), collection.id, category.id);
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

    saveCollection(collection: string) {
        DataStore.setData(collection, this.state[collection]);
    }

    loadCollection(id: string) {
        const previousState = DataStore.getData(id);
        if (!previousState) return this.saveCollection(id);
        for (const category in this.state[id]) {
            if (!previousState[category]) Object.assign(previousState, {[category]: this.state[id][category]});
            for (const setting in this.state[id][category]) {
                if (previousState[category][setting] == undefined) continue;
                const settingObj = this.getSetting(id, category, setting);
                switch (settingObj?.type) {
                    case "radio":
                    case "dropdown": {
                        const exists = (settingObj as DropdownSetting<unknown>).options.some(o => o.value == previousState[category][setting]);
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

    resetCollection(id: string) {
        const collection = this.collections.find(c => c.id == id);
        if (!collection) return;
        const categories = collection.settings;
        for (let cc = 0; cc < categories.length; cc++) {
            const category = categories[cc];
            for (let s = 0; s < category.settings.length; s++) {
                const setting = category.settings[s];
                // console.log("setting", collection.id, category.id, setting.id, this.get(collection.id, category.id, setting.id), setting.defaultValue);
                if (this.get(collection.id, category.id, setting.id) == setting.defaultValue) continue;
                this.set(collection.id, category.id, setting.id, setting.defaultValue);
            }
        }
    }

    onSettingChange(collection: string, category: string, id: string, value: unknown) {
        this.state[collection][category][id] = value;
        Events.dispatch("setting-updated", collection, category, id, value);
        this.emit();
        this.saveCollection(collection);
    }

    getSetting(collection: string, category: string, id?: string) {
        if (arguments.length == 2) {
            id = category;
            category = collection;
            collection = "settings";
        }
        return this.collections.find(c => c.id == collection)?.settings.find(c => c.id == category)?.settings.find(s => s.id == id);
    }

    get(collection: string, category: string, id?: string) {
        if (arguments.length == 2) {
            id = category;
            category = collection;
            collection = "settings";
        }
        if (!this.state[collection] || !this.state[collection][category]) return false;
        return this.state[collection][category][id!];
    }

    set(collection: string, category: string, id: string | unknown, value?: unknown): any {
        if (arguments.length == 3) {
            value = id;
            id = category;
            category = collection;
            collection = "settings";
        }
        return this.onSettingChange(collection, category, id as string, value);
    }

    on(collection: string, category: string, identifier: string, callback: (val: unknown) => void) {
        const handler = (col: string, cat: string, id: string, value: unknown) => {
            if (col !== collection || cat !== category || id !== identifier) return;
            callback(value);
        };
        Events.on("setting-updated", handler);
        return () => {Events.off("setting-updated", handler);};
    }
};
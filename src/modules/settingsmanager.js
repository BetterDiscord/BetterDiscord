import {SettingsConfig} from "data";
import Logger from "./logger";
import DataStore from "./datastore";
import Events from "./emitter";
import WebpackModules from "./webpackmodules";
import DiscordModules from "./discordmodules";
import Patcher from "./patcher";
import ReactComponents from "./reactcomponents";

import {SettingsPanel as SettingsRenderer} from "ui";
import Utilities from "./utilities";

export default new class SettingsManager {

    constructor() {
        this.state = {};
        this.collections = [];
        this.panels = [];
        this.registerCollection("settings", "Settings", SettingsConfig);
    }

    initialize() {
        DataStore.initialize();
        this.loadSettings();
        this.patchSections();
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
        this.setup();
    }

    removeCollection(id) {
        const location = this.collections.findIndex(c => c.id == id);
        if (!location < 0) return Logger.error("Settings", "No collection with id " + id);
        this.collections.splice(location, 1);
    }

    registerPanel(id, name, options) {
        if (this.panels.find(p => p.id == id)) return Logger.error("Settings", "Already have a panel with id " + id);
        const {element, onClick, order = 1} = options;
        const section = {id, order, label: name, section: name};
        if (onClick) section.clickListener = onClick;
        if (element) section.element = element instanceof DiscordModules.React.Component ? () => DiscordModules.React.createElement(element, {}) : typeof(element) == "function" ? element : () => element;
        this.panels.push(section);
    }

    removePanel(id) {
        const location = this.panels.findIndex(c => c.id == id);
        if (!location < 0) return Logger.error("Settings", "No collection with id " + id);
        this.panels.splice(location, 1);
    }

    getPath(path, collectionId = "", categoryId = "") {
        const collection = path.length == 3 ? path[0] : collectionId;
        const category = path.length == 3 ? path[1] : path.length == 2 ? path[0] : categoryId;
        const setting = path[path.length - 1];
        return {collection, category, setting};
    }

    setup() {
        for (let c = 0; c < this.collections.length; c++) {
            const collection = this.collections[c];
            const categories = this.collections[c].settings;
            if (!this.state[collection.id]) this.state[collection.id] = {};
            for (let cc = 0; cc < categories.length; cc++) {
                const category = categories[cc];
                if (category.type != "category") {if (!this.state[collection.id].hasOwnProperty(category.id)) this.state[collection.id][category.id] = category.value;}
                else {
                    if (!this.state[collection.id].hasOwnProperty(category.id)) this.state[collection.id][category.id] = {};
                    for (let s = 0; s < category.settings.length; s++) {
                        const setting = category.settings[s];
                        if (!this.state[collection.id][category.id].hasOwnProperty(setting.id)) this.state[collection.id][category.id][setting.id] = setting.value;
                        if (setting.enableWith) {
                            const path = this.getPath(setting.enableWith.split("."), collection.id, category.id);
                            if (setting.hasOwnProperty("disabled")) continue;
                            Object.defineProperty(setting, "disabled", {
                                get: () => {
                                    return !this.state[path.collection][path.category][path.setting];
                                }
                            });
                        }

                        if (setting.disableWith) {
                            const path = this.getPath(setting.disableWith.split("."), collection.id, category.id);
                            if (setting.hasOwnProperty("disabled")) continue;
                            Object.defineProperty(setting, "disabled", {
                                get: () => {
                                    return this.state[path.collection][path.category][path.setting];
                                }
                            });
                        }
                    }
                }
            }
        }
    }

    async patchSections() {
        Patcher.after("SettingsManager", WebpackModules.getByDisplayName("FluxContainer(GuildSettings)").prototype, "render", (thisObject) => {
            thisObject._reactInternalFiber.return.return.return.return.return.return.memoizedProps.id = "guild-settings";
        });
        const UserSettings = await ReactComponents.get("UserSettings", m => m.prototype && m.prototype.generateSections);
        Patcher.after("SettingsManager", UserSettings.prototype, "render", (thisObject) => {
            thisObject._reactInternalFiber.return.return.return.return.return.return.return.memoizedProps.id = "user-settings";
        });
        Patcher.after("SettingsManager", UserSettings.prototype, "generateSections", (thisObject, args, returnValue) => {
            let location = returnValue.findIndex(s => s.section.toLowerCase() == "linux") + 1;
            const insert = (section) => {
                returnValue.splice(location, 0, section);
                location++;
            };
            insert({section: "DIVIDER"});
            insert({section: "HEADER", label: "BandagedBD"});
            for (const collection of this.collections) {
                if (collection.disabled) continue;
                insert({
                    section: collection.name,
                    label: collection.name,
                    element: () => SettingsRenderer.buildSettingsPanel(collection.name, collection.settings, this.state[collection.id], this.onSettingChange.bind(this, collection.id), collection.button ? collection.button : null)
                });
            }
            for (const panel of this.panels.sort((a,b) => a.order > b.order)) {
                if (panel.clickListener) panel.onClick = (event) => panel.clickListener(thisObject, event, returnValue);
                insert(panel);
            }
            insert({section: "CUSTOM", element: () => SettingsRenderer.attribution});
        });
        this.forceUpdate();
    }

    forceUpdate() {
        const viewClass = WebpackModules.getByProps("standardSidebarView").standardSidebarView.split(" ")[0];
        const node = document.querySelector(`.${viewClass}`);
        Utilities.getReactInstance(node).return.return.return.return.return.return.stateNode.forceUpdate();
    }

    saveSettings() {
        DataStore.setData("settings", this.state);
    }

    loadSettings() {
        const previousState = DataStore.getData("settings");
        if (!previousState) return this.saveSettings();
        for (const collection in this.state) {
            if (!previousState[collection]) Object.assign(previousState, {[collection]: this.state[collection]});
            for (const category in this.state[collection]) {
                if (!previousState[collection][category]) Object.assign(previousState[collection], {[category]: this.state[collection][category]});
                for (const setting in this.state[collection][category]) {
                    if (previousState[collection][category][setting] == undefined) continue;
                    this.state[collection][category][setting] = previousState[collection][category][setting];
                }
            }
        }

        this.saveSettings(); // in case new things were added
    }

    onSettingChange(collection, category, id, value) {
        const before = this.collections.length + this.panels.length;
        this.state[collection][category][id] = value;
        Events.dispatch("setting-updated", collection, category, id, value);
        const after = this.collections.length + this.panels.length;
        this.saveSettings();
        if (before != after) setTimeout(this.forceUpdate.bind(this), 50);
    }

    getSetting(collection, category, id) {
        if (arguments.length == 2) return this.collections[0].find(c => c.id == arguments[0]).settings.find(s => s.id == arguments[1]);
        return this.collections.find(c => c.id == collection).find(c => c.id == category).settings.find(s => s.id == id);
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
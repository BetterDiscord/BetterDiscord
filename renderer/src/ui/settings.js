import {React, WebpackModules, Patcher, Utilities, Settings, Events, DataStore} from "modules";

import AddonList from "./settings/addonlist";
import SettingsGroup from "./settings/group";
import SettingsTitle from "./settings/title";
import Header from "./settings/sidebarheader";
import {Filters} from "../modules/webpackmodules";

export default new class SettingsRenderer {

    constructor() {
        this.patchSections();
        Events.on("strings-updated", this.forceUpdate);
    }

    onDrawerToggle(collection, group, state) {
        const drawerStates = DataStore.getBDData("drawerStates") || {};
        if (!drawerStates[collection]) drawerStates[collection] = {};
        drawerStates[collection][group] = state;
        DataStore.setBDData("drawerStates", drawerStates);
    }

    getDrawerState(collection, group, defaultValue) {
        const drawerStates = DataStore.getBDData("drawerStates") || {};
        if (!drawerStates[collection]) return defaultValue;
        if (!drawerStates[collection].hasOwnProperty(group)) return defaultValue;
        return drawerStates[collection][group];
    }

    onChange(onChange) {
        return (collection, category, id) => {
            const before = Settings.collections.length + Settings.panels.length;
            onChange(collection, category, id);
            const after = Settings.collections.length + Settings.panels.length;
            if (before != after) setTimeout(this.forceUpdate.bind(this), 50);
        };
    }

    buildSettingsPanel(id, title, config, state, onChange, button = null) {
        config.forEach(section => {
            section.settings.forEach(item => item.value = state[section.id][item.id]);
        });
        return this.getSettingsPanel(id, title, config, this.onChange(onChange), button);
    }

    getSettingsPanel(id, title, groups, onChange, button = null) {
        return [React.createElement(SettingsTitle, {text: title, button: button}), groups.map(section => {
            return React.createElement(SettingsGroup, Object.assign({}, section, {
                onChange: onChange,
                onDrawerToggle: state => this.onDrawerToggle(id, section.id, state),
                shown: this.getDrawerState(id, section.id, section.hasOwnProperty("shown") ? section.shown : true)
            }));
        })];
    }

    getAddonPanel(title, addonList, addonState, options = {}) {
        return React.createElement(AddonList, Object.assign({}, {
            title: title,
            addonList: addonList,
            addonState: addonState
        }, options));
    }

    async patchSections() {
        const UserSettings = await WebpackModules.getLazy(Filters.byDisplayName("SettingsView"));
        
        Patcher.after("SettingsManager", UserSettings.prototype, "getPredicateSections", (thisObject, args, returnValue) => {
            let location = returnValue.findIndex(s => s.section.toLowerCase() == "changelog") - 1;
            if (location < 0) return;
            const insert = (section) => {
                returnValue.splice(location, 0, section);
                location++;
            };
            insert({section: "DIVIDER"});
            // Header
            insert({section: "CUSTOM", element: Header});
            for (const collection of Settings.collections) {
                if (collection.disabled) continue;
                insert({
                    section: collection.name,
                    label: collection.name.toString(),
                    className: `bd-${collection.id}-tab`,
                    element: () => this.buildSettingsPanel(collection.id, collection.name, collection.settings, Settings.state[collection.id], Settings.onSettingChange.bind(Settings, collection.id), collection.button ? collection.button : null)
                });
            }
            for (const panel of Settings.panels.sort((a,b) => a.order > b.order)) {
                if (panel.clickListener) panel.onClick = (event) => panel.clickListener(thisObject, event, returnValue);
                if (!panel.className) panel.className = `bd-${panel.id}-tab`;
                if (typeof(panel.label) !== "string") panel.label = panel.label.toString();
                insert(panel);
            }
        });
    }

    forceUpdate() {
        const viewClass = WebpackModules.getByProps("standardSidebarView")?.standardSidebarView.split(" ")[0];
        const node = document.querySelector(`.${viewClass}`);
        if (!node) return;
        const stateNode = Utilities.findInReactTree(Utilities.getReactInstance(node), m => m && m.getPredicateSections, {walkable: ["return", "stateNode"]});
        if (stateNode) stateNode.forceUpdate();
    }
};
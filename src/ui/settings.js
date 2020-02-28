import {React, WebpackModules, Patcher, ReactComponents, Utilities, Settings, Events} from "modules";

import AddonList from "./settings/addonlist";
import SettingsGroup from "./settings/group";
import SettingsTitle from "./settings/title";
import Attribution from "./settings/attribution";

export default new class SettingsRenderer {

    constructor() {
        this.patchSections();
        Events.on("strings-updated", this.forceUpdate);
    }

    onChange(onChange) {
        return (collection, category, id) => {
            const before = Settings.collections.length + Settings.panels.length;
            onChange(collection, category, id);
            const after = Settings.collections.length + Settings.panels.length;
            if (before != after) setTimeout(this.forceUpdate.bind(this), 50);
        };
    }

    buildSettingsPanel(title, config, state, onChange, button = null) {
        config.forEach(section => {
            section.settings.forEach(item => item.value = state[section.id][item.id]);
        });
        return this.getSettingsPanel(title, config, this.onChange(onChange), button);
    }

    getSettingsPanel(title, groups, onChange, button = null) {
        return [React.createElement(SettingsTitle, {text: title, button: button}), groups.map(section => {
            return React.createElement(SettingsGroup, Object.assign({}, section, {onChange}));
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
        ReactComponents.get("FluxContainer(GuildSettings)", m => m.displayName == "FluxContainer(GuildSettings)").then(c => console.log("COMPONENT", c));
        // const GuildSettings = await ReactComponents.get("FluxContainer(GuildSettings)", m => m.displayName == "FluxContainer(GuildSettings)");
        // Patcher.after("SettingsManager", GuildSettings.prototype, "render", (thisObject) => {
        //     thisObject._reactInternalFiber.return.return.return.return.return.return.memoizedProps.id = "guild-settings";
        // });
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
            for (const collection of Settings.collections) {
                if (collection.disabled) continue;
                insert({
                    section: collection.name,
                    label: collection.name,
                    element: () => this.buildSettingsPanel(collection.name, collection.settings, Settings.state[collection.id], Settings.onSettingChange.bind(Settings, collection.id), collection.button ? collection.button : null)
                });
            }
            for (const panel of Settings.panels.sort((a,b) => a.order > b.order)) {
                if (panel.clickListener) panel.onClick = (event) => panel.clickListener(thisObject, event, returnValue);
                insert(panel);
            }
            insert({section: "CUSTOM", element: Attribution});
        });
        this.forceUpdate();
    }

    forceUpdate() {
        const viewClass = WebpackModules.getByProps("standardSidebarView").standardSidebarView.split(" ")[0];
        const node = document.querySelector(`.${viewClass}`);
        if (!node) return;
        const stateNode = Utilities.findInReactTree(Utilities.getReactInstance(node), m => m && m.generateSections, {walkable: ["return", "stateNode"]});
        if (stateNode) stateNode.forceUpdate();
    }
};
import React from "@modules/react";
import Settings from "@stores/settings";
import JsonStore from "@stores/json";
import {Filters, getByKeys, getLazy} from "@webpack";
import Patcher from "@modules/patcher";

import ReactUtils from "@api/reactutils";

import AddonPage from "@ui/settings/addonpage";
import Header from "@ui/settings/sidebarheader";
import SettingsPanel from "@ui/settings/panel";


import type {SettingsCategory} from "@data/settings";
import type {ComponentType, ReactNode} from "react";
import VersionInfo from "./misc/versioninfo";
import {findInTree} from "@common/utils";


interface Section {
    section: string;
    element?: (ComponentType | (() => ReactNode));
    label?: string;
    className?: string;
    onClick?: (t: any) => void;
    tabPredicate?: () => boolean;
}

export default new class SettingsRenderer {

    initialize() {
        this.patchSections();
        this.patchVersionInformation();
    }

    onDrawerToggle(collection: string, group: string, state: boolean) {
        const drawerStates: Partial<Record<string, Record<string, boolean>>> = JsonStore.get("misc", "drawerStates") || {};
        if (!drawerStates[collection]) drawerStates[collection] = {};
        drawerStates[collection][group] = state;
        JsonStore.set("misc", "drawerStates", drawerStates);
    }

    getDrawerState(collection: string, group: string, defaultValue: boolean) {
        const drawerStates: Partial<Record<string, Record<string, boolean>>> = JsonStore.get("misc", "drawerStates") || {};
        if (!drawerStates[collection]) return defaultValue;
        if (!drawerStates[collection].hasOwnProperty(group)) return defaultValue;
        return drawerStates[collection][group];
    }

    onChange(onChange: (c: string, s: string, v: unknown) => void) {
        return (categoryId: string, settingId: string, value: unknown) => {
            onChange(categoryId, settingId, value);

            // Delay until after switch animation
            // customcss is here to let the tab show/hide
            // since that component is out of our control/scope
            if (settingId === "customcss") {
                setTimeout(this.forceUpdate.bind(this), 250);
            }
        };
    }

    buildSettingsPanel(id: string, title: string, groups: SettingsCategory[], onChange: (c: string, s: string, v: unknown) => void) {
        return React.createElement(SettingsPanel, {id, title, groups, onChange: this.onChange(onChange).bind(this), onDrawerToggle: this.onDrawerToggle.bind(this), getDrawerState: this.getDrawerState.bind(this)});
    }

    getAddonPanel(title: string, options = {}) {
        return (props: any) => {
            return React.createElement(AddonPage, Object.assign({}, {
                title: title,
                ...props
            }, options));
        };
    }

    async patchSections() {
        const UserSettings = await getLazy<{prototype: {getPredicateSections(): Section[];};}>(Filters.byPrototypeKeys(["getPredicateSections"]));
        if (!UserSettings) return;

        Patcher.after("SettingsManager", UserSettings.prototype, "getPredicateSections", (thisObject: unknown, _: unknown, returnValue: any) => {
            let location = returnValue.findIndex((s: Section) => s.section.toLowerCase() == "changelog") - 1;
            if (location < 0) return;
            const insert = (section: Section) => {
                returnValue.splice(location, 0, section);
                location++;
            };
            insert({section: "DIVIDER"});
            insert({section: "CUSTOM", element: Header});
            for (const collection of Settings.collections) {
                insert({
                    section: collection.name,
                    label: collection.name.toString(),
                    className: `bd-${collection.id}-tab`,
                    element: () => this.buildSettingsPanel(collection.id, collection.name, collection.settings, Settings.onSettingChange.bind(Settings, collection.id))
                });
            }
            for (const panel of Settings.panels.sort((a, b) => a.order > b.order ? 1 : -1)) {
                if (panel.clickListener) panel.onClick = () => panel.clickListener?.(thisObject);
                if (!panel.className) panel.className = `bd-${panel.id}-tab`;
                if (panel.type === "addon" && !panel.element) panel.element = this.getAddonPanel(panel.label, {store: panel.manager});
                insert({
                    section: panel.id,
                    label: panel.label.toString(),
                    className: panel.className,
                    element: panel.element,
                    onClick: panel.onClick
                });
            }
        });
    }

    async patchVersionInformation() {
        const versionDisplayModule = await getLazy<{Z(): void;}>(Filters.byStrings("copyValue", "RELEASE_CHANNEL"), {defaultExport: false});
        if (!versionDisplayModule?.Z) return;

        Patcher.after("SettingsManager", versionDisplayModule, "Z", () => {
            return React.createElement(VersionInfo);
        });
    }

    forceUpdate() {
        const viewClass = getByKeys<{standardSidebarView: string;}>(["standardSidebarView"])?.standardSidebarView.split(" ")[0];
        const node = document.querySelector(`.${viewClass}`);
        if (!node) return;
        const stateNode = findInTree(ReactUtils.getInternalInstance(node), (m: {getPredicateSections: any;}) => m && m.getPredicateSections, {walkable: ["return", "stateNode"]});
        if (stateNode) stateNode.forceUpdate();
    }
};
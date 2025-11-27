import Builtin from "@structs/builtin";

import {t} from "@common/i18n";
import SettingsStore, {type SettingsCollection} from "@stores/settings";

import ContextMenuPatcher from "@api/contextmenu";
import pluginManager, {type Plugin} from "@modules/pluginmanager";
import themeManager from "@modules/thememanager";
import React from "@modules/react";
import DOMManager from "@modules/dommanager";
import Modals from "@ui/modals";
import {findInTree} from "@common/utils";
import {CustomCSS} from "@builtins/builtins";
import type AddonManager from "@modules/addonmanager";
import settings from "@ui/settings";


// TODO: fix type after reworking the context module
const ContextMenu = new ContextMenuPatcher() as InstanceType<typeof ContextMenuPatcher> & {
    Separator: any;
    CheckboxItem: any;
    RadioItem: any;
    ControlItem: any;
    Group: any;
    Item: any;
    Menu: any;
};

export default new class BDContextMenu extends Builtin {
    get name() {return "BDContextMenu";}
    get category() {return "general";}
    get id() {return "bdContextMenu";}

    patch?(): void;

    constructor() {
        super();
        this.callback = this.callback.bind(this);
    }

    async enabled() {
        this.patch = ContextMenu.patch("user-settings-cog", this.callback);
    }

    async disabled() {
        this.patch?.();
    }

    callback(retVal: any) {
        const target = findInTree(retVal, b => Array.isArray(b) && b.some(e => e?.key?.toLowerCase() === "my_account"), {walkable: ["props", "children"]});
        if (!target) return;

        // Prevent conflict with plugin until its eradicated
        if (target.some((e: any) => e.props.label.toLowerCase() === "betterdiscord")) return;

        // BetterDiscord Settings
        // TODO: de-dup when converting context menu module
        const items: Array<{type?: string; label: any; action: () => Promise<void>; items?: any;}> = SettingsStore.collections.map(c => this.buildCollectionMenu(c));

        // Updater
        items.push({
            label: t("Panels.updates"),
            action: () => this.openCategory("updates")
        });

        // Custom CSS
        if (SettingsStore.get("settings", "customcss", "customcss")) {
            items.push({
                label: t("Panels.customcss"),
                action: async () => CustomCSS.open()
            });
        }

        // Plugins & Themes
        items.push(this.buildAddonMenu("plugin", t("Panels.plugins"), pluginManager));
        items.push(this.buildAddonMenu("theme", t("Panels.themes"), themeManager));

        // Parent SubMenu
        const bdSubMenu = ContextMenu.buildItem({type: "submenu", label: "BetterDiscord", items: items});
        const bdGroup = React.createElement(ContextMenu.Group, null, [bdSubMenu]);
        target.push(bdGroup);
    }

    buildCollectionMenu(collection: SettingsCollection) {
        return {
            type: "submenu",
            label: collection.name,
            action: () => this.openCategory(collection.id),
            items: collection.settings.map(category => {
                return {
                    type: "submenu",
                    label: category.name,
                    action: () => this.openCategory(collection.id),
                    items: category.settings.filter(s => s.type === "switch" && !s.hidden && s.id !== this.id).map(setting => {
                        return {
                            type: "toggle",
                            label: setting.name,
                            disabled: setting.disabled,
                            active: SettingsStore.get(collection.id, category.id, setting.id),
                            action: () => SettingsStore.set(collection.id, category.id, setting.id, !SettingsStore.get(collection.id, category.id, setting.id))
                        };
                    })
                };
            })
        };
    }

    /**
     * TODO: Can this be done better now that it's integrated?
     * @param {string} label
     * @param {import("../../modules/addonmanager").default} manager
     * @returns
     */
    buildAddonMenu(type: "plugin" | "theme", label: string, manager: AddonManager) {
        const names = manager.addonList.map(a => a.name || (a as any).getName()).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
        const toggles: Array<{type?: string; label?: any; disabled?: boolean; active?: boolean; action?: (e: any) => void;}> = names.map(name => {
            return {
                type: "toggle",
                label: name,
                disabled: manager.getAddon(name)?.partial ?? false,
                active: manager.isEnabled(name),
                action: (e) => {
                    if (!e.shiftKey) {
                        manager.toggleAddon(name);
                    }
                    else {
                        const addon = manager.getAddon(name);
                        const hasSettings = (addon as Plugin).instance && typeof ((addon as Plugin).instance.getSettingsPanel) === "function";
                        const getSettings = (hasSettings && (addon as Plugin).instance.getSettingsPanel!.bind((addon as Plugin).instance)) as () => any;
                        if (hasSettings) {
                            Modals.showAddonSettingsModal(name, getSettings());
                        }
                    }
                }
            };
        });

        // If the store is enabled, add a separate item to open it
        if (SettingsStore.get("settings", "store", "bdAddonStore")) {
            if (toggles.length) toggles.push({type: "separator"}); // Add separator when addons exist

            toggles.push({
                label: t("Addons.openStore", {context: type}),
                action: () => {
                    this.openCategory(manager.prefix + "s");
                    // If the addon store instantly opens have it just stop basically
                    DOMManager.onAdded(":where(.bd-store-card, .bd-addon-title > :nth-child(3))", (elem) => (elem as HTMLElement)?.click());
                }
            });
        }

        return {
            type: "submenu",
            label: label,
            action: () => this.openCategory(manager.prefix + "s"),
            items: toggles
        };
    }

    async openCategory(id: string) {
        ContextMenu.close();
        settings.openSettingsPage(id);
    }
};
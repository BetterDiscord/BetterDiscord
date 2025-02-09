import Builtin from "@structs/builtin";

import Strings from "@modules/strings";
import Settings from "@stores/settings";

import ContextMenuPatcher from "@api/contextmenu";
import pluginManager from "@modules/pluginmanager";
import themeManager from "@modules/thememanager";
import React from "@modules/react";
import DOMManager from "@modules/dommanager";
import Modals from "@ui/modals";
import {getByKeys} from "@webpack";
import {findInTree} from "@common/utils";


const ContextMenu = new ContextMenuPatcher();
const UserSettingsWindow = getByKeys(["open", "updateAccount"]);

export default new class BDContextMenu extends Builtin {
    get name() {return "BDContextMenu";}
    get category() {return "general";}
    get id() {return "bdContextMenu";}

    constructor() {
        super(...arguments);
        this.callback = this.callback.bind(this);
    }

    enabled() {
        this.patch = ContextMenu.patch("user-settings-cog", this.callback);
    }

    disabled() {
        this.patch?.();
    }

    callback(retVal) {
        const target = findInTree(retVal, b => Array.isArray(b) && b.some(e => e?.key?.toLowerCase() === "my_account"), {walkable: ["props", "children"]});
        if (!target) return;

        // Prevent conflict with plugin until its eradicated
        if (target.some(e => e.props.label.toLowerCase() === "betterdiscord")) return;

        // BetterDiscord Settings
        const items = Settings.collections.map(c => this.buildCollectionMenu(c));

        // Updater
        items.push({
            label: Strings.Panels.updates,
            action: () => this.openCategory("updates")
        });

        // Custom CSS
        if (Settings.get("settings", "customcss", "customcss")) {
            items.push({
                label: Strings.Panels.customcss,
                action: () => this.openCategory("customcss")
            });
        }

        // Plugins & Themes
        items.push(this.buildAddonMenu(Strings.Panels.plugins, pluginManager));
        items.push(this.buildAddonMenu(Strings.Panels.themes, themeManager));

        // Parent SubMenu
        const bdSubMenu = ContextMenu.buildItem({type: "submenu", label: "BetterDiscord", items: items});
        const bdGroup = React.createElement(ContextMenu.Group, null, [bdSubMenu]);
        target.push(bdGroup);
    }

    buildCollectionMenu(collection) {
        return {
            type: "submenu",
            label: collection.name,
            action: () => this.openCategory(collection.name),
            items: collection.settings.map(category => {
                return {
                    type: "submenu",
                    label: category.name,
                    action: () => this.openCategory(collection.name),
                    items: category.settings.filter(s => s.type === "switch" && !s.hidden && s.id !== this.id).map(setting => {
                        return {
                            type: "toggle",
                            label: setting.name,
                            disabled: setting.disabled,
                            active: Settings.get(collection.id, category.id, setting.id),
                            action: () => Settings.set(collection.id, category.id, setting.id, !Settings.get(collection.id, category.id, setting.id))
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
    buildAddonMenu(label, manager) {
        const names = manager.addonList.map(a => a.name || a.getName()).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
        const toggles = names.map(name => {
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
                        const hasSettings = addon.instance && typeof(addon.instance.getSettingsPanel) === "function";
                        const getSettings = hasSettings && addon.instance.getSettingsPanel.bind(addon.instance);
                        if (hasSettings) {
                            Modals.showAddonSettingsModal(name, getSettings());
                        }
                    }
                }
            };
        });

        // If the store is enabled, add a separate item to open it
        if (Settings.get("settings", "store", "bdAddonStore")) {
            if (toggles.length) toggles.push({type: "separator"}); // Add separator when addons exist

            toggles.push({
                label: Strings.Addons.openStore.format({type: label}),
                action: () => {
                    this.openCategory(label.toLowerCase());
                    // If the addon store instantly opens have it just stop basically
                    DOMManager.onAdded(":where(.bd-store-card, .bd-addon-title > :nth-child(3))", (elem) => elem?.click());
                }
            });
        }

        return {
            type: "submenu",
            label: label,
            action: () => this.openCategory(label.toLowerCase()),
            items: toggles
        };
    }

    async openCategory(id) {
        ContextMenu.close();
        UserSettingsWindow?.open?.(id);
    }
};
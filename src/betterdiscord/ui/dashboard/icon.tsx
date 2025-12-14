import React from "react";
import {Logo} from "@ui/logo";
import {getByStrings} from "@webpack";
import HeaderBar from "./header";
import {useLocation} from "./hooks";

import {t} from "@common/i18n";
import SettingsStore, {type SettingsCollection} from "@stores/settings";

import pluginManager, {type Plugin} from "@modules/pluginmanager";
import themeManager from "@modules/thememanager";
import DOMManager from "@modules/dommanager";
import Modals from "@ui/modals";
import {CustomCSS} from "@builtins/builtins";
import type AddonManager from "@modules/addonmanager";
import ContextMenuPatcher from "@api/contextmenu";
import DiscordModules from "@modules/discordmodules";

function openCategory(categoryId: string) {
    const transitionTo = getByStrings<(path: string) => void>(["transitionTo - Transitioning to"], {searchExports: true})!;
    transitionTo(`/betterdiscord${categoryId ? `/${categoryId}` : ""}`);
}

function buildCollectionMenu(collection: SettingsCollection) {
    return {
        type: "submenu",
        label: collection.name,
        action: () => openCategory(collection.id),
        items: collection.settings.map(category => {
            return {
                type: "submenu",
                label: category.name,
                action: () => openCategory(collection.id),
                items: category.settings.filter(s => s.type === "switch" && !s.hidden).map(setting => {
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

function buildAddonMenu(type: "plugin" | "theme", label: string, manager: AddonManager) {
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
                openCategory(manager.prefix + "s");
                // If the addon store instantly opens have it just stop basically
                DOMManager.onAdded(":where(.bd-store-card, .bd-addon-title > :nth-child(3))", (elem) => (elem as HTMLElement)?.click());
            }
        });
    }

    return {
        type: "submenu",
        label: label,
        action: () => openCategory(manager.prefix + "s"),
        items: toggles
    };
}

const contextmenu = new ContextMenuPatcher();

function makeContextMenu() {
    // BetterDiscord Settings
    // TODO: de-dup when converting context menu module
    const items: Array<{type?: string; label: any; action: () => void | Promise<void>; items?: any;}> = SettingsStore.collections.map(c => buildCollectionMenu(c));

    // Updater
    items.push({
        label: t("Panels.updates"),
        action: () => openCategory("updates")
    });

    // Custom CSS
    if (SettingsStore.get("settings", "customcss", "customcss")) {
        items.push({
            label: t("Panels.customcss"),
            action: () => CustomCSS.open()
        });
    }

    // Plugins & Themes
    items.push(buildAddonMenu("plugin", t("Panels.plugins"), pluginManager));
    items.push(buildAddonMenu("theme", t("Panels.themes"), themeManager));

    return contextmenu.buildMenu(items);
}

function TitlebarIcon() {
    const location = useLocation();
    const selected = location.pathname.startsWith("/betterdiscord");

    return (
        <HeaderBar.Icon
            // icon={selected ? Logo.DiscordAccented : Logo.Discord}
            icon={Logo.Discord}
            tooltip="BetterDiscord"
            selected={selected}
            onContextMenu={(event) => contextmenu.open(event, (props: any) => makeContextMenu()(props), {})}
            onClick={() => DiscordModules.transitionTo("/betterdiscord")}
        />
    );
}

export default TitlebarIcon;
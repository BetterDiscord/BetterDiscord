import Builtin from "@structs/builtin";

import {t} from "@common/i18n";
import SettingsStore from "@stores/settings";

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
import toasts from "@stores/toasts";
import {useStateFromStores} from "@ui/hooks";
import {useMemo} from "react";

const ContextMenu = new ContextMenuPatcher();

function openCategory(id: string) {
    ContextMenu.close();
    settings.openSettingsPage(id);
}

const BDContextMenu = new class BDContextMenu extends Builtin {
    get name() {return "BDContextMenu";}
    get category() {return "general";}
    get id() {return "bdContextMenu";}

    patch?(): void;

    async enabled() {
        this.patch = ContextMenu.patch("user-settings-cog", (retVal) => {
            const bdMenu = useBDContextMenu();

            const target = findInTree(retVal as any, b => Array.isArray(b) && b.some(e => e?.key?.toLowerCase() === "my_account"), {walkable: ["props", "children"]});
            if (!target) return;

            target.push(bdMenu);
        });
    }

    async disabled() {
        this.patch?.();
    }
};

function useCollectionMenu() {
    const collections = useStateFromStores(SettingsStore, () => {
        const c = [];

        for (const collection of SettingsStore.collections) {
            c.push({
                id: collection.id,
                name: collection.name!,
                settings: collection.settings.map(category => ({
                    id: category.id,
                    name: category.name!,
                    settings: category.settings.filter(s => s.type === "switch" && !s.hidden && s.id !== BDContextMenu.id).map(setting => ({
                        id: setting.id,
                        label: setting.name!,
                        disabled: setting.disabled,
                        checked: SettingsStore.get(collection.id, category.id, setting.id),
                        action: () => SettingsStore.set(collection.id, category.id, setting.id, !SettingsStore.get(collection.id, category.id, setting.id))
                    }))
                }))
            });
        }

        return c;
    }, []);

    return (
        <>
            {collections.map((collection) => (
                <ContextMenu.Item
                    label={collection.name}
                    id={collection.id}
                    action={() => openCategory(collection.id)}
                    key={`bd.${collection.id}`}
                >
                    {collection.settings.map(category => (
                        <ContextMenu.Item
                            label={category.name}
                            id={category.id}
                            action={() => openCategory(collection.id)}
                            key={`bd.${collection.id}.${category.id}`}
                        >
                            {category.settings.map(setting => (
                                <ContextMenu.CheckboxItem {...setting} key={`bd.${collection.id}.${category.id}.${setting.id}`} />
                            ))}
                        </ContextMenu.Item>
                    ))}
                </ContextMenu.Item>
            ))}
        </>
    );
}

function useAddonMenu(type: "plugin" | "theme", label: string, manager: AddonManager) {
    const addons = useStateFromStores(manager, () => manager.addonList.map(a => a.name || (a as any).getName?.()).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).map((name) => [name as string, manager.getAddon(name), manager.isEnabled(name)] as const), [], true);
    const addonStoreIsEnabled = useStateFromStores(SettingsStore, () => SettingsStore.get("settings", "store", "bdAddonStore"), []);

    const toggles = useMemo(() => addons.map(([name, addon, enabled]) => (
        <ContextMenu.CheckboxItem
            label={name}
            id={name}
            checked={enabled}
            key={`bd.${type}.${name}`}
            disabled={addon?.partial}
            action={(e: MouseEvent) => {
                if (!e.shiftKey) {
                    manager.toggleAddon(name);
                    return;
                }

                if (!manager.isEnabled(name)) {
                    toasts.warning(t("Addons.isDisabled", {name}));
                    return;
                }

                const hasSettings = (addon as Plugin).instance && typeof ((addon as Plugin).instance.getSettingsPanel) === "function";
                const getSettings = (hasSettings && (addon as Plugin).instance.getSettingsPanel!.bind((addon as Plugin).instance)) as () => any;

                if (hasSettings) {
                    Modals.showAddonSettingsModal(name, getSettings());
                }
                else {
                    toasts.warning(t("Addons.noSettings", {name}));
                }
            }}
        />
    )), [addons, manager, type]);

    return (
        <ContextMenu.Item label={label} id={type} action={() => openCategory(manager.prefix + "s")}>
            <ContextMenu.Group key={`bd.${type}.installed`}>
                {toggles}
            </ContextMenu.Group>
            {addonStoreIsEnabled && (
                <ContextMenu.Group key={`bd.${type}.store`}>
                    <ContextMenu.Item
                        label={t("Addons.openStore", {context: type})}
                        id={`${type}-store`}
                        action={() => {
                            openCategory(manager.prefix + "s");
                            // If the addon store instantly opens have it just stop basically
                            DOMManager.onAdded(":where(.bd-store-card, .bd-addon-title > :nth-child(3))", (elem) => (elem as HTMLElement)?.click());
                        }}
                    />
                </ContextMenu.Group>
            )}
        </ContextMenu.Item>
    );
}

function useCustomCSSMenuItem() {
    const isEnabled = useStateFromStores(SettingsStore, () => SettingsStore.get("settings", "customcss", "customcss"), []);

    if (!isEnabled) return null;

    return (
        <ContextMenu.Item
            label={t("Panels.customcss")}
            id="customcss"
            action={() => CustomCSS.open()}
            key="bd.customcss"
        />
    );
}

function useBDContextMenu() {
    const collections = useCollectionMenu();

    const customCSS = useCustomCSSMenuItem();

    const plugins = useAddonMenu("plugin", t("Panels.plugins"), pluginManager);
    const themes = useAddonMenu("theme", t("Panels.themes"), themeManager);

    return (
        <ContextMenu.Group>
            <ContextMenu.Item label="BetterDiscord" id="BetterDiscord">
                {collections}

                <ContextMenu.Item
                    label={t("Panels.updates")}
                    id="updates"
                    action={async () => openCategory("updates")}
                />

                {customCSS}

                {plugins}
                {themes}
            </ContextMenu.Item>
        </ContextMenu.Group>
    );

}

export default BDContextMenu;
import ReactDOM from "@modules/reactdom";
import React from "react";
import Settings, {type SettingsCollection} from "@stores/settings";
import JsonStore from "@stores/json";
import {Filters, getByKeys, getLazy, getMangled, getMangledLazy} from "@webpack";
import Patcher from "@modules/patcher";

import AddonPage from "@ui/settings/addonpage";

import type {SettingsCategory} from "@data/settings";
import VersionInfo from "./misc/versioninfo";
import {useForceUpdate, useStateFromStores} from "./hooks";
import SettingsPanel from "./settings/panel";
import {CustomCSS} from "@builtins/builtins";
import {lucideToDiscordIcon, type DiscordIcon} from "@utils/icon";
import {Logo} from "./logo";
import DiscordModules from "@modules/discordmodules";
import Button from "./base/button";
import {HistoryIcon} from "lucide-react";
import {t} from "@common/i18n";
import Modals from "./modals";
import changelog from "@data/changelog";
import {type Plugin} from "@modules/pluginmanager";
import DOMManager from "@modules/dommanager";
import type AddonManager from "@modules/addonmanager";
import toasts from "@stores/toasts";
import ContextMenuPatcher from "@api/contextmenu";
import type {GroupOnChange} from "./settings/group";

const ContextMenu = new ContextMenuPatcher();

const UserSettings = getByKeys<any>(["openUserSettings", "USER_SETTINGS_MODAL_KEY"], {firstId: 840065, cacheId: "core-settings-usersettings"});

const SettingsRenderer = new class SettingsRenderer {
    initialize() {
        this.patchModalSettings();
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

    buildSettingsPanel(id: string, title: string, groups: SettingsCategory[], onChange: GroupOnChange) {
        return React.createElement(SettingsPanel, {
            id,
            title,
            groups,
            onChange: onChange.bind(this),
            onDrawerToggle: this.onDrawerToggle.bind(this),
            getDrawerState: this.getDrawerState.bind(this)
        });
    }

    getAddonPanel(title: string, options: {store: AddonManager;}) {
        return (props: any) => {
            return React.createElement(AddonPage, Object.assign({}, {
                title: title,
                ...props
            }, options));
        };
    }

    private layoutBuilder?: LayoutBuilder;
    private getLayoutBuilder() {
        if (this.layoutBuilder) return this.layoutBuilder;

        const layoutModuleRaw = DiscordModules.Layout;

        const out: Partial<LayoutBuilder> = {};
        for (const key in layoutModuleRaw) {
            if (!Object.hasOwn(layoutModuleRaw, key)) continue;

            const match = String(layoutModuleRaw[key]).match(/\..{1,3}\.(.+?),/);

            if (match) {
                // Format FOO -> foo and FOO_BAR -> fooBar
                const outKey = match[1].toLowerCase().replace(/_([a-z])/gi, (_, letter) => letter.toUpperCase());

                Object.defineProperty(out, outKey, {
                    value(id: string, ...args: any) {
                        if (typeof id === "string") {
                            id = `betterdiscord_${id}_${outKey}`;
                        }

                        return layoutModuleRaw[key](id, ...args);
                    }
                });
            }
        }

        return this.layoutBuilder = out as LayoutBuilder;
    }

    async patchModalSettings() {
        // if discords creates another root check buildLayout
        const rootLayout = await getLazy<{
            key: "$Root";
            buildLayout(): SectionLayout[];
        }>(m => m?.key === "$Root", {searchExports: true, searchDefault: false});
        if (!rootLayout) return;

        this.patchSettingsSearch();

        const layoutBuilder = this.getLayoutBuilder();

        const section = layoutBuilder.section("betterdiscord", {
            buildLayout: () => {
                const layouts: SidebarItemLayout[] = [];

                const insert = (key: string, item: LayoutConstructor) => {
                    let layout: [] | [panel: PanelLayout] = [];

                    if ("render" in item) {
                        const custom = layoutBuilder.custom(key, {
                            Component: () => <item.render />
                        });

                        const category = layoutBuilder.category(key, {
                            buildLayout: () => [custom]
                        });

                        const panel = layoutBuilder.panel(key, {
                            buildLayout: () => [category],
                            useTitle: item.header
                        });

                        layout = [panel];
                    }

                    const sidebar = layoutBuilder.sidebarItem(key, {
                        buildLayout: () => layout,
                        useTitle: item.title,
                        icon: item.icon,
                        usePredicate: () => true,
                        useSearchTerms: () => [
                            "betterdiscord", "bd",
                            ...item.useSearchTerms()
                        ]
                    });

                    if (typeof item.predicate === "function") {
                        sidebar.usePredicate = () => !!item.predicate!();
                    }

                    if (typeof item.useMenu === "function") {
                        sidebar.useMenu = () => item.useMenu!();
                    }

                    if ("onClick" in item) {
                        sidebar.onClick = item.onClick;
                    }

                    layouts.push(sidebar);
                };

                const makeSettingsPanelProvider = (children: React.ReactNode) => {
                    const listeners = new Set<() => void>();
                    let items = {
                        text: null as React.ReactNode,
                        children: null as React.ReactNode
                    };

                    function PanelHeader() {
                        const [node, setNode] = React.useState<HTMLElement | undefined>();
                        const {text, children: child} = items;

                        const [, forceUpdate] = useForceUpdate();

                        React.useLayoutEffect(() => {
                            listeners.add(forceUpdate);
                            return listeners.delete.bind(listeners, forceUpdate) as unknown as ReturnType<React.EffectCallback>;
                        }, [forceUpdate]);

                        return (
                            <>
                                <div
                                    className="bd-settings-page-title"
                                    ref={(v) => {
                                        const flex = v?.closest("div[data-wrap][data-full-width] > nav")?.parentElement as HTMLElement;

                                        if (flex) {
                                            flex.classList.add("bd-settings-title-extend");
                                            setNode(flex);
                                        }
                                        else if (v?.parentElement?.parentElement) {
                                            v.parentElement.parentElement.classList.add("bd-settings-title-extend");
                                            setNode(v.parentElement.parentElement);
                                        }
                                        else {
                                            setNode(v!);
                                        }

                                        return () => setNode(undefined);
                                    }}
                                >
                                    {text}
                                </div>

                                {node && (
                                    ReactDOM.createPortal(
                                        <div className="bd-settings-page-title-children">{child}</div>,
                                        node
                                    )
                                )}
                            </>
                        );
                    }

                    return {
                        header: () => <PanelHeader />,
                        render: () => (
                            <SettingsTitleContext
                                value={(value) => {
                                    items = {
                                        children: (value as React.ReactElement<{children: React.ReactNode;}>).props.children,
                                        text: (value as React.ReactElement<{text: React.ReactNode;}>).props.text
                                    };

                                    listeners.forEach(listener => listener());

                                    return null;
                                }}
                            >
                                {children}
                            </SettingsTitleContext>
                        )
                    };
                };

                for (const collection of Settings.collections) {
                    const items = collection.settings.map(m => [m.name, m.settings.map(setting => setting.name)]).flat(2) as string[];

                    insert(collection.id, {
                        ...makeSettingsPanelProvider(
                            this.buildSettingsPanel(
                                collection.id,
                                collection.name,
                                collection.settings,
                                Settings.onSettingChange.bind(Settings, collection.id) as GroupOnChange
                            )
                        ),
                        icon: Logo.Discord,
                        title: () => collection.name,
                        useMenu: () => useCollectionMenu(collection),
                        useSearchTerms: () => [
                            collection.name,
                            ...items
                        ]
                    });
                }

                for (const panel of Settings.panels.sort((a, b) => a.order > b.order ? 1 : -1)) {
                    if (panel.type === "addon" && !panel.element) panel.element = this.getAddonPanel(panel.label, {store: panel.manager!});

                    const icon = panel.icon ? lucideToDiscordIcon(panel.icon) : () => panel.id;

                    if (panel.id === "customcss") {
                        insert("customcss_tab", {
                            ...makeSettingsPanelProvider(React.createElement(panel.element!)),
                            icon,
                            title: () => panel.label,
                            predicate: checkAll(useCustomCSSEnabled, () => !useCustomCSSClickable()),
                            useSearchTerms: () => [panel.label],
                        });

                        insert("customcss_clickable", {
                            icon,
                            title: () => panel.label,
                            predicate: checkAll(useCustomCSSEnabled, useCustomCSSClickable),
                            onClick: () => CustomCSS.open(),
                            useSearchTerms: () => [panel.label]
                        });

                        continue;
                    }

                    insert(panel.id, {
                        ...makeSettingsPanelProvider(React.createElement(panel.element!)),
                        icon,
                        title: () => panel.label,
                        useMenu: panel.type === "addon" ? () => useAddonMenu(panel.manager!) : undefined,
                        useSearchTerms: () => [
                            panel.label,
                            typeof panel.searchable === "function" ? panel.searchable().filter(m => typeof m === "string") : []
                        ].flat()
                    });
                }

                return layouts;
            },
            useTitle: () => Object.assign(<LayerSettingTitle />, {toString: () => "BetterDiscord"}),
        });

        Patcher.after("SettingsManager", rootLayout, "buildLayout", (_, __, res) => {
            const index = res.findIndex((layout) => (layout as any).key === "games_and_apps_section") + 1;

            res.splice(index, 0, section);
        });
    }

    patchSettingsSearch() {
        const search = getMangled<{
            search(): Record<string, any>;
        }>(".PRIVACY_AND_SAFETY_PERSISTENT_VERIFICATION_CODES]", {
            search: Filters.byStrings(".PRIVACY_AND_SAFETY_PERSISTENT_VERIFICATION_CODES]")
        }, {cacheId: "core-settings-search"});

        Patcher.after("SettingsManager", search, "search", (_, __, res) => {
            res = {...res}; // Discord freezes the object

            function insert(key: string, item: {
                label: string;
                searchableTitles: string[];
            }) {
                res[`BETTERDISCORD_${key}`] = {
                    ...item,
                    ariaLabel: item.label,
                    section: "betterdiscord"
                };
            }

            for (const collection of Settings.collections) {
                const items = collection.settings.map(m => [m.name, m.settings.map(setting => setting.name)]).flat(2) as string[];

                insert(collection.id, {
                    label: collection.name,
                    searchableTitles: [
                        "betterdiscord",
                        collection.name,
                        ...items
                    ]
                });
            }

            for (const panel of Settings.panels.sort((a, b) => a.order > b.order ? 1 : -1)) {
                const content = {
                    label: panel.label,
                    searchableTitles: [
                        "betterdiscord",
                        panel.label,
                        typeof panel.searchable === "function" ? panel.searchable().filter(m => typeof m === "string") : []
                    ].flat()
                };

                if (panel.id === "customcss") {
                    insert("customcss_tab", content);
                    insert("customcss_clickable", content);

                    continue;
                }

                insert(panel.id, content);
            }

            return Object.freeze(res);
        });
    }

    async patchVersionInformation() {
        const versionDisplayModule = await getMangledLazy<{
            versionDisplay: React.FC;
        }>(["copyValue", "RELEASE_CHANNEL", "Build Override"], {
            versionDisplay: Filters.byStrings("copyValue", "RELEASE_CHANNEL", "Build Override")
        }, {
            searchDefault: false,
            mapDeclarations: true
        });

        if (typeof versionDisplayModule.versionDisplay !== "function") return;

        Patcher.instead("SettingsManager", versionDisplayModule, "versionDisplay", () => <VersionInfo />);
    }

    public openSettingsPage(key: string) {
        UserSettings?.openUserSettings?.(`betterdiscord_${key === "customcss" ? "customcss_tab" : key}_panel`, {
            section: key
        });
    }

    private readonly DISCORD_USER_SETTINGS_MODAL_KEY: string = typeof UserSettings?.USER_SETTINGS_MODAL_KEY === "string" ? UserSettings.USER_SETTINGS_MODAL_KEY : "USER_SETTINGS_MODAL_MODAL_KEY";

    public closeUserSettingsModal() {
        Modals.ModalActions.closeModal(this.DISCORD_USER_SETTINGS_MODAL_KEY);
    }
};

interface PanelLayout {
    buildLayout(): [category: CategoryLayout];
    useTitle(): React.ReactNode;
}

type Trailing = ({
    // ngl idk
    type: 0,
} | {
    type: 1,
    badgeComponent?: unknown;
} | {
    type: 2,
    useCount(): number;
} | {
    type: 3,
    useDecoration(x: unknown, y: unknown): React.ReactNode;
}) & {
    getDismissibleContentTypes?(): unknown[];
};

interface SidebarItemLayout {
    icon: DiscordIcon;
    useTitle(): React.ReactNode;
    buildLayout(): [] | [panel: PanelLayout];
    useSearchTerms(): string[];

    /**
     * ⚠️ You cannot have page with onClick!
     */
    onClick?(): void;

    /** You can use react hooks here! */
    usePredicate?(): boolean;

    trailing?: Trailing;

    useMenu?(): React.ReactNode;
}

interface SectionLayout {
    useTitle(): React.ReactNode;
    buildLayout(): SidebarItemLayout[];
    usePredicate?(): boolean;
}

interface CustomLayout {
    Component: React.ComponentType;
}

interface CategoryLayout {
    buildLayout(): CustomLayout[];
}

interface LayoutBuilder {
    custom(key: string, custom: CustomLayout): CustomLayout;
    category(key: string, custom: CategoryLayout): CategoryLayout;
    panel(key: string, panel: PanelLayout): PanelLayout;
    sidebarItem(key: string, panel: SidebarItemLayout): SidebarItemLayout;
    section(key: string, panel: SectionLayout): SectionLayout;
}

type LayoutConstructor = {
    title(): React.ReactNode;
    icon: DiscordIcon;

    predicate?(): boolean;
    useMenu?(): React.ReactNode;
    useSearchTerms(): string[];
} & ({
    header(): React.ReactNode;
    render(): React.ReactNode;
} | {
    onClick(): void;
});

const checkAll = (...hooks: Array<() => boolean>) => () => hooks.map(hook => hook()).every(x => x);

const useCustomCSSEnabled = () => useStateFromStores(Settings, () => Settings.get<boolean>("settings", "customcss", "customcss"), []);

/** @description On true clicking open will open not open the page. On false will open the page */
const useCustomCSSClickable = () => {
    const state = useStateFromStores(Settings, () => Settings.get<string>("settings", "customcss", "openAction"), []);
    const isDetached = useStateFromStores(CustomCSS, () => CustomCSS.isDetached, []);

    return isDetached || ["detached", "external", "system"].includes(state);
};

function LayerSettingTitle() {
    const [node, setNode] = React.useState<HTMLElement | undefined | null | void>();

    return (
        <>
            <div
                className="bd-sidebar-header"
                ref={(v) => {
                    let nNode = v as HTMLElement;
                    if (v?.parentElement?.parentElement) {
                        // If discord changes the dom layout don't blame me
                        // if context menu
                        if (v.parentElement.parentElement.role === "group") {
                            nNode = v.parentElement as HTMLElement;
                        }
                        // if settings modal layer
                        else {
                            nNode = v.parentElement.parentElement as HTMLElement;
                        }
                    }

                    setNode(nNode);
                    return setNode;
                }}
            >
                BetterDiscord
            </div>
            {!!node && ReactDOM.createPortal(
                <DiscordModules.Tooltip color="primary" position="top" text={t("Modals.changelog")}>
                    {props =>
                        <Button {...props} className="bd-changelog-button" look={Button.Looks.BLANK} color={Button.Colors.TRANSPARENT} size={Button.Sizes.NONE} onClick={() => Modals.showChangelogModal(changelog)}>
                            <HistoryIcon className="bd-icon" size="16px" />
                        </Button>
                    }
                </DiscordModules.Tooltip>,
                node
            )}
        </>
    );
}

export const SettingsTitleContext = React.createContext((v: React.ReactNode) => v);

function openCategory(id: string) {
    ContextMenu.close();
    SettingsRenderer.openSettingsPage(id);
}

function useCollectionMenu(collection: SettingsCollection) {
    const settings = useStateFromStores(Settings, () => {
        return collection.settings.map(category => ({
            id: category.id,
            name: category.name!,
            settings: category.settings.filter(s => s.type === "switch" && !s.hidden).map(setting => ({
                id: setting.id,
                label: setting.name!,
                disabled: setting.disabled,
                checked: Settings.get<boolean>(collection.id, category.id, setting.id),
                action: () => Settings.set(collection.id, category.id, setting.id, !Settings.get(collection.id, category.id, setting.id))
            }))
        }));
    }, []);

    return (
        <>
            {settings.map(category => (
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
        </>
    );
}

function useAddonMenu(manager: AddonManager) {
    const addons = useStateFromStores(manager, () => manager.addonList.map(a => a.name || (a as any).getName?.()).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).map((name) => [name as string, manager.resolveAddon(name), manager.isEnabled(name)] as const), [], true);
    const addonStoreIsEnabled = useStateFromStores(Settings, () => Settings.get("settings", "store", "bdAddonStore"), []);

    const toggles = React.useMemo(() => addons.map(([name, addon, enabled]) => (
        <ContextMenu.CheckboxItem
            label={name}
            id={name}
            checked={enabled}
            key={`bd.${manager.prefix}.${name}`}
            disabled={addon?.partial}
            action={(e: React.MouseEvent) => {
                if (!e.shiftKey) {
                    manager.toggleAddon(name);
                    return;
                }

                if (!manager.isEnabled(name)) {
                    toasts.warning(t("Addons.isDisabled", {name}));
                    return;
                }

                const hasSettings = (addon as Plugin).instance && typeof ((addon as Plugin).instance.getSettingsPanel) === "function";

                if (hasSettings) {
                    Modals.showAddonSettingsModal(name, (addon as Plugin).instance.getSettingsPanel!());
                }
                else {
                    toasts.warning(t("Addons.noSettings", {name}));
                }
            }}
        />
    )), [addons, manager]);

    return (
        <>
            <ContextMenu.Group key={`bd.${manager.prefix}.installed`}>
                {toggles}
            </ContextMenu.Group>
            {!!addonStoreIsEnabled && (
                <ContextMenu.Group key={`bd.${manager.prefix}.store`}>
                    <ContextMenu.Item
                        label={t("Addons.openStore", {context: manager.prefix})}
                        id={`${manager.prefix}-store`}
                        action={() => {
                            openCategory(manager.prefix + "s");
                            // If the addon store instantly opens have it just stop basically
                            DOMManager.onAdded(":where(.bd-store-card, .bd-addon-title > :nth-child(3))", (elem) => (elem as HTMLElement)?.click());
                        }}
                    />
                </ContextMenu.Group>
            )}
        </>
    );
}

export default SettingsRenderer;
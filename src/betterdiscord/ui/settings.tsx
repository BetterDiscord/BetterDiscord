import React, {ReactDOM} from "@modules/react";
import Settings from "@stores/settings";
import JsonStore from "@stores/json";
import {Filters, getByKeys, getLazy, getLazyByPrototypes, getLazyByStrings, getMangled} from "@webpack";
import Patcher from "@modules/patcher";

import ReactUtils from "@api/reactutils";

import AddonPage from "@ui/settings/addonpage";
import Header from "@ui/settings/sidebarheader";

import type {SettingsCategory} from "@data/settings";
import type {ComponentType, ReactNode} from "react";
import VersionInfo from "./misc/versioninfo";
import {findInTree} from "@common/utils";
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

const UserSettings = getByKeys<any>(["openUserSettings", "openUserSettingsFromParsedUrl"], {firstId: 840065, cacheId: "core-settings-usersettings"});

interface Section {
    section: string;
    element?: (ComponentType | (() => ReactNode));
    label?: string;
    className?: string;
    onClick?: (t: any) => void;
    tabPredicate?: () => boolean;
}
// Probably removed as an FYI
interface PaneLayout {
    buildLayout(): [];
    StronglyDiscouragedCustomComponent(): React.ReactNode;

    useTitle?(): React.ReactNode;
}
interface PanelLayout {
    buildLayout(): [] | [pane: PaneLayout];
    StronglyDiscouragedCustomComponent(): React.ReactNode;
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
    getLegacySearchKey(): string;
    buildLayout(): [] | [panel: PanelLayout];

    /**
     * @warning You cannot have page with onClick!
     */
    onClick?(): void;

    /** You can use react hooks here! */
    usePredicate?(): boolean;

    trailing?: Trailing;
}

interface SectionLayout {
    useTitle(): React.ReactNode;
    buildLayout(): SidebarItemLayout[];
    usePredicate?(): boolean;
}

interface LayoutBuilder {
    pane?(key: string, panel: PaneLayout): PaneLayout;
    panel(key: string, panel: PanelLayout): PanelLayout;
    sidebarItem(key: string, panel: SidebarItemLayout): SidebarItemLayout;
    section(key: string, panel: SectionLayout): SectionLayout;
}

type LayoutConstructor = {
    title(): React.ReactNode;
    icon: DiscordIcon;

    predicate?(): boolean;
} & ({
    header(): React.ReactNode;
    render(): React.ReactNode;
} | {
    onClick(): void;
});

/** @description On true clicking open will open not open the page. On false will open the page */
const useCustomCSSClickable = () => {
    const state = useStateFromStores(Settings, () => Settings.get<string>("settings", "customcss", "openAction"));

    return ["detached", "external", "system"].includes(state);
};
const useCustomCSSViewable = () => !useCustomCSSClickable();

function LayerSettingTitle() {
    const [node, setNode] = React.useState<HTMLElement | undefined | null | void>();

    return (
        <>
            <div
                className="bd-sidebar-header"
                ref={(v) => {
                    setNode(v?.parentElement?.parentElement || v);
                    return setNode;
                }}
            >
                BetterDiscord
            </div>
            {node && ReactDOM.createPortal(
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

export default new class SettingsRenderer {
    initialize() {
        this.patchSections();
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
        const UserSettingsLayer = await getLazyByPrototypes<{prototype: {getPredicateSections(): Section[];};}>(["getPredicateSections"]);
        if (!UserSettingsLayer) return;

        Patcher.after("SettingsManager", UserSettingsLayer.prototype, "getPredicateSections", (thisObject: unknown, _: unknown, returnValue: any) => {
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
                    section: collection.id,
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
                        let panelLayout: [] | [pane: PaneLayout] = [];

                        if (layoutBuilder.pane) {
                            const pane = layoutBuilder.pane(key, {
                                buildLayout: () => [],
                                StronglyDiscouragedCustomComponent: item.render,
                                useTitle: item.header
                            });

                            panelLayout = [pane];
                        }


                        const panel = layoutBuilder.panel(key, {
                            buildLayout: () => panelLayout,
                            StronglyDiscouragedCustomComponent: item.render,
                            useTitle: item.header
                        });

                        layout = [panel];
                    }

                    const sidebar = layoutBuilder.sidebarItem(key, {
                        buildLayout: () => layout,
                        useTitle: item.title,
                        icon: item.icon,
                        getLegacySearchKey: () => `BETTERDISCORD_${key}`,
                        usePredicate: () => true
                    });

                    if (typeof item.predicate === "function") {
                        sidebar.usePredicate = () => !!item.predicate!();
                    }

                    (sidebar as any).useSearchable = () => ["test"];

                    if ("onClick" in item) {
                        sidebar.onClick = item.onClick;
                    }

                    layouts.push(sidebar);
                };

                const makeSettingsPanelProvider = (children: React.ReactNode) => {
                    const ref: {
                        current: {
                            text?: React.ReactNode;
                            children?: React.ReactNode;
                        };
                    } = {
                        current: {}
                    };

                    let forceUpdate: () => void;
                    function PanelHeader() {
                        const [node, setNode] = React.useState<HTMLElement | undefined>();
                        forceUpdate = useForceUpdate()[1];

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
                                    {ref.current.text}
                                </div>

                                {node && (
                                    ReactDOM.createPortal(
                                        <div className="bd-settings-page-title-children">{ref.current.children}</div>,
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
                                    ref.current = (value as {props: typeof ref["current"];}).props;
                                    forceUpdate();
                                    return null;
                                }}
                            >
                                {children}
                            </SettingsTitleContext>
                        )
                    };
                };

                for (const collection of Settings.collections) {
                    // if (collection.disabled) continue;

                    insert(collection.id, {
                        ...makeSettingsPanelProvider(this.buildSettingsPanel(collection.id, collection.name, collection.settings, Settings.onSettingChange.bind(Settings, collection.id))),
                        icon: Logo.Discord,
                        title: () => collection.name
                    });
                }

                for (const panel of Settings.panels.sort((a, b) => a.order > b.order ? 1 : -1)) {
                    // if (panel.clickListener) panel.onClick = () => panel.clickListener?.(thisObject);
                    // if (!panel.className) panel.className = `bd-${panel.id}-tab`;
                    if (panel.type === "addon" && !panel.element) panel.element = this.getAddonPanel(panel.label, {store: panel.manager});

                    const icon = panel.icon ? lucideToDiscordIcon(panel.icon) : () => panel.id;

                    if (panel.id === "customcss") {
                        insert("customcss_tab", {
                            ...makeSettingsPanelProvider(React.createElement(panel.element!)),
                            icon,
                            title: () => panel.label,
                            predicate: useCustomCSSViewable

                        });
                        insert("customcss_clickable", {
                            icon,
                            title: () => panel.label,
                            predicate: useCustomCSSClickable,
                            onClick: () => CustomCSS.open()
                        });

                        continue;
                    }

                    insert(panel.id, {
                        ...makeSettingsPanelProvider(React.createElement(panel.element!)),
                        icon,
                        title: () => panel.label,
                    });
                }

                return layouts;
            },
            useTitle: () => Object.assign(<LayerSettingTitle />, {toString: () => "BetterDiscord"}),
        });

        Patcher.after("SettingsManager", rootLayout, "buildLayout", (that, args, res) => {
            let index = res.findIndex((layout) => (layout as any).key === "activity_section") + 1;
            if (index === -1) index = res.length;

            res.splice(index, 0, section);
        });
    }

    patchSettingsSearch() {
        const search = getMangled<{
            search(): Record<string, any>;
        }>(".PRIVACY_AND_SAFETY_PERSISTENT_VERIFICATION_CODES]", {
            search: Filters.byStrings(".PRIVACY_AND_SAFETY_PERSISTENT_VERIFICATION_CODES]")
        }, {cacheId: "core-settings-search"});

        Patcher.after("SettingsManager", search, "search", (that, args, res) => {
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
        const versionDisplayModule = await getLazyByStrings<{A(): void;}>(["copyValue", "RELEASE_CHANNEL"], {defaultExport: false});
        if (!versionDisplayModule?.A) return;

        Patcher.after("SettingsManager", versionDisplayModule, "A", () => {
            return React.createElement(VersionInfo);
        });
    }

    public openSettingsPage(key: string) {
        UserSettings?.openUserSettings?.(`betterdiscord_${key === "customcss" ? "customcss_tab" : key}_panel`, {
            section: key
        });
    }

    forceUpdate() {
        const viewClass = DiscordModules.ViewClasses?.standardSidebarView.split(" ")[0];
        const node = document.querySelector(`.${viewClass}`);
        if (!node) return;
        const stateNode = findInTree(ReactUtils.getInternalInstance(node), (m: {getPredicateSections: any;}) => m && m.getPredicateSections, {walkable: ["return", "stateNode"]});
        if (stateNode) stateNode.forceUpdate();
    }
};
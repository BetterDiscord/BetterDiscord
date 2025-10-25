import Config from "@data/config";

import React, {ReactDOM} from "@modules/react";
import Strings from "@modules/strings";
import Utilities from "@modules/utilities";
import Events from "@modules/emitter";
import Settings from "@modules/settingsmanager";
import DataStore from "@modules/datastore";
import WebpackModules, {Filters} from "@modules/webpackmodules";
import Patcher from "@modules/patcher";
import DiscordModules from "@modules/discordmodules";
import PluginManager from "@modules/pluginmanager";
import ThemeManager from "@modules/thememanager";

import ReactUtils from "@modules/api/reactutils";

import Button from "@ui/base/button";
import Modals from "@ui/modals";

import AddonPage from "@ui/settings/addonpage";
import SettingsGroup from "@ui/settings/group";
import SettingsTitle from "@ui/settings/title";
import Header from "@ui/settings/sidebarheader";

import Restore from "./icons/restore";
import Text from "./base/text";
import BDLogo from "./icons/bdlogo";
import HistoryIcon from "@ui/icons/history";
import changelog from "@data/changelog";

function makeResetButton(collectionId, refresh) {
    const action = confirmReset(() => {
        Settings.resetCollection(collectionId);
        refresh?.();
    });
    return <DiscordModules.Tooltip color="primary" position="top" text={Strings.Settings.resetSettings}>
                {(props) =>
                    <Button {...props} size={Button.Sizes.ICON} look={Button.Looks.BLANK} color={Button.Colors.TRANSPARENT} onClick={action}>
                        <Restore />
                    </Button>
                }
            </DiscordModules.Tooltip>;
}

/**
 * @param {function} action
 * @returns
 */
function confirmReset(action) {
    return () => {
        Modals.showConfirmationModal(Strings.Modals.confirmAction, Strings.Settings.resetSettingsWarning, {
            confirmText: Strings.Modals.okay,
            cancelText: Strings.Modals.cancel,
            danger: true,
            onConfirm: action,
        });
    };
}

function getDebugInfo(discordInfo, pluginsEnabled, themesEnabled) {
    const lines = ["```md", `## Discord Info\n${discordInfo}\n`];
    lines.push(`## BetterDiscord`);
    lines.push(`stable ${Config.version}\n`);
    lines.push(`### Plugins (${pluginsEnabled} Enabled):\n${PluginManager.addonList.map(a => `- ${a.name}${PluginManager.isEnabled(a.id) ? " (Enabled)" : ""}`).join("\n")}\n`);
    lines.push(`### Themes (${themesEnabled} Enabled):\n${ThemeManager.addonList.map(a => `- ${a.name}${ThemeManager.isEnabled(a.id) ? " (Enabled)" : ""}`).join("\n")}`);
    lines.push("```");
    return lines.join("\n");
}

/**
 *
 * @param {string} type plugin or theme
 * @returns {{total: number, enabled: number}}
 */
function getAddonCount(type) {
    if (type === "theme") return {total: ThemeManager.addonList.length, enabled: ThemeManager.addonList.filter(p => ThemeManager.isEnabled(p.id)).length};
    if (type === "plugin") return {total: PluginManager.addonList.length, enabled: PluginManager.addonList.filter(p => PluginManager.isEnabled(p.id)).length};
    return {total: 0, enabled: 0};
}

export const SettingsTitleContext = React.createContext();

export default new class SettingsRenderer {

    constructor() {
        this.patchSections();
        this.patchVersionInformation();
        this.patchModalSettings();
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
        return (categoryId, settingId, value) => {
            onChange(categoryId, settingId, value);

            // Delay until after switch animation
            // TODO: find a better workaround
            // customcss is here to let the tab show/hide
            // devTools is here for toggles that enableWith
            // checkForUpdates also here for enableWith
            // lift state to top level properly to avoid this
            if (settingId === "customcss" || settingId === "devTools" || settingId === "checkForUpdates") {
                setTimeout(this.forceUpdate.bind(this), 250);
            }
        };
    }

    buildSettingsPanel(id, title, config, state, onChange) {
        config.forEach(section => {
            section.settings.forEach(item => item.value = state[section.id][item.id]);
        });
        return this.getSettingsPanel(id, title, config, this.onChange(onChange));
    }

    getSettingsPanel(id, title, groups, onChange) {
        // return <SettingsPanel
        //             id={id}
        //             title={title}
        //             groups={groups}
        //             onChange={onChange}
        //             onDrawerToggle={(...args) => this.onDrawerToggle(...args)}
        //             getDrawerState={(...args) => this.getDrawerState(...args)}
        //         />;
        return [React.createElement(SettingsTitle, {text: title}, makeResetButton(id, this.forceUpdate.bind(this))), groups.map(section => {
            return React.createElement(SettingsGroup, Object.assign({}, section, {
                onChange: onChange,
                onDrawerToggle: state => this.onDrawerToggle(id, section.id, state),
                shown: this.getDrawerState(id, section.id, section.hasOwnProperty("shown") ? section.shown : true)
            }));
        })];
    }

    getAddonPanel(title, addonList, addonState, options = {}) {
        return (props) => React.createElement(AddonPage, Object.assign({}, {
            title: title,
            addonList: addonList,
            addonState: addonState,
            ...props
        }, options));
    }

    async patchSections() {
        const UserSettings = await WebpackModules.getLazy(Filters.byPrototypeKeys(["getPredicateSections"]));

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
                    element: () => this.buildSettingsPanel(collection.id, collection.name, collection.settings, Settings.state[collection.id], Settings.onSettingChange.bind(Settings, collection.id))
                });
            }
            for (const panel of Settings.panels.sort((a,b) => a.order > b.order ? 1 : -1)) {
                if (panel.clickListener) panel.onClick = (event) => panel.clickListener(thisObject, event, returnValue);
                if (!panel.className) panel.className = `bd-${panel.id}-tab`;
                insert(panel);
            }
        });
    }

    async patchVersionInformation() {
        const versionDisplayModule = await WebpackModules.getLazy(Filters.byStrings("copyValue", "RELEASE_CHANNEL"), {defaultExport: false});
        if (!versionDisplayModule?.Z) return;

        Patcher.after("SettingsManager", versionDisplayModule, "Z", (_, __, reactTree) => {
            const currentCopy = reactTree?.props?.copyValue;
            const renderer = reactTree?.props?.children;

            // Do some sanity checking to make sure this is both the right component
            // and that it's in the format we expect
            if (typeof(renderer) !== "function" || !currentCopy) return;

            const [pluginCount, setPluginCount] = React.useState(getAddonCount("plugin"));
            const [themeCount, setThemeCount] = React.useState(getAddonCount("theme"));

            React.useEffect(() => {
                const hooks = [setPluginCount, setThemeCount];
                const handlers = {};
                const types = ["plugin", "theme"];
                const events = ["enabled", "disabled", "loaded", "unloaded"];

                // Set handlers and add event listeners
                for (let t = 0; t < types.length; t++) {
                    handlers[types[t]] = () => hooks[t](getAddonCount(types[t]));
                    for (let e = 0; e < events.length; e++) {
                        Events.on(`${types[t]}-${events[e]}`, handlers[types[t]]);
                    }
                }
                return () => {
                    // Remove event listeners
                    for (let t = 0; t < types.length; t++) {
                        for (let e = 0; e < events.length; e++) {
                            Events.off(`${types[t]}-${events[e]}`, handlers[types[t]]);
                        }
                    }
                };
            }, []);

            Object.assign(reactTree.props, {get copyValue() {return getDebugInfo(currentCopy, pluginCount.enabled, themeCount.enabled);}});

            if (renderer.__patched) return;
            reactTree.props.children = function DebugInfo(...props) {
                const returnTree = renderer(...props);
                const target = returnTree?.props?.children?.props?.children;

                // Do some sanity checking to make sure this is both the right component
                // and that it's in the format we expect
                if (!Array.isArray(target) && returnTree?.props?.role === "button") return returnTree;

                target.push(<Text color={Text.Colors.MUTED} size={Text.Sizes.SIZE_12}>BetterDiscord {Config.version}</Text>);
                target.push(<Text color={Text.Colors.MUTED} size={Text.Sizes.SIZE_12}>{Strings.Panels.plugins} {pluginCount.total} ({pluginCount.enabled} {Strings.Addons.isEnabled})</Text>);
                target.push(<Text color={Text.Colors.MUTED} size={Text.Sizes.SIZE_12}>{Strings.Panels.themes} {themeCount.total} ({themeCount.enabled} {Strings.Addons.isEnabled})</Text>);

                return returnTree;
            };
            renderer.__patched = true;
        });
    }

    async patchModalSettings() {
        const rootBuilder = await WebpackModules.getLazy(m => m?.key === "$Root");

        this.patchSearchStuff();

        Patcher.after("SettingsManager", rootBuilder, "buildLayout", (that, args, res) => {
            let index = res.findIndex(m => m.key === "activity_section") + 1;
            if (index === 0) index = res.length;

            const layouts = [];

            function PaneHeader({text, children}) {
                const [node, setNode] = React.useState();                

                return (
                    <>
                        <div 
                            className="bd-settings-page-title"
                            ref={(v) => {
                                if (v.parentElement?.parentElement) {
                                    v.parentElement.parentElement.classList.add("bd-settings-page-title-extend");
                                }

                                return setNode(v.parentElement?.parentElement || v), setNode
                            }}
                        >
                            {text}
                        </div>

                        {node && ReactDOM.createPortal(
                            <div>{children}</div>,
                            node
                        )}
                    </>
                )
            }

            for (const collection of Settings.collections) {
                if (collection.disabled) continue;

                const [title, settingsPanel] = this.buildSettingsPanel(collection.id, collection.name, collection.settings, Settings.state[collection.id], Settings.onSettingChange.bind(Settings, collection.id));                
                

                const pane = {
                    buildLayout: () => [],
                    key: `betterdiscord_${collection.id}_pane`,
                    type: 4,
                    render: () => settingsPanel
                }

                const panel = {
                    buildLayout: () => [pane],
                    key: `betterdiscord_${collection.id}_panel`,
                    type: 3,
                    useTitle: () => <PaneHeader text={collection.name.toString()}>{title.props.children}</PaneHeader>
                }

                layouts.push({
                    icon: ({className, color}) => React.createElement(collection.icon || BDLogo, {className, color, width: 20, height: 20}),
                    key: `openUserSettings${collection.id}_sidebar_item`,
                    buildLayout: () => [panel],
                    legacySearchKey: "BETTERDISCORD_" + collection.id,
                    type: 2,
                    useTitle: () => collection.name.toString(),
                    trailing: null
                });
            }

            for (const item of Settings.panels.sort((a,b) => a.order > b.order ? 1 : -1)) {
                const ref = React.createRef({});
                let update;

                function Title() {
                    const [node, setNode] = React.useState();
                    update = React.useReducer((prev) => prev + 1, 0)[1];                    

                    return (
                        <>
                            <div 
                                className="bd-settings-page-title"
                                ref={(v) => {
                                    if (v.parentElement?.parentElement) {
                                        v.parentElement.parentElement.classList.add("bd-settings-page-title-extend");
                                    }

                                    return setNode(v.parentElement?.parentElement || v), setNode
                                }}
                            >
                                {ref.current?.title}
                            </div>

                            {node && ReactDOM.createPortal(
                                <div>{ref.current?.children}</div>,
                                node
                            )}
                        </>
                    )
                }
                
                const pane = {
                    buildLayout: () => [],
                    key: `betterdiscord_${item.id}_pane`,
                    type: 4,
                    render: (props) => React.createElement(SettingsTitleContext.Provider, {
                        value: (value) => {
                            ref.current = value;
                            update?.();
                        },
                        children: React.createElement(item.element, props)
                    })
                }

                const panel = {
                    buildLayout: () => [pane],
                    key: `betterdiscord_${item.id}_panel`,
                    type: 3,
                    useTitle: () => React.createElement(Title)
                }

                layouts.push({
                    icon: ({className, color}) => React.createElement(item.icon || BDLogo, {className, color, width: 20, height: 20}),
                    key: `betterdiscord_${item.id}_sidebar_item`,
                    buildLayout: () => [panel],
                    legacySearchKey: "BETTERDISCORD_" + item.id,
                    type: 2,
                    useTitle: () => item.label.toString()
                });
            }

            function Header() {
                const [node, setNode] = React.useState();

                return (
                    <>
                        <div 
                            className="bd-sidebar-header" 
                            ref={(v) => (setNode(v.parentElement?.parentElement || v), setNode)}
                        >
                            BetterDiscord
                        </div>
                        {node && ReactDOM.createPortal(
                            <DiscordModules.Tooltip color="primary" position="top" text={Strings.Modals.changelog}>
                                {props =>
                                    <Button {...props} className="bd-changelog-button" look={Button.Looks.BLANK} color={Button.Colors.TRANSPARENT} size={Button.Sizes.NONE} onClick={() => Modals.showChangelogModal(changelog)}>
                                        <HistoryIcon className="bd-icon" size="16px" />
                                    </Button>
                                }
                            </DiscordModules.Tooltip>,
                            node
                        )}
                    </>
                )
            }
            
            res.splice(index, 0, {
                buildLayout: () => layouts,
                key: "betterdiscord",
                type: 1,
                useLabel: () => React.createElement(Header)
            });
        });
    }

    async patchSearchStuff() {        
        const [module, key] = WebpackModules.getWithKey(Filters.byStrings(".SEARCH_NO_RESULTS]:{"), {
            target: WebpackModules.getBySource(".SEARCH_NO_RESULTS]:{")
        });        

        Patcher.after("SettingsManager", module, key, (that, args, res) => {
            // IDK if this is an attempt to block us from adding stuff
            // but discord freezes the result
            res = {...res};

            for (const collection of Settings.collections) {
                if (collection.disabled) continue;                

                res["BETTERDISCORD_" + collection.id] = {
                    ariaLabel: collection.name.toString(),
                    label: collection.name.toString(),
                    searchableTitles: [
                        collection.name.toString(),
                        ...collection.settings.flatMap(m => [m.name, m.settings.flatMap(m => m.name)].flat())
                    ],
                    section: collection.name.toString(),
                    url: null
                }
            }

            for (const item of Settings.panels.sort((a,b) => a.order > b.order ? 1 : -1)) {
                res["BETTERDISCORD_" + item.id] = {
                    ariaLabel: item.label.toString(),
                    label: item.label.toString(),
                    searchableTitles: [item.label.toString(), ...item.searchableTitles],
                    section: item.label.toString(),
                    url: null
                }
            }

            return Object.freeze(res);
        });
    }

    forceUpdate() {
        const viewClass = WebpackModules.getByProps("standardSidebarView")?.standardSidebarView.split(" ")[0];
        const node = document.querySelector(`.${viewClass}`);
        if (!node) return;
        const stateNode = Utilities.findInTree(ReactUtils.getInternalInstance(node), m => m && m.getPredicateSections, {walkable: ["return", "stateNode"]});
        if (stateNode) stateNode.forceUpdate();
    }
};
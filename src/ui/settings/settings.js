import {SettingsInfo, SettingsCookie, Plugins, Themes} from "data";
import {React, ReactDOM, Utilities, ContentManager, Events, EmoteModule, PluginManager, ThemeManager} from "modules";
import Sidebar from "./sidebar";
import Scroller from "../scroller";
import List from "../list";
import ContentColumn from "./contentcolumn";
import SectionedSettingsPanel from "./sectionedsettings";
import Tools from "./exitbutton";
import SettingsPanel from "./panel";
import PluginCard from "./plugincard";
import ThemeCard from "./themecard";
import ReloadIcon from "../icons/reload";

import CssEditor from "../customcss/editor";
import SettingsGroup from "../settings/settingsgroup";

export default class V2_SettingsPanel {

    constructor(props) {
        this.sideBarOnClick = this.sideBarOnClick.bind(this);
        this.onChange = props.onChange;
        this.sidebar = new Sidebar(this.sideBarOnClick);
    }

    get root() {
        const _root = $("#bd-settingspane-container");
        if (!_root.length) {
            if (!this.injectRoot()) return null;
            return this.root;
        }
        return _root[0];
    }

    injectRoot() {
        if (!$(".layer-3QrUeG .standardSidebarView-3F1I7i, .layer-3QrUeG .ui-standard-sidebar-view").length) return false;
        const root = $("<div/>", {
            "class": "contentRegion-3nDuYy content-region",
            "id": "bd-settingspane-container"
        });
        $(".layer-3QrUeG .standardSidebarView-3F1I7i, .layer-3QrUeG .ui-standard-sidebar-view").append(root);

        Utilities.onRemoved(root[0], () => {
            ReactDOM.unmountComponentAtNode(root[0]);
        });
        return true;
    }

    get coreSettings() {
        const settings = this.getSettings("core");
        const categories = [...new Set(settings.map(s => s.category))];
        const sections = categories.map(c => {return {title: c, settings: settings.filter(s => s.category == c)};});
        return sections;
    }

    get emoteSettings() {
        return this.getSettings("emote");
    }
    getSettings(category) {
        return Object.keys(SettingsInfo).reduce((arr, key) => {
            const setting = SettingsInfo[key];
            if (setting.cat === category && setting.implemented && !setting.hidden) {
                setting.text = key;
                arr.push(setting);
            }
            return arr;
        }, []);
    }

    sideBarOnClick(id) {
        const self = this;
        $(".contentRegion-3nDuYy, .content-region").first().hide();
        $(self.root).show();
        switch (id) {
            case "core":
                self.renderCoreSettings();
                break;
            case "emotes":
                self.renderEmoteSettings();
                break;
            case "customcss":
                self.renderCustomCssEditor();
                break;
            case "plugins":
                self.renderPluginPane();
                break;
            case "themes":
                self.renderThemePane();
                break;
        }
    }

    renderSidebar() {
        const self = this;
        $("[class*='side-'] > [class*='item-']").off("click.v2settingspanel").on("click.v2settingspanel", () => {
            ReactDOM.unmountComponentAtNode(self.root);
            $(self.root).hide();
            $(".contentRegion-3nDuYy, .content-region").first().show();
        });
        self.sidebar.render();
    }

    get core2() {
        return this.coreSettings.map(section => {
            return React.createElement(SettingsGroup, Object.assign({}, section, {onChange: this.onChange}));
        });
    }

    get coreComponent() {
        return React.createElement(Scroller, {contentColumn: true, fade: true, dark: true, children: [
            React.createElement(SectionedSettingsPanel, {key: "cspanel", onChange: this.onChange, sections: this.coreSettings}),
            React.createElement(Tools, {key: "tools"})
        ]});
    }

    get emoteComponent() {
        return React.createElement(Scroller, {
            contentColumn: true, fade: true, dark: true, children: [
                React.createElement(SettingsPanel, {key: "espanel", title: "Emote Settings", onChange: this.onChange, settings: this.emoteSettings, button: {
                    title: "Clear Emote Cache",
                    onClick: () => { EmoteModule.clearEmoteData(); EmoteModule.init(); }
                }}),
                React.createElement(Tools, {key: "tools"})
        ]});
    }

    get customCssComponent() {
        return React.createElement(Scroller, {contentColumn: true, fade: true, dark: true, children: [React.createElement(CssEditor, {key: "csseditor"}), React.createElement(Tools, {key: "tools"})]});
    }

    contentComponent(type) {
        const componentElement = type == "plugins" ? this.pluginsComponent : this.themesComponent;
        const prefix = type.replace("s", "");
        const settingsList = this;
        class ContentList extends React.Component {
            constructor(props) {
                super(props);
                this.onChange = this.onChange.bind(this);
            }

            componentDidMount() {
                Events.on(`${prefix}-reloaded`, this.onChange);
                Events.on(`${prefix}-loaded`, this.onChange);
                Events.on(`${prefix}-unloaded`, this.onChange);
            }

            componentWillUnmount() {
                Events.off(`${prefix}-reloaded`, this.onChange);
                Events.off(`${prefix}-loaded`, this.onChange);
                Events.off(`${prefix}-unloaded`, this.onChange);
            }

            onChange() {
                settingsList.sideBarOnClick(type);
            }

            render() {return componentElement;}
        }
        return React.createElement(ContentList);
    }

    get pluginsComponent() {
        const plugins = Object.keys(Plugins).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).reduce((arr, key) => {
            arr.push(React.createElement(PluginCard, {key: key, plugin: Plugins[key].plugin}));return arr;
        }, []);
        const list = React.createElement(List, {key: "plugin-list", className: "bda-slist", children: plugins});
        const refreshIcon = !SettingsCookie["fork-ps-5"] && React.createElement(ReloadIcon, {className: "bd-reload-header", size: "18px", onClick: async () => {
            PluginManager.updatePluginList();
            this.sideBarOnClick("plugins");
        }});
        const pfBtn = React.createElement("button", {key: "folder-button", className: "bd-pfbtn", onClick: () => { require("electron").shell.openItem(ContentManager.pluginsFolder); }}, "Open Plugin Folder");
        const contentColumn = React.createElement(ContentColumn, {key: "pcolumn", title: "Plugins", children: [refreshIcon, pfBtn, list]});
        return React.createElement(Scroller, {contentColumn: true, fade: true, dark: true, children: [contentColumn, React.createElement(Tools, {key: "tools"})]});
    }

    get themesComponent() {
        const themes = Object.keys(Themes).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).reduce((arr, key) => {
            arr.push(React.createElement(ThemeCard, {key: key, theme: Themes[key]}));return arr;
        }, []);
        const list = React.createElement(List, {key: "theme-list", className: "bda-slist", children: themes});
        const refreshIcon = !SettingsCookie["fork-ps-5"] && React.createElement(ReloadIcon, {className: "bd-reload-header", size: "18px", onClick: async () => {
            ThemeManager.updateThemeList();
            this.sideBarOnClick("themes");
        }});
        const tfBtn = React.createElement("button", {key: "folder-button", className: "bd-pfbtn", onClick: () => { require("electron").shell.openItem(ContentManager.themesFolder); }}, "Open Theme Folder");
        const contentColumn = React.createElement(ContentColumn, {key: "tcolumn", title: "Themes", children: [refreshIcon, tfBtn, list]});
        return React.createElement(Scroller, {contentColumn: true, fade: true, dark: true, children: [contentColumn, React.createElement(Tools, {key: "tools"})]});
    }

    renderCoreSettings() {
        const root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layer-3QrUeG .standardSidebarView-3F1I7i");
            return;
        }
        ReactDOM.render(this.coreComponent, root);
    }

    renderEmoteSettings() {
        const root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layer-3QrUeG .standardSidebarView-3F1I7i");
            return;
        }
        ReactDOM.render(this.emoteComponent, root);
    }

    renderCustomCssEditor() {
        const root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layer-3QrUeG .standardSidebarView-3F1I7i");
            return;
        }
        ReactDOM.render(this.customCssComponent, root);
    }

    renderPluginPane() {
        const root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layer-3QrUeG .standardSidebarView-3F1I7i");
            return;
        }
        ReactDOM.render(this.contentComponent("plugins"), root);
    }

    renderThemePane() {
        const root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layer-3QrUeG .standardSidebarView-3F1I7i");
            return;
        }
        ReactDOM.render(this.contentComponent("themes"), root);
    }
}
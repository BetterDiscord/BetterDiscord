import {SettingsInfo, SettingsCookie, Plugins, Themes} from "data";
import {BDV2, Utilities, ContentManager, Emitter, EmoteModule, EmoteMenu, PluginManager, ThemeManager} from "modules";
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
            BDV2.reactDom.unmountComponentAtNode(root[0]);
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
            BDV2.reactDom.unmountComponentAtNode(self.root);
            $(self.root).hide();
            $(".contentRegion-3nDuYy, .content-region").first().show();
        });
        self.sidebar.render();
    }

    get coreComponent() {
        return BDV2.react.createElement(Scroller, {contentColumn: true, fade: true, dark: true, children: [
            BDV2.react.createElement(SectionedSettingsPanel, {key: "cspanel", onChange: this.onChange, sections: this.coreSettings}),
            BDV2.react.createElement(Tools, {key: "tools"})
        ]});
    }

    get emoteComponent() {
        return BDV2.react.createElement(Scroller, {
            contentColumn: true, fade: true, dark: true, children: [
                BDV2.react.createElement(SettingsPanel, {key: "espanel", title: "Emote Settings", onChange: this.onChange, settings: this.emoteSettings, button: {
                    title: "Clear Emote Cache",
                    onClick: () => { EmoteModule.clearEmoteData(); EmoteModule.init(); EmoteMenu.init(); }
                }}),
                BDV2.react.createElement(Tools, {key: "tools"})
        ]});
    }

    get customCssComponent() {
        return BDV2.react.createElement(Scroller, {contentColumn: true, fade: true, dark: true, children: [BDV2.react.createElement(CssEditor, {key: "csseditor"}), BDV2.react.createElement(Tools, {key: "tools"})]});
    }

    contentComponent(type) {
        const componentElement = type == "plugins" ? this.pluginsComponent : this.themesComponent;
        const prefix = type.replace("s", "");
        const settingsList = this;
        class ContentList extends BDV2.react.Component {
            constructor(props) {
                super(props);
                this.onChange = this.onChange.bind(this);
            }

            componentDidMount() {
                Emitter.on(`${prefix}-reloaded`, this.onChange);
                Emitter.on(`${prefix}-loaded`, this.onChange);
                Emitter.on(`${prefix}-unloaded`, this.onChange);
            }

            componentWillUnmount() {
                Emitter.off(`${prefix}-reloaded`, this.onChange);
                Emitter.off(`${prefix}-loaded`, this.onChange);
                Emitter.off(`${prefix}-unloaded`, this.onChange);
            }

            onChange() {
                settingsList.sideBarOnClick(type);
            }

            render() {return componentElement;}
        }
        return BDV2.react.createElement(ContentList);
    }

    get pluginsComponent() {
        const plugins = Object.keys(Plugins).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).reduce((arr, key) => {
            arr.push(BDV2.react.createElement(PluginCard, {key: key, plugin: Plugins[key].plugin}));return arr;
        }, []);
        const list = BDV2.react.createElement(List, {key: "plugin-list", className: "bda-slist", children: plugins});
        const refreshIcon = !SettingsCookie["fork-ps-5"] && BDV2.react.createElement(ReloadIcon, {className: "bd-reload-header", size: "18px", onClick: async () => {
            PluginManager.updatePluginList();
            this.sideBarOnClick("plugins");
        }});
        const pfBtn = BDV2.react.createElement("button", {key: "folder-button", className: "bd-pfbtn", onClick: () => { require("electron").shell.openItem(ContentManager.pluginsFolder); }}, "Open Plugin Folder");
        const contentColumn = BDV2.react.createElement(ContentColumn, {key: "pcolumn", title: "Plugins", children: [refreshIcon, pfBtn, list]});
        return BDV2.react.createElement(Scroller, {contentColumn: true, fade: true, dark: true, children: [contentColumn, BDV2.react.createElement(Tools, {key: "tools"})]});
    }

    get themesComponent() {
        const themes = Object.keys(Themes).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).reduce((arr, key) => {
            arr.push(BDV2.react.createElement(ThemeCard, {key: key, theme: Themes[key]}));return arr;
        }, []);
        const list = BDV2.react.createElement(List, {key: "theme-list", className: "bda-slist", children: themes});
        const refreshIcon = !SettingsCookie["fork-ps-5"] && BDV2.react.createElement(ReloadIcon, {className: "bd-reload-header", size: "18px", onClick: async () => {
            ThemeManager.updateThemeList();
            this.sideBarOnClick("themes");
        }});
        const tfBtn = BDV2.react.createElement("button", {key: "folder-button", className: "bd-pfbtn", onClick: () => { require("electron").shell.openItem(ContentManager.themesFolder); }}, "Open Theme Folder");
        const contentColumn = BDV2.react.createElement(ContentColumn, {key: "tcolumn", title: "Themes", children: [refreshIcon, tfBtn, list]});
        return BDV2.react.createElement(Scroller, {contentColumn: true, fade: true, dark: true, children: [contentColumn, BDV2.react.createElement(Tools, {key: "tools"})]});
    }

    renderCoreSettings() {
        const root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layer-3QrUeG .standardSidebarView-3F1I7i");
            return;
        }
        BDV2.reactDom.render(this.coreComponent, root);
    }

    renderEmoteSettings() {
        const root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layer-3QrUeG .standardSidebarView-3F1I7i");
            return;
        }
        BDV2.reactDom.render(this.emoteComponent, root);
    }

    renderCustomCssEditor() {
        const root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layer-3QrUeG .standardSidebarView-3F1I7i");
            return;
        }
        BDV2.reactDom.render(this.customCssComponent, root);
    }

    renderPluginPane() {
        const root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layer-3QrUeG .standardSidebarView-3F1I7i");
            return;
        }
        BDV2.reactDom.render(this.contentComponent("plugins"), root);
    }

    renderThemePane() {
        const root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layer-3QrUeG .standardSidebarView-3F1I7i");
            return;
        }
        BDV2.reactDom.render(this.contentComponent("themes"), root);
    }
}
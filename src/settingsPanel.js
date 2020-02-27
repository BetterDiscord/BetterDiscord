import {settings, settingsCookie, bdplugins, bdthemes} from "./0globals";
import DataStore from "./dataStore";
import V2_SettingsPanel_Sidebar from "./settingsPanelSidebar";
import Utils from "./utils";
import BDV2 from "./v2";
import ContentManager from "./contentManager";
import BDEvents from "./bdEvents";
import pluginModule from "./pluginModule";
import themeModule from "./themeModule";
import coloredText from "./coloredText";

import publicServersModule from "./publicServers";
import voiceMode from "./voiceMode";
import emoteModule from "./emoteModule";
import ClassNormalizer from "./classNormalizer";
import dMode from "./devMode";
import quickEmoteMenu from "./quickEmoteMenu";

import Tools from "./react/tools";
import ReloadIcon from "./react/reloadIcon";
import TooltipWrap from "./react/tooltipWrap";
import Scroller from "./react/scroller";
import List from "./react/list";
import PluginCard from "./react/pluginCard";
import ThemeCard from "./react/themeCard";
import SectionedSettingsPanel from "./react/sectionedSettingsPanel";
import SettingsPanel from "./react/settingsPanel";
import CssEditor from "./react/cssEditor";
import ContentColumn from "./react/contentColumn";

export default new class V2_SettingsPanel {

    constructor() {
        const self = this;
        self.sideBarOnClick = self.sideBarOnClick.bind(self);
        self.onChange = self.onChange.bind(self);
        self.updateSettings = this.updateSettings.bind(self);
        self.sidebar = new V2_SettingsPanel_Sidebar(self.sideBarOnClick);
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

        Utils.onRemoved(root[0], () => {
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
        return Object.keys(settings).reduce((arr, key) => {
            const setting = settings[key];
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

    onClick() {}

    onChange(id, checked) {
        this.updateSettings(id, checked);
    }

    updateSettings(id, enabled) {
        settingsCookie[id] = enabled;

        // if (id == "bda-gs-b") {
        //     if (enabled) $("body").addClass("bd-blue");
        //     else $("body").removeClass("bd-blue");
        // }

        if (id == "bda-gs-2") {
            if (enabled) $("body").addClass("bd-minimal");
            else $("body").removeClass("bd-minimal");
        }

        if (id == "bda-gs-3") {
            if (enabled) $("body").addClass("bd-minimal-chan");
            else $("body").removeClass("bd-minimal-chan");
        }

        if (id == "bda-gs-1") {
            if (enabled) publicServersModule.addButton();
            else publicServersModule.removeButton();
        }

        if (id == "bda-gs-4") {
            if (enabled) voiceMode.enable();
            else voiceMode.disable();
        }

        if (id == "bda-gs-5") {
            if (enabled) $("#app-mount").addClass("bda-dark");
            else $("#app-mount").removeClass("bda-dark");
        }

        if (enabled && id == "bda-gs-6") coloredText.inject24Hour();

        if (id == "bda-gs-7") {
            if (enabled) coloredText.injectColoredText();
            else coloredText.removeColoredText();
        }

        if (id == "bda-es-4") {
            if (enabled) emoteModule.autoCapitalize();
            else emoteModule.disableAutoCapitalize();
        }

        if (id == "fork-ps-4") {
            if (enabled) ClassNormalizer.start();
            else ClassNormalizer.stop();
        }

        if (id == "fork-ps-5") {
            if (enabled) {
                ContentManager.watchContent("plugin");
                ContentManager.watchContent("theme");
            }
            else {
                ContentManager.unwatchContent("plugin");
                ContentManager.unwatchContent("theme");
            }
        }

        if (id == "fork-wp-1") {
            // BdApi.setWindowPreference("transparent", enabled);
            // if (enabled) BdApi.setWindowPreference("backgroundColor", null);
            // else BdApi.setWindowPreference("backgroundColor", "#2f3136");
        }

        /*if (_c["fork-wp-2"]) {
            const current = BdApi.getWindowPreference("frame");
            if (current != _c["fork-wp-2"]) BdApi.setWindowPreference("frame", _c["fork-wp-2"]);
        }*/


        if (id == "bda-gs-8") {
            if (enabled) dMode.enable(settingsCookie["fork-dm-1"]);
            else dMode.disable();
        }

        if (id == "fork-dm-1") {
            if (settingsCookie["bda-gs-8"]) dMode.enable(enabled);
        }

        this.saveSettings();
    }

    initializeSettings() {

        // if (settingsCookie["bda-gs-b"]) $("body").addClass("bd-blue");
        if (settingsCookie["bda-gs-2"]) $("body").addClass("bd-minimal");
        if (settingsCookie["bda-gs-3"]) $("body").addClass("bd-minimal-chan");
        if (settingsCookie["bda-gs-1"]) publicServersModule.addButton();
        if (settingsCookie["bda-gs-4"]) voiceMode.enable();
        if (settingsCookie["bda-gs-5"]) $("#app-mount").addClass("bda-dark");
        if (settingsCookie["bda-gs-6"]) coloredText.inject24Hour();
        if (settingsCookie["bda-gs-7"]) coloredText.injectColoredText();
        if (settingsCookie["bda-es-4"]) emoteModule.autoCapitalize();
        if (settingsCookie["fork-ps-4"]) ClassNormalizer.start();

        if (settingsCookie["fork-ps-5"]) {
            ContentManager.watchContent("plugin");
            ContentManager.watchContent("theme");
        }

        if (settingsCookie["bda-gs-8"]) dMode.enable(settingsCookie["fork-dm-1"]);

        this.saveSettings();
    }

    saveSettings() {
        DataStore.setSettingGroup("settings", settingsCookie);
    }
    
    loadSettings() {
        Object.assign(settingsCookie, DataStore.getSettingGroup("settings"));
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
                    onClick: () => { emoteModule.clearEmoteData(); emoteModule.init(); quickEmoteMenu.init(); }
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
                BDEvents.on(`${prefix}-reloaded`, this.onChange);
                BDEvents.on(`${prefix}-loaded`, this.onChange);
                BDEvents.on(`${prefix}-unloaded`, this.onChange);
            }

            componentWillUnmount() {
                BDEvents.off(`${prefix}-reloaded`, this.onChange);
                BDEvents.off(`${prefix}-loaded`, this.onChange);
                BDEvents.off(`${prefix}-unloaded`, this.onChange);
            }

            onChange() {
                settingsList.sideBarOnClick(type);
            }

            render() {return componentElement;}
        }
        return BDV2.react.createElement(ContentList);
    }

    get pluginsComponent() {
        const plugins = Object.keys(bdplugins).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).reduce((arr, key) => {
            arr.push(BDV2.react.createElement(PluginCard, {key: key, plugin: bdplugins[key].plugin}));return arr;
        }, []);
        const list = BDV2.react.createElement(List, {key: "plugin-list", className: "bda-slist", children: plugins});
        const refreshIcon = !settingsCookie["fork-ps-5"] && BDV2.react.createElement(TooltipWrap(ReloadIcon, {color: "black", side: "top", text: "Reload Plugin List"}), {className: "bd-reload-header", size: "18px", onClick: async () => {
            pluginModule.updatePluginList();
            this.sideBarOnClick("plugins");
        }});
        const pfBtn = BDV2.react.createElement("button", {key: "folder-button", className: "bd-pfbtn", onClick: () => { require("electron").shell.openItem(ContentManager.pluginsFolder); }}, "Open Plugin Folder");
        const contentColumn = BDV2.react.createElement(ContentColumn, {key: "pcolumn", title: "Plugins", children: [refreshIcon, pfBtn, list]});
        return BDV2.react.createElement(Scroller, {contentColumn: true, fade: true, dark: true, children: [contentColumn, BDV2.react.createElement(Tools, {key: "tools"})]});
    }

    get themesComponent() {
        const themes = Object.keys(bdthemes).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).reduce((arr, key) => {
            arr.push(BDV2.react.createElement(ThemeCard, {key: key, theme: bdthemes[key]}));return arr;
        }, []);
        const list = BDV2.react.createElement(List, {key: "theme-list", className: "bda-slist", children: themes});
        const refreshIcon = !settingsCookie["fork-ps-5"] && BDV2.react.createElement(TooltipWrap(ReloadIcon, {color: "black", side: "top", text: "Reload Theme List"}), {className: "bd-reload-header", size: "18px", onClick: async () => {
            themeModule.updateThemeList();
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
};

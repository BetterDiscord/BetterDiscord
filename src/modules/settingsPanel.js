import {settings, settingsCookie, bdplugins, bdthemes} from "../0globals";
import DataStore from "./dataStore";
import V2_SettingsPanel_Sidebar from "./settingsPanelSidebar";
import Utils from "./utils";
import BDV2 from "./v2";
import ContentManager from "./contentManager";
import BDEvents from "./bdEvents";
import coloredText from "./coloredText";
import tfHour from "./24hour";
import reactDevTools from "./reactDevTools";
import DOM from "./domtools";

import publicServersModule from "./publicServers";
import voiceMode from "./voiceMode";
import emoteModule from "./emoteModule";
import ClassNormalizer from "./classNormalizer";
import dMode from "./devMode";
import quickEmoteMenu from "./quickEmoteMenu";

import Tools from "../ui/tools";
import Scroller from "../ui/scroller";
import SectionedSettingsPanel from "../ui/sectionedSettingsPanel";
import SettingsPanel from "../ui/settingsPanel";
import CssEditor from "../ui/cssEditor";
import CardList from "../ui/addonlist";

export default new class V2_SettingsPanel {

    constructor() {
        this.sideBarOnClick = this.sideBarOnClick.bind(this);
        this.onChange = this.onChange.bind(this);
        this.updateSettings = this.updateSettings.bind(this);
        this.sidebar = new V2_SettingsPanel_Sidebar(this.sideBarOnClick);
        this.buildPluginProps = this.buildPluginProps.bind(this);
        this.buildThemeProps = this.buildThemeProps.bind(this);
        this.showOriginal = this.showOriginal.bind(this);
    }

    get root() {
        const _root = DOM.query("#bd-settingspane-container");
        if (!_root) {
            if (!this.injectRoot()) return null;
            return this.root;
        }
        return _root;
    }

    injectRoot() {
        const sidebar = DOM.query(".layer-3QrUeG .standardSidebarView-3F1I7i, .layer-3QrUeG .ui-standard-sidebar-view");
        if (!sidebar) return false;
        const root = DOM.createElement(`<div id="bd-settingspane-container" class="contentRegion-3nDuYy content-region">`);
        sidebar.append(root);

        Utils.onRemoved(root, () => {
            BDV2.reactDom.unmountComponentAtNode(root);
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
        const contentRegion = DOM.query(".contentRegion-3nDuYy, .content-region");
        contentRegion.style.display = "none";
        this.root.style.display = "";
        switch (id) {
            case "core":
                this.renderCoreSettings();
                break;
            case "emotes":
                this.renderEmoteSettings();
                break;
            case "customcss":
                this.renderCustomCssEditor();
                break;
            case "plugins":
                this.renderPluginPane();
                break;
            case "themes":
                this.renderThemePane();
                break;
        }
    }

    onClick() {}

    onChange(id, checked) {
        this.updateSettings(id, checked);
    }

    updateSettings(id, enabled) {
        settingsCookie[id] = enabled;

        if (id == "bda-gs-2") {
            if (enabled) DOM.addClass(document.body, "bd-minimal");
            else DOM.removeClass(document.body, "bd-minimal");
        }

        if (id == "bda-gs-3") {
            if (enabled) DOM.addClass(document.body, "bd-minimal-chan");
            else DOM.removeClass(document.body, "bd-minimal-chan");
        }

        if (id == "bda-gs-1") {
            if (enabled) publicServersModule.addButton();
            else publicServersModule.removeButton();
        }

        if (id == "bda-gs-4") {
            if (enabled) voiceMode.start();
            else voiceMode.stop();
        }

        if (id == "bda-gs-5") {
            if (enabled) DOM.addClass(DOM.query("#app-mount"), "bda-dark");
            else DOM.removeClass(DOM.query("#app-mount"), "bda-dark");
        }

        if (enabled && id == "bda-gs-6") tfHour.inject24Hour();

        if (id == "bda-gs-7") {
            if (enabled) coloredText.injectColoredText();
            else coloredText.removeColoredText();
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
            Utils.setWindowPreference("transparent", enabled);
            if (enabled) Utils.setWindowPreference("backgroundColor", null);
            else Utils.setWindowPreference("backgroundColor", "#2f3136");
        }

        /*if (_c["fork-wp-2"]) {
            const current = BdApi.getWindowPreference("frame");
            if (current != _c["fork-wp-2"]) BdApi.setWindowPreference("frame", _c["fork-wp-2"]);
        }*/


        if (id == "bda-gs-8") {
            if (enabled) dMode.startDebugListener();
            else dMode.stopDebugListener();
        }

        if (id == "fork-dm-1") {
            if (enabled) dMode.startCopySelector();
            else dMode.stopCopySelector();
        }

        if (id === "reactDevTools") {
            if (enabled) reactDevTools.start();
            else reactDevTools.stop();
        }

        this.saveSettings();
    }

    async initializeSettings() {
        if (settingsCookie["bda-gs-2"]) DOM.addClass(document.body, "bd-minimal");
        if (settingsCookie["bda-gs-3"]) DOM.addClass(document.body, "bd-minimal-chan");
        if (settingsCookie["bda-gs-1"]) publicServersModule.addButton();
        if (settingsCookie["bda-gs-4"]) voiceMode.start();
        if (settingsCookie["bda-gs-5"]) DOM.addClass(DOM.query("#app-mount"), "bda-dark");
        if (settingsCookie["bda-gs-6"]) tfHour.inject24Hour();
        if (settingsCookie["bda-gs-7"]) coloredText.injectColoredText();
        if (settingsCookie["fork-ps-4"]) ClassNormalizer.start();

        if (settingsCookie["fork-ps-5"]) {
            ContentManager.watchContent("plugin");
            ContentManager.watchContent("theme");
        }

        if (settingsCookie["bda-gs-8"]) dMode.startDebugListener();
        if (settingsCookie["fork-dm-1"]) dMode.startCopySelector();
        if (settingsCookie.reactDevTools) reactDevTools.start();

        this.saveSettings();
    }

    saveSettings() {
        DataStore.setSettingGroup("settings", settingsCookie);
    }

    loadSettings() {
        Object.assign(settingsCookie, DataStore.getSettingGroup("settings"));
    }

    showOriginal() {
        BDV2.reactDom.unmountComponentAtNode(this.root);
        this.root.style.display = "none";
        DOM.query(".contentRegion-3nDuYy, .content-region").style.display = "";
    }

    renderSidebar() {
        const tabs = document.querySelectorAll("[class*='side-'] > [class*='item-']");
        for (const element of tabs) {
            element.removeEventListener("click", this.showOriginal);
            element.addEventListener("click", this.showOriginal);
        }
        this.sidebar.render();
    }

    get coreComponent() {
        return BDV2.react.createElement(Scroller, {contentColumn: true, fade: true, dark: true},
            BDV2.react.createElement(SectionedSettingsPanel, {key: "cspanel", onChange: this.onChange, sections: this.coreSettings}),
            BDV2.react.createElement(Tools, {key: "tools"})
        );
    }

    get emoteComponent() {
        return BDV2.react.createElement(Scroller, {
            contentColumn: true, fade: true, dark: true},
                BDV2.react.createElement(SettingsPanel, {key: "espanel", title: "Emote Settings", onChange: this.onChange, settings: this.emoteSettings, button: {
                    title: "Clear Emote Cache",
                    onClick: () => { emoteModule.clearEmoteData(); emoteModule.init(); quickEmoteMenu.init(); }
                }}),
                BDV2.react.createElement(Tools, {key: "tools"})
        );
    }

    get customCssComponent() {
        return BDV2.react.createElement(Scroller, {contentColumn: true, fade: true, dark: true},
            BDV2.react.createElement(CssEditor, {key: "csseditor"}),
            BDV2.react.createElement(Tools, {key: "tools"})
        );
    }

    contentComponent(type) {
        const componentElement = this.getAddonList(type);
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

    getString(value) {
        if (!value) return "???";
        return typeof value == "string" ? value : value.toString();
    }

    buildPluginProps(meta) {
        const plugin = meta.plugin;
        return Object.assign({}, meta, {
            name: this.getString(plugin.getName()),
            author: this.getString(plugin.getAuthor()),
            description: this.getString(plugin.getDescription()),
            version: this.getString(plugin.getVersion()),
            getSettingsPanel: plugin.getSettingsPanel && plugin.getSettingsPanel.bind(plugin)
        });
    }

    buildThemeProps(meta) {
        return Object.assign({}, meta, {
            name: this.getString(meta.name),
            author: this.getString(meta.author),
            description: this.getString(meta.description),
            version: this.getString(meta.version)
        });
    }

    getAddonList(type) {
        const isPlugins = type === "plugins";
        const list = isPlugins ? Object.values(bdplugins) : Object.values(bdthemes);
        return BDV2.react.createElement(CardList, {type, list});
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

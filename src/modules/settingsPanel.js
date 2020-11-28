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
        // this.buildPluginProps = this.buildPluginProps.bind(this);
        // this.buildThemeProps = this.buildThemeProps.bind(this);
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
            case "themes":
                this.renderAddonPane(id);
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
        if (settingsCookie.reactDevTools) reactDevTools.start();
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
            BDV2.react.createElement(SectionedSettingsPanel, {key: "cspanel", title: "BetterDiscord Settings", onChange: this.onChange, sections: this.coreSettings, button: {
                title: "Try BD Beta",
                onClick: () => {
                    const fs = require("fs");
                    const path = require("path");
                    const configFile = path.join(DataStore.injectionPath, "betterdiscord", "config.json");
                    if (!fs.existsSync(configFile)) {
                            return Utils.showConfirmationModal("File Not Found", "Could not find the config file. Please **do not ask for support** for this.", {
                            cancelText: null,
                            confirmText: "Okay"
                        });
                    }
                    const config = JSON.parse(fs.readFileSync(configFile).toString());
                    config.branch = "gh-pages-development";
                    config.local = false;
                    fs.writeFileSync(configFile, JSON.stringify(config, null, 4));
                    Utils.showConfirmationModal("Success!", "Sucessfully switched to BD Beta. A restart of Discord is required for this to take effect. Would you like to restart now?", {
                        danger: true,
                        confirmText: "Restart Now",
                        cancelText: "Restart Later",
                        onConfirm: () => {
                            const app = require("electron").remote.app;
                            app.relaunch();
                            app.exit();
                        }
                    });
                }
            }}),
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

    renderCoreSettings() {
        const root = this.root;
        if (!root) return Utils.err("SettingsPanel", "FAILED TO LOCATE ROOT: .layer-3QrUeG .standardSidebarView-3F1I7i");
        BDV2.reactDom.render(this.coreComponent, root);
    }

    renderEmoteSettings() {
        const root = this.root;
        if (!root) return Utils.err("SettingsPanel", "FAILED TO LOCATE ROOT: .layer-3QrUeG .standardSidebarView-3F1I7i");
        BDV2.reactDom.render(this.emoteComponent, root);
    }

    renderCustomCssEditor() {
        const root = this.root;
        if (!root) return Utils.err("SettingsPanel", "FAILED TO LOCATE ROOT: .layer-3QrUeG .standardSidebarView-3F1I7i");
        BDV2.reactDom.render(this.customCssComponent, root);
    }

    // renderAddonPane(type) {
    //     const root = this.root;
    //     if (!root) return Utils.err("SettingsPanel", "FAILED TO LOCATE ROOT: .layer-3QrUeG .standardSidebarView-3F1I7i");
    //     BDV2.reactDom.render(this.contentComponent(type), root);
    // }

    renderAddonPane(type) {
        if (!this.root) return Utils.err("SettingsPanel", "FAILED TO LOCATE ROOT: .layer-3QrUeG .standardSidebarView-3F1I7i");
        // I know this shouldn't be here, but when it isn't,
        // React refuses to change the button when going
        // between plugins and themes page... something
        // to debug later.
        class ContentList extends BDV2.react.Component {
            constructor(props) {
                super(props);
                this.prefix = this.props.type.replace("s", "");
                this.onChange = this.onChange.bind(this);
            }
        
            componentDidMount() {
                BDEvents.on(`${this.prefix}-reloaded`, this.onChange);
                BDEvents.on(`${this.prefix}-loaded`, this.onChange);
                BDEvents.on(`${this.prefix}-unloaded`, this.onChange);
            }
        
            componentWillUnmount() {
                BDEvents.off(`${this.prefix}-reloaded`, this.onChange);
                BDEvents.off(`${this.prefix}-loaded`, this.onChange);
                BDEvents.off(`${this.prefix}-unloaded`, this.onChange);
            }
        
            onChange() {
                this.props.onChange(this.props.type);
            }
        
            render() {return this.props.children;}
        }
        const originalRender = ContentList.prototype.render;
        Object.defineProperty(ContentList.prototype, "render", {
            enumerable: false,
            configurable: false,
            set: function() {console.warn("Addon policy for plugins #5 https://github.com/rauenzi/BetterDiscordApp/wiki/Addon-Policies#plugins");},
            get: () => originalRender
        });
        const list = type === "plugins" ? Object.values(bdplugins) : Object.values(bdthemes);
        return BDV2.reactDom.render(BDV2.react.createElement(ContentList, {type, onChange: this.sideBarOnClick}, BDV2.react.createElement(CardList, {type, list})), this.root);
    }
};

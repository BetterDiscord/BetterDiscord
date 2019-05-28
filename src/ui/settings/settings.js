export default class V2_SettingsPanel {

    constructor() {
        let self = this;
        self.sideBarOnClick = self.sideBarOnClick.bind(self);
        self.onChange = self.onChange.bind(self);
        self.updateSettings = this.updateSettings.bind(self);
        self.sidebar = new V2_SettingsPanel_Sidebar(self.sideBarOnClick);
    }

    get root() {
        let _root = $("#bd-settingspane-container");
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
        return this.getSettings("core");
    }
    get forkSettings() {
        return this.getSettings("fork");
    }
    get emoteSettings() {
        return this.getSettings("emote");
    }
    getSettings(category) {
        return Object.keys(settings).reduce((arr, key) => {
            let setting = settings[key];
            if (setting.cat === category && setting.implemented && !setting.hidden) {
                setting.text = key;
                arr.push(setting);
            }
            return arr;
        }, []);
    }

    sideBarOnClick(id) {
        let self = this;
        $(".contentRegion-3nDuYy, .content-region").first().hide();
        $(self.root).show();
        switch (id) {
            case "core":
                self.renderCoreSettings();
                break;
            case "fork":
                self.renderForkSettings();
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

        if (id == "bda-es-0") {
            if (enabled) $("#twitchcord-button-container").show();
            else $("#twitchcord-button-container").hide();
        }

        if (id == "bda-gs-b") {
            if (enabled) $("body").addClass("bd-blue");
            else $("body").removeClass("bd-blue");
        }

        if (id == "bda-gs-2") {
            if (enabled) $("body").addClass("bd-minimal");
            else $("body").removeClass("bd-minimal");
        }

        if (id == "bda-gs-3") {
            if (enabled) $("body").addClass("bd-minimal-chan");
            else $("body").removeClass("bd-minimal-chan");
        }

        if (id == "bda-gs-1") {
            if (enabled) $("#bd-pub-li").show();
            else $("#bd-pub-li").hide();
        }

        if (id == "bda-gs-4") {
            if (enabled) voiceMode.enable();
            else voiceMode.disable();
        }

        if (id == "bda-gs-5") {
            if (enabled) $("#app-mount").addClass("bda-dark");
            else $("#app-mount").removeClass("bda-dark");
        }

        if (enabled && id == "bda-gs-6") mainCore.inject24Hour();

        if (id == "bda-gs-7") {
            if (enabled) mainCore.injectColoredText();
            else mainCore.removeColoredText();
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
            BdApi.setWindowPreference("transparent", enabled);
            if (enabled) BdApi.setWindowPreference("backgroundColor", null);
            else BdApi.setWindowPreference("backgroundColor", "#2f3136");
        }

        /*if (_c["fork-wp-2"]) {
            const current = BdApi.getWindowPreference("frame");
            if (current != _c["fork-wp-2"]) BdApi.setWindowPreference("frame", _c["fork-wp-2"]);
        }*/
        

        if (id == "bda-gs-8") {
            if (enabled) dMode.enable(settingsCookie["fork-dm-1"]);
            else dMode.disable();
        }

        mainCore.saveSettings();
    }

    initializeSettings() {
        if (settingsCookie["bda-es-0"]) $("#twitchcord-button-container").show();
        if (settingsCookie["bda-gs-b"]) $("body").addClass("bd-blue");
        if (settingsCookie["bda-gs-2"]) $("body").addClass("bd-minimal");
        if (settingsCookie["bda-gs-3"]) $("body").addClass("bd-minimal-chan");
        if (settingsCookie["bda-gs-1"]) $("#bd-pub-li").show();
        if (settingsCookie["bda-gs-4"]) voiceMode.enable();
        if (settingsCookie["bda-gs-5"]) $("#app-mount").addClass("bda-dark");
        if (settingsCookie["bda-gs-6"]) mainCore.inject24Hour();
        if (settingsCookie["bda-gs-7"]) mainCore.injectColoredText();
        if (settingsCookie["bda-es-4"]) emoteModule.autoCapitalize();
        if (settingsCookie["fork-ps-4"]) ClassNormalizer.start();

        if (settingsCookie["fork-ps-5"]) {
            ContentManager.watchContent("plugin");
            ContentManager.watchContent("theme");
        }

        if (settingsCookie["bda-gs-8"]) dMode.enable(settingsCookie["fork-dm-1"]);

        mainCore.saveSettings();
    }

    renderSidebar() {
        let self = this;
        $("[class*='side-'] > [class*='item-']").off("click.v2settingspanel").on("click.v2settingspanel", () => {
            BDV2.reactDom.unmountComponentAtNode(self.root);
            $(self.root).hide();
            $(".contentRegion-3nDuYy, .content-region").first().show();
        });
        self.sidebar.render();
    }

    get coreComponent() {
        return BDV2.react.createElement(V2Components.Scroller, {contentColumn: true, fade: true, dark: true, children: [BDV2.react.createElement(V2Components.SettingsPanel, {key: "cspanel", title: "Core Settings", onChange: this.onChange, settings: this.coreSettings}), BDV2.react.createElement(V2Components.Tools, {key: "tools"})]});
    }
    
    get forkComponent() {
        return BDV2.react.createElement(V2Components.Scroller, {
                contentColumn: true, 
                fade: true,
                dark: true,
                children: [
                    BDV2.react.createElement(V2Components.SettingsPanel, {key: "fspanel", title: "BandagedBD Settings", onChange: this.onChange, settings: this.forkSettings, button: {
                        title: "Clear Emote Cache",
                        onClick: () => { emoteModule.clearEmoteData(); emoteModule.init(); quickEmoteMenu.init(); }
                    }}),
                    BDV2.react.createElement(V2Components.Tools, {key: "tools"})
                ]
            }
        );
    }

    get emoteComponent() {
        return BDV2.react.createElement(V2Components.Scroller, {contentColumn: true, fade: true, dark: true, children: [BDV2.react.createElement(V2Components.SettingsPanel, {key: "espanel", title: "Emote Settings", onChange: this.onChange, settings: this.emoteSettings}), BDV2.react.createElement(V2Components.Tools, {key: "tools"})]});
    }

    get customCssComponent() {
        return BDV2.react.createElement(V2Components.Scroller, {contentColumn: true, fade: true, dark: true, children: [BDV2.react.createElement(V2Components.CssEditor, {key: "csseditor"}), BDV2.react.createElement(V2Components.Tools, {key: "tools"})]});
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
        let plugins = Object.keys(bdplugins).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).reduce((arr, key) => {
            arr.push(BDV2.react.createElement(V2Components.PluginCard, {key: key, plugin: bdplugins[key].plugin}));return arr;
        }, []);
        let list = BDV2.react.createElement(V2Components.List, {key: "plugin-list", className: "bda-slist", children: plugins});
        let refreshIcon = !settingsCookie["fork-ps-5"] && BDV2.react.createElement(V2Components.TooltipWrap(V2Components.ReloadIcon, {color: "black", side: "top", text: "Reload Plugin List"}), {className: "bd-reload-header", size: "18px", onClick: async () => {
            pluginModule.updatePluginList();
            this.sideBarOnClick("plugins");
        }});
        let pfBtn = BDV2.react.createElement("button", {key: "folder-button", className: "bd-pfbtn", onClick: () => { require("electron").shell.openItem(ContentManager.pluginsFolder); }}, "Open Plugin Folder");
        let contentColumn = BDV2.react.createElement(V2Components.ContentColumn, {key: "pcolumn", title: "Plugins", children: [refreshIcon, pfBtn, list]});
        return BDV2.react.createElement(V2Components.Scroller, {contentColumn: true, fade: true, dark: true, children: [contentColumn, BDV2.react.createElement(V2Components.Tools, {key: "tools"})]});
    }

    get themesComponent() {
        let themes = Object.keys(bdthemes).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).reduce((arr, key) => {
            arr.push(BDV2.react.createElement(V2Components.ThemeCard, {key: key, theme: bdthemes[key]}));return arr;
        }, []);
        let list = BDV2.react.createElement(V2Components.List, {key: "theme-list", className: "bda-slist", children: themes});
        let refreshIcon = !settingsCookie["fork-ps-5"] && BDV2.react.createElement(V2Components.TooltipWrap(V2Components.ReloadIcon, {color: "black", side: "top", text: "Reload Theme List"}), {className: "bd-reload-header", size: "18px", onClick: async () => {
            themeModule.updateThemeList();
            this.sideBarOnClick("themes");
        }});
        let tfBtn = BDV2.react.createElement("button", {key: "folder-button", className: "bd-pfbtn", onClick: () => { require("electron").shell.openItem(ContentManager.themesFolder); }}, "Open Theme Folder");
        let contentColumn = BDV2.react.createElement(V2Components.ContentColumn, {key: "tcolumn", title: "Themes", children: [refreshIcon, tfBtn, list]});
        return BDV2.react.createElement(V2Components.Scroller, {contentColumn: true, fade: true, dark: true, children: [contentColumn, BDV2.react.createElement(V2Components.Tools, {key: "tools"})]});
    }

    renderCoreSettings() {
        let root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layer-3QrUeG .standardSidebarView-3F1I7i");
            return;
        }
        BDV2.reactDom.render(this.coreComponent, root);
    }
    
    renderForkSettings() {
        let root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layer-3QrUeG .standardSidebarView-3F1I7i");
            return;
        }
        BDV2.reactDom.render(this.forkComponent, root);
    }

    renderEmoteSettings() {
        let root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layer-3QrUeG .standardSidebarView-3F1I7i");
            return;
        }
        BDV2.reactDom.render(this.emoteComponent, root);
    }

    renderCustomCssEditor() {
        let root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layer-3QrUeG .standardSidebarView-3F1I7i");
            return;
        }
        BDV2.reactDom.render(this.customCssComponent, root);
    }

    renderPluginPane() {
        let root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layer-3QrUeG .standardSidebarView-3F1I7i");
            return;
        }
        BDV2.reactDom.render(this.contentComponent("plugins"), root);
    }

    renderThemePane() {
        let root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layer-3QrUeG .standardSidebarView-3F1I7i");
            return;
        }
        BDV2.reactDom.render(this.contentComponent("themes"), root);
    }
}
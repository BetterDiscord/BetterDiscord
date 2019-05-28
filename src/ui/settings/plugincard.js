export default class V2C_PluginCard extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        let self = this;
        self.onChange = self.onChange.bind(self);
        self.showSettings = self.showSettings.bind(self);
        self.setInitialState();
        self.hasSettings = typeof self.props.plugin.getSettingsPanel === "function";
        self.settingsPanel = "";

        this.reload = this.reload.bind(this);
        this.onReload = this.onReload.bind(this);
    }

    setInitialState() {
        this.state = {
            checked: pluginCookie[this.props.plugin.getName()],
            settings: false,
            reloads: 0
        };
    }

    // componentDidMount() {
    //     BDEvents.on("plugin-reloaded", this.onReload);
    // }

    // componentWillUnmount() {
    //     BDEvents.off("plugin-reloaded", this.onReload);
    // }

    onReload(pluginName) {
        if (pluginName !== this.props.plugin.getName()) return;
        this.setState({reloads: this.state.reloads + 1});
    }

    componentDidUpdate() {
        if (this.state.settings) {
            if (typeof this.settingsPanel === "object") {
                this.refs.settingspanel.appendChild(this.settingsPanel);
            }
            
            if (!settingsCookie["fork-ps-3"]) return;
            var isHidden = (container, element) => {

                let cTop = container.scrollTop;
                let cBottom = cTop + container.clientHeight;

                let eTop = element.offsetTop;
                let eBottom = eTop + element.clientHeight;

                return  (eTop < cTop || eBottom > cBottom);
            };
            
            let self = $(BDV2.reactDom.findDOMNode(this));
            let container = self.parents(".scroller");
            if (!isHidden(container[0], self[0])) return;
            container.animate({
                scrollTop: self.offset().top - container.offset().top + container.scrollTop() - 30
            }, 300);
        }
    }
    
    reload() {
        const plugin = this.props.plugin.getName();
        pluginModule.reloadPlugin(plugin);
        this.props.plugin = bdplugins[plugin].plugin;
        this.onReload(this.props.plugin.getName());
    }

    render() {
        let self = this;
        let {plugin} = this.props;
        let name = plugin.getName();
        let author = plugin.getAuthor();
        let description = plugin.getDescription();
        let version = plugin.getVersion();
        let website = bdplugins[name].website;
        let source = bdplugins[name].source;

        if (this.state.settings) {
            try { self.settingsPanel = plugin.getSettingsPanel(); }
            catch (err) { Utils.err("Plugins", "Unable to get settings panel for " + plugin.getName() + ".", err); }
            
            return BDV2.react.createElement("li", {className: "settings-open ui-switch-item"},
                    BDV2.react.createElement("div", {style: {"float": "right", "cursor": "pointer"}, onClick: () => {
                            this.refs.settingspanel.innerHTML = "";
                            self.setState({settings: false});
                        }},
                    BDV2.react.createElement(V2Components.XSvg, null)
                ),
                typeof self.settingsPanel === "object" && BDV2.react.createElement("div", {id: `plugin-settings-${name}`, className: "plugin-settings", ref: "settingspanel"}),
                typeof self.settingsPanel !== "object" && BDV2.react.createElement("div", {id: `plugin-settings-${name}`, className: "plugin-settings", ref: "settingspanel", dangerouslySetInnerHTML: {__html: self.settingsPanel}})
            );
        }

        return BDV2.react.createElement("li", {"data-name": name, "data-version": version, "className": "settings-closed ui-switch-item"},
            BDV2.react.createElement("div", {className: "bda-header"},
                    BDV2.react.createElement("span", {className: "bda-header-title"},
                        BDV2.react.createElement("span", {className: "bda-name"}, name),
                        " v",
                        BDV2.react.createElement("span", {className: "bda-version"}, version),
                        " by ",
                        BDV2.react.createElement("span", {className: "bda-author"}, author)
                    ),
                    BDV2.react.createElement("div", {className: "bda-controls"},
                        !settingsCookie["fork-ps-5"] && BDV2.react.createElement(V2Components.TooltipWrap(V2Components.ReloadIcon, {color: "black", side: "top", text: "Reload"}), {className: "bd-reload-card", onClick: this.reload}),
                        BDV2.react.createElement("label", {className: "ui-switch-wrapper ui-flex-child", style: {flex: "0 0 auto"}},
                            BDV2.react.createElement("input", {checked: this.state.checked, onChange: this.onChange, className: "ui-switch-checkbox", type: "checkbox"}),
                            BDV2.react.createElement("div", {className: this.state.checked ? "ui-switch checked" : "ui-switch"})
                        )
                    )
            ),
            BDV2.react.createElement("div", {className: "bda-description-wrap scroller-wrap fade"},
                BDV2.react.createElement("div", {className: "bda-description scroller"}, description)
            ),
            (website || source || this.hasSettings) && BDV2.react.createElement("div", {className: "bda-footer"},
                BDV2.react.createElement("span", {className: "bda-links"},
                    website && BDV2.react.createElement("a", {className: "bda-link bda-link-website", href: website, target: "_blank"}, "Website"),
                    website && source && " | ",
                    source && BDV2.react.createElement("a", {className: "bda-link bda-link-source", href: source, target: "_blank"}, "Source")
                ),
                this.hasSettings && BDV2.react.createElement("button", {onClick: this.showSettings, className: "bda-settings-button", disabled: !this.state.checked}, "Settings")
            )
        );
    }

    onChange() {
        this.setState({checked: !this.state.checked});
        pluginModule.togglePlugin(this.props.plugin.getName());
    }

    showSettings() {		
        if (!this.hasSettings) return;
        this.setState({settings: true});
    }
}
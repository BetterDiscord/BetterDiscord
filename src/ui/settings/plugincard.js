import {SettingsCookie, PluginCookie, Plugins} from "data";
import {BDV2, Utilities, PluginManager} from "modules";
import CloseButton from "../icons/close";
import ReloadIcon from "../icons/reload";

export default class V2C_PluginCard extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.showSettings = this.showSettings.bind(this);
        this.setInitialState();
        this.hasSettings = typeof this.props.plugin.getSettingsPanel === "function";
        this.settingsPanel = "";

        this.reload = this.reload.bind(this);
        this.onReload = this.onReload.bind(this);
    }

    setInitialState() {
        this.state = {
            checked: PluginCookie[this.props.plugin.getName()],
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

            if (!SettingsCookie["fork-ps-3"]) return;
            const isHidden = (container, element) => {

                const cTop = container.scrollTop;
                const cBottom = cTop + container.clientHeight;

                const eTop = element.offsetTop;
                const eBottom = eTop + element.clientHeight;

                return  (eTop < cTop || eBottom > cBottom);
            };

            const self = $(BDV2.reactDom.findDOMNode(this));
            const container = self.parents(".scroller");
            if (!isHidden(container[0], self[0])) return;
            container.animate({
                scrollTop: self.offset().top - container.offset().top + container.scrollTop() - 30
            }, 300);
        }
    }

    reload() {
        const plugin = this.props.plugin.getName();
        PluginManager.reloadPlugin(plugin);
        this.props.plugin = Plugins[plugin].plugin;
        this.onReload(this.props.plugin.getName());
    }

    getString(value) {
        return typeof value == "string" ? value : value.toString();
    }

    render() {
        const self = this;
        const {plugin} = this.props;
        const name = this.getString(plugin.getName());
        const author = this.getString(plugin.getAuthor());
        const description = this.getString(plugin.getDescription());
        const version = this.getString(plugin.getVersion());
        const website = Plugins[name].website;
        const source = Plugins[name].source;

        if (this.state.settings) {
            try { self.settingsPanel = plugin.getSettingsPanel(); }
            catch (err) { Utilities.err("Plugins", "Unable to get settings panel for " + plugin.getName() + ".", err); }

            return BDV2.react.createElement("li", {className: "settings-open ui-switch-item"},
                    BDV2.react.createElement("div", {style: {"float": "right", "cursor": "pointer"}, onClick: () => {
                            this.refs.settingspanel.innerHTML = "";
                            self.setState({settings: false});
                        }},
                    BDV2.react.createElement(CloseButton, null)
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
                        !SettingsCookie["fork-ps-5"] && BDV2.react.createElement(ReloadIcon, {className: "bd-reload-card", onClick: this.reload}),
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
        PluginManager.togglePlugin(this.props.plugin.getName());
    }

    showSettings() {
        if (!this.hasSettings) return;
        this.setState({settings: true});
    }
}
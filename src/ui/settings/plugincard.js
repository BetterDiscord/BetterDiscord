// import {SettingsCookie, PluginCookie, Plugins} from "data";
import {React, ReactDOM, Utilities, PluginManager} from "modules";
import CloseButton from "../icons/close";
// import ReloadIcon from "../icons/reload";

export default class V2C_PluginCard extends React.Component {

    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.showSettings = this.showSettings.bind(this);
        this.state = {
            checked: PluginManager.isEnabled(this.props.content.id),
            settings: false
        };
        this.hasSettings = typeof this.props.content.plugin.getSettingsPanel === "function";
        this.settingsPanel = "";

        // this.reload = this.reload.bind(this);
        // this.onReload = this.onReload.bind(this);
    }

    componentDidUpdate() {
        if (this.state.settings) {
            if (typeof this.settingsPanel === "object") {
                this.refs.settingspanel.appendChild(this.settingsPanel);
            }

            // if (!SettingsCookie["fork-ps-3"]) return;
            const isHidden = (container, element) => {

                const cTop = container.scrollTop;
                const cBottom = cTop + container.clientHeight;

                const eTop = element.offsetTop;
                const eBottom = eTop + element.clientHeight;

                return  (eTop < cTop || eBottom > cBottom);
            };

            const self = $(ReactDOM.findDOMNode(this));
            const container = self.parents(".scroller");
            if (!isHidden(container[0], self[0])) return;
            container.animate({
                scrollTop: self.offset().top - container.offset().top + container.scrollTop() - 30
            }, 300);
        }
    }

    getString(value) {
        return typeof value == "string" ? value : value.toString();
    }

    render() {
        const self = this;
        const {content} = this.props;
        const name = this.getString(content.name);
        const author = this.getString(content.author);
        const description = this.getString(content.description);
        const version = this.getString(content.version);
        const website = content.website;
        const source = content.source;

        if (this.state.settings) {
            try { self.settingsPanel = content.plugin.getSettingsPanel(); }
            catch (err) { Utilities.err("Plugins", "Unable to get settings panel for " + content.name + ".", err); }

            return React.createElement("li", {className: "settings-open ui-switch-item"},
                    React.createElement("div", {style: {"float": "right", "cursor": "pointer"}, onClick: () => {
                            this.refs.settingspanel.innerHTML = "";
                            self.setState({settings: false});
                        }},
                    React.createElement(CloseButton, null)
                ),
                typeof self.settingsPanel === "object" && React.createElement("div", {id: `plugin-settings-${name}`, className: "plugin-settings", ref: "settingspanel"}),
                typeof self.settingsPanel !== "object" && React.createElement("div", {id: `plugin-settings-${name}`, className: "plugin-settings", ref: "settingspanel", dangerouslySetInnerHTML: {__html: self.settingsPanel}})
            );
        }

        return React.createElement("li", {"data-name": name, "data-version": version, "className": "settings-closed ui-switch-item"},
            React.createElement("div", {className: "bda-header"},
                    React.createElement("span", {className: "bda-header-title"},
                        React.createElement("span", {className: "bda-name"}, name),
                        " v",
                        React.createElement("span", {className: "bda-version"}, version),
                        " by ",
                        React.createElement("span", {className: "bda-author"}, author)
                    ),
                    React.createElement("div", {className: "bda-controls"},
                        //!SettingsCookie["fork-ps-5"] && React.createElement(ReloadIcon, {className: "bd-reload-card", onClick: this.reload}),
                        React.createElement("label", {className: "ui-switch-wrapper ui-flex-child", style: {flex: "0 0 auto"}},
                            React.createElement("input", {checked: this.state.checked, onChange: this.onChange, className: "ui-switch-checkbox", type: "checkbox"}),
                            React.createElement("div", {className: this.state.checked ? "ui-switch checked" : "ui-switch"})
                        )
                    )
            ),
            React.createElement("div", {className: "bda-description-wrap scroller-wrap fade"},
                React.createElement("div", {className: "bda-description scroller"}, description)
            ),
            (website || source || this.hasSettings) && React.createElement("div", {className: "bda-footer"},
                React.createElement("span", {className: "bda-links"},
                    website && React.createElement("a", {className: "bda-link bda-link-website", href: website, target: "_blank"}, "Website"),
                    website && source && " | ",
                    source && React.createElement("a", {className: "bda-link bda-link-source", href: source, target: "_blank"}, "Source")
                ),
                this.hasSettings && React.createElement("button", {onClick: this.showSettings, className: "bda-settings-button", disabled: !this.state.checked}, "Settings")
            )
        );
    }

    onChange() {
        this.setState({checked: !this.state.checked});
        PluginManager.togglePlugin(this.props.content.id);
    }

    showSettings() {
        if (!this.hasSettings) return;
        this.setState({settings: true});
    }
}
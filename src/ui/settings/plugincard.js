// import {SettingsCookie, PluginCookie, Plugins} from "data";
import {React, Logger, Settings} from "modules";
import CloseButton from "../icons/close";
import ReloadIcon from "../icons/reload";

export default class PluginCard extends React.Component {

    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.showSettings = this.showSettings.bind(this);
        this.state = {
            checked: this.props.enabled,//PluginManager.isEnabled(this.props.content.id),
            settingsOpen: false
        };
        this.hasSettings = typeof this.props.content.plugin.getSettingsPanel === "function";
        this.settingsPanel = "";
        this.panelRef = React.createRef();

        this.reload = this.reload.bind(this);
        // this.onReload = this.onReload.bind(this);
    }

    reload() {
        if (!this.props.reload) return;
        this.props.content = this.props.reload(this.props.content.id);
        this.forceUpdate();
    }

    componentDidUpdate() {
        if (this.state.settingsOpen) {
            if (this.settingsPanel instanceof Node) {
                this.panelRef.current.appendChild(this.settingsPanel);
            }

            // if (!SettingsCookie["fork-ps-3"]) return;
            const isHidden = (container, element) => {

                const cTop = container.scrollTop;
                const cBottom = cTop + container.clientHeight;

                const eTop = element.offsetTop;
                const eBottom = eTop + element.clientHeight;

                return  (eTop < cTop || eBottom > cBottom);
            };

            const panel = $(this.panelRef.current);
            const container = panel.parents(".scroller-2FKFPG");
            if (!isHidden(container[0], panel[0])) return;
            container.animate({
                scrollTop: panel.offset().top - container.offset().top + container.scrollTop() - 30
            }, 300);
        }
    }

    getString(value) {
        return typeof value == "string" ? value : value.toString();
    }

    render() {
        const {content} = this.props;
        const name = this.getString(content.name);
        const author = this.getString(content.author);
        const description = this.getString(content.description);
        const version = this.getString(content.version);
        const website = content.website;
        const source = content.source;

        if (this.state.settingsOpen) {
            try { this.settingsPanel = content.plugin.getSettingsPanel(); }
            catch (err) { Logger.stacktrace("Plugin Settings", "Unable to get settings panel for " + content.name + ".", err); }

            const props = {id: `plugin-settings-${name}`, className: "plugin-settings", ref: this.panelRef};
            if (typeof(this.settingsPanel) == "string") props.dangerouslySetInnerHTML = this.settingsPanel;

            return React.createElement("li", {className: "settings-open ui-switch-item"},
                    React.createElement("div", {style: {"float": "right", "cursor": "pointer"}, onClick: () => {
                            this.panelRef.current.innerHTML = "";
                            this.setState({settingsOpen: false});
                        }},
                    React.createElement(CloseButton, null)
                ),
                React.createElement("div", props, this.settingsPanel instanceof React.Component ? this.settingsPanel : null),
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
                        !Settings.get("settings", "content", "autoReload") && React.createElement(ReloadIcon, {className: "bd-reload bd-reload-card", onClick: this.reload}),
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
        // PluginManager.togglePlugin(this.props.content.id);
        this.props.onChange && this.props.onChange(this.props.content.id);
    }

    showSettings() {
        if (!this.hasSettings) return;
        this.setState({settingsOpen: true});
    }
}
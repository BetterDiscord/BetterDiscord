import {React, Strings} from "modules";
import ReloadIcon from "../icons/reload";
// import Toasts from "../toasts";

export default class ThemeCard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            checked: this.props.enabled,
            reloads: 0
        };
        this.onChange = this.onChange.bind(this);
        this.reload = this.reload.bind(this);
    }

    reload() {
        if (!this.props.reload) return;
        this.props.addon = this.props.reload(this.props.addon.id);
        this.forceUpdate();
    }

    buildTitle(name, version, author) {
        const title = Strings.Addons.title.split(/({{[A-Za-z]+}})/);
        const nameIndex = title.findIndex(s => s == "{{name}}");
        if (nameIndex) title[nameIndex] = React.createElement("span", {className: "bd-name"}, name);
        const versionIndex = title.findIndex(s => s == "{{version}}");
        if (nameIndex) title[versionIndex] = React.createElement("span", {className: "bd-version"}, version);
        const authorIndex = title.findIndex(s => s == "{{author}}");
        if (nameIndex) title[authorIndex] = React.createElement("span", {className: "bd-author"}, author);
        return title.flat();
    }

    render() {
        const {addon} = this.props;
        const name = addon.name;
        const description = addon.description;
        const version = addon.version;
        const author = addon.author;
        const website = addon.website;
        const source = addon.source;

        return React.createElement("li", {"data-name": name, "data-version": version, "className": "settings-closed bd-switch-item"},
            React.createElement("div", {className: "bd-header"},
                    React.createElement("span", {className: "bd-header-title"},
                        this.buildTitle(name, version, author)
                    ),
                    React.createElement("div", {className: "bd-controls"},
                    this.props.showReloadIcon && React.createElement(ReloadIcon, {className: "bd-reload bd-reload-card", onClick: this.reload}),
                        React.createElement("label", {className: "bd-switch-wrapper bd-flex-child", style: {flex: "0 0 auto"}},
                            React.createElement("input", {checked: this.state.checked, onChange: this.onChange, className: "bd-switch-checkbox", type: "checkbox"}),
                            React.createElement("div", {className: this.state.checked ? "bd-switch checked" : "bd-switch"})
                        )
                    )
            ),
            React.createElement("div", {className: "bd-description-wrap scroller-wrap fade"},
                React.createElement("div", {className: "bd-description scroller"}, description)
            ),
            (website || source) && React.createElement("div", {className: "bd-footer"},
                React.createElement("span", {className: "bd-links"},
                    website && React.createElement("a", {className: "bd-link", href: website, target: "_blank"}, "Website"),
                    website && source && " | ",
                    source && React.createElement("a", {className: "bd-link", href: source, target: "_blank"}, "Source")
                )
            )
        );
    }

    onChange() {
        this.setState({checked: !this.state.checked});
        this.props.onChange && this.props.onChange(this.props.addon.id);
    }
}
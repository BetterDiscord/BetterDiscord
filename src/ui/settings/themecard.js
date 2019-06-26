import {React, Settings, Strings} from "modules";
import ReloadIcon from "../icons/reload";
// import Toasts from "../toasts";

export default class ThemeCard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            checked: this.props.enabled, //ThemeManager.isEnabled(this.props.content.id),
            reloads: 0
        };
        this.onChange = this.onChange.bind(this);
        this.reload = this.reload.bind(this);
    }

    reload() {
        if (!this.props.reload) return;
        this.props.content = this.props.reload(this.props.content.id);
        this.forceUpdate();
    }

    buildTitle(name, version, author) {
        const title = Strings.Addons.title.split(/({{[A-Za-z]+}})/);
        const nameIndex = title.findIndex(s => s == "{{name}}");
        if (nameIndex) title[nameIndex] = React.createElement("span", {className: "bda-name"}, name);
        const versionIndex = title.findIndex(s => s == "{{version}}");
        if (nameIndex) title[versionIndex] = React.createElement("span", {className: "bda-version"}, version);
        const authorIndex = title.findIndex(s => s == "{{author}}");
        if (nameIndex) title[authorIndex] = React.createElement("span", {className: "bda-author"}, author);
        return title.flat();
    }

    render() {
        const {content} = this.props;
        const name = content.name;
        const description = content.description;
        const version = content.version;
        const author = content.author;
        const website = content.website;
        const source = content.source;

        return React.createElement("li", {"data-name": name, "data-version": version, "className": "settings-closed ui-switch-item"},
            React.createElement("div", {className: "bda-header"},
                    React.createElement("span", {className: "bda-header-title"},
                        this.buildTitle(name, version, author)
                    ),
                    React.createElement("div", {className: "bda-controls"},
                        !Settings.get("settings", "addons", "autoReload") && React.createElement(ReloadIcon, {className: "bd-reload bd-reload-card", onClick: this.reload}),
                        React.createElement("label", {className: "ui-switch-wrapper ui-flex-child", style: {flex: "0 0 auto"}},
                            React.createElement("input", {checked: this.state.checked, onChange: this.onChange, className: "ui-switch-checkbox", type: "checkbox"}),
                            React.createElement("div", {className: this.state.checked ? "ui-switch checked" : "ui-switch"})
                        )
                    )
            ),
            React.createElement("div", {className: "bda-description-wrap scroller-wrap fade"},
                React.createElement("div", {className: "bda-description scroller"}, description)
            ),
            (website || source) && React.createElement("div", {className: "bda-footer"},
                React.createElement("span", {className: "bda-links"},
                    website && React.createElement("a", {className: "bda-link", href: website, target: "_blank"}, "Website"),
                    website && source && " | ",
                    source && React.createElement("a", {className: "bda-link", href: source, target: "_blank"}, "Source")
                )
            )
        );
    }

    onChange() {
        this.setState({checked: !this.state.checked});
        this.props.onChange && this.props.onChange(this.props.content.id);
    }
}
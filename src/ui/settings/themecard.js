import {React, ThemeManager} from "modules";
import ReloadIcon from "../icons/reload";
// import Toasts from "../toasts";

export default class V2C_ThemeCard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            checked: ThemeManager.isEnabled(this.props.content.id),
            reloads: 0
        };
        this.onChange = this.onChange.bind(this);
        // this.reload = this.reload.bind(this);
    }

    // onReload(themeName) {
    //     if (themeName !== this.props.theme.name) return;
    //     this.setState({reloads: this.state.reloads + 1});
    // }

    // reload() {
    //     const theme = this.props.theme.name;
    //     const error = ThemeManager.reloadTheme(theme);
    //     if (error) Toasts.show(`Could not reload ${Themes[theme].name}. Check console for details.`, {type: "error"});
    //     else Toasts.show(`${Themes[theme].name} v${Themes[theme].version} has been reloaded.`, {type: "success"});
    //     // this.setState(this.state);
    //     this.props.theme = Themes[theme];
    //     this.onReload(this.props.theme.name);
    // }

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
        ThemeManager.toggleTheme(this.props.content.id);
    }
}
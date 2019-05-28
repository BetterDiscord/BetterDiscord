export default class V2C_SettingsPanel extends BDV2.reactComponent {

    constructor(props) {
        super(props);
    }

    render() {
        let {settings} = this.props;
        return BDV2.react.createElement(
            "div",
            {className: "contentColumn-2hrIYH contentColumnDefault-1VQkGM content-column default"},
            BDV2.react.createElement(V2Components.SettingsTitle, {text: this.props.title}),
            this.props.button && BDV2.react.createElement("button", {key: "title-button", className: "bd-pfbtn", onClick: this.props.button.onClick}, this.props.button.title),
            settings.map(setting => {
                return BDV2.react.createElement(V2Components.Switch, {id: setting.id, key: setting.id, data: setting, checked: settingsCookie[setting.id], onChange: (id, checked) => {
                        this.props.onChange(id, checked);
                    }});
            })
        );
    }
}
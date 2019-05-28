export default class V2C_SettingsTitle extends BDV2.reactComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return BDV2.react.createElement(
            "h2",
            {className: "ui-form-title h2 margin-reset margin-bottom-20"},
            this.props.text
        );
    }
}
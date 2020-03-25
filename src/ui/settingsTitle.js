import BDV2 from "../modules/v2";

export default class V2C_SettingsTitle extends BDV2.reactComponent {
    constructor(props) {
        super(props);
    }
//h2-2gWE-o title-3sZWYQ size16-14cGz5 height20-mO2eIN weightSemiBold-NJexzi da-h2 da-title da-size16 da-height20 da-weightSemiBold defaultColor-1_ajX0 da-defaultColor marginTop60-3PGbtK da-marginTop60 marginBottom20-32qID7 da-marginBottom20
    render() {
        return BDV2.react.createElement(
            "h2",
            {className: "ui-form-title h2 margin-reset margin-bottom-20 marginTop60-3PGbtK da-marginTop6"},
            this.props.text
        );
    }
}
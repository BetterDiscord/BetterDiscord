import BDV2 from "../modules/v2";

export default class V2C_TabBarHeader extends BDV2.reactComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return BDV2.react.createElement("div",{className: "ui-tab-bar-header"}, this.props.text, this.props.button);
    }
}
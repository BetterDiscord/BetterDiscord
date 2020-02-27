import BDV2 from "../v2";

export default class V2C_TabBarSeparator extends BDV2.reactComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return BDV2.react.createElement("div", {className: "ui-tab-bar-separator margin-top-8 margin-bottom-8"});
    }
}
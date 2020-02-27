import BDV2 from "../v2";

export default class V2C_List extends BDV2.reactComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return BDV2.react.createElement(
            "ul",
            {className: this.props.className},
            this.props.children
        );
    }
}
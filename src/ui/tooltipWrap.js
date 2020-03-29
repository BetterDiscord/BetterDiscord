import BDV2 from "../modules/v2";
import Tooltip from "./tooltip";

export default class extends BDV2.reactComponent {
    constructor(props) {
        super(props);
    }

    async componentDidMount() {
        const {style = "black", side = "top", text = ""} = this.props;
        this.node = BDV2.reactDom.findDOMNode(this);
        this.tooltip = new Tooltip(this.node, text, {style, side});
    }

    componentWillUnmount() {
        this.tooltip.hide();
        delete this.tooltip;
    }

    render() {
        return this.props.children;
    }
}
import BDV2 from "../modules/v2";
import Tooltip from "./tooltip";

export default class extends BDV2.reactComponent {
    constructor(props) {
        super(props);
        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
    }

    async componentDidMount() {
        const {style = "black", side = "top", text = ""} = this.props;
        this.node = BDV2.reactDom.findDOMNode(this);
        // this.node.addEventListener("mouseenter", this.onMouseEnter);
        // this.node.addEventListener("mouseleave", this.onMouseLeave);
        this.tooltip = new Tooltip(this.node, text, {style, side});
    }

    componentWillUnmount() {
        // this.node.removeEventListener("mouseenter", this.onMouseEnter);
        // this.node.removeEventListener("mouseleave", this.onMouseLeave);
        this.tooltip.hide();
        delete this.tooltip;
    }

    onMouseEnter() {

    }

    onMouseLeave() {
        
    }

    render() {
        return this.props.children;
    }
}
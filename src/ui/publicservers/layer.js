import BDV2 from "../../modules/v2";
import DOM from "../../modules/domtools";

export default class V2C_Layer extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        this.keyupListener = this.keyupListener.bind(this);
    }

    keyupListener(e) {
        if (e.which === 27) {
            BDV2.reactDom.unmountComponentAtNode(this.refs.root.parentNode);
        }
    }

    componentDidMount() {
        window.addEventListener("keyup", this.keyupListener);

        const thisNode = DOM.query(`#${this.props.id}`);
        DOM.animate({
            duration: 200,
            update: function(progress) {
                thisNode.style.transform = `scale(${1.1 - 0.1 * progress}) translateZ(0px)`;
                thisNode.style.opacity = progress;
                if (progress == 1) {
                    setImmediate(() => {
                        thisNode.style.transform = "";
                        thisNode.style.opacity = "";
                    });
                }
            }
        });
    }

    componentWillUnmount() {
        window.removeEventListener("keyup", this.keyupListener);

        const thisNode = DOM.query(`#${this.props.id}`);
        DOM.animate({
            duration: 200,
            update: function(progress) {
                thisNode.style.transform = `scale(${1.1 - 0.1 * (1 - progress)}) translateZ(0px)`;
                thisNode.style.opacity = 1 - progress;
                if (progress == 1) {
                    setImmediate(() => {
                        thisNode.remove();
                    });
                }
            }
        });

        const layer = DOM.query(".publicServersOpen");
        layer.classList.remove("publicServersOpen");
        DOM.animate({
            duration: 200,
            update: function(progress) {
                layer.style.transform = `scale(${0.07 * progress + 0.93}) translateZ(0px)`;
                layer.style.opacity = progress;
                if (progress == 1) {
                    setImmediate(() => {
                        layer.style.transform = "";
                        layer.style.opacity = "";
                    });
                }
            }
        });
    }

    componentWillMount() {
        const layer = DOM.query("[class*=\"layer-\"]");
        layer.classList.add("publicServersOpen");
        DOM.animate({
            duration: 200,
            update: function(progress) {
                layer.style.transform = `scale(${0.07 * (1 - progress) + 0.93}) translateZ(0px)`;
                layer.style.opacity = 1 - progress;
            }
        });
    }

    render() {
        return BDV2.react.createElement(
            "div",
            {className: "layer bd-layer layer-3QrUeG", id: this.props.id, ref: "root", style: {opacity: 0, transform: "scale(1.1) translateZ(0px)"}},
            this.props.children
        );
    }
}
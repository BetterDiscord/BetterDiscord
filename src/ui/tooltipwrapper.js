export default function TooltipWrap(Component, options) {

    const {style = "black", side = "top", text = ""} = options;
    const id = BDV2.KeyGenerator();    

    return class extends BDV2.reactComponent {
        constructor(props) {
            super(props);
            this.onMouseEnter = this.onMouseEnter.bind(this);
            this.onMouseLeave = this.onMouseLeave.bind(this);
        }

        componentDidMount() {
            this.node = BDV2.reactDom.findDOMNode(this);
            this.node.addEventListener("mouseenter", this.onMouseEnter);
            this.node.addEventListener("mouseleave", this.onMouseLeave);
        }

        componentWillUnmount() {
            this.node.removeEventListener("mouseenter", this.onMouseEnter);
            this.node.removeEventListener("mouseleave", this.onMouseLeave);
        }

        onMouseEnter() {
            const {left, top, width, height} = this.node.getBoundingClientRect();
            BDV2.Tooltips.show(id, {
                position: side,
                text: text,
                color: style,
                targetWidth: width,
                targetHeight: height,
                windowWidth: Utils.screenWidth,
                windowHeight: Utils.screenHeight,
                x: left,
                y: top
            });

            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    const nodes = Array.from(mutation.removedNodes);
                    const directMatch = nodes.indexOf(this.node) > -1;
                    const parentMatch = nodes.some(parent => parent.contains(this.node));
                    if (directMatch || parentMatch) {
                        this.onMouseLeave();
                        observer.disconnect();
                    }
                });
            });

            observer.observe(document.body, {subtree: true, childList: true});
        }

        onMouseLeave() {
            BDV2.Tooltips.hide(id);
        }

        render() {
            return BDV2.react.createElement(Component, this.props);
        }
    };
}
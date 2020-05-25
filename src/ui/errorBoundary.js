import BDV2 from "../modules/v2";

export default class BDErrorBoundary extends BDV2.reactComponent {
    constructor(props) {
      super(props);
      this.state = {hasError: false};
    }

    componentDidCatch() {
      this.setState({hasError: true});
    }

    render() {
      if (this.state.hasError) return BDV2.react.createElement("div", {className: "react-error"}, "Component Error");  
      return this.props.children; 
    }
}

const originalRender = BDErrorBoundary.prototype.render;
Object.defineProperty(BDErrorBoundary.prototype, "render", {
    enumerable: false,
    configurable: false,
    set: function() {console.warn("Addon policy for plugins #5 https://github.com/rauenzi/BetterDiscordApp/wiki/Addon-Policies#plugins");},
    get: () => originalRender
});
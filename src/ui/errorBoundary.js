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
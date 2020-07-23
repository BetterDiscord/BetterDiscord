import {React, Logger} from "modules";
import {remote} from "electron";
export default class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = {hasError: false};
    }

    componentDidCatch() {
      this.setState({hasError: true});
    }

    render() {
      if (this.state.hasError) return <div onClick={() => remote.getCurrentWindow().openDevTools()} className="react-error">There was an unexpected Error. Click to open console for more details.</div>;  
      return this.props.children; 
    }
}

const originalRender = ErrorBoundary.prototype.render;
Object.defineProperty(ErrorBoundary.prototype, "render", {
    enumerable: false,
    configurable: false,
    set: function() {Logger.warn("ErrorBoundary", "Addon policy for plugins #5 https://github.com/rauenzi/BetterDiscordApp/wiki/Addon-Policies#plugins");},
    get: () => originalRender
});
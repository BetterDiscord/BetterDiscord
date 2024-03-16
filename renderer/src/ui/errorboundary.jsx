import Logger from "@common/logger";
import React from "@modules/react";
import IPC from "@modules/ipc";


export default class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = {hasError: false};
    }

    componentDidCatch(error) {
      this.setState({hasError: true});
      if (typeof this.props.onError === "function") this.props.onError(error);
    }

    render() {
      if (this.state.hasError && !this.props.hideError) return <div onClick={() => IPC.openDevTools()} className="react-error">There was an unexpected Error. Click to open console for more details.</div>;  
      return this.props.children; 
    }
}

const originalRender = ErrorBoundary.prototype.render;
Object.defineProperty(ErrorBoundary.prototype, "render", {
    enumerable: false,
    configurable: false,
    set: function() {Logger.warn("ErrorBoundary", "Addon policy for plugins #5 https://github.com/BetterDiscord/BetterDiscord/wiki/Addon-Policies#plugins");},
    get: () => originalRender
});

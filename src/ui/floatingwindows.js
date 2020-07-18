import {WebpackModules, React, ReactDOM, DOM, DOMManager} from "modules";
import FloatingWindowContainer from "./floating/container";

export default class FloatingWindows {
    static initialize() {
        const containerRef = React.createRef();
        const container = <FloatingWindowContainer ref={containerRef} />;
        const wrapped = React.createElement(WebpackModules.getByProps("AppReferencePositionLayer").AppLayerProvider().props.layerContext.Provider, {value: [document.querySelector("#app-mount > .layerContainer-yqaFcK")]}, container);
        const div = DOM.createElement(`<div id="floating-windows-layer">`);
        DOMManager.bdBody.append(div);
        ReactDOM.render(wrapped, div);
        this.ref = containerRef;
    }
    
    static open(window) {
        if (!this.ref) this.initialize();
        return this.ref.current.open(window);
    }
}
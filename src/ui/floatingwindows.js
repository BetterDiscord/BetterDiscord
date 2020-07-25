import {WebpackModules, React, ReactDOM, DOM, DOMManager} from "modules";
import FloatingWindowContainer from "./floating/container";

/* eslint-disable new-cap */

const LayerProviders = WebpackModules.getByProps("AppReferencePositionLayer");

export default class FloatingWindows {
    static initialize() {
        const containerRef = React.createRef();
        const container = <FloatingWindowContainer ref={containerRef} />;
        const wrapped = LayerProviders
                        ? React.createElement(LayerProviders.AppLayerProvider().props.layerContext.Provider, {value: [document.querySelector("#app-mount > .layerContainer-yqaFcK")]}, container) // eslint-disable-line new-cap
                        : container;
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
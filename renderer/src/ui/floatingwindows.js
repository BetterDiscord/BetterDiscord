import {WebpackModules, React, ReactDOM, DOMManager} from "modules";
import FloatingWindowContainer from "./floating/container";

/* eslint-disable new-cap */

const AppLayerProvider = WebpackModules.getByDisplayName("AppLayerProvider");

export default class FloatingWindows {
    static initialize() {
        const containerRef = React.createRef();
        const container = <FloatingWindowContainer ref={containerRef} />;
        const wrapped = AppLayerProvider
                        ? React.createElement(AppLayerProvider().props.layerContext.Provider, {value: [document.querySelector("#app-mount > .layerContainer-2v_Sit")]}, container) // eslint-disable-line new-cap
                        : container;
        const div = DOMManager.parseHTML(`<div id="floating-windows-layer">`);
        DOMManager.bdBody.append(div);
        ReactDOM.render(wrapped, div);
        this.ref = containerRef;
    }
    
    static open(window) {
        if (!this.ref) this.initialize();
        return this.ref.current.open(window);
    }
}
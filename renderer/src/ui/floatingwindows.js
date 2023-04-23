import {WebpackModules, React, ReactDOM, DOMManager, Events} from "modules";
import FloatingWindowContainer from "./floating/container";

/* eslint-disable new-cap */

const AppLayerProvider = WebpackModules.getByDisplayName("AppLayerProvider");

let hasInitialized = false;
export default class FloatingWindows {
    static initialize() {
        const container = <FloatingWindowContainer />;
        const wrapped = AppLayerProvider
                        ? React.createElement(AppLayerProvider().props.layerContext.Provider, {value: [document.querySelector("#app-mount > .layerContainer-2v_Sit")]}, container) // eslint-disable-line new-cap
                        : container;
        const div = DOMManager.parseHTML(`<div id="floating-windows-layer">`);
        DOMManager.bdBody.append(div);
        ReactDOM.render(wrapped, div);
        hasInitialized = true;
    }
    
    static open(window) {
        if (!hasInitialized) this.initialize();
        return Events.emit("open-window", window);
    }
}
import React from "@modules/react";
import ReactDOM from "@modules/reactdom";
import Events from "@modules/emitter";
import DOMManager from "@modules/dommanager";
import WebpackModules from "@modules/webpackmodules";

import FloatingWindowContainer from "./floating/container";


const AppLayerProvider = WebpackModules.getByDisplayName("AppLayerProvider");

let hasInitialized = false;
export default class FloatingWindows {
    static initialize() {
        const container = <FloatingWindowContainer />;
        const wrapped = AppLayerProvider
                        ? React.createElement(AppLayerProvider().props.layerContext.Provider, {value: [document.querySelector("#app-mount > .layerContainer-2v_Sit")]}, container)
                        : container;
        const div = DOMManager.parseHTML(`<div id="floating-windows-layer">`);
        DOMManager.bdBody.append(div);
        // eslint-disable-next-line react/no-deprecated
        ReactDOM.render(wrapped, div);
        hasInitialized = true;
    }
    
    static open(window) {
        if (!hasInitialized) this.initialize();
        return Events.emit("open-window", window);
    }
}
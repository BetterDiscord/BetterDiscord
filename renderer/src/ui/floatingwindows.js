import {React, ReactDOM, WebpackModules, DOMManager, Events} from "modules";
import Utilities from "../modules/utilities";

/* eslint-disable new-cap */
const FloatingWindowContainer = Utilities.makeLazy(() => import("./floating/container"));
const AppLayerProvider = Utilities.makeModuleLazy(() => WebpackModules.getByDisplayName("AppLayerProvider")());

let hasInitialized = false;
export default class FloatingWindows {
    static initialize() {
        const container = <FloatingWindowContainer />;
        const wrapped = container;
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

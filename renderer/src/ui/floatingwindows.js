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

    /**
     * Opens a new floating window.
     * @param {object} window Options for the window.
     * @param {string} [window.title] The title of the window.
     * @param {React.ReactNode} [window.children] The content of the window.
     * @param {width} [window.width] The width of the window.
     * @param {height} [window.height] The height of the window.
     * @param {Boolean} [window.center] Whether the window should be initially centered.
     * @param {number} [window.top] The top position of the window.
     * @param {number} [window.left] The left position of the window.
     * @param {()=>void} [window.onResize] The callback to call when the window is resized.
     * @param {()=>void} [window.onClose] The callback to call when the window is closed.
     * @param {boolean} [window.resizable] Whether the window is resizable.
     * @param {string} [window.id] The id of the window element.
     * @param {string} [window.className] Additional classes to add to the window element.
     * @param {boolean|()=>boolean} [window.confirmClose] Function or boolean to determine if the close confirmation message should be shown.
     * @param {string} [window.confirmationText] Message to display when trying closing the window.
     * @param {number} [window.minX] The top left x position of the bounds the window can be moved in. Defaults to 0.
     * @param {number} [window.minY] The top left y position of the bounds the window can be moved in. Defaults to 0.
     * @param {number} [window.maxX] The bottom right x position of the bounds the window can be moved in. Defaults to the width of the window.
     * @param {number} [window.maxY] The bottom right y position of the bounds the window can be moved in. Defaults to the height of the window.
     */
    static open(window) {
        if (!this.ref) this.initialize();
        return this.ref.current.open(window);
    }
}
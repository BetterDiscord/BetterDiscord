import DOMManager from "../dommanager";

/**
 * `DOM` is a simple utility class for dom manipulation. An instance is available on {@link BdApi}.
 * @type DOM
 * @summary {@link DOM} is a simple utility class for dom manipulation.
 * @name DOM
 */
class DOM {

    /**
     * Current width of the user's screen.
     * @type {number}
     */
    get screenWidth() {return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);}

    /**
     * Current height of the user's screen.
     * @type {number}
     */
    get screenHeight() {return Math.max(document.documentElement.clientHeight, window.innerHeight || 0);}

    #callerName = "";

    constructor(callerName) {
        if (!callerName) return;
        this.#callerName = callerName;
    }

    /**
     * Adds a `<style>` to the document with the given ID.
     * 
     * @param {string} id ID to use for style element
     * @param {string} css CSS to apply to the document
     */
    addStyle(id, css) {
        if (this.#callerName && arguments.length === 2) {
            id = arguments[0];
            css = arguments[1];
        }
        else if (this.#callerName) {
            css = id;
            id = this.#callerName;
        }

        DOMManager.injectStyle(id, css);
    }

    /**
     * Removes a `<style>` from the document corresponding to the given ID.
     * 
     * @param {string} id ID uses for the style element
     */
    removeStyle(id) {
        if (this.#callerName && arguments.length === 1) {
            id = arguments[0];
        }
        else if (this.#callerName) {
            id = this.#callerName;
        }
        
        DOMManager.removeStyle(id);
    }

    /**
     * Adds a listener for when the node is removed from the document body.
     * 
     * @param {HTMLElement} node Node to be observed
     * @param {function} callback Function to run when fired
     */
    onRemoved(node, callback) {
        return DOMManager.onRemoved(node, callback);
    }

    /**
     * Utility to help smoothly animate using JavaScript
     * 
     * @param {function} update render function indicating the style should be updates
     * @param {number} duration duration in ms to animate for
     * @param {object} [options] option to customize the animation
     */
    animate(update, duration, options = {}) {
        return DOMManager.animate({update, duration, timing: options.timing});
    }

    /**
     * Utility function to make creating DOM elements easier. Acts similarly 
     * to `React.createElement`
     * 
     * @param {string} tag HTML tag name to create
     * @param {object} [options] options object to customize the element
     * @param {string} [options.className] class name to add to the element
     * @param {string} [options.id] id to set for the element
     * @param {HTMLElement} [options.target] target element to automatically append to
     * @param {HTMLElement} [child] child node to add
     * @returns HTMLElement
     */
    createElement(tag, options = {}, child = null) {
        return DOMManager.createElement(tag, options, child);
    }

    /**
     * Parses a string of HTML and returns the results. If the second parameter is true,
     * the parsed HTML will be returned as a document fragment {@see https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment}.
     * This is extremely useful if you have a list of elements at the top level, they can then be appended all at once to another node.
     * 
     * If the second parameter is false, then the return value will be the list of parsed
     * nodes and there were multiple top level nodes, otherwise the single node is returned.
     * @param {string} html - HTML to be parsed
     * @param {boolean} [fragment=false] - Whether or not the return should be the raw `DocumentFragment`
     * @returns {(DocumentFragment|NodeList|HTMLElement)} - The result of HTML parsing
     */
    parseHTML(html, fragment = false) {
        return DOMManager.parseHTML(html, fragment);
    }
}

Object.freeze(DOM);
Object.freeze(DOM.prototype);
export default DOM;
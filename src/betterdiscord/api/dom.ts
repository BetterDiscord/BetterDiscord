import DOMManager from "@modules/dommanager";

type AddStyleArgs<Bound extends boolean> = Bound extends true ? [css: string] | [id: string, css: string] : [id: string, css: string];
type RemoveStyleArgs<Bound extends boolean> = Bound extends true ? [] | [id: string] : [id: string];

/**
 * `DOM` is a simple utility class for dom manipulation. An instance is available on {@link BdApi}.
 * @type DOM
 * @summary {@link DOM} is a simple utility class for dom manipulation.
 * @name DOM
 */
class DOM<Bound extends boolean> {

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

    constructor(callerName?: string) {
        if (!callerName) return;
        this.#callerName = callerName;
    }

    /**
     * Adds a `<style>` to the document with the given ID.
     *
     * @param {string} id ID to use for style element
     * @param {string} css CSS to apply to the document
     */
    addStyle(...args: AddStyleArgs<Bound>) {
        if (args.length === 1) {
            if (this.#callerName) {
                args.unshift(this.#callerName);
            }
            else {
                throw new Error("No css provided");
            }
        }

        DOMManager.injectStyle(args[0], args[1]!);
    }

    /**
     * Removes a `<style>` from the document corresponding to the given ID.
     *
     * @param {string} id ID used for the style element
     */
    removeStyle(...args: RemoveStyleArgs<Bound>) {
        let id = args[0];

        if (this.#callerName && arguments.length === 0) {
            id = this.#callerName;
        }

        if (!id) throw new Error("No id provided");

        DOMManager.removeStyle(id);
    }

    /**
     * Adds a listener for when the node is removed from the document body.
     *
     * @param {HTMLElement} node Node to be observed
     * @param {function} callback Function to run when removed
     */
    onRemoved(node: HTMLElement, callback: () => void) {
        return DOMManager.onRemoved(node, callback);
    }

    /**
     * Adds a listener for when a node matching a selector is added to the document body.
     * The listener is automatically removed upon firing.
     * The callback is given the matching element.
     * @param {string} selector - node to wait for
     * @param {callable} callback - function to be performed on event
     */
    onAdded(selector: string, callback: () => void) {
        return DOMManager.onAdded(selector, callback);
    }

    /**
     * Utility to help smoothly animate using JavaScript.
     *
     * @param {function} update Render function indicating the style should be updated
     * @param {number} duration Duration in ms to animate for
     * @param {object} [options] Options to customize the animation
     * @param {function} [options.timing] Optional function calculating progress based on current time fraction. Linear by default.
     */
    animate(update: (p: number) => void, duration: number, options: {timing?: (_: number) => number;} = {}) {
        return DOMManager.animate({update, duration, timing: options.timing});
    }

    /**
     * Utility function to make creating DOM elements easier. Acts similarly
     * to `React.createElement`
     *
     * @param {string} tag HTML tag name to create
     * @param {object} [options] Options object to customize the element
     * @param {string} [options.className] Class name to add to the element
     * @param {string} [options.id] ID to set for the element
     * @param {HTMLElement} [options.target] Target element to automatically append to
     * @param {(Node|string|(Node|string)[])[]} [children] Child nodes to add
     * @returns {HTMLElement} The created HTML element
     */
    createElement(tag: keyof HTMLElementTagNameMap, options = {}, ...children: Array<Node | string>) {
        return DOMManager.createElement(tag, options, ...children);
    }

    /**
     * Parses a string of HTML and returns the results. If the second parameter is true,
     * the parsed HTML will be returned as a document fragment {@see https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment}.
     * This is extremely useful if you have a list of elements at the top level, they can then be appended all at once to another node.
     *
     * If the second parameter is false, then the return value will be the list of parsed
     * nodes and there were multiple top level nodes, otherwise the single node is returned.
     *
     * @param {string} html HTML to be parsed
     * @param {boolean} [fragment=false] Whether or not the return should be the raw `DocumentFragment`
     * @returns {(DocumentFragment|NodeList|HTMLElement)} The result of HTML parsing
     */
    parseHTML(html: string, fragment = false) {
        return DOMManager.parseHTML(html, fragment);
    }
}

Object.freeze(DOM);
Object.freeze(DOM.prototype);
export default DOM;
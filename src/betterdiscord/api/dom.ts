import DOMManager from "@modules/dommanager";

interface AnimateOptions {
    /** Optional function that calculating progress based on current time fraction. Linear by default. */
    timing?: (timeFraction: number) => number;
}

class BaseDOM {
    /**
     * The current width of the user's screen.
     */
    get screenWidth() {return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);}

    /**
     * The current height of the user's screen.
     */
    get screenHeight() {return Math.max(document.documentElement.clientHeight, window.innerHeight || 0);}

    /**
     * Adds a listener for when the node is removed from the document body.
     * @param node Node to be observed
     * @param callback Function to run when removed
     */
    onRemoved(node: HTMLElement, callback: () => void) {
        return DOMManager.onRemoved(node, callback);
    }

    /**
     * Adds a listener for when a node matching a selector is added to the document body.
     * The listener is automatically removed upon firing.
     * The callback is given the matching element.
     * @param selector A CSS selector for the node to wait for
     * @param callback Function to be performed on event
     */
    onAdded(selector: string, callback: () => void) {
        return DOMManager.onAdded(selector, callback);
    }

    /**
     * Utility to help smoothly animate using JavaScript.
     * @param update Render function indicating the style should be updated
     * @param duration Duration in ms to animate for
     * @param [options] Options to customize the animation
     */
    animate(update: (p: number) => void, duration: number, options: AnimateOptions = {}) {
        return DOMManager.animate({update, duration, timing: options.timing});
    }

    /**
     * Utility function to make creating DOM elements easier. Acts similarly
     * to `React.createElement`
     * @param tag HTML tag name to create
     * @param [options] Options object to customize the element
     * @param [children] Child nodes to add
     * @returns The created HTML element
     */
    createElement<T extends keyof HTMLElementTagNameMap>(tag: T, options: Partial<HTMLElementTagNameMap[T]> = {}, ...children: Array<Node | string>) {
        return DOMManager.createElement(tag, options, ...children);
    }

    /**
     * Parses a string of HTML and returns the results. If the second parameter is true,
     * the parsed HTML will be returned as a [document fragment](https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment).
     * This is extremely useful if you have a list of elements at the top level, they can then be appended all at once to another node.
     *
     * If the second parameter is false, then the return value will be the list of parsed
     * nodes and there were multiple top level nodes, otherwise the single node is returned.
     *
     * @param html HTML to be parsed
     * @param [fragment=false] Whether or not the return should be the raw `DocumentFragment`
     * @returns The result of HTML parsing
     */
    parseHTML(html: string, fragment = false) {
        return DOMManager.parseHTML(html, fragment);
    }
}

/**
 * `DOM` is a simple utility class for dom manipulation. An instance is available on {@link BdApi}.
 */
class DOM extends BaseDOM {
    /**
     * Adds a `<style>` to the document with the given ID.
     *
     * @param id ID to use for style element
     * @param css CSS to apply to the document
     */
    addStyle(id: string, css: string) {
        if (!css) {
            throw new Error("No css provided");
        }

        DOMManager.injectStyle(id, css);
    }

    /**
     * Removes a `<style>` from the document corresponding to the given ID.
     *
     * @param id ID used for the style element
     */
    removeStyle(id: string) {
        if (!id) throw new Error("No id provided");

        DOMManager.removeStyle(id);
    }
}

class BoundDOM extends BaseDOM {
    #callerName: string;

    constructor(callerName: string) {
        super();
        this.#callerName = callerName;
    }

    /**
     * Adds a `<style>` to the document with the given ID.
     *
     * @param id ID to use for style element
     * @param css CSS to apply to the document
     */
    addStyle(css: string): void;
    addStyle(id: string, css: string): void;
    addStyle(id: string, css?: string): void {
        if (!css) {
            if (this.#callerName) {
                css = id;
                id = this.#callerName;
            }
            else {
                throw new Error("No css provided");
            }
        }

        DOMManager.injectStyle(id, css);
    }

    /**
     * Removes a `<style>` from the document corresponding to the given ID.
     *
     * @param id ID used for the style element
     */
    removeStyle(id?: string) {
        id ??= this.#callerName;
        if (!id) throw new Error("No id provided");

        DOMManager.removeStyle(id);
    }
}

Object.freeze(DOM);
Object.freeze(DOM.prototype);
export { DOM, BoundDOM };
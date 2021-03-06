/**
 * Copyright 2018 Zachary Rauen
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is furnished
 * to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
 * OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * 
 * From: https://github.com/rauenzi/BDPluginLibrary
 */

/**
 * @interface
 * @name Offset
 * @property {number} top - Top offset of the target element.
 * @property {number} right - Right offset of the target element.
 * @property {number} bottom - Bottom offset of the target element.
 * @property {number} left - Left offset of the target element.
 * @property {number} height - Outer height of the target element.
 * @property {number} width - Outer width of the target element.
 */

 /**
 * Function that automatically removes added listener.
 * @callback module:DOMTools~CancelListener
 */
 
export default class DOMTools {

    static escapeID(id) {
        return id.replace(/^[^a-z]+|[^\w-]+/gi, "-");
    }

    /**
     * Adds a style to the document.
     * @param {string} id - identifier to use as the element id
     * @param {string} css - css to add to the document
     */
    static addStyle(id, css) {
        document.head.append(DOMTools.createElement(`<style id="${id}">${css}</style>`));
    }

    /**
     * Removes a style from the document.
     * @param {string} id - original identifier used
     */
    static removeStyle(id) {
        const element = document.getElementById(id);
        if (element) element.remove();
    }

    /**
     * Adds/requires a remote script to be loaded
     * @param {string} id - identifier to use for this script
     * @param {string} url - url from which to load the script
     * @returns {Promise} promise that resolves when the script is loaded
     */
    static addScript(id, url) {
        return new Promise(resolve => {
            const script = document.createElement("script");
            script.id = id;
            script.src = url;
            script.type = "text/javascript";
            script.onload = resolve;
            document.head.append(script);
        });
    }

    /**
     * Removes a remote script from the document.
     * @param {string} id - original identifier used
     */
    static removeScript(id) {
        id = this.escapeID(id);
        const element = document.getElementById(id);
        if (element) element.remove();
    }
    
    // https://javascript.info/js-animation
    static animate({timing = _ => _, update, duration}) {
        const start = performance.now();
      
        requestAnimationFrame(function animate(time) {
          // timeFraction goes from 0 to 1
          let timeFraction = (time - start) / duration;
          if (timeFraction > 1) timeFraction = 1;
      
          // calculate the current animation state
          const progress = timing(timeFraction);
      
          update(progress); // draw it
      
          if (timeFraction < 1) {
            requestAnimationFrame(animate);
          }
      
        });
      }

    /**
     * This is my shit version of not having to use `$` from jQuery. Meaning
     * that you can pass a selector and it will automatically run {@link module:DOMTools.query}.
     * It also means that you can pass a string of html and it will perform and return `parseHTML`.
     * @see module:DOMTools.parseHTML
     * @see module:DOMTools.query
     * @param {string} selector - Selector to query or HTML to parse
     * @returns {(DocumentFragment|NodeList|HTMLElement)} - Either the result of `parseHTML` or `query`
     */
    static Q(selector) {
        const element = this.parseHTML(selector);
        const isHTML = element instanceof NodeList ? Array.from(element).some(n => n.nodeType === 1) : element.nodeType === 1;
        if (isHTML) return element;
        return this.query(selector);
    }

    /**
     * Essentially a shorthand for `document.querySelector`. If the `baseElement` is not provided
     * `document` is used by default.
     * @param {string} selector - Selector to query
     * @param {Element} [baseElement] - Element to base the query from
     * @returns {(Element|null)} - The found element or null if not found
     */
    static query(selector, baseElement) {
        if (!baseElement) baseElement = document;
        return baseElement.querySelector(selector);
    }

    /**
     * Essentially a shorthand for `document.querySelectorAll`. If the `baseElement` is not provided
     * `document` is used by default.
     * @param {string} selector - Selector to query
     * @param {Element} [baseElement] - Element to base the query from
     * @returns {Array<Element>} - Array of all found elements
     */
    static queryAll(selector, baseElement) {
        if (!baseElement) baseElement = document;
        return baseElement.querySelectorAll(selector);
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
    static parseHTML(html, fragment = false) {
        const template = document.createElement("template");
        template.innerHTML = html;
        const node = template.content.cloneNode(true);
        if (fragment) return node;
        return node.childNodes.length > 1 ? node.childNodes : node.childNodes[0];
    }

    /** Alternate name for {@link module:DOMTools.parseHTML} */
    static createElement(html, fragment = false) {return this.parseHTML(html, fragment);}
    
    /**
     * Takes a string of html and escapes it using the brower's own escaping mechanism.
     * @param {String} html - html to be escaped
     */
    static escapeHTML(html) {
        const textNode = document.createTextNode("");
        const spanElement = document.createElement("span");
        spanElement.append(textNode);
        textNode.nodeValue = html;
        return spanElement.innerHTML;
    }

    /**
     * Adds a list of classes from the target element.
     * @param {Element} element - Element to edit classes of
     * @param {...string} classes - Names of classes to add
     * @returns {Element} - `element` to allow for chaining
     */
    static addClass(element, ...classes) {
        classes = classes.flat().filter(c => c);
        for (let c = 0; c < classes.length; c++) classes[c] = classes[c].toString().split(" ");
        classes = classes.flat().filter(c => c);
        element.classList.add(...classes);
        return element;
    }

    /**
     * Removes a list of classes from the target element.
     * @param {Element} element - Element to edit classes of
     * @param {...string} classes - Names of classes to remove
     * @returns {Element} - `element` to allow for chaining
     */
    static removeClass(element, ...classes) {
        for (let c = 0; c < classes.length; c++) classes[c] = classes[c].toString().split(" ");
        classes = classes.flat().filter(c => c);
        element.classList.remove(...classes);
        return element;
    }

    /**
     * When only one argument is present: Toggle class value;
     * i.e., if class exists then remove it and return false, if not, then add it and return true.
     * When a second argument is present:
     * If the second argument evaluates to true, add specified class value, and if it evaluates to false, remove it.
     * @param {Element} element - Element to edit classes of
     * @param {string} classname - Name of class to toggle
     * @param {boolean} [indicator] - Optional indicator for if the class should be toggled
     * @returns {Element} - `element` to allow for chaining
     */
    static toggleClass(element, classname, indicator) {
        classname = classname.toString().split(" ").filter(c => c);
        if (typeof(indicator) !== "undefined") classname.forEach(c => element.classList.toggle(c, indicator));
        else classname.forEach(c => element.classList.toggle(c));
        return element;
    }

    /**
     * Checks if an element has a specific class
     * @param {Element} element - Element to edit classes of
     * @param {string} classname - Name of class to check
     * @returns {boolean} - `true` if the element has the class, `false` otherwise.
     */
    static hasClass(element, classname) {
        return classname.toString().split(" ").filter(c => c).every(c => element.classList.contains(c));
    }

    /**
     * Replaces one class with another
     * @param {Element} element - Element to edit classes of
     * @param {string} oldName - Name of class to replace
     * @param {string} newName - New name for the class
     * @returns {Element} - `element` to allow for chaining
     */
    static replaceClass(element, oldName, newName) {
        element.classList.replace(oldName, newName);
        return element;
    }

    /**
     * Appends `thisNode` to `thatNode`
     * @param {Node} thisNode - Node to be appended to another node
     * @param {Node} thatNode - Node for `thisNode` to be appended to
     * @returns {Node} - `thisNode` to allow for chaining
     */
    static appendTo(thisNode, thatNode) {
        if (typeof(thatNode) == "string") thatNode = this.query(thatNode);
        if (!thatNode) return null;
        thatNode.append(thisNode);
        return thisNode;
    }

    /**
     * Prepends `thisNode` to `thatNode`
     * @param {Node} thisNode - Node to be prepended to another node
     * @param {Node} thatNode - Node for `thisNode` to be prepended to
     * @returns {Node} - `thisNode` to allow for chaining
     */
    static prependTo(thisNode, thatNode) {
        if (typeof(thatNode) == "string") thatNode = this.query(thatNode);
        if (!thatNode) return null;
        thatNode.prepend(thisNode);
        return thisNode;
    }

    /**
     * Insert after a specific element, similar to jQuery's `thisElement.insertAfter(otherElement)`.
     * @param {Node} thisNode - The node to insert
     * @param {Node} targetNode - Node to insert after in the tree
     * @returns {Node} - `thisNode` to allow for chaining
     */
    static insertAfter(thisNode, targetNode) {
        targetNode.parentNode.insertBefore(thisNode, targetNode.nextSibling);
        return thisNode;
    }

    /**
     * Insert after a specific element, similar to jQuery's `thisElement.after(newElement)`.
     * @param {Node} thisNode - The node to insert
     * @param {Node} newNode - Node to insert after in the tree
     * @returns {Node} - `thisNode` to allow for chaining
     */
    static after(thisNode, newNode) {
        thisNode.parentNode.insertBefore(newNode, thisNode.nextSibling);
        return thisNode;
    }

    /**
     * Gets the next sibling element that matches the selector.
     * @param {Element} element - Element to get the next sibling of
     * @param {string} [selector=""] - Optional selector
     * @returns {Element} - The sibling element
     */
    static next(element, selector = "") {
        return selector ? element.querySelector("+ " + selector) : element.nextElementSibling;
    }

    /**
     * Gets all subsequent siblings.
     * @param {Element} element - Element to get next siblings of
     * @returns {NodeList} - The list of siblings
     */
    static nextAll(element) {
        return element.querySelectorAll("~ *");
    }

    /**
     * Gets the subsequent siblings until an element matches the selector.
     * @param {Element} element - Element to get the following siblings of
     * @param {string} selector - Selector to stop at
     * @returns {Array<Element>} - The list of siblings
     */
    static nextUntil(element, selector) {
        const next = []; 
        while (element.nextElementSibling && !element.nextElementSibling.matches(selector)) next.push(element = element.nextElementSibling);
        return next;
    }

    /**
     * Gets the previous sibling element that matches the selector.
     * @param {Element} element - Element to get the previous sibling of
     * @param {string} [selector=""] - Optional selector
     * @returns {Element} - The sibling element
     */
    static previous(element, selector = "") {
        const previous = element.previousElementSibling;
        if (selector) return previous && previous.matches(selector) ? previous : null;
        return previous;
    }

    /**
     * Gets all preceeding siblings.
     * @param {Element} element - Element to get preceeding siblings of
     * @returns {NodeList} - The list of siblings
     */
    static previousAll(element) {
        const previous = [];
        while (element.previousElementSibling) previous.push(element = element.previousElementSibling);
        return previous;
    }

    /**
     * Gets the preceeding siblings until an element matches the selector.
     * @param {Element} element - Element to get the preceeding siblings of
     * @param {string} selector - Selector to stop at
     * @returns {Array<Element>} - The list of siblings
     */
    static previousUntil(element, selector) {
        const previous = []; 
        while (element.previousElementSibling && !element.previousElementSibling.matches(selector)) previous.push(element = element.previousElementSibling);
        return previous;
    }

    /**
     * Find which index in children a certain node is. Similar to jQuery's `$.index()`
     * @param {HTMLElement} node - The node to find its index in parent
     * @returns {number} Index of the node
     */
    static indexInParent(node) {
        const children = node.parentNode.childNodes;
        let num = 0;
        for (let i = 0; i < children.length; i++) {
            if (children[i] == node) return num;
            if (children[i].nodeType == 1) num++;
        }
        return -1;
    }

    /** Shorthand for {@link module:DOMTools.indexInParent} */
    static index(node) {return this.indexInParent(node);}

    /**
     * Gets the parent of the element if it matches the selector,
     * otherwise returns null.
     * @param {Element} element - Element to get parent of
     * @param {string} [selector=""] - Selector to match parent
     * @returns {(Element|null)} - The sibling element or null
     */
    static parent(element, selector = "") {
        return !selector || element.parentElement.matches(selector) ? element.parentElement : null;
    }

    /**
     * Gets all children of Element that match the selector if provided.
     * @param {Element} element - Element to get all children of
     * @param {string} selector - Selector to match the children to
     * @returns {Array<Element>} - The list of children
     */
    static findChild(element, selector) {
        return element.querySelector(":scope > " + selector);
    }

    /**
     * Gets all children of Element that match the selector if provided.
     * @param {Element} element - Element to get all children of
     * @param {string} selector - Selector to match the children to
     * @returns {Array<Element>} - The list of children
     */
    static findChildren(element, selector) {
        return element.querySelectorAll(":scope > " + selector);
    }

    /**
     * Gets all ancestors of Element that match the selector if provided.
     * @param {Element} element - Element to get all parents of
     * @param {string} [selector=""] - Selector to match the parents to
     * @returns {Array<Element>} - The list of parents
     */
    static parents(element, selector = "") {
        const parents = [];
        if (selector) while (element.parentElement && element.parentElement.closest(selector)) parents.push(element = element.parentElement.closest(selector));
        else while (element.parentElement) parents.push(element = element.parentElement);
        return parents;
    }

    /**
     * Gets the ancestors until an element matches the selector.
     * @param {Element} element - Element to get the ancestors of
     * @param {string} selector - Selector to stop at
     * @returns {Array<Element>} - The list of parents
     */
    static parentsUntil(element, selector) {
        const parents = [];
        while (element.parentElement && !element.parentElement.matches(selector)) parents.push(element = element.parentElement);
        return parents;
    }

    /**
     * Gets all siblings of the element that match the selector.
     * @param {Element} element - Element to get all siblings of
     * @param {string} [selector="*"] - Selector to match the siblings to
     * @returns {Array<Element>} - The list of siblings
     */
    static siblings(element, selector = "*") {
        return Array.from(element.parentElement.children).filter(e => e != element && e.matches(selector));
    }

    /**
     * Sets or gets css styles for a specific element. If `value` is provided
     * then it sets the style and returns the element to allow for chaining,
     * otherwise returns the style.  
     * @param {Element} element - Element to set the CSS of
     * @param {string} attribute - Attribute to get or set
     * @param {string} [value] - Value to set for attribute
     * @returns {Element|string} - When setting a value, element is returned for chaining, otherwise the value is returned.
     */
    static css(element, attribute, value) {
        if (typeof(value) == "undefined") return global.getComputedStyle(element)[attribute];
        element.style[attribute] = value;
        return element;
    }

    /**
     * Sets or gets the width for a specific element. If `value` is provided
     * then it sets the width and returns the element to allow for chaining,
     * otherwise returns the width.  
     * @param {Element} element - Element to set the CSS of
     * @param {string} [value] - Width to set
     * @returns {Element|string} - When setting a value, element is returned for chaining, otherwise the value is returned.
     */
    static width(element, value) {
        if (typeof(value) == "undefined") return parseInt(getComputedStyle(element).width);
        element.style.width = value;
        return element;
    }

    /**
     * Sets or gets the height for a specific element. If `value` is provided
     * then it sets the height and returns the element to allow for chaining,
     * otherwise returns the height.  
     * @param {Element} element - Element to set the CSS of
     * @param {string} [value] - Height to set
     * @returns {Element|string} - When setting a value, element is returned for chaining, otherwise the value is returned.
     */
    static height(element, value) {
        if (typeof(value) == "undefined") return parseInt(getComputedStyle(element).height);
        element.style.height = value;
        return element;
    }

    /**
     * Sets the inner text of an element if given a value, otherwise returns it.
     * @param {Element} element - Element to set the text of
     * @param {string} [text] - Content to set
     * @returns {string} - Either the string set by this call or the current text content of the node.
     */
    static text(element, text) {
        if (typeof(text) == "undefined") return element.textContent;
        return element.textContent = text;
    }

    /**
     * Returns the innerWidth of the element.
     * @param {Element} element - Element to retrieve inner width of
     * @return {number} - The inner width of the element.
     */
    static innerWidth(element) {
        return element.clientWidth;
    }

    /**
     * Returns the innerHeight of the element.
     * @param {Element} element - Element to retrieve inner height of
     * @return {number} - The inner height of the element.
     */
    static innerHeight(element) {
        return element.clientHeight;
    }

    /**
     * Returns the outerWidth of the element.
     * @param {Element} element - Element to retrieve outer width of
     * @return {number} - The outer width of the element.
     */
    static outerWidth(element) {
        return element.offsetWidth;
    }

    /**
     * Returns the outerHeight of the element.
     * @param {Element} element - Element to retrieve outer height of
     * @return {number} - The outer height of the element.
     */
    static outerHeight(element) {
        return element.offsetHeight;
    }

    /**
     * Gets the offset of the element in the page.
     * @param {Element} element - Element to get offset of
     * @return {Offset} - The offset of the element
     */
    static offset(element) {
        return element.getBoundingClientRect();
    }

    static get listeners() {return this._listeners || (this._listeners = {});}

    /**
     * This is similar to jQuery's `on` function and can *hopefully* be used in the same way.
     * 
     * Rather than attempt to explain, I'll show some example usages.
     * 
     * The following will add a click listener (in the `myPlugin` namespace) to `element`.
     * `DOMTools.on(element, "click.myPlugin", () => {console.log("clicked!");});`
     * 
     * The following will add a click listener (in the `myPlugin` namespace) to `element` that only fires when the target is a `.block` element.
     * `DOMTools.on(element, "click.myPlugin", ".block", () => {console.log("clicked!");});`
     * 
     * The following will add a click listener (without namespace) to `element`.
     * `DOMTools.on(element, "click", () => {console.log("clicked!");});`
     * 
     * The following will add a click listener (without namespace) to `element` that only fires once.
     * `const cancel = DOMTools.on(element, "click", () => {console.log("fired!"); cancel();});`
     * 
     * @param {Element} element - Element to add listener to
     * @param {string} event - Event to listen to with option namespace (e.g. "event.namespace")
     * @param {(string|callable)} delegate - Selector to run on element to listen to
     * @param {callable} [callback] - Function to fire on event
     * @returns {module:DOMTools~CancelListener} - A function that will undo the listener
     */
    static on(element, event, delegate, callback) {
        const [type, namespace] = event.split(".");
        const hasDelegate = delegate && callback;
        if (!callback) callback = delegate;
        const eventFunc = !hasDelegate ? callback : function(ev) {
            if (ev.target.matches(delegate)) {
                callback(ev);
            }
        };

        element.addEventListener(type, eventFunc);
        const cancel = () => {
            element.removeEventListener(type, eventFunc);
        };
        if (namespace) {
            if (!this.listeners[namespace]) this.listeners[namespace] = [];
            const newCancel = () => {
                cancel();
                this.listeners[namespace].splice(this.listeners[namespace].findIndex(l => l.event == type && l.element == element), 1);
            };
            this.listeners[namespace].push({
                event: type,
                element: element,
                cancel: newCancel
            });
            return newCancel;
        }
        return cancel;
    }

    /**
     * Functionality for this method matches {@link module:DOMTools.on} but automatically cancels itself
     * and removes the listener upon the first firing of the desired event.
     * 
     * @param {Element} element - Element to add listener to
     * @param {string} event - Event to listen to with option namespace (e.g. "event.namespace")
     * @param {(string|callable)} delegate - Selector to run on element to listen to
     * @param {callable} [callback] - Function to fire on event
     * @returns {module:DOMTools~CancelListener} - A function that will undo the listener
     */
    static once(element, event, delegate, callback) {
        const [type, namespace] = event.split(".");
        const hasDelegate = delegate && callback;
        if (!callback) callback = delegate;
        const eventFunc = !hasDelegate ? function(ev) {
            callback(ev);
            element.removeEventListener(type, eventFunc);
        } : function(ev) {
            if (!ev.target.matches(delegate)) return;
            callback(ev);
            element.removeEventListener(type, eventFunc);
        };

        element.addEventListener(type, eventFunc);
        const cancel = () => {
            element.removeEventListener(type, eventFunc);
        };
        if (namespace) {
            if (!this.listeners[namespace]) this.listeners[namespace] = [];
            const newCancel = () => {
                cancel();
                this.listeners[namespace].splice(this.listeners[namespace].findIndex(l => l.event == type && l.element == element), 1);
            };
            this.listeners[namespace].push({
                event: type,
                element: element,
                cancel: newCancel
            });
            return newCancel;
        }
        return cancel;
    }

    static __offAll(event, element) {
        const [type, namespace] = event.split(".");
        let matchFilter = listener => listener.event == type, defaultFilter = _ => _;
        if (element) {
            matchFilter = l => l.event == type && l.element == element;
            defaultFilter = l => l.element == element;
        }
        const listeners = this.listeners[namespace] || [];
        const list = type ? listeners.filter(matchFilter) : listeners.filter(defaultFilter);
        for (let c = 0; c < list.length; c++) list[c].cancel();
    }
    
    /**
     * This is similar to jQuery's `off` function and can *hopefully* be used in the same way.
     * 
     * Rather than attempt to explain, I'll show some example usages.
     * 
     * The following will remove a click listener called `onClick` (in the `myPlugin` namespace) from `element`.
     * `DOMTools.off(element, "click.myPlugin", onClick);`
     * 
     * The following will remove a click listener called `onClick` (in the `myPlugin` namespace) from `element` that only fired when the target is a `.block` element.
     * `DOMTools.off(element, "click.myPlugin", ".block", onClick);`
     * 
     * The following will remove a click listener (without namespace) from `element`.
     * `DOMTools.off(element, "click", onClick);`
     * 
     * The following will remove all listeners in namespace `myPlugin` from `element`.
     * `DOMTools.off(element, ".myPlugin");`
     * 
     * The following will remove all click listeners in namespace `myPlugin` from *all elements*.
     * `DOMTools.off("click.myPlugin");`
     * 
     * The following will remove all listeners in namespace `myPlugin` from *all elements*.
     * `DOMTools.off(".myPlugin");`
     * 
     * @param {(Element|string)} element - Element to remove listener from
     * @param {string} [event] - Event to listen to with option namespace (e.g. "event.namespace")
     * @param {(string|callable)} [delegate] - Selector to run on element to listen to
     * @param {callable} [callback] - Function to fire on event
     * @returns {Element} - The original element to allow for chaining
     */
    static off(element, event, delegate, callback) {
        if (typeof(element) == "string") return this.__offAll(element);
        const [type, namespace] = event.split(".");
        if (namespace) return this.__offAll(event, element);

        const hasDelegate = delegate && callback;
        if (!callback) callback = delegate;
        const eventFunc = !hasDelegate ? callback : function(ev) {
            if (ev.target.matches(delegate)) {
                callback(ev);
            }
        };

        element.removeEventListener(type, eventFunc);
        return element;
    }

    /**
     * Adds a listener for when the node is added/removed from the document body.
     * The listener is automatically removed upon firing.
     * @param {HTMLElement} node - node to wait for
     * @param {callable} callback - function to be performed on event
     * @param {boolean} onMount - determines if it should fire on Mount or on Unmount
     */
    static onMountChange(node, callback, onMount = true) {
        const wrappedCallback = () => {
            this.observer.unsubscribe(wrappedCallback);
            callback();
        };
        this.observer.subscribe(wrappedCallback, mutation => {
            const nodes = Array.from(onMount ? mutation.addedNodes : mutation.removedNodes);
            const directMatch = nodes.indexOf(node) > -1;
            const parentMatch = nodes.some(parent => parent.contains(node));
            return directMatch || parentMatch;
        });
        return node;
    }

    /** Shorthand for {@link module:DOMTools.onMountChange} with third parameter `true` */
    static onMount(node, callback) {return this.onMountChange(node, callback);}

    /** Shorthand for {@link module:DOMTools.onMountChange} with third parameter `false` */
    static onUnmount(node, callback) {return this.onMountChange(node, callback, false);}

    /** Alias for {@link module:DOMTools.onMount} */
    static onAdded(node, callback) {return this.onMount(node, callback);}

    /** Alias for {@link module:DOMTools.onUnmount} */
    static onRemoved(node, callback) {return this.onUnmount(node, callback, false);}

    /**
     * Helper function which combines multiple elements into one parent element
     * @param {Array<HTMLElement>} elements - array of elements to put into a single parent
     */
    static wrap(elements) {
        const domWrapper = this.parseHTML(`<div class="dom-wrapper"></div>`);
        for (let e = 0; e < elements.length; e++) domWrapper.appendChild(elements[e]);
        return domWrapper;
    }
}
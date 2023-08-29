import DiscordModules from "@modules//discordmodules";


/**
 * `ReactUtils` is a utility class for interacting with React internals. Instance is accessible through the {@link BdApi}.
 * This is extremely useful for interacting with the internals of the UI.
 * @type ReactUtils
 * @summary {@link ReactUtils} is a utility class for interacting with React internals.
 * @name ReactUtils
 */
const ReactUtils = {

    get rootInstance() {return document.getElementById("app-mount")?._reactRootContainer?._internalRoot?.current;},

    /**
     * Gets the internal React data of a specified node.
     * 
     * @param {HTMLElement} node Node to get the internal React data from
     * @returns {object|undefined} Either the found data or `undefined` 
     */
    getInternalInstance(node) {
        if (node.__reactFiber$) return node.__reactFiber$;
        return node[Object.keys(node).find(k => k.startsWith("__reactInternalInstance") || k.startsWith("__reactFiber"))] || null;
    },

    /**
      * Attempts to find the "owner" node to the current node. This is generally 
      * a node with a `stateNode` - a class component.
      * 
      * @param {HTMLElement} node Node to obtain React instance of
      * @param {object} options Options for the search
      * @param {array} [options.include] List of items to include in the search
      * @param {array} [options.exclude=["Popout", "Tooltip", "Scroller", "BackgroundFlash"]] List of items to exclude from the search.
      * @param {callable} [options.filter=_=>_] Filter to check the current instance with (should return a boolean)
      * @return {object|undefined} The owner instance or `undefined` if not found
      */
    getOwnerInstance(node, {include, exclude = ["Popout", "Tooltip", "Scroller", "BackgroundFlash"], filter = _ => _} = {}) {
        if (node === undefined) return undefined;
        const excluding = include === undefined;
        const nameFilter = excluding ? exclude : include;
        function getDisplayName(owner) {
            const type = owner.type;
            if (!type) return null;
            return type.displayName || type.name || null;
        }
        function classFilter(owner) {
            const name = getDisplayName(owner);
            return (name !== null && !!(nameFilter.includes(name) ^ excluding));
        }
        
        let curr = ReactUtils.getInternalInstance(node);
        for (curr = curr && curr.return; curr !== null; curr = curr.return) {
            if (curr === null) continue;
            const owner = curr.stateNode;
            if (owner !== null && !(owner instanceof HTMLElement) && classFilter(curr) && filter(owner)) return owner;
        }
        
        return null;
    },

    /**
      * Creates an unrendered React component that wraps HTML elements.
      * 
      * @param {HTMLElement} element Element or array of elements to wrap
      * @returns {object} Unrendered React component
      */
    wrapElement(element) {
        return class ReactWrapper extends DiscordModules.React.Component {
            constructor(props) {
                super(props);
                this.element = element;
                this.state = {hasError: false};
            }
            componentDidCatch() {this.setState({hasError: true});}
            componentDidMount() {this.refs.element.appendChild(this.element);}
            render() {return this.state.hasError ? null : DiscordModules.React.createElement("div", {className: "react-wrapper", ref: "element"});}
        };
    }

};

Object.freeze(ReactUtils);

export default ReactUtils;
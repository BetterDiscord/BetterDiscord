import NodePatcher from "@modules/nodepatcher";
import {getInternalInstance, getOwnerInstance, getType, rerenderComponent, wrapElement, wrapInHooks} from "@utils/react";

/**
 * `ReactUtils` is a utility class for interacting with React internals. An instance is available on {@link BdApi}.
 * This is extremely useful for interacting with the internals of the UI.
 */
class ReactUtils {
    /** @ignore */
    constructor() {};

    /**
     * @deprecated
     */
    get rootInstance() {
        return (document.getElementById("app-mount") as any)?._reactRootContainer?._internalRoot?.current;
    }

    /**
     * Gets the internal React data of a specified node.
     *
     * @param node Node to get the internal React data from
     * @returns Either the found data or `undefined`
     */
    getInternalInstance = getInternalInstance;

    /**
     * Attempts to find the "owner" node to the current node. This is generally
     * a node with a `stateNode` - a class component.
     *
     * @param node Node to obtain React instance of
     * @param options Options for the search
     * @returns The owner instance or `undefined` if not found
     */
    getOwnerInstance = getOwnerInstance;

    /**
     * Creates an unrendered React component that wraps HTML elements.
     *
     * @param element Element or array of elements to wrap
     * @returns Unrendered React component
     */
    wrapElement = wrapElement;

    /**
     * Wraps a functional React component to allow it to be created outside of
     * the normal React lifecycle.
     *
     * @param functionComponent The functional component to wrap
     * @param customPatches Custom react hooks to use
     * @returns The wrapped component
     */
    wrapInHooks = wrapInHooks;

    /**
     * Gets the type of a React component, going through things such as forwardRef and memo
     */
    getType = getType;

    /**
     * Re-renders every mounted instance of a component, using the component as it is now.
     * Mounted components keep the function they were created with, so patching or unpatching
     * a component only shows once it mounts again. Call this right after patching or unpatching
     * to apply the change immediately.
     *
     * @example
     * const [module, key] = BdApi.Webpack.getModule(filter, {withKey: true});
     * BdApi.Patcher.after("MyPlugin", module, key, (_, args, ret) => {...});
     * BdApi.ReactUtils.rerenderComponent([module, key]);
     *
     * @param component The component, or the `[module, key]` it is exported under
     * @param filter Optional filter to only re-render matching fibers
     */
    rerenderComponent = rerenderComponent;

    /**
     * Creates a NodePatcher instance which is used to patch React nodes
     */
    createNodePatcher() {
        return new NodePatcher();
    }
};

Object.freeze(ReactUtils);
Object.freeze(ReactUtils.prototype);

export default ReactUtils;